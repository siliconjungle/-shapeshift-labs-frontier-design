import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createCssVariables,
  createDesignRegistryGraph,
  defineDesignSystem,
  materializeDesignRecipe,
  roleRef,
  tokenRef,
  validateDesignSystem
} from '../dist/index.js';

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPath = readStringArg('--out') ?? path.join(packageDir, 'demo', 'inkwell-editor-demo.html');
const outDir = path.dirname(outPath);
const inkwellPublicDir = '/Users/james/code/inkwell-mono/inkwell-api-frontend/public';
const heroImage = copyDemoAsset(path.join(inkwellPublicDir, 'inkwell-hero-image.png'), 'inkwell-hero-image.png');
const footerImage = copyDemoAsset(path.join(inkwellPublicDir, 'inkwell-footer.png'), 'inkwell-footer.png');
const playButtonImage = copyDemoAsset(path.join(inkwellPublicDir, 'play-button.png'), 'play-button.png');

const design = defineDesignSystem({
  id: 'inkwell.editor.feed-first',
  name: 'Inkwell Editor Feed-First Demo',
  package: '@shapeshift-labs/frontier-design',
  targets: ['dom', 'canvas2d', 'svg'],
  tokens: {
    color: {
      $type: 'color',
      black: '#000000',
      ink: {
        980: '#08080b',
        960: '#0d0d0d',
        940: '#111117',
        920: '#141416',
        900: '#151517',
        860: '#171a21',
        840: '#1a1b20',
        820: '#1e1e1e',
        760: '#282828',
        700: '#2a2a2a',
        660: '#2a2d35',
        620: '#333333',
        560: '#3a3a3a',
        520: '#3a3f4b'
      },
      text: {
        100: '#ffffff',
        140: '#f2f5fc',
        180: '#e0e0e0',
        220: '#c0c0c0',
        320: '#8b95a7',
        360: '#757575'
      },
      purple: {
        400: '#7e6aff',
        500: '#6940ff',
        560: '#6342f5',
        620: '#605bfc'
      },
      warm: {
        400: '#ffba40'
      },
      role: {
        admin: '#218e5d',
        demigod: '#a44b8b',
        danger: '#d75555'
      }
    },
    space: {
      $type: 'dimension',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px'
    },
    radius: {
      $type: 'dimension',
      control: '8px',
      card: '8px',
      panel: '8px',
      media: '8px',
      pill: '999px'
    },
    size: {
      $type: 'dimension',
      rail: '80px',
      control: '36px',
      icon: '40px',
      avatar: '48px',
      tile: '192px'
    },
    font: {
      ui: 'Geist, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace'
    },
    shadow: {
      $type: 'shadow',
      soft: '0 2px 4px rgba(0, 0, 0, 0.15)',
      sticky: '0 4px 14px rgba(0, 0, 0, 0.45)',
      modal: '0 24px 54px rgba(0, 0, 0, 0.52)',
      focus: '0 0 0 2px {color.purple.500}'
    }
  },
  roles: {
    surface: {
      app: tokenRef('color.black'),
      home: tokenRef('color.ink.940'),
      homeBand: tokenRef('color.ink.900'),
      rail: tokenRef('color.ink.960'),
      panel: tokenRef('color.ink.820'),
      panelRaised: tokenRef('color.ink.860'),
      card: tokenRef('color.ink.840'),
      cardFlat: tokenRef('color.ink.820'),
      control: tokenRef('color.ink.760'),
      controlHover: tokenRef('color.ink.560'),
      canvas: tokenRef('color.ink.940'),
      thumbnail: tokenRef('color.ink.900')
    },
    content: {
      default: tokenRef('color.text.100'),
      strong: tokenRef('color.text.140'),
      muted: tokenRef('color.text.220'),
      subtle: tokenRef('color.text.320'),
      placeholder: tokenRef('color.text.360'),
      inverse: tokenRef('color.black')
    },
    border: {
      rail: '#1a1a1a',
      muted: tokenRef('color.ink.620'),
      soft: tokenRef('color.ink.660'),
      strong: tokenRef('color.ink.520'),
      active: tokenRef('color.purple.500'),
      focus: tokenRef('color.purple.400')
    },
    accent: {
      primary: tokenRef('color.purple.500'),
      deep: tokenRef('color.purple.560'),
      user: tokenRef('color.purple.620'),
      warm: tokenRef('color.warm.400'),
      admin: tokenRef('color.role.admin'),
      demigod: tokenRef('color.role.demigod'),
      danger: tokenRef('color.role.danger'),
      onPrimary: tokenRef('color.text.100')
    },
    layout: {
      gap: tokenRef('space.4'),
      rail: tokenRef('size.rail'),
      control: tokenRef('size.control'),
      tile: tokenRef('size.tile')
    },
    shape: {
      control: tokenRef('radius.control'),
      card: tokenRef('radius.card'),
      panel: tokenRef('radius.panel'),
      media: tokenRef('radius.media'),
      pill: tokenRef('radius.pill')
    },
    type: {
      ui: tokenRef('font.ui'),
      mono: tokenRef('font.mono')
    },
    effect: {
      softShadow: tokenRef('shadow.soft'),
      stickyShadow: tokenRef('shadow.sticky'),
      modalShadow: tokenRef('shadow.modal'),
      focusRing: tokenRef('shadow.focus')
    }
  },
  recipes: {
    'editor.shell': {
      base: {
        root: {
          fill: roleRef('surface.app'),
          content: roleRef('content.default'),
          font: roleRef('type.ui')
        }
      }
    },
    'editor.rail': {
      base: {
        root: {
          fill: roleRef('surface.rail'),
          stroke: roleRef('border.rail')
        }
      }
    },
    'editor.panel': {
      base: {
        root: {
          fill: roleRef('surface.panel'),
          stroke: roleRef('border.muted'),
          radius: roleRef('shape.panel'),
          shadow: roleRef('effect.softShadow')
        }
      },
      variants: {
        elevation: {
          flat: {
            root: {
              fill: roleRef('surface.panel')
            }
          },
          raised: {
            root: {
              fill: roleRef('surface.panelRaised'),
              stroke: roleRef('border.soft'),
              shadow: roleRef('effect.modalShadow')
            }
          }
        }
      },
      defaultVariants: { elevation: 'flat' }
    },
    'editor.card': {
      base: {
        root: {
          fill: roleRef('surface.card'),
          stroke: roleRef('border.soft'),
          radius: roleRef('shape.card'),
          shadow: roleRef('effect.softShadow')
        }
      },
      variants: {
        selected: {
          false: {},
          true: {
            root: {
              stroke: roleRef('border.active'),
              shadow: '0 0 0 2px {border.active}'
            }
          }
        }
      },
      defaultVariants: { selected: 'false' }
    },
    'editor.control': {
      base: {
        root: {
          fill: roleRef('surface.control'),
          stroke: roleRef('border.strong'),
          content: roleRef('content.muted'),
          radius: roleRef('shape.control'),
          padding: tokenRef('space.2')
        }
      },
      variants: {
        tone: {
          neutral: {},
          active: {
            root: {
              fill: roleRef('accent.primary'),
              stroke: roleRef('accent.primary'),
              content: roleRef('accent.onPrimary')
            }
          },
          warm: {
            root: {
              fill: roleRef('accent.warm'),
              stroke: roleRef('accent.warm'),
              content: roleRef('content.inverse')
            }
          }
        }
      },
      defaultVariants: { tone: 'neutral' }
    },
    'editor.input': {
      base: {
        root: {
          fill: roleRef('surface.panel'),
          stroke: roleRef('border.muted'),
          content: roleRef('content.default'),
          radius: roleRef('shape.control'),
          shadow: roleRef('effect.stickyShadow'),
          font: roleRef('type.ui')
        }
      },
      variants: {
        active: {
          false: {},
          true: {
            root: {
              stroke: roleRef('border.active')
            }
          }
        }
      },
      defaultVariants: { active: 'false' }
    },
    'editor.pill': {
      base: {
        root: {
          fill: roleRef('surface.control'),
          content: roleRef('content.default'),
          radius: roleRef('shape.pill'),
          padding: tokenRef('space.2')
        }
      },
      variants: {
        tone: {
          neutral: {},
          user: {
            root: {
              fill: roleRef('accent.user'),
              content: roleRef('accent.onPrimary')
            }
          },
          demigod: {
            root: {
              fill: roleRef('accent.demigod'),
              content: roleRef('accent.onPrimary')
            }
          },
          admin: {
            root: {
              fill: roleRef('accent.admin'),
              content: roleRef('accent.onPrimary')
            }
          }
        }
      },
      defaultVariants: { tone: 'neutral' }
    },
    'editor.thumbnail': {
      base: {
        root: {
          fill: roleRef('surface.thumbnail'),
          stroke: roleRef('border.muted'),
          radius: roleRef('shape.media')
        }
      },
      variants: {
        selected: {
          false: {},
          true: {
            root: {
              stroke: roleRef('border.active')
            }
          }
        }
      },
      defaultVariants: { selected: 'false' }
    },
    'editor.canvas': {
      base: {
        root: {
          fill: roleRef('surface.canvas'),
          stroke: roleRef('border.soft'),
          radius: roleRef('shape.panel')
        }
      }
    }
  }
});

const issues = validateDesignSystem(design);
if (issues.length > 0) {
  throw new Error('Inkwell editor design system did not validate: ' + JSON.stringify(issues, null, 2));
}

const graph = createDesignRegistryGraph(design);
const css = [
  createCssVariables(design, { selector: ':root', includeModes: false }),
  recipeCss('.inkwell-demo', 'editor.shell'),
  recipeCss('.demoRail', 'editor.rail'),
  recipeCss('.demoPanel', 'editor.panel'),
  recipeCss('.demoPanelRaised', 'editor.panel', { elevation: 'raised' }),
  recipeCss('.demoCard', 'editor.card'),
  recipeCss('.demoCardSelected', 'editor.card', { selected: 'true' }),
  recipeCss('.demoControl', 'editor.control'),
  recipeCss('.demoControlActive', 'editor.control', { tone: 'active' }),
  recipeCss('.demoControlWarm', 'editor.control', { tone: 'warm' }),
  recipeCss('.demoInput', 'editor.input'),
  recipeCss('.demoInputActive', 'editor.input', { active: 'true' }),
  recipeCss('.demoPill', 'editor.pill'),
  recipeCss('.demoPillUser', 'editor.pill', { tone: 'user' }),
  recipeCss('.demoPillDemigod', 'editor.pill', { tone: 'demigod' }),
  recipeCss('.demoPillAdmin', 'editor.pill', { tone: 'admin' }),
  recipeCss('.demoThumb', 'editor.thumbnail'),
  recipeCss('.demoThumbSelected', 'editor.thumbnail', { selected: 'true' }),
  recipeCss('.demoCanvas', 'editor.canvas'),
  layoutCss()
].join('\n\n');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Inkwell Editor Design System Demo</title>
  <style>${css}</style>
</head>
<body class="inkwell-demo">
  <aside class="demoRail" aria-label="Editor sections">
    <button class="demoRailButton demoControlActive" aria-label="Wish">✦</button>
    <button class="demoRailButton demoControl" aria-label="Worlds">▣</button>
    <button class="demoRailButton demoControl" aria-label="Library">⌕</button>
    <button class="demoRailButton demoControl" aria-label="Settings">⚙</button>
    <button class="demoRailButton demoControl demoRailAvatar" aria-label="Profile">J</button>
  </aside>

  <main class="demoWorkspace">
    <header class="demoTopbar">
      <div class="demoInputActive demoPrompt">
        <span class="demoPromptText">Design the town gate palette with brighter foreground sprites</span>
        <button class="demoPromptSubmit demoControlActive" aria-label="Submit wish">↑</button>
      </div>
      <div class="demoTopMeta">
        <span class="demoPillUser">Latest</span>
        <span class="demoPill">Random</span>
        <span class="demoPill">Scene</span>
      </div>
    </header>

    <section class="demoGrid" aria-label="Editor workspace">
      <section class="demoPanel demoLibrary" aria-label="Asset palette">
        <div class="demoSectionHeader">
          <span class="demoEyebrow">Palette</span>
          <button class="demoControl" aria-label="Search">⌕</button>
        </div>
        <article class="demoCardSelected demoFeedRow">
          <div class="demoThumbSelected demoFeedMedia"><img src="${heroImage}" alt="" /></div>
          <div class="demoFeedBody">
            <div class="demoFeedUser">
              <span class="demoAvatar">I</span>
              <div><strong>@inkwell</strong><span>just now</span></div>
            </div>
            <p>Moonlit town gate, purple banners, bright playable silhouette.</p>
            <div class="demoChipRow"><span class="demoPillUser">scene</span><span class="demoPill">256x256</span></div>
          </div>
        </article>
        <article class="demoCard demoFeedRow">
          <div class="demoThumb demoFeedMedia"><img src="${footerImage}" alt="" /></div>
          <div class="demoFeedBody">
            <div class="demoFeedUser">
              <span class="demoAvatar demoAvatarDemigod">M</span>
              <div><strong>@myth</strong><span>3m ago</span></div>
            </div>
            <p>Animated ember sprite with readable outline and warm idle glow.</p>
            <div class="demoChipRow"><span class="demoPillDemigod">effect</span><span class="demoPill">loop</span></div>
          </div>
        </article>
      </section>

      <section class="demoCanvas demoStage" aria-label="Canvas">
        <div class="demoStageToolbar">
          <button class="demoControlActive" aria-label="Select">↖</button>
          <button class="demoControl" aria-label="Brush">✎</button>
          <button class="demoControl" aria-label="Eraser">⌫</button>
          <button class="demoControlWarm" aria-label="Play">▶</button>
          <span class="demoPill">100%</span>
        </div>
        <div class="demoStageScene">
          <img src="${heroImage}" alt="" />
          <div class="demoSelectionBox"></div>
          <div class="demoSpriteCard">
            <img src="${playButtonImage}" alt="" />
            <span>Play anchor</span>
          </div>
        </div>
        <div class="demoStageFooter">
          <span class="demoPill">Town Square</span>
          <span class="demoPill">24 nodes</span>
          <span class="demoPillAdmin">Published draft</span>
        </div>
      </section>

      <aside class="demoPanelRaised demoInspector" aria-label="Properties">
        <div class="demoSectionHeader">
          <span class="demoEyebrow">Properties</span>
          <button class="demoControl" aria-label="More">⋯</button>
        </div>
        <div class="demoInspectorPreview demoThumbSelected">
          <img src="${heroImage}" alt="" />
        </div>
        <label class="demoField">
          <span>Name</span>
          <input class="demoInput" value="Town gate palette" readonly />
        </label>
        <label class="demoField">
          <span>Style</span>
          <select class="demoInput" aria-label="Style">
            <option>Feed first</option>
            <option>High contrast</option>
          </select>
        </label>
        <div class="demoSwatches" aria-label="Design roles">
          <span style="--swatch: var(--frd-role-accent-primary)"></span>
          <span style="--swatch: var(--frd-role-surface-panel)"></span>
          <span style="--swatch: var(--frd-role-border-soft)"></span>
          <span style="--swatch: var(--frd-role-accent-warm)"></span>
        </div>
        <div class="demoJson" aria-hidden="true">${escapeHtml(JSON.stringify({
          kind: graph.kind,
          tokens: design.summary.tokenCount,
          roles: design.summary.roleCount,
          recipes: design.summary.recipeCount
        }, null, 2))}</div>
      </aside>
    </section>
  </main>
</body>
</html>
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, html);
console.log(outPath);

function recipeCss(selector, recipeId, variants = {}) {
  const frame = materializeDesignRecipe(design, recipeId, { target: 'dom', variants });
  const styles = frame.slots.root?.targetStyles ?? {};
  return `${selector} {\n${styleObjectToCss(styles)}\n}`;
}

function styleObjectToCss(styles) {
  const declarations = [];
  for (const [property, value] of Object.entries(styles)) {
    declarations[declarations.length] = `  ${toCssProperty(property)}: ${String(value)};`;
  }
  if (styles.borderColor !== undefined && styles.borderWidth === undefined) {
    declarations[declarations.length] = '  border-width: 1px;';
    declarations[declarations.length] = '  border-style: solid;';
  }
  return declarations.join('\n');
}

function layoutCss() {
  return `
* { box-sizing: border-box; }
html, body { margin: 0; min-height: 100%; background: var(--frd-role-surface-app); }
body { min-height: 100vh; }
.inkwell-demo { min-height: 100vh; display: grid; grid-template-columns: var(--frd-role-layout-rail) minmax(0, 1fr); }
button, input, select { font: inherit; }
button { cursor: pointer; }
.demoRail { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 12px 0; }
.demoRailButton { width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 0; font-size: 18px; }
.demoRailAvatar { margin-top: auto; border-radius: 999px; font-weight: 700; }
.demoWorkspace { min-width: 0; min-height: 100vh; background: var(--frd-role-surface-home); display: grid; grid-template-rows: auto minmax(0, 1fr); }
.demoTopbar { position: sticky; top: 0; z-index: 3; display: grid; grid-template-columns: minmax(280px, 800px) auto; align-items: center; justify-content: center; gap: 16px; padding: 16px; background: rgba(0, 0, 0, 0.72); backdrop-filter: blur(12px); border-bottom: 1px solid var(--frd-role-border-muted); }
.demoPrompt { min-height: 58px; display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 8px 8px 8px 18px; }
.demoPromptText { min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; color: var(--frd-role-content-default); }
.demoPromptSubmit { width: 42px; height: 42px; padding: 0; border-radius: 999px; }
.demoTopMeta, .demoChipRow, .demoStageFooter { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.demoGrid { min-width: 0; min-height: 0; padding: 16px; display: grid; grid-template-columns: minmax(280px, 360px) minmax(420px, 1fr) minmax(280px, 340px); gap: 16px; }
.demoPanel, .demoPanelRaised, .demoCanvas { min-width: 0; min-height: 0; border-style: solid; border-width: 1px; overflow: hidden; }
.demoLibrary, .demoInspector { padding: 16px; display: flex; flex-direction: column; gap: 16px; }
.demoSectionHeader { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.demoEyebrow { color: var(--frd-role-content-muted); font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.demoFeedRow { display: grid; grid-template-columns: 96px minmax(0, 1fr); gap: 12px; padding: 12px; border-style: solid; border-width: 1px; }
.demoFeedMedia { width: 96px; aspect-ratio: 1 / 1; overflow: hidden; border-style: solid; border-width: 1px; }
.demoFeedMedia img, .demoInspectorPreview img, .demoStageScene > img { width: 100%; height: 100%; object-fit: cover; display: block; }
.demoFeedBody { min-width: 0; display: grid; gap: 10px; align-content: start; }
.demoFeedBody p { margin: 0; color: var(--frd-role-content-muted); line-height: 1.4; font-size: 14px; }
.demoFeedUser { display: flex; align-items: center; gap: 10px; min-width: 0; }
.demoFeedUser strong { color: var(--frd-role-content-default); font-size: 14px; }
.demoFeedUser span:not(.demoAvatar):not(.demoAvatarDemigod) { display: block; color: var(--frd-role-content-subtle); font-size: 12px; }
.demoAvatar { width: 36px; height: 36px; border-radius: 999px; background: var(--frd-role-accent-user); color: var(--frd-role-accent-onprimary); display: inline-flex; align-items: center; justify-content: center; font-weight: 700; flex: none; }
.demoAvatarDemigod { background: var(--frd-role-accent-demigod); }
.demoPill, .demoPillUser, .demoPillDemigod, .demoPillAdmin { display: inline-flex; align-items: center; min-height: 26px; padding: 0 10px; font-size: 12px; font-weight: 700; line-height: 1; }
.demoStage { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; }
.demoStageToolbar { display: flex; align-items: center; gap: 8px; padding: 12px; border-bottom: 1px solid var(--frd-role-border-muted); }
.demoStageToolbar button { width: 36px; height: 36px; padding: 0; }
.demoStageToolbar .demoPill { margin-left: auto; }
.demoStageScene { position: relative; min-height: 0; overflow: hidden; background: var(--frd-role-surface-home); }
.demoStageScene > img { object-fit: cover; filter: saturate(0.9) brightness(0.72); }
.demoSelectionBox { position: absolute; left: 18%; top: 18%; width: 44%; height: 38%; border: 2px solid var(--frd-role-border-active); box-shadow: 0 0 0 999px rgba(0, 0, 0, 0.22), 0 0 0 2px rgba(105, 64, 255, 0.22); }
.demoSpriteCard { position: absolute; right: 22px; bottom: 22px; width: 164px; min-height: 92px; padding: 10px; border-radius: 8px; border: 1px solid var(--frd-role-border-soft); background: rgba(23, 26, 33, 0.92); color: var(--frd-role-content-strong); display: grid; gap: 8px; box-shadow: var(--frd-role-effect-modalshadow); }
.demoSpriteCard img { width: 86px; justify-self: center; filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.42)); }
.demoSpriteCard span { text-align: center; font-size: 12px; color: var(--frd-role-content-muted); }
.demoStageFooter { padding: 12px; border-top: 1px solid var(--frd-role-border-muted); }
.demoInspectorPreview { width: 100%; aspect-ratio: 16 / 9; overflow: hidden; border-style: solid; border-width: 1px; }
.demoField { display: grid; gap: 6px; color: var(--frd-role-content-muted); font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
.demoField .demoInput { width: 100%; min-width: 0; min-height: 38px; padding: 0 10px; border-style: solid; border-width: 1px; outline: none; box-shadow: none; background: var(--frd-role-surface-control); }
.demoField input.demoInput { caret-color: var(--frd-role-border-active); }
.demoField select.demoInput { appearance: none; -webkit-appearance: none; padding-right: 34px; background-image: linear-gradient(45deg, transparent 50%, var(--frd-role-content-muted) 50%), linear-gradient(135deg, var(--frd-role-content-muted) 50%, transparent 50%); background-position: calc(100% - 17px) 16px, calc(100% - 11px) 16px; background-size: 6px 6px, 6px 6px; background-repeat: no-repeat; }
.demoField .demoInput:focus { border-color: var(--frd-role-border-active); box-shadow: 0 0 0 2px rgba(105, 64, 255, 0.24); }
.demoSwatches { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
.demoSwatches span { min-height: 38px; border-radius: 8px; background: var(--swatch); border: 1px solid var(--frd-role-border-muted); }
.demoJson { margin-top: auto; padding: 12px; border-radius: 8px; border: 1px solid var(--frd-role-border-muted); background: var(--frd-role-surface-rail); color: var(--frd-role-content-subtle); font-family: var(--frd-role-type-mono); font-size: 12px; line-height: 1.45; white-space: pre-wrap; }
@media (max-width: 1120px) {
  .demoGrid { grid-template-columns: minmax(260px, 340px) minmax(420px, 1fr); }
  .demoInspector { grid-column: 1 / -1; min-height: 260px; }
}
@media (max-width: 820px) {
  .inkwell-demo { grid-template-columns: 1fr; grid-template-rows: minmax(0, 1fr) 64px; }
  .demoRail { position: fixed; inset: auto 0 0 0; width: 100%; height: 64px; flex-direction: row; justify-content: space-around; padding: 8px; z-index: 10; }
  .demoRailAvatar { margin-top: 0; }
  .demoWorkspace { padding-bottom: 64px; }
  .demoTopbar { grid-template-columns: 1fr; justify-content: stretch; }
  .demoGrid { grid-template-columns: 1fr; }
  .demoStage { min-height: 560px; }
}
`;
}

function toCssProperty(property) {
  return property.replace(/[A-Z]/g, (match) => '-' + match.toLowerCase());
}

function copyDemoAsset(sourcePath, filename) {
  if (!fs.existsSync(sourcePath)) throw new Error('Missing Inkwell demo asset: ' + sourcePath);
  const assetDir = path.join(outDir, 'assets');
  fs.mkdirSync(assetDir, { recursive: true });
  fs.copyFileSync(sourcePath, path.join(assetDir, filename));
  return 'assets/' + filename;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readStringArg(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}
