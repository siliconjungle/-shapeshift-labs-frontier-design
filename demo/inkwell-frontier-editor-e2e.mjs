import fs from 'node:fs/promises';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  createFrontierAiSession,
  domProbe,
  stateProbe
} from '../../frontier-playwright/dist/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = readArgs(process.argv.slice(2));
const runId = String(args.run || `inkwell-frontier-editor-${new Date().toISOString().replace(/[:.]/g, '-')}-${process.pid}`);
const runDir = path.resolve(String(args.outDir || path.join(os.tmpdir(), 'frontier-inkwell-editor-agent-runs', runId)));
const evidencePath = path.join(runDir, 'evidence.json');
const screenshotPath = path.join(runDir, 'editor.png');
const explicitUrl = args.url ? String(args.url) : '';
const viewIds = ['canvas', 'assets', 'entities', 'layers', 'events', 'properties', 'world', 'sharing', 'debugging', 'agent'];

async function main() {
  let server = null;
  let chrome = null;
  try {
    let url = explicitUrl;
    if (!url) {
      const port = await freePort();
      server = await serveDemo(port);
      url = `http://127.0.0.1:${port}/inkwell-frontier-editor.html`;
    }

    chrome = await CdpBrowser.launch();
    const page = await chrome.newPage();
    const frontier = await createFrontierAiSession(page, {
      runId,
      sampleLimit: 64,
      defaultMaxDepth: 7,
      defaultMaxEntries: 640,
      state: [
        stateProbe('app', 'window.frontierInkwellEditor.state', {
          paths: [
            '/activeView',
            '/declaredViews',
            '/iconSource/source',
            '/iconSource/requiredNames',
            '/iconSource/renderedNames',
            '/canvas/itemCount',
            '/canvas/layerCount',
            '/viewFrames/selectedEntity/fieldCount',
            '/viewFrames/world/fieldCount',
            '/viewFrames/sharing/fieldCount',
            '/collaboration/roomId',
            '/collaboration/queuedPatches',
            '/offline/canEditOffline'
          ]
        }),
        stateProbe('dom-health', `(() => ({
          images: Array.from(document.images).map((img) => ({
            src: img.getAttribute('src'),
            complete: img.complete,
            width: img.naturalWidth,
            height: img.naturalHeight
          })),
          visiblePanel: document.querySelector('[data-view-panel]:not([hidden])')?.dataset?.viewPanel || '',
          fieldControls: document.querySelectorAll('.fieldControl, select, input[type="range"], .toggleControl input').length,
          duplicateViewButtons: document.querySelectorAll('[data-view-button="sharing"]').length,
          localSnapshot: Boolean(localStorage.getItem('frontier.inkwell.editor.snapshot.v1'))
        }))`, {
          paths: [
            '/images',
            '/visiblePanel',
            '/fieldControls',
            '/duplicateViewButtons',
            '/localSnapshot'
          ]
        })
      ],
      dom: [
        domProbe('view-buttons', '[data-view-button]', {
          include: ['text', 'attributes', 'rect'],
          attributes: ['data-view-button', 'aria-pressed', 'title']
        }),
        domProbe('view-panels', '[data-view-panel]', {
          include: ['text', 'attributes', 'rect'],
          attributes: ['data-view-panel', 'hidden']
        }),
        domProbe('forms', '.dataForm', {
          include: ['text', 'attributes', 'rect'],
          attributes: ['data-view-frame']
        })
      ],
      defaultStep: {
        timeoutMs: 3000,
        intervalMs: 50
      }
    });

    await page.goto(url);
    await waitForPage(page, 'window.frontierInkwellEditor && window.__FRONTIER_PLAYWRIGHT__');
    await frontier.sample('loaded');

    const loaded = await page.evaluate(() => {
      const editor = window.frontierInkwellEditor;
      return {
        title: document.title,
        declaredViews: editor?.state?.declaredViews || [],
        activeView: editor?.state?.activeView || '',
        icons: editor?.state?.iconSource || {},
        imageCount: document.images.length,
        fieldControls: document.querySelectorAll('.fieldControl, select, input[type="range"], .toggleControl input').length,
        sharingButtons: document.querySelectorAll('[data-view-button="sharing"]').length,
        localSnapshot: Boolean(localStorage.getItem('frontier.inkwell.editor.snapshot.v1'))
      };
    });
    assert(loaded.title === 'Inkwell Frontier Editor Scaffold', 'unexpected document title');
    assert(JSON.stringify(loaded.declaredViews) === JSON.stringify(viewIds), 'declared views did not match expected scaffold');
    assert(loaded.imageCount >= 3, 'expected copied Inkwell visual assets to render');
    assert(loaded.fieldControls >= 20, 'expected data-driven form controls to be present');
    assert(loaded.sharingButtons >= 2, 'View -> Sharing should be available from more than one editor surface');
    assert(loaded.localSnapshot === true, 'offline local snapshot should be persisted on load');
    assert(loaded.icons.source === 'inkwell-world-editor-react-icons', 'expected existing world editor icon source');
    for (const iconName of loaded.icons.requiredNames || []) {
      assert((loaded.icons.renderedNames || []).includes(iconName), `expected Inkwell icon to render: ${iconName}`);
    }

    const images = await page.evaluate(() => Array.from(document.images).map((img) => ({
      src: img.getAttribute('src'),
      complete: img.complete,
      width: img.naturalWidth,
      height: img.naturalHeight
    })));
    for (const image of images) {
      assert(image.complete && image.width > 0 && image.height > 0, `missing image asset: ${image.src}`);
    }

    for (const viewId of viewIds) {
      await frontier.step(`activate ${viewId} view`, async () => {
        await clickElementCenter(page, `[data-view-button="${viewId}"]`);
        await waitForPage(page, `
          window.frontierInkwellEditor.state.activeView === ${JSON.stringify(viewId)} &&
          document.querySelector('[data-view-panel="${viewId}"]') &&
          !document.querySelector('[data-view-panel="${viewId}"]').hidden
        `);
      }, {
        waitFor: { source: 'state', id: 'app', path: '/activeView', changed: viewId !== 'canvas' }
      });
      await frontier.sample(`view:${viewId}`);
    }

    const coverage = await page.evaluate((expectedViews) => {
      const panels = Array.from(document.querySelectorAll('[data-view-panel]')).map((panel) => panel.dataset.viewPanel);
      const buttons = Array.from(document.querySelectorAll('[data-view-button]')).map((button) => button.dataset.viewButton);
      const sharingText = document.querySelector('[data-view-panel="sharing"]')?.textContent || '';
      return {
        panels,
        missingPanels: expectedViews.filter((id) => !panels.includes(id)),
        missingButtons: expectedViews.filter((id) => !buttons.includes(id)),
        sharingHasRoomLink: sharingText.includes('Room link'),
        sharingHasPresence: sharingText.includes('Designing tiles') && sharingText.includes('Offline queue'),
        sharingHasStandalone: sharingText.includes('Standalone sync server'),
        propertiesFrame: document.querySelector('[data-view-frame="inkwell.editor.selected-entity"]') !== null,
        worldFrame: document.querySelector('[data-view-frame="inkwell.editor.world-settings"]') !== null,
        sharingFrame: document.querySelector('[data-view-frame="inkwell.editor.sharing"]') !== null
      };
    }, viewIds);
    assert(coverage.missingPanels.length === 0, 'missing panels: ' + coverage.missingPanels.join(', '));
    assert(coverage.missingButtons.length === 0, 'missing buttons: ' + coverage.missingButtons.join(', '));
    assert(coverage.sharingHasRoomLink && coverage.sharingHasPresence && coverage.sharingHasStandalone, 'sharing view is missing collaboration affordances');
    assert(coverage.propertiesFrame && coverage.worldFrame && coverage.sharingFrame, 'data-driven form frames are missing');

    await fs.mkdir(runDir, { recursive: true });
    await page.screenshot(screenshotPath);
    const evidence = await frontier.evidence([
      { id: 'active-view-changes', query: { source: 'state', id: 'app', path: '/activeView', changed: true }, limit: 16 },
      { id: 'all-view-panels', query: { source: 'dom', id: 'view-panels' }, limit: 16 },
      { id: 'sharing-panel', query: { source: 'dom', id: 'view-panels', textIncludes: 'Room link' }, limit: 4 },
      { id: 'forms', query: { source: 'dom', id: 'forms' }, limit: 6 },
      { id: 'offline-snapshot', query: { source: 'state', id: 'dom-health', path: '/localSnapshot' }, limit: 3 },
      { id: 'icon-source', query: { source: 'state', id: 'app', path: '/iconSource/source' }, limit: 3 }
    ], {
      includeJsonl: true,
      includeLogRecords: true,
      includeTimeline: true,
      runId
    });

    const browserErrors = page.events.filter((event) => {
      const level = String(event.level || event.type || '').toLowerCase();
      const text = String(event.text || event.description || event.message || '');
      return level === 'error' || /uncaught|syntaxerror|typeerror|referenceerror/i.test(text);
    });
    assert(browserErrors.length === 0, 'browser logged errors: ' + JSON.stringify(browserErrors.slice(0, 3)));

    await fs.writeFile(evidencePath, JSON.stringify({
      ok: true,
      runId,
      url,
      loaded,
      coverage,
      evidence,
      screenshotPath
    }, null, 2));

    console.log(JSON.stringify({
      ok: true,
      runId,
      url,
      evidencePath,
      screenshotPath,
      viewCount: viewIds.length,
      fieldControls: loaded.fieldControls,
      iconCount: loaded.icons.renderedNames?.length ?? 0,
      summary: evidence.report.summary
    }, null, 2));
  } finally {
    if (chrome) await chrome.close().catch(() => {});
    if (server) await new Promise((resolve) => server.close(resolve));
  }
}

async function clickElementCenter(page, selector) {
  const point = await page.evaluate((nextSelector) => {
    const element = document.querySelector(nextSelector);
    if (!element) throw new Error(`missing element: ${nextSelector}`);
    const rect = element.getBoundingClientRect();
    return {
      x: Math.round(rect.left + rect.width * 0.5),
      y: Math.round(rect.top + rect.height * 0.5)
    };
  }, selector);
  await page.click(point.x, point.y);
}

async function serveDemo(port) {
  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url || '/', `http://127.0.0.1:${port}`);
      if (url.pathname === '/favicon.ico') {
        response.writeHead(204, { 'cache-control': 'no-store' });
        response.end();
        return;
      }
      const pathname = url.pathname === '/' ? '/inkwell-frontier-editor.html' : url.pathname;
      const file = safeJoin(__dirname, pathname.slice(1));
      const stat = file ? await fs.stat(file).catch(() => null) : null;
      if (!file || !stat?.isFile()) {
        response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        response.end('not found');
        return;
      }
      response.writeHead(200, {
        'content-type': contentType(file),
        'cache-control': 'no-store'
      });
      response.end(await fs.readFile(file));
    } catch (error) {
      response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      response.end(error?.stack || String(error));
    }
  });
  await new Promise((resolve, reject) => {
    server.listen(port, '127.0.0.1', resolve);
    server.on('error', reject);
  });
  return server;
}

function safeJoin(root, requestPath) {
  const file = path.resolve(root, requestPath);
  if (!file.startsWith(root + path.sep)) return null;
  return file;
}

function contentType(file) {
  if (file.endsWith('.html')) return 'text/html; charset=utf-8';
  if (file.endsWith('.css')) return 'text/css; charset=utf-8';
  if (file.endsWith('.js') || file.endsWith('.mjs')) return 'text/javascript; charset=utf-8';
  if (file.endsWith('.png')) return 'image/png';
  if (file.endsWith('.json')) return 'application/json; charset=utf-8';
  return 'application/octet-stream';
}

class CdpBrowser {
  constructor(process, port, profileDir) {
    this.process = process;
    this.port = port;
    this.profileDir = profileDir;
  }

  static async launch() {
    const chromePath = findChrome();
    const port = await freePort();
    const profileDir = await fs.mkdtemp(path.join(os.tmpdir(), 'frontier-inkwell-editor-chrome-'));
    const chromeArgs = [
      '--headless=new',
      `--user-data-dir=${profileDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--remote-debugging-address=127.0.0.1',
      `--remote-debugging-port=${port}`,
      '--window-size=1440,960',
      'about:blank'
    ];
    const child = spawn(chromePath, chromeArgs, { stdio: ['ignore', 'ignore', 'pipe'] });
    await waitForCdp(port, child);
    return new CdpBrowser(child, port, profileDir);
  }

  async newPage() {
    const target = await cdpHttp(this.port, '/json/new?about:blank', { method: 'PUT' });
    const page = await CdpPage.connect(target.webSocketDebuggerUrl);
    await page.enable();
    return page;
  }

  async close() {
    this.process.kill('SIGTERM');
    await fs.rm(this.profileDir, { recursive: true, force: true }).catch(() => {});
  }
}

class CdpPage {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.eventWaiters = new Map();
    this.events = [];
    ws.addEventListener('message', (event) => this.onMessage(event));
  }

  static async connect(wsUrl) {
    if (typeof WebSocket !== 'function') throw new Error('Node WebSocket global is required for CDP verification');
    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true });
      ws.addEventListener('error', reject, { once: true });
    });
    return new CdpPage(ws);
  }

  async enable() {
    await this.send('Runtime.enable');
    await this.send('Page.enable');
    await this.send('Log.enable');
  }

  async addInitScript(script) {
    const source = typeof script === 'string' ? script : script.content;
    await this.send('Page.addScriptToEvaluateOnNewDocument', { source });
  }

  async goto(nextUrl) {
    const loaded = this.waitForEvent('Page.loadEventFired', 5000);
    await this.send('Page.navigate', { url: nextUrl });
    await loaded.catch(() => {});
    await waitForPage(this, 'document.readyState === "complete"', 5000);
  }

  async evaluate(pageFunction, arg) {
    const expression = typeof pageFunction === 'string'
      ? pageFunction
      : `(${pageFunction.toString()})(${arg === undefined ? 'undefined' : JSON.stringify(arg)})`;
    const result = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
    if (result.exceptionDetails) {
      const description = result.exceptionDetails.exception?.description || result.exceptionDetails.text || 'evaluation failed';
      throw new Error(description);
    }
    return result.result?.value;
  }

  async click(x, y) {
    await this.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'none', pointerType: 'mouse' });
    await this.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1, pointerType: 'mouse' });
    await this.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1, pointerType: 'mouse' });
  }

  async screenshot(file) {
    const result = await this.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    await fs.writeFile(file, Buffer.from(result.data, 'base64'));
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
    });
  }

  waitForEvent(method, timeoutMs) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timed out waiting for ' + method)), timeoutMs);
      const waiters = this.eventWaiters.get(method) || [];
      waiters.push((payload) => {
        clearTimeout(timer);
        resolve(payload);
      });
      this.eventWaiters.set(method, waiters);
    });
  }

  onMessage(event) {
    const message = JSON.parse(event.data);
    if (message.id && this.pending.has(message.id)) {
      const request = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) request.reject(new Error(`${request.method}: ${message.error.message}`));
      else request.resolve(message.result || {});
      return;
    }
    if (message.method === 'Runtime.exceptionThrown') this.events.push(message.params.exceptionDetails);
    if (message.method === 'Log.entryAdded') this.events.push(message.params.entry);
    const waiters = this.eventWaiters.get(message.method);
    if (waiters?.length) {
      this.eventWaiters.delete(message.method);
      for (const waiter of waiters) waiter(message.params);
    }
  }
}

async function waitForPage(page, expression, timeoutMs = 5000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const ok = await page.evaluate(`Boolean(${expression})`).catch(() => false);
    if (ok) return;
    await sleep(50);
  }
  throw new Error('timed out waiting for page expression: ' + expression);
}

async function waitForCdp(port, child) {
  const started = Date.now();
  while (Date.now() - started < 5000) {
    if (child.exitCode !== null) throw new Error('Chrome exited before CDP was ready');
    try {
      await cdpHttp(port, '/json/version');
      return;
    } catch {
      await sleep(80);
    }
  }
  throw new Error('timed out waiting for Chrome CDP');
}

async function cdpHttp(port, pathname, options = {}) {
  const response = await fetch(`http://127.0.0.1:${port}${pathname}`, options);
  if (!response.ok) throw new Error(`CDP HTTP ${response.status} for ${pathname}`);
  return response.json();
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const nextPort = typeof address === 'object' && address ? address.port : 0;
      server.close(() => resolve(nextPort));
    });
    server.on('error', reject);
  });
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    commandPath('google-chrome'),
    commandPath('chromium'),
    commandPath('chromium-browser')
  ].filter(Boolean);
  for (const candidate of candidates) {
    const result = spawnSync(candidate, ['--version'], { stdio: 'ignore' });
    if (result.status === 0) return candidate;
  }
  throw new Error('Chrome/Chromium not found. Set CHROME_PATH to run the agent verification.');
}

function commandPath(command) {
  const result = spawnSync('which', [command], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : '';
}

function readArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const equalIndex = arg.indexOf('=');
    if (equalIndex !== -1) {
      out[arg.slice(2, equalIndex)] = arg.slice(equalIndex + 1);
      continue;
    }
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) out[key] = true;
    else {
      out[key] = next;
      i += 1;
    }
  }
  return out;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

await main();
