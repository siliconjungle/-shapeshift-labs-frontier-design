import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
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
import {
  createCanvasStateLayout,
  createCanvasSurface,
  materializeCanvasFrame
} from '../../frontier-canvas/dist/index.js';
import {
  createViewManifest,
  materializeView,
  traceViewImpact
} from '../../frontier-view/dist/index.js';

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPath = readStringArg('--out') ?? path.join(packageDir, 'demo', 'inkwell-frontier-editor.html');
const outDir = path.dirname(outPath);
const inkwellPublicDir = '/Users/james/code/inkwell-mono/inkwell-api-frontend/public';
const inkwellFrontendDir = '/Users/james/code/inkwell-mono/inkwell-api-frontend';
const heroImage = copyDemoAsset(path.join(inkwellPublicDir, 'inkwell-hero-image.png'), 'inkwell-hero-image.png');
const footerImage = copyDemoAsset(path.join(inkwellPublicDir, 'inkwell-footer.png'), 'inkwell-footer.png');
const playButtonImage = copyDemoAsset(path.join(inkwellPublicDir, 'play-button.png'), 'play-button.png');
const iconRenderer = createInkwellIconRenderer();

const design = defineDesignSystem({
  id: 'inkwell.editor.frontier-scaffold',
  name: 'Inkwell Frontier Editor Scaffold',
  package: '@shapeshift-labs/frontier-design',
  targets: ['dom', 'canvas2d', 'svg', 'native'],
  tokens: {
    color: {
      $type: 'color',
      black: '#000000',
      ink: {
        990: '#050506',
        970: '#09090b',
        950: '#0d0d0f',
        930: '#111116',
        900: '#151517',
        860: '#181a20',
        820: '#1d1f27',
        780: '#242734',
        720: '#2e3342',
        660: '#3b4052',
        580: '#4d556a'
      },
      text: {
        100: '#ffffff',
        140: '#f3f5fb',
        190: '#e2e6ef',
        260: '#b6bdce',
        340: '#8992a6',
        430: '#626b7d'
      },
      purple: {
        380: '#8f7dff',
        460: '#7a5cff',
        520: '#6940ff',
        600: '#5831e9'
      },
      mint: {
        420: '#35d397',
        560: '#218e5d'
      },
      warm: {
        420: '#ffba40',
        520: '#ed8f2d'
      },
      rose: {
        520: '#d75555'
      },
      blue: {
        420: '#5dd3ff'
      }
    },
    space: {
      $type: 'dimension',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
      8: '32px'
    },
    radius: {
      $type: 'dimension',
      xs: '4px',
      sm: '6px',
      md: '8px',
      pill: '999px'
    },
    size: {
      $type: 'dimension',
      rail: '64px',
      toolbar: '42px',
      panel: '320px',
      inspector: '360px'
    },
    font: {
      ui: 'Geist, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace'
    },
    shadow: {
      $type: 'shadow',
      soft: '0 2px 8px rgba(0, 0, 0, 0.24)',
      raised: '0 18px 42px rgba(0, 0, 0, 0.42)',
      focus: '0 0 0 2px rgba(105, 64, 255, 0.44)'
    }
  },
  roles: {
    surface: {
      app: tokenRef('color.black'),
      rail: tokenRef('color.ink.970'),
      topbar: tokenRef('color.ink.990'),
      panel: tokenRef('color.ink.930'),
      panelRaised: tokenRef('color.ink.860'),
      card: tokenRef('color.ink.820'),
      cardHover: tokenRef('color.ink.780'),
      control: tokenRef('color.ink.780'),
      controlHover: tokenRef('color.ink.720'),
      canvas: tokenRef('color.ink.950'),
      grid: tokenRef('color.ink.780')
    },
    content: {
      default: tokenRef('color.text.100'),
      strong: tokenRef('color.text.140'),
      muted: tokenRef('color.text.260'),
      subtle: tokenRef('color.text.340'),
      faint: tokenRef('color.text.430'),
      inverse: tokenRef('color.black')
    },
    border: {
      muted: tokenRef('color.ink.660'),
      soft: tokenRef('color.ink.580'),
      active: tokenRef('color.purple.520'),
      focus: tokenRef('color.purple.380')
    },
    accent: {
      primary: tokenRef('color.purple.520'),
      primaryHover: tokenRef('color.purple.600'),
      online: tokenRef('color.mint.420'),
      admin: tokenRef('color.mint.560'),
      warm: tokenRef('color.warm.420'),
      warning: tokenRef('color.warm.520'),
      danger: tokenRef('color.rose.520'),
      info: tokenRef('color.blue.420')
    },
    shape: {
      control: tokenRef('radius.md'),
      card: tokenRef('radius.md'),
      panel: tokenRef('radius.md'),
      pill: tokenRef('radius.pill')
    },
    layout: {
      rail: tokenRef('size.rail'),
      toolbar: tokenRef('size.toolbar'),
      panel: tokenRef('size.panel'),
      inspector: tokenRef('size.inspector'),
      gap: tokenRef('space.4')
    },
    type: {
      ui: tokenRef('font.ui'),
      mono: tokenRef('font.mono')
    },
    effect: {
      softShadow: tokenRef('shadow.soft'),
      raisedShadow: tokenRef('shadow.raised'),
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
          flat: {},
          raised: {
            root: {
              fill: roleRef('surface.panelRaised'),
              stroke: roleRef('border.soft'),
              shadow: roleRef('effect.raisedShadow')
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
          stroke: roleRef('border.muted'),
          radius: roleRef('shape.card')
        }
      },
      variants: {
        state: {
          idle: {},
          active: {
            root: {
              stroke: roleRef('border.active'),
              shadow: '0 0 0 1px {border.active}'
            }
          },
          hover: {
            root: {
              fill: roleRef('surface.cardHover')
            }
          }
        }
      },
      defaultVariants: { state: 'idle' }
    },
    'editor.control': {
      base: {
        root: {
          fill: roleRef('surface.control'),
          stroke: roleRef('border.muted'),
          radius: roleRef('shape.control'),
          content: roleRef('content.strong')
        }
      },
      variants: {
        tone: {
          neutral: {},
          primary: {
            root: {
              fill: roleRef('accent.primary'),
              stroke: roleRef('accent.primary'),
              content: roleRef('content.default')
            }
          }
        }
      },
      defaultVariants: { tone: 'neutral' }
    }
  }
});

const validation = validateDesignSystem(design);
if (validation.length > 0) {
  throw new Error('Invalid design system: ' + validation.map((entry) => entry.message).join('; '));
}

const canvasLayout = createCanvasStateLayout({
  rootPath: '/editor/canvas',
  extraPaths: [
    { id: 'world.entities', role: 'items', path: '/world/entities', scope: 'crdt' },
    { id: 'world.layers', role: 'layers', path: '/world/layers', scope: 'crdt' },
    { id: 'editor.session', role: 'session', path: '/editor/session', scope: 'local', ephemeral: true },
    { id: 'editor.presence', role: 'presence', path: '/collaboration/presence', scope: 'crdt' },
    { id: 'editor.offlineQueue', role: 'offlineQueue', path: '/collaboration/offlineQueue', scope: 'local' }
  ]
});

const canvasSurface = createCanvasSurface({
  id: 'inkwell.editor.frontier.canvas',
  title: 'Inkwell Frontier world canvas',
  package: '@shapeshift-labs/frontier-canvas',
  feature: 'feature.inkwell.frontier-editor.ui-scaffold',
  statePath: '/editor/canvas',
  document: {
    id: 'wish-world',
    title: 'Wish world layout',
    layers: [
      { id: 'terrain', title: 'Terrain', order: 1 },
      { id: 'scenery', title: 'Scenery', order: 2 },
      { id: 'characters', title: 'Characters', order: 3 },
      { id: 'triggers', title: 'Triggers', order: 4 }
    ],
    items: [
      { id: 'hero-spawn', x: 96, y: 120, width: 116, height: 148, layer: 'characters', tags: ['character', 'player'] },
      { id: 'market-arch', x: 272, y: 88, width: 220, height: 164, layer: 'scenery', tags: ['scenery'] },
      { id: 'portal-trigger', x: 540, y: 178, width: 142, height: 112, layer: 'triggers', tags: ['trigger', 'portal'] },
      { id: 'river-tile-run', x: 188, y: 342, width: 320, height: 84, layer: 'terrain', tags: ['tile', 'water'] }
    ],
    metadata: {
      renderer: 'dom-scaffold',
      eventualRenderers: ['dom', 'canvas2d', 'webgl', 'native'],
      iconSource: 'inkwell-world-editor-react-icons'
    }
  },
  session: {
    camera: { x: 0, y: 0, zoom: 0.86, minZoom: 0.2, maxZoom: 4 },
    viewport: { width: 1180, height: 780, dpr: 2, left: 0, top: 0 },
    grid: { enabled: true, size: 24, subdivisions: 4, majorEvery: 4, snap: true },
    activeToolId: 'canvas.select',
    selectedIds: ['hero-spawn']
  },
  metadata: {
    offlineFirst: true,
    realtimeByDefault: true
  }
});

const canvasFrame = materializeCanvasFrame({ surface: canvasSurface });

const editorDocument = {
  world: {
    id: 'wish-world',
    name: 'Moonlit Market Wish',
    visibility: 'shared-room',
    startArea: 'market-square',
    cameraZoom: 0.86,
    gravity: 'default',
    palette: 'inkwell-feed'
  },
  selectedEntity: {
    id: 'hero-spawn',
    type: 'character',
    name: 'Ari the Cartographer',
    layer: 'characters',
    x: 96,
    y: 120,
    width: 116,
    height: 148,
    visible: true
  },
  collaboration: {
    roomId: 'wish-market-8f7c',
    access: 'invite',
    localStatus: 'offline-ready',
    peers: 4,
    queuedPatches: 6,
    server: 'standalone-frontier-crdt-sync'
  }
};

const viewManifests = {
  selectedEntity: createViewManifest({
    id: 'inkwell.editor.selected-entity',
    source: {
      path: '/selectedEntity',
      schema: {
        type: 'object',
        required: ['id', 'name', 'type', 'layer'],
        properties: {
          id: { type: 'string', readOnly: true },
          name: { type: 'string' },
          type: { type: 'string', enum: ['character', 'item', 'scenery', 'tile', 'effect', 'trigger'] },
          layer: { type: 'string', enum: ['terrain', 'scenery', 'characters', 'triggers'] },
          x: { type: 'number' },
          y: { type: 'number' },
          visible: { type: 'boolean' }
        }
      }
    },
    defaults: {
      string: 'field.text',
      number: 'field.number',
      boolean: 'field.toggle',
      enum: 'field.select',
      object: 'group.section'
    },
    fields: {
      '/id': { label: 'Entity ID', mode: 'readonly', representation: 'text.code' },
      '/name': { label: 'Name', writePath: '/draft/selectedEntity/name' },
      '/type': { label: 'Type', representation: 'field.select' },
      '/layer': { label: 'Layer', representation: 'field.select' },
      '/visible': { label: 'Visible', representation: 'field.toggle' }
    },
    flows: {
      edit: {
        draftFrom: '/selectedEntity',
        draftPath: '/draft/selectedEntity',
        submit: {
          id: 'selected-entity.save',
          action: 'entity.patch',
          reads: ['/draft/selectedEntity'],
          writes: ['/world/entities/hero-spawn'],
          requiresDirty: true
        }
      }
    }
  }),
  world: createViewManifest({
    id: 'inkwell.editor.world-settings',
    source: {
      path: '/world',
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          visibility: { type: 'string', enum: ['private', 'shared-room', 'published'] },
          startArea: { type: 'string' },
          cameraZoom: { type: 'number', minimum: 0.2, maximum: 4 },
          gravity: { type: 'string', enum: ['default', 'floaty', 'heavy'] },
          palette: { type: 'string', enum: ['inkwell-feed', 'night-market', 'bright-play'] }
        }
      }
    },
    defaults: {
      string: 'field.text',
      number: 'field.number',
      enum: 'field.select',
      object: 'group.section'
    },
    fields: {
      '/name': { label: 'World name' },
      '/visibility': { label: 'Visibility', representation: 'field.select' },
      '/startArea': { label: 'Start area' },
      '/cameraZoom': { label: 'Default camera zoom', representation: 'field.slider' },
      '/gravity': { label: 'Gravity', representation: 'field.select' },
      '/palette': { label: 'Design palette', representation: 'field.select' }
    }
  }),
  sharing: createViewManifest({
    id: 'inkwell.editor.sharing',
    source: {
      path: '/collaboration',
      schema: {
        type: 'object',
        properties: {
          roomId: { type: 'string', readOnly: true },
          access: { type: 'string', enum: ['private', 'invite', 'team', 'public'] },
          localStatus: { type: 'string', enum: ['online', 'offline-ready', 'syncing'] },
          peers: { type: 'integer' },
          queuedPatches: { type: 'integer' },
          server: { type: 'string' }
        }
      }
    },
    defaults: {
      string: 'field.text',
      integer: 'field.number',
      enum: 'field.select',
      object: 'group.section'
    },
    fields: {
      '/roomId': { label: 'Room ID', mode: 'readonly', representation: 'text.code' },
      '/access': { label: 'Access', representation: 'field.select' },
      '/localStatus': { label: 'Local status', mode: 'readonly' },
      '/peers': { label: 'Peers', mode: 'readonly' },
      '/queuedPatches': { label: 'Queued patches', mode: 'readonly' },
      '/server': { label: 'Sync server', mode: 'readonly' }
    }
  })
};

const viewFrames = {
  selectedEntity: materializeView(viewManifests.selectedEntity, {
    flow: 'edit',
    state: editorDocument,
    capabilities: ['entity.write', 'world.write', 'room.share'],
    validation: 'all'
  }),
  world: materializeView(viewManifests.world, {
    state: editorDocument,
    capabilities: ['world.write'],
    validation: 'all'
  }),
  sharing: materializeView(viewManifests.sharing, {
    state: editorDocument,
    capabilities: ['room.share'],
    validation: 'all'
  })
};

const viewImpact = {
  selectedEntity: traceViewImpact(viewManifests.selectedEntity, { actions: ['entity.patch'] }),
  world: traceViewImpact(viewManifests.world, { statePaths: ['/world/name', '/world/visibility'] }),
  sharing: traceViewImpact(viewManifests.sharing, { statePaths: ['/collaboration/roomId', '/collaboration/queuedPatches'] })
};

const views = [
  {
    id: 'canvas',
    label: 'Canvas',
    icon: 'FaMap',
    title: 'Infinite canvas',
    kicker: 'Frontier canvas',
    summary: 'Renderer-neutral world frame with camera, grid, selection, layers, and local session state.',
    statePath: '/editor/canvas',
    package: '@shapeshift-labs/frontier-canvas'
  },
  {
    id: 'assets',
    label: 'Assets',
    icon: 'FaMagnifyingGlass',
    title: 'Assets and palette',
    kicker: 'Inkwell library',
    summary: 'Characters, items, scenery, tiles, effects, sounds, and icons stay grouped by the current Inkwell type icons.',
    statePath: '/world/palettes',
    package: '@shapeshift-labs/frontier-assets'
  },
  {
    id: 'entities',
    label: 'Entities',
    icon: 'FaPerson',
    title: 'Entities',
    kicker: 'World graph',
    summary: 'Character/item/scenery rows map to patchable entity records and future blueprint references.',
    statePath: '/world/entities',
    package: '@shapeshift-labs/frontier-blueprint'
  },
  {
    id: 'layers',
    label: 'Layers',
    icon: 'FaGripLinesVertical',
    title: 'Layers',
    kicker: 'Scene graph',
    summary: 'Layer order, visibility, lock state, and scene nodes are separate CRDT document paths.',
    statePath: '/world/layers',
    package: '@shapeshift-labs/frontier-scene'
  },
  {
    id: 'events',
    label: 'Events',
    icon: 'FaRegLightbulb',
    title: 'Events',
    kicker: 'Triggers',
    summary: 'Trigger rules, custom events, and reaction chains are shaped as deterministic action plans.',
    statePath: '/world/triggers',
    package: '@shapeshift-labs/frontier-triggers'
  },
  {
    id: 'properties',
    label: 'Properties',
    icon: 'FaChevronDown',
    title: 'Properties',
    kicker: 'Data-driven forms',
    summary: 'Inspector fields are generated from Frontier view manifests, not hard-coded DOM controls.',
    statePath: '/selectedEntity',
    package: '@shapeshift-labs/frontier-view'
  },
  {
    id: 'world',
    label: 'World',
    icon: 'FaSun',
    title: 'World settings',
    kicker: 'Global state',
    summary: 'World settings, resources, weather, lighting, camera, and published-state controls share one form surface.',
    statePath: '/world',
    package: '@shapeshift-labs/frontier-view'
  },
  {
    id: 'sharing',
    label: 'Sharing',
    icon: 'FaCloud',
    title: 'View -> Sharing',
    kicker: 'Realtime collaboration',
    summary: 'Room link, presence, access, offline queue, and CRDT sync health are visible by default.',
    statePath: '/collaboration',
    package: '@shapeshift-labs/frontier-crdt-sync'
  },
  {
    id: 'debugging',
    label: 'Debug',
    icon: 'FaRotateRight',
    title: 'Debugging',
    kicker: 'Evidence',
    summary: 'Trigger lint, timeline samples, patch logs, and browser evidence should be attached to editor runs.',
    statePath: '/debug',
    package: '@shapeshift-labs/frontier-test'
  },
  {
    id: 'agent',
    label: 'Agent',
    icon: 'FaWandMagicSparkles',
    title: 'Agent chat',
    kicker: 'Tool manifests',
    summary: 'Agent actions can inspect visible views, propose patch plans, and produce reviewable evidence.',
    statePath: '/agent',
    package: '@shapeshift-labs/frontier-tools'
  }
];

const paletteTypes = [
  { id: 'characters', label: 'Characters', icon: 'FaPerson', count: 12 },
  { id: 'items', label: 'Items', icon: 'GiPiercingSword', count: 18 },
  { id: 'tiles', label: 'Tiles', icon: 'TbTexture', count: 42 },
  { id: 'scenery', label: 'Scenery', icon: 'FaTree', count: 27 },
  { id: 'scenes', label: 'Scenes', icon: 'GiMountainRoad', count: 4 },
  { id: 'effects', label: 'Effects', icon: 'GiInkSwirl', count: 9 },
  { id: 'sound', label: 'Sound', icon: 'FaWaveSquare', count: 16 },
  { id: 'icons', label: 'Icons', icon: 'GiCherish', count: 31 }
];

const toolButtons = [
  { id: 'select', label: 'Select', icon: 'FaEye' },
  { id: 'pan', label: 'Pan', icon: 'FaMap' },
  { id: 'camera', label: 'Camera', icon: 'FaCamera' },
  { id: 'add', label: 'Add', icon: 'FaPlus' },
  { id: 'copy', label: 'Copy', icon: 'FaCopy' }
];

const layerRows = [
  { id: 'characters', label: 'Characters', icon: 'FaPerson', visible: true, locked: false },
  { id: 'triggers', label: 'Triggers', icon: 'FaRegLightbulb', visible: true, locked: false },
  { id: 'scenery', label: 'Scenery', icon: 'FaTree', visible: true, locked: false },
  { id: 'terrain', label: 'Terrain', icon: 'TbTexture', visible: true, locked: true }
];

const formSections = {
  properties: [
    { label: 'Entity ID', type: 'text', value: 'hero-spawn', readonly: true, icon: 'FaCopy' },
    { label: 'Name', type: 'text', value: 'Ari the Cartographer' },
    { label: 'Type', type: 'select', value: 'Character', options: ['Character', 'Item', 'Scenery', 'Tile', 'Effect'] },
    { label: 'Layer', type: 'select', value: 'Characters', options: ['Terrain', 'Scenery', 'Characters', 'Triggers'] },
    { label: 'Visible', type: 'toggle', value: true },
    { label: 'Position', type: 'pair', value: ['96', '120'] },
    { label: 'Scale', type: 'range', value: 86, min: 20, max: 160 },
    { label: 'Render mode', type: 'select', value: 'Sprite', options: ['Sprite', 'Silhouette', 'Shadow only'] },
    { label: 'Asset set', type: 'text', value: 'wish:ari-cartographer' },
    { label: 'AI enabled', type: 'toggle', value: true }
  ],
  world: [
    { label: 'World name', type: 'text', value: 'Moonlit Market Wish' },
    { label: 'Visibility', type: 'select', value: 'Shared room', options: ['Private', 'Shared room', 'Published'] },
    { label: 'Start area', type: 'select', value: 'Market Square', options: ['Market Square', 'Canal Gate', 'Sky Archive'] },
    { label: 'Camera zoom', type: 'range', value: 86, min: 20, max: 400 },
    { label: 'Gravity', type: 'select', value: 'Default', options: ['Default', 'Floaty', 'Heavy'] },
    { label: 'Palette', type: 'select', value: 'Inkwell feed', options: ['Inkwell feed', 'Night market', 'Bright play'] },
    { label: 'Time of day', type: 'range', value: 62, min: 0, max: 100 },
    { label: 'Ambient barks', type: 'select', value: 'Occasional', options: ['Quiet', 'Occasional', 'Frequent'] },
    { label: 'Team rules', type: 'toggle', value: true }
  ],
  sharing: [
    { label: 'Room ID', type: 'text', value: 'wish-market-8f7c', readonly: true, icon: 'FaCopy' },
    { label: 'Access', type: 'select', value: 'Invite', options: ['Private', 'Invite', 'Team', 'Public'] },
    { label: 'Local status', type: 'text', value: 'Offline ready', readonly: true },
    { label: 'Sync server', type: 'text', value: 'standalone-frontier-crdt-sync', readonly: true },
    { label: 'Queued patches', type: 'range', value: 6, min: 0, max: 24 },
    { label: 'Default role', type: 'select', value: 'Editor', options: ['Viewer', 'Editor', 'Owner'] },
    { label: 'Presence cursors', type: 'toggle', value: true },
    { label: 'Require approval', type: 'toggle', value: false }
  ]
};

const requiredIconNames = [
  'FaCamera',
  'FaChevronDown',
  'FaCloud',
  'FaCopy',
  'FaEye',
  'FaEyeSlash',
  'FaGripLinesVertical',
  'FaMagnifyingGlass',
  'FaMap',
  'FaPlus',
  'FaRegLightbulb',
  'FaSun',
  'FaXmark',
  'FaPerson',
  'FaTree',
  'FaWaveSquare',
  'GiPiercingSword',
  'GiInkSwirl',
  'GiMountainRoad',
  'GiCherish',
  'TbTexture',
  'FaWandMagicSparkles',
  'FaRotateRight',
  'FaArrowUpRightFromSquare',
  'FaBroom',
  'FaCode',
  'FaRegTrashCan'
];

const iconSource = {
  source: 'inkwell-world-editor-react-icons',
  importFiles: [
    '/Users/james/code/inkwell-mono/inkwell-api-frontend/inkwell-components/editor-view.jsx',
    '/Users/james/code/inkwell-mono/inkwell-api-frontend/components/entity-icon-type/index.js',
    '/Users/james/code/inkwell-mono/inkwell-api-frontend/inkwell-components/editor-agent-chat-tab.js',
    '/Users/james/code/inkwell-mono/inkwell-api-frontend/inkwell-components/debugging-tab.js'
  ],
  requiredNames: requiredIconNames,
  renderedNames: requiredIconNames.filter((name) => iconRenderer.has(name))
};

const frontierContract = {
  featureId: 'feature.inkwell.frontier-editor.ui-scaffold',
  package: '@shapeshift-labs/frontier-design',
  packageRoles: {
    design: '@shapeshift-labs/frontier-design',
    canvas: '@shapeshift-labs/frontier-canvas',
    tools: '@shapeshift-labs/frontier-canvas-tools',
    forms: '@shapeshift-labs/frontier-view',
    renderer: '@shapeshift-labs/frontier-dom',
    collaboration: '@shapeshift-labs/frontier-crdt-sync',
    tests: '@shapeshift-labs/frontier-playwright'
  },
  renderTargets: design.targets,
  stateLayout: canvasLayout,
  views: views.map(({ id, label, statePath, package: packageName }) => ({ id, label, statePath, package: packageName })),
  iconSource,
  canvas: {
    surfaceId: canvasSurface.id,
    frameKind: canvasFrame.kind,
    itemCount: canvasFrame.items.length,
    layerCount: canvasSurface.document.layers.length,
    selectedIds: canvasSurface.session.selectedIds
  },
  viewFrames: Object.fromEntries(Object.entries(viewFrames).map(([key, frame]) => [
    key,
    {
      kind: frame.kind,
      id: frame.manifestId,
      fieldCount: frame.nodes.length,
      actionCount: frame.actions.length,
      summary: frame.summary
    }
  ])),
  viewImpact: Object.fromEntries(Object.entries(viewImpact).map(([key, impact]) => [
    key,
    {
      viewIds: impact.viewIds,
      actionIds: impact.actionIds,
      statePaths: impact.statePaths
    }
  ])),
  collaboration: editorDocument.collaboration
};

const registryGraph = createDesignRegistryGraph(design, {
  source: { file: 'packages/frontier-design/demo/inkwell-frontier-editor.mjs' }
});

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Inkwell Frontier Editor Scaffold</title>
  <style>
${createCssVariables(design, { selector: ':root' })}
${recipeCss('.inkwellFrontier', 'editor.shell')}
${recipeCss('.panel', 'editor.panel')}
${recipeCss('.panelRaised', 'editor.panel', { elevation: 'raised' })}
${recipeCss('.card', 'editor.card')}
${recipeCss('.cardActive', 'editor.card', { state: 'active' })}
${recipeCss('.control', 'editor.control')}
${recipeCss('.controlPrimary', 'editor.control', { tone: 'primary' })}
${layoutCss()}
  </style>
</head>
<body>
  <div id="app" class="inkwellFrontier" data-active-view="canvas">
    <aside class="rail" aria-label="Inkwell editor rail">
      <div class="railLogo" aria-label="Inkwell">I</div>
      ${views.slice(0, 8).map((view) => `
        <button type="button" class="railButton" data-view-button="${view.id}" title="${escapeHtml(view.label)}" aria-label="${escapeHtml(view.label)}">
          ${icon(view.icon)}
        </button>
      `).join('')}
      <button type="button" class="railButton railBottom" data-view-button="agent" title="Agent" aria-label="Agent">${icon('FaWandMagicSparkles')}</button>
    </aside>
    <main class="workspace">
      <header class="topbar">
        <div class="promptBar panelRaised">
          <span class="promptIcon">${icon('FaWandMagicSparkles')}</span>
          <input class="promptInput" value="Make the market feel alive, add collaborative cues, and keep the editor offline-ready" aria-label="Wish prompt">
          <button type="button" class="runWish controlPrimary" aria-label="Run wish">${icon('FaArrowUpRightFromSquare')}</button>
        </div>
        <div class="topActions" aria-label="Editor status">
          <span class="statusPill online" data-sync-status>Online</span>
          <span class="statusPill local" data-offline-queue>6 local patches queued</span>
          <button type="button" class="shareButton controlPrimary" data-view-button="sharing">${icon('FaCloud')} Share</button>
        </div>
      </header>
      <section class="editorBody">
        <nav class="viewStrip panel" aria-label="View menu">
          <div class="viewMenuLabel">View</div>
          ${views.map((view) => `
            <button type="button" class="viewButton" data-view-button="${view.id}" aria-controls="view-${view.id}">
              ${icon(view.icon)}
              <span>${escapeHtml(view.label)}</span>
            </button>
          `).join('')}
        </nav>
        <section class="leftPanel panel" aria-label="World libraries">
          <div class="panelHeader">
            <div>
              <div class="kicker">Library</div>
              <h2>World palette</h2>
            </div>
            <button type="button" class="iconButton control" aria-label="Add asset">${icon('FaPlus')}</button>
          </div>
          <label class="searchBox">
            ${icon('FaMagnifyingGlass')}
            <input value="moonlit market" aria-label="Search assets">
          </label>
          <div class="paletteGrid" aria-label="Palette types">
            ${paletteTypes.map((type) => `
              <button type="button" class="paletteType card">
                ${icon(type.icon)}
                <span>${escapeHtml(type.label)}</span>
                <small>${type.count}</small>
              </button>
            `).join('')}
          </div>
          <div class="assetFeed" aria-label="Recent assets">
            ${assetCard('Ari the Cartographer', 'Character', heroImage, 'FaPerson')}
            ${assetCard('Market archway', 'Scenery', footerImage, 'FaTree')}
            ${assetCard('Play portal glyph', 'Icon', playButtonImage, 'GiCherish')}
          </div>
        </section>
        <section class="canvasPanel panelRaised" aria-label="World canvas">
          <div class="canvasToolbar">
            ${toolButtons.map((tool) => `
              <button type="button" class="toolButton control" title="${escapeHtml(tool.label)}" aria-label="${escapeHtml(tool.label)}">
                ${icon(tool.icon)}
              </button>
            `).join('')}
            <span class="canvasMeta">Frontier canvas frame: ${canvasFrame.items.length} items</span>
            <span class="zoomPill">86%</span>
          </div>
          <div class="worldCanvas" data-canvas-frame="${escapeHtml(canvasFrame.id)}">
            <div class="canvasBackdrop"></div>
            <div class="gridLayer"></div>
            ${canvasSurface.document.items.map((item, index) => renderCanvasItem(item, index)).join('')}
            <div class="selectionOutline" aria-hidden="true"></div>
            <div class="presenceCursor cursorA" aria-label="Jamie cursor">${icon('FaPerson')} Jamie</div>
            <div class="presenceCursor cursorB" aria-label="Mira cursor">${icon('GiInkSwirl')} Mira</div>
            <div class="minimap card">
              <span class="miniViewport"></span>
              <span class="miniNode nodeA"></span>
              <span class="miniNode nodeB"></span>
              <span class="miniNode nodeC"></span>
            </div>
          </div>
          <footer class="canvasFooter">
            <span>${icon('FaMap')} Area: Market Square</span>
            <span>${icon('FaEye')} 4 collaborators viewing</span>
            <span>${icon('FaCloud')} Offline replay enabled</span>
          </footer>
        </section>
        <aside class="rightPanel panel" aria-label="Editor view panels">
          ${views.map(renderViewPanel).join('')}
        </aside>
        <section class="bottomPanel panel" aria-label="Layers and timeline">
          <div class="layerColumn">
            <div class="panelHeader compact">
              <h2>Layers</h2>
              <button type="button" class="iconButton control" aria-label="Add layer">${icon('FaPlus')}</button>
            </div>
            ${layerRows.map((layer) => `
              <div class="layerRow card">
                <span class="dragIcon">${icon('FaGripLinesVertical')}</span>
                <span class="layerGlyph">${icon(layer.icon)}</span>
                <strong>${escapeHtml(layer.label)}</strong>
                <span class="layerTools">${icon(layer.visible ? 'FaEye' : 'FaEyeSlash')}${layer.locked ? icon('FaXmark') : ''}</span>
              </div>
            `).join('')}
          </div>
          <div class="timelineColumn">
            <div class="panelHeader compact">
              <h2>Patch timeline</h2>
              <button type="button" class="iconButton control" aria-label="Refresh timeline">${icon('FaRotateRight')}</button>
            </div>
            <div class="timeline">
              ${timelineRow('local', 'entity.patch', '/world/entities/hero-spawn/name', 'queued')}
              ${timelineRow('remote', 'layer.reorder', '/world/layers', 'applied')}
              ${timelineRow('local', 'view.change', '/editor/session/activeView', 'ephemeral')}
            </div>
          </div>
        </section>
      </section>
    </main>
  </div>
  <script>
    window.frontierInkwellEditor = ${jsonScript({
      contract: frontierContract,
      registrySummary: {
        entries: registryGraph.entries.length,
        edges: registryGraph.edges.length
      },
      state: {
        activeView: 'canvas',
        declaredViews: views.map((view) => view.id),
        iconSource,
        canvas: frontierContract.canvas,
        canvasFrame: {
          kind: canvasFrame.kind,
          id: canvasFrame.id,
          itemCount: canvasFrame.items.length,
          visibleItemCount: canvasFrame.items.filter((item) => item.visible !== false).length
        },
        viewFrames: frontierContract.viewFrames,
        collaboration: editorDocument.collaboration,
        offline: {
          localSnapshotKey: 'frontier.inkwell.editor.snapshot.v1',
          queueDepth: editorDocument.collaboration.queuedPatches,
          canEditOffline: true
        }
      },
      actions: []
    })};
    ${clientScript()}
  </script>
</body>
</html>
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, html);
console.log(outPath);

function renderViewPanel(view) {
  const hidden = view.id === 'canvas' ? '' : ' hidden';
  return `
    <article id="view-${view.id}" class="viewPanel" data-view-panel="${view.id}"${hidden}>
      <header class="viewHeader">
        <div class="viewIcon">${icon(view.icon)}</div>
        <div>
          <div class="kicker">${escapeHtml(view.kicker)}</div>
          <h2>${escapeHtml(view.title)}</h2>
        </div>
      </header>
      <p class="viewSummary">${escapeHtml(view.summary)}</p>
      ${renderPanelBody(view)}
    </article>
  `;
}

function renderPanelBody(view) {
  if (view.id === 'canvas') {
    return `
      <div class="metricsGrid">
        ${metricCard('Items', String(canvasFrame.items.length), 'FaMap')}
        ${metricCard('Layers', String(canvasSurface.document.layers.length), 'FaGripLinesVertical')}
        ${metricCard('Selected', '1', 'FaEye')}
        ${metricCard('Grid', '24px', 'TbTexture')}
      </div>
      <div class="contractCard card">
        <strong>${escapeHtml(view.package)}</strong>
        <span>${escapeHtml(view.statePath)}</span>
      </div>
    `;
  }
  if (view.id === 'assets') {
    return `
      <div class="panelList">
        ${paletteTypes.map((type) => `
          <div class="listRow card">
            ${icon(type.icon)}
            <strong>${escapeHtml(type.label)}</strong>
            <span>${type.count} ready</span>
          </div>
        `).join('')}
      </div>
    `;
  }
  if (view.id === 'entities') {
    return `
      <div class="panelList">
        ${entityRow('hero-spawn', 'Ari the Cartographer', 'FaPerson', 'Selected')}
        ${entityRow('market-arch', 'Market archway', 'FaTree', 'Scenery')}
        ${entityRow('portal-trigger', 'Portal trigger', 'FaRegLightbulb', 'Trigger')}
        ${entityRow('river-tile-run', 'Canal tiles', 'TbTexture', 'Terrain')}
      </div>
    `;
  }
  if (view.id === 'layers') {
    return `<div class="panelList">${layerRows.map((layer) => `
      <div class="listRow card">
        ${icon(layer.icon)}
        <strong>${escapeHtml(layer.label)}</strong>
        <span>${layer.visible ? 'Visible' : 'Hidden'}${layer.locked ? ', locked' : ''}</span>
      </div>
    `).join('')}</div>`;
  }
  if (view.id === 'events') {
    return `
      <div class="eventStack">
        ${eventBlock('On enter market', 'show-dialog-modal -> change-weather', 'FaRegLightbulb')}
        ${eventBlock('On portal overlap', 'transition-area -> reveal-map', 'FaMap')}
        ${eventBlock('On item collect', 'modify-stat -> add-journal-entry', 'GiPiercingSword')}
      </div>
    `;
  }
  if (view.id === 'properties') return renderForm('properties', viewFrames.selectedEntity);
  if (view.id === 'world') return renderForm('world', viewFrames.world);
  if (view.id === 'sharing') {
    return `
      <div class="sharingHero cardActive">
        <div>
          <div class="kicker">Room link</div>
          <strong>inkwell://room/wish-market-8f7c</strong>
        </div>
        <button type="button" class="iconButton control" aria-label="Copy room link">${icon('FaCopy')}</button>
      </div>
      <div class="presenceGrid">
        ${presenceCard('J', 'Jamie', 'Designing tiles', 'online')}
        ${presenceCard('M', 'Mira', 'Editing triggers', 'online')}
        ${presenceCard('A', 'Alex', 'Offline queue', 'offline')}
      </div>
      ${renderForm('sharing', viewFrames.sharing)}
      <div class="syncLog card">
        <strong>Standalone sync server</strong>
        <span>CRDT updates can run against a standalone room server while local edits keep writing to the offline queue.</span>
      </div>
    `;
  }
  if (view.id === 'debugging') {
    return `
      <div class="debugList">
        ${debugRow('Trigger lint', '0 errors, 2 warnings', 'FaRotateRight')}
        ${debugRow('Browser evidence', 'Frontier Playwright probes ready', 'FaArrowUpRightFromSquare')}
        ${debugRow('Patch samples', '3 local samples, 1 remote sample', 'FaCode')}
        ${debugRow('Cleanup', 'Clear transient session patches', 'FaBroom')}
      </div>
    `;
  }
  if (view.id === 'agent') {
    return `
      <div class="chatShell">
        <div class="agentBubble card">${icon('FaWandMagicSparkles')} I can inspect selected state paths and propose patch plans.</div>
        <div class="toolManifest card">
          <strong>Tool manifest</strong>
          <code>entity.patch, layer.reorder, room.share, trigger.lint</code>
        </div>
      </div>
    `;
  }
  return `<div class="contractCard card"><strong>${escapeHtml(view.package)}</strong><span>${escapeHtml(view.statePath)}</span></div>`;
}

function renderForm(key, frame) {
  return `
    <form class="dataForm" data-view-frame="${escapeHtml(frame.manifestId)}" aria-label="${escapeHtml(key)} form">
      <div class="formMeta">
        <span>frontier-view</span>
        <span>${frame.nodes.length} fields</span>
      </div>
      ${formSections[key].map(renderField).join('')}
    </form>
  `;
}

function renderField(field) {
  const label = `<label><span>${field.icon ? icon(field.icon) : ''}${escapeHtml(field.label)}</span>`;
  if (field.type === 'select') {
    return `${label}<select class="fieldControl">${field.options.map((option) => `<option${option === field.value ? ' selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select></label>`;
  }
  if (field.type === 'toggle') {
    return `${label}<span class="toggleControl"><input type="checkbox"${field.value ? ' checked' : ''}><i></i></span></label>`;
  }
  if (field.type === 'pair') {
    return `${label}<span class="pairControl"><input class="fieldControl" value="${escapeHtml(field.value[0])}"><input class="fieldControl" value="${escapeHtml(field.value[1])}"></span></label>`;
  }
  if (field.type === 'range') {
    return `${label}<span class="rangeControl"><input type="range" min="${field.min}" max="${field.max}" value="${field.value}"><output>${field.value}</output></span></label>`;
  }
  return `${label}<input class="fieldControl" value="${escapeHtml(field.value)}"${field.readonly ? ' readonly' : ''}></label>`;
}

function assetCard(title, type, src, iconName) {
  return `
    <article class="assetCard card">
      <img src="${escapeHtml(src)}" alt="">
      <div>
        <strong>${escapeHtml(title)}</strong>
        <span>${icon(iconName)} ${escapeHtml(type)}</span>
      </div>
    </article>
  `;
}

function renderCanvasItem(item, index) {
  const typeIcon = item.tags.includes('character')
    ? 'FaPerson'
    : item.tags.includes('scenery')
      ? 'FaTree'
      : item.tags.includes('trigger')
        ? 'FaRegLightbulb'
        : 'TbTexture';
  const colors = ['purple', 'warm', 'info', 'mint'];
  return `
    <div class="canvasItem ${colors[index % colors.length]}" style="--x:${item.x}px;--y:${item.y}px;--w:${item.width}px;--h:${item.height}px" data-canvas-item="${escapeHtml(item.id)}">
      ${icon(typeIcon)}
      <span>${escapeHtml(item.id)}</span>
    </div>
  `;
}

function timelineRow(source, action, statePath, status) {
  return `
    <div class="timelineRow">
      <span>${escapeHtml(source)}</span>
      <strong>${escapeHtml(action)}</strong>
      <code>${escapeHtml(statePath)}</code>
      <em>${escapeHtml(status)}</em>
    </div>
  `;
}

function metricCard(label, value, iconName) {
  return `
    <div class="metric card">
      ${icon(iconName)}
      <strong>${escapeHtml(value)}</strong>
      <span>${escapeHtml(label)}</span>
    </div>
  `;
}

function entityRow(id, label, iconName, meta) {
  return `
    <div class="listRow card">
      ${icon(iconName)}
      <strong>${escapeHtml(label)}</strong>
      <span>${escapeHtml(meta)} - ${escapeHtml(id)}</span>
    </div>
  `;
}

function eventBlock(title, detail, iconName) {
  return `
    <div class="eventBlock card">
      <div>${icon(iconName)}</div>
      <strong>${escapeHtml(title)}</strong>
      <code>${escapeHtml(detail)}</code>
    </div>
  `;
}

function presenceCard(initial, name, status, tone) {
  return `
    <div class="presenceCard card ${tone}">
      <span class="avatar">${escapeHtml(initial)}</span>
      <strong>${escapeHtml(name)}</strong>
      <small>${escapeHtml(status)}</small>
    </div>
  `;
}

function debugRow(label, value, iconName) {
  return `
    <div class="debugRow card">
      ${icon(iconName)}
      <strong>${escapeHtml(label)}</strong>
      <span>${escapeHtml(value)}</span>
    </div>
  `;
}

function icon(name) {
  return iconRenderer.render(name);
}

function createInkwellIconRenderer() {
  const modules = {};
  try {
    const inkwellRequire = createRequire(path.join(inkwellFrontendDir, 'package.json'));
    const React = inkwellRequire('react');
    const { renderToStaticMarkup } = inkwellRequire('react-dom/server');
    Object.assign(modules, inkwellRequire('react-icons/fa6'));
    Object.assign(modules, inkwellRequire('react-icons/gi'));
    Object.assign(modules, inkwellRequire('react-icons/tb'));
    return {
      has: (name) => typeof modules[name] === 'function',
      render: (name) => {
        const Icon = modules[name];
        if (typeof Icon !== 'function') return `<span class="uiIcon iconFallback" data-icon="${escapeHtml(name)}">${escapeHtml(name.replace(/^(Fa|Gi|Tb)/, '').slice(0, 2))}</span>`;
        return `<span class="uiIcon" data-icon="${escapeHtml(name)}">${renderToStaticMarkup(React.createElement(Icon, {
          'aria-hidden': 'true',
          focusable: 'false'
        }))}</span>`;
      }
    };
  } catch {
    return {
      has: () => false,
      render: (name) => `<span class="uiIcon iconFallback" data-icon="${escapeHtml(name)}">${escapeHtml(name.replace(/^(Fa|Gi|Tb)/, '').slice(0, 2))}</span>`
    };
  }
}

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
html, body { margin: 0; width: 100%; min-height: 100%; background: var(--frd-role-surface-app); }
body { min-height: 100vh; overflow: hidden; }
button, input, select, textarea { font: inherit; }
button { cursor: pointer; }
.inkwellFrontier { min-height: 100vh; display: grid; grid-template-columns: var(--frd-role-layout-rail) minmax(0, 1fr); background: var(--frd-role-surface-app); color: var(--frd-role-content-default); }
.uiIcon { width: 1em; height: 1em; display: inline-flex; align-items: center; justify-content: center; flex: none; }
.uiIcon svg { width: 1em; height: 1em; display: block; }
.iconFallback { font-size: 10px; font-weight: 800; letter-spacing: 0; }
.rail { min-height: 100vh; padding: 10px 8px; background: var(--frd-role-surface-rail); border-right: 1px solid var(--frd-role-border-muted); display: flex; flex-direction: column; align-items: center; gap: 8px; }
.railLogo { width: 40px; height: 40px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; color: var(--frd-role-content-default); background: var(--frd-role-accent-primary); font-weight: 900; }
.railButton, .iconButton, .toolButton { width: 40px; height: 40px; border: 0; padding: 0; display: inline-flex; align-items: center; justify-content: center; color: var(--frd-role-content-muted); }
.railButton { border-radius: 8px; background: transparent; }
.railButton:hover, .railButton.active { color: var(--frd-role-content-default); background: var(--frd-role-surface-card); }
.railBottom { margin-top: auto; }
.workspace { min-width: 0; height: 100vh; display: grid; grid-template-rows: auto minmax(0, 1fr); background: var(--frd-role-surface-canvas); }
.topbar { min-width: 0; display: grid; grid-template-columns: minmax(420px, 860px) auto; align-items: center; gap: 16px; padding: 12px 16px; background: rgba(5, 5, 6, 0.88); backdrop-filter: blur(14px); border-bottom: 1px solid var(--frd-role-border-muted); }
.promptBar { min-height: 52px; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 7px 8px 7px 14px; border-style: solid; border-width: 1px; }
.promptIcon { color: var(--frd-role-accent-primary); }
.promptInput { min-width: 0; width: 100%; height: 36px; border: 0; outline: 0; background: transparent; color: var(--frd-role-content-default); }
.runWish { width: 38px; height: 38px; border-radius: 999px; border-style: solid; border-width: 1px; }
.topActions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
.statusPill, .zoomPill { min-height: 30px; display: inline-flex; align-items: center; gap: 6px; padding: 0 10px; border-radius: 999px; border: 1px solid var(--frd-role-border-muted); color: var(--frd-role-content-muted); background: var(--frd-role-surface-panel); font-size: 12px; font-weight: 800; }
.statusPill.online { color: var(--frd-role-accent-online); }
.statusPill.local { color: var(--frd-role-accent-warm); }
.shareButton { min-height: 38px; display: inline-flex; align-items: center; gap: 8px; border-style: solid; border-width: 1px; padding: 0 12px; }
.editorBody { min-width: 0; min-height: 0; display: grid; grid-template-columns: minmax(270px, 320px) minmax(420px, 1fr) minmax(320px, var(--frd-role-layout-inspector)); grid-template-rows: auto minmax(0, 1fr) minmax(168px, 210px); gap: 12px; padding: 12px; }
.viewStrip { grid-column: 1 / -1; min-width: 0; min-height: 50px; display: flex; align-items: center; gap: 6px; padding: 8px; overflow: auto; border-style: solid; border-width: 1px; }
.viewMenuLabel { color: var(--frd-role-content-subtle); font-size: 12px; font-weight: 900; text-transform: uppercase; padding: 0 8px; }
.viewButton { height: 34px; border: 0; border-radius: 8px; background: transparent; color: var(--frd-role-content-muted); padding: 0 10px; display: inline-flex; align-items: center; gap: 7px; flex: none; }
.viewButton:hover, .viewButton.active { background: var(--frd-role-surface-card); color: var(--frd-role-content-default); }
.viewButton[data-view-button="sharing"].active { color: var(--frd-role-accent-online); }
.panel, .panelRaised, .card, .cardActive, .control, .controlPrimary { border-style: solid; border-width: 1px; }
.leftPanel, .rightPanel, .canvasPanel, .bottomPanel { min-width: 0; min-height: 0; overflow: hidden; }
.leftPanel, .rightPanel { padding: 14px; display: flex; flex-direction: column; gap: 14px; }
.panelHeader { min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.panelHeader.compact h2 { font-size: 14px; }
.kicker { color: var(--frd-role-content-subtle); font-size: 11px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; }
h2, p { margin: 0; }
h2 { color: var(--frd-role-content-strong); font-size: 17px; line-height: 1.2; letter-spacing: 0; }
.searchBox { min-height: 40px; display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 8px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--frd-role-border-muted); background: var(--frd-role-surface-control); color: var(--frd-role-content-subtle); }
.searchBox input { width: 100%; min-width: 0; height: 36px; border: 0; outline: 0; color: var(--frd-role-content-default); background: transparent; }
.paletteGrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.paletteType { min-width: 0; min-height: 74px; padding: 10px; display: grid; grid-template-columns: auto minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto; align-items: center; gap: 4px 8px; color: var(--frd-role-content-muted); text-align: left; }
.paletteType .uiIcon { font-size: 18px; color: var(--frd-role-accent-primary); }
.paletteType span { color: var(--frd-role-content-strong); font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.paletteType small { grid-column: 2; color: var(--frd-role-content-subtle); }
.assetFeed { min-height: 0; display: grid; gap: 8px; overflow: auto; }
.assetCard { display: grid; grid-template-columns: 62px minmax(0, 1fr); gap: 10px; padding: 8px; align-items: center; }
.assetCard img { width: 62px; height: 62px; object-fit: cover; border-radius: 8px; border: 1px solid var(--frd-role-border-muted); background: var(--frd-role-surface-card); }
.assetCard div { min-width: 0; display: grid; gap: 6px; }
.assetCard strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.assetCard span { display: inline-flex; align-items: center; gap: 6px; color: var(--frd-role-content-subtle); font-size: 12px; }
.canvasPanel { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; }
.canvasToolbar, .canvasFooter { display: flex; align-items: center; gap: 8px; padding: 10px; border-bottom: 1px solid var(--frd-role-border-muted); }
.canvasFooter { border-top: 1px solid var(--frd-role-border-muted); border-bottom: 0; color: var(--frd-role-content-subtle); font-size: 12px; flex-wrap: wrap; }
.canvasFooter span { display: inline-flex; align-items: center; gap: 6px; }
.canvasMeta { margin-left: auto; color: var(--frd-role-content-subtle); font-size: 12px; font-weight: 800; }
.worldCanvas { position: relative; min-height: 0; overflow: hidden; background: var(--frd-role-surface-canvas); }
.canvasBackdrop { position: absolute; inset: 0; background-image: linear-gradient(rgba(105, 64, 255, 0.11), rgba(5, 5, 6, 0.88)), url("${escapeCssUrl(heroImage)}"); background-size: cover; background-position: center; opacity: 0.72; }
.gridLayer { position: absolute; inset: -1px; background-image: linear-gradient(rgba(255, 255, 255, 0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.055) 1px, transparent 1px), linear-gradient(rgba(105, 64, 255, 0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(105, 64, 255, 0.16) 1px, transparent 1px); background-size: 24px 24px, 24px 24px, 96px 96px, 96px 96px; }
.canvasItem { position: absolute; left: calc(50% - 340px + var(--x)); top: calc(50% - 260px + var(--y)); width: var(--w); height: var(--h); border-radius: 8px; border: 1px solid currentColor; background: rgba(24, 26, 32, 0.84); color: var(--frd-role-accent-primary); display: grid; place-items: center; gap: 6px; padding: 10px; box-shadow: var(--frd-role-effect-softshadow); }
.canvasItem .uiIcon { font-size: 24px; }
.canvasItem span { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--frd-role-content-strong); font-size: 12px; font-weight: 800; }
.canvasItem.warm { color: var(--frd-role-accent-warm); }
.canvasItem.info { color: var(--frd-role-accent-info); }
.canvasItem.mint { color: var(--frd-role-accent-online); }
.selectionOutline { position: absolute; left: calc(50% - 340px + 88px); top: calc(50% - 260px + 112px); width: 132px; height: 164px; border: 2px solid var(--frd-role-border-active); border-radius: 10px; box-shadow: 0 0 0 999px rgba(0, 0, 0, 0.22), 0 0 0 3px rgba(105, 64, 255, 0.22); pointer-events: none; }
.presenceCursor { position: absolute; display: inline-flex; align-items: center; gap: 6px; min-height: 28px; padding: 0 9px; border-radius: 999px; background: var(--frd-role-surface-card); border: 1px solid var(--frd-role-border-active); color: var(--frd-role-content-strong); font-size: 12px; font-weight: 900; }
.cursorA { left: 58%; top: 24%; }
.cursorB { left: 43%; top: 64%; border-color: var(--frd-role-accent-online); }
.minimap { position: absolute; right: 14px; bottom: 14px; width: 132px; height: 96px; background: rgba(13, 13, 15, 0.9); }
.miniViewport, .miniNode { position: absolute; border-radius: 3px; }
.miniViewport { left: 28px; top: 18px; width: 72px; height: 48px; border: 1px solid var(--frd-role-border-active); }
.miniNode { width: 12px; height: 8px; background: var(--frd-role-accent-warm); }
.nodeA { left: 36px; top: 30px; }
.nodeB { left: 70px; top: 48px; background: var(--frd-role-accent-online); }
.nodeC { left: 92px; top: 58px; background: var(--frd-role-accent-info); }
.rightPanel { overflow: auto; }
.viewPanel { display: grid; gap: 14px; align-content: start; }
.viewPanel[hidden] { display: none; }
.viewHeader { display: flex; align-items: center; gap: 12px; }
.viewIcon { width: 44px; height: 44px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; background: var(--frd-role-surface-card); color: var(--frd-role-accent-primary); border: 1px solid var(--frd-role-border-muted); font-size: 20px; }
.viewSummary { color: var(--frd-role-content-muted); line-height: 1.45; font-size: 13px; }
.metricsGrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.metric { min-height: 86px; padding: 12px; display: grid; align-content: center; gap: 4px; color: var(--frd-role-content-subtle); }
.metric .uiIcon { color: var(--frd-role-accent-primary); }
.metric strong { color: var(--frd-role-content-strong); font-size: 24px; }
.metric span { font-size: 12px; }
.contractCard, .syncLog, .toolManifest { padding: 12px; display: grid; gap: 7px; color: var(--frd-role-content-subtle); }
.contractCard strong, .syncLog strong, .toolManifest strong { color: var(--frd-role-content-strong); }
.panelList, .eventStack, .debugList, .chatShell { display: grid; gap: 8px; }
.listRow, .debugRow { min-height: 52px; padding: 10px; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 4px 10px; align-items: center; }
.listRow .uiIcon, .debugRow .uiIcon { color: var(--frd-role-accent-primary); }
.listRow strong, .debugRow strong { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--frd-role-content-strong); }
.listRow span, .debugRow span { grid-column: 2; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--frd-role-content-subtle); font-size: 12px; }
.eventBlock { padding: 12px; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 6px 10px; }
.eventBlock div { color: var(--frd-role-accent-warm); }
.eventBlock strong { color: var(--frd-role-content-strong); }
.eventBlock code { grid-column: 2; color: var(--frd-role-content-subtle); font-family: var(--frd-role-type-mono); font-size: 12px; white-space: normal; }
.dataForm { display: grid; gap: 10px; }
.formMeta { display: flex; justify-content: space-between; color: var(--frd-role-content-subtle); font-size: 11px; font-weight: 900; text-transform: uppercase; }
.dataForm label { display: grid; gap: 6px; color: var(--frd-role-content-muted); font-size: 12px; font-weight: 800; }
.dataForm label > span:first-child { display: inline-flex; align-items: center; gap: 6px; }
.fieldControl, .dataForm select { width: 100%; min-width: 0; min-height: 38px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--frd-role-border-muted); outline: 0; color: var(--frd-role-content-strong); background: var(--frd-role-surface-control); box-shadow: none; }
.dataForm select { appearance: none; -webkit-appearance: none; padding-right: 32px; background-image: linear-gradient(45deg, transparent 50%, var(--frd-role-content-muted) 50%), linear-gradient(135deg, var(--frd-role-content-muted) 50%, transparent 50%); background-position: calc(100% - 17px) 16px, calc(100% - 11px) 16px; background-size: 6px 6px, 6px 6px; background-repeat: no-repeat; }
.fieldControl:focus, .dataForm select:focus { border-color: var(--frd-role-border-active); box-shadow: var(--frd-role-effect-focusring); }
.pairControl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.rangeControl { display: grid; grid-template-columns: minmax(0, 1fr) 44px; align-items: center; gap: 8px; }
.rangeControl output { color: var(--frd-role-content-subtle); font-family: var(--frd-role-type-mono); font-size: 12px; text-align: right; }
.toggleControl { justify-self: start; position: relative; width: 46px; height: 26px; }
.toggleControl input { position: absolute; opacity: 0; }
.toggleControl i { position: absolute; inset: 0; border-radius: 999px; background: var(--frd-role-surface-control); border: 1px solid var(--frd-role-border-muted); }
.toggleControl i::after { content: ""; position: absolute; width: 18px; height: 18px; left: 3px; top: 3px; border-radius: 999px; background: var(--frd-role-content-muted); transition: transform 120ms ease; }
.toggleControl input:checked + i { background: rgba(53, 211, 151, 0.16); border-color: var(--frd-role-accent-online); }
.toggleControl input:checked + i::after { transform: translateX(20px); background: var(--frd-role-accent-online); }
.sharingHero { min-height: 76px; padding: 12px; display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 12px; }
.sharingHero strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--frd-role-content-strong); font-family: var(--frd-role-type-mono); font-size: 13px; }
.presenceGrid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.presenceCard { min-width: 0; padding: 10px; display: grid; justify-items: center; gap: 5px; text-align: center; }
.presenceCard .avatar { width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; background: var(--frd-role-accent-primary); color: var(--frd-role-content-default); font-weight: 900; }
.presenceCard.online .avatar { background: var(--frd-role-accent-online); color: var(--frd-role-content-inverse); }
.presenceCard.offline .avatar { background: var(--frd-role-accent-warm); color: var(--frd-role-content-inverse); }
.presenceCard strong { min-width: 0; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.presenceCard small { color: var(--frd-role-content-subtle); }
.agentBubble { padding: 12px; display: flex; align-items: center; gap: 10px; line-height: 1.4; color: var(--frd-role-content-muted); }
.toolManifest code { color: var(--frd-role-content-muted); white-space: normal; font-family: var(--frd-role-type-mono); }
.bottomPanel { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(280px, 400px) minmax(0, 1fr); gap: 12px; padding: 12px; }
.layerColumn, .timelineColumn { min-width: 0; display: grid; grid-template-rows: auto minmax(0, 1fr); gap: 10px; }
.layerRow { min-height: 38px; display: grid; grid-template-columns: auto auto minmax(0, 1fr) auto; gap: 8px; align-items: center; padding: 7px 10px; }
.dragIcon { color: var(--frd-role-content-faint); }
.layerGlyph { color: var(--frd-role-accent-primary); }
.layerRow strong { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--frd-role-content-strong); font-size: 13px; }
.layerTools { color: var(--frd-role-content-subtle); display: inline-flex; gap: 8px; }
.timeline { min-height: 0; overflow: auto; display: grid; align-content: start; gap: 6px; }
.timelineRow { min-height: 36px; display: grid; grid-template-columns: 70px 120px minmax(0, 1fr) 86px; gap: 8px; align-items: center; color: var(--frd-role-content-subtle); font-size: 12px; }
.timelineRow strong { color: var(--frd-role-content-strong); }
.timelineRow code { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: var(--frd-role-type-mono); color: var(--frd-role-content-muted); }
.timelineRow em { font-style: normal; color: var(--frd-role-accent-online); text-align: right; }
@media (max-width: 1220px) {
  body { overflow: auto; }
  .workspace { height: auto; min-height: 100vh; }
  .editorBody { grid-template-columns: minmax(260px, 320px) minmax(420px, 1fr); grid-template-rows: auto minmax(520px, 1fr) minmax(420px, auto) auto; }
  .rightPanel { grid-column: 1 / -1; max-height: none; }
}
@media (max-width: 820px) {
  .inkwellFrontier { grid-template-columns: 1fr; grid-template-rows: minmax(0, 1fr) 58px; }
  .rail { position: fixed; z-index: 10; inset: auto 0 0 0; min-height: 58px; height: 58px; flex-direction: row; justify-content: space-around; border-right: 0; border-top: 1px solid var(--frd-role-border-muted); }
  .railLogo, .railButton:nth-of-type(n+6), .railBottom { display: none; }
  .topbar { grid-template-columns: 1fr; }
  .editorBody { grid-template-columns: 1fr; padding-bottom: 70px; }
  .canvasPanel { min-height: 540px; }
  .bottomPanel { grid-template-columns: 1fr; }
  .presenceGrid { grid-template-columns: 1fr; }
}
`;
}

function clientScript() {
  return `
const appRoot = document.getElementById('app');
const editor = window.frontierInkwellEditor;
const buttons = Array.from(document.querySelectorAll('[data-view-button]'));
const panels = Array.from(document.querySelectorAll('[data-view-panel]'));
function setActiveView(viewId) {
  if (!editor.state.declaredViews.includes(viewId)) return;
  editor.state.activeView = viewId;
  appRoot.dataset.activeView = viewId;
  for (const button of buttons) {
    button.classList.toggle('active', button.dataset.viewButton === viewId);
    button.setAttribute('aria-pressed', button.dataset.viewButton === viewId ? 'true' : 'false');
  }
  for (const panel of panels) panel.hidden = panel.dataset.viewPanel !== viewId;
  editor.actions.push({
    action: 'view.change',
    viewId,
    path: '/editor/session/activeView',
    scope: 'local',
    at: new Date().toISOString()
  });
  persistLocalSnapshot();
}
function persistLocalSnapshot() {
  try {
    localStorage.setItem(editor.state.offline.localSnapshotKey, JSON.stringify({
      activeView: editor.state.activeView,
      queuedPatches: editor.state.offline.queueDepth,
      updatedAt: new Date().toISOString()
    }));
  } catch {}
}
function updateNetworkStatus() {
  const online = navigator.onLine;
  const status = document.querySelector('[data-sync-status]');
  if (status) {
    status.textContent = online ? 'Online' : 'Offline';
    status.classList.toggle('online', online);
  }
  editor.state.collaboration.localStatus = online ? 'online' : 'offline-ready';
}
for (const button of buttons) button.addEventListener('click', () => setActiveView(button.dataset.viewButton));
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);
setActiveView('canvas');
updateNetworkStatus();
`;
}

function toCssProperty(property) {
  return property.replace(/[A-Z]/g, (match) => '-' + match.toLowerCase());
}

function jsonScript(value) {
  return JSON.stringify(value, null, 2).replace(/</g, '\\u003c');
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

function escapeCssUrl(value) {
  return String(value).replace(/["\\]/g, '\\$&');
}

function readStringArg(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}
