import assert from 'node:assert';
import {
  createCssVariables,
  createDesignFrame,
  createDesignRegistryGraph,
  defineDesignSystem,
  materializeDesignRecipe,
  resolveDesignString,
  resolveDesignToken,
  roleRef,
  tokenRef,
  validateDesignSystem
} from '../dist/index.js';

const editorDesign = defineDesignSystem({
  id: 'inkwell.editor',
  package: '@inkwell/editor',
  modes: ['dark', 'light'],
  targets: ['dom', 'canvas2d', 'svg'],
  tokens: {
    color: {
      ink: {
        950: '#0e1116',
        900: '#141821',
        850: '#171c27',
        800: '#1b212d',
        700: '#2a3342',
        600: '#3c4b61',
        100: '#e6e7ee'
      },
      paper: {
        0: '#ffffff',
        50: '#f6f8fb',
        900: '#1b212d'
      },
      cyan: {
        400: '#5dd3ff',
        900: '#0b1725'
      },
      red: {
        300: '#ffb3b3',
        900: '#2a1212'
      }
    },
    space: {
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px'
    },
    radius: {
      control: '8px',
      panel: '8px'
    },
    font: {
      ui: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial'
    }
  },
  roles: {
    surface: {
      app: {
        value: tokenRef('color.ink.950'),
        modes: { light: tokenRef('color.paper.50') }
      },
      panel: {
        value: tokenRef('color.ink.900'),
        modes: { light: tokenRef('color.paper.0') }
      },
      control: {
        value: tokenRef('color.ink.850'),
        modes: { light: tokenRef('color.paper.0') }
      },
      danger: tokenRef('color.red.900')
    },
    content: {
      default: {
        value: tokenRef('color.ink.100'),
        modes: { light: tokenRef('color.ink.900') }
      },
      muted: '#a5adba',
      danger: tokenRef('color.red.300')
    },
    border: {
      muted: tokenRef('color.ink.700'),
      active: tokenRef('color.cyan.400')
    },
    accent: {
      primary: tokenRef('color.cyan.400'),
      onPrimary: tokenRef('color.cyan.900')
    },
    layout: {
      gap: tokenRef('space.2'),
      panelPadding: tokenRef('space.3')
    },
    shape: {
      control: tokenRef('radius.control'),
      panel: tokenRef('radius.panel')
    },
    type: {
      ui: tokenRef('font.ui')
    }
  },
  recipes: {
    'editor.control': {
      slots: ['root', 'label'],
      base: {
        root: {
          fill: roleRef('surface.control'),
          stroke: roleRef('border.muted'),
          content: roleRef('content.default'),
          radius: roleRef('shape.control'),
          padding: roleRef('layout.gap'),
          font: roleRef('type.ui')
        },
        label: {
          content: roleRef('content.muted'),
          font: roleRef('type.ui')
        }
      },
      variants: {
        tone: {
          default: {},
          primary: {
            root: {
              fill: roleRef('accent.primary'),
              stroke: roleRef('accent.primary'),
              content: roleRef('accent.onPrimary')
            }
          },
          danger: {
            root: {
              fill: roleRef('surface.danger'),
              content: roleRef('content.danger')
            }
          }
        },
        density: {
          compact: {
            root: { padding: tokenRef('space.1') }
          },
          comfortable: {
            root: { padding: tokenRef('space.2') }
          }
        }
      },
      defaultVariants: {
        tone: 'default',
        density: 'comfortable'
      },
      compoundVariants: [
        {
          when: { tone: ['primary', 'danger'], density: 'compact' },
          css: {
            root: {
              shadow: '0 0 0 1px ' + roleRef('border.active')
            }
          }
        }
      ]
    }
  }
});

assert.deepStrictEqual(validateDesignSystem(editorDesign), []);
assert.strictEqual(editorDesign.summary.tokenCount, 21);
assert.strictEqual(editorDesign.summary.roleCount, 16);
assert.strictEqual(editorDesign.summary.recipeCount, 1);

const panel = resolveDesignToken(editorDesign, 'role.surface.panel', { mode: 'dark' });
assert.strictEqual(panel.value, '#141821');
assert.strictEqual(panel.variable, '--frd-role-surface-panel');
assert.deepStrictEqual(panel.trace.map((step) => `${step.kind}:${step.path}`), [
  'role:surface.panel',
  'token:color.ink.900'
]);

const lightPanel = resolveDesignToken(editorDesign, 'role.surface.panel', { mode: 'light' });
assert.strictEqual(lightPanel.value, '#ffffff');

const domFrame = materializeDesignRecipe(editorDesign, 'editor.control', {
  mode: 'dark',
  target: 'dom',
  variants: { tone: 'primary' }
});
assert.strictEqual(domFrame.slots.root.values.fill, '#5dd3ff');
assert.strictEqual(domFrame.slots.root.targetStyles.background, 'var(--frd-role-accent-primary)');
assert.strictEqual(domFrame.slots.root.targetStyles.color, 'var(--frd-role-accent-onprimary)');
assert.strictEqual(domFrame.slots.root.targetStyles.borderColor, 'var(--frd-role-accent-primary)');
assert.strictEqual(domFrame.slots.root.targetStyles.padding, 'var(--frd-space-2)');

const canvasFrame = materializeDesignRecipe(editorDesign, 'editor.control', {
  mode: 'dark',
  target: 'canvas2d',
  variants: { tone: 'primary' }
});
assert.strictEqual(canvasFrame.slots.root.targetStyles.fillStyle, '#5dd3ff');
assert.strictEqual(canvasFrame.slots.root.targetStyles.strokeStyle, '#5dd3ff');
assert.strictEqual(canvasFrame.slots.root.targetStyles.padding, '8px');

const compactPrimaryFrame = materializeDesignRecipe(editorDesign, 'editor.control', {
  mode: 'dark',
  target: 'dom',
  variants: { tone: 'primary', density: 'compact' }
});
assert.strictEqual(compactPrimaryFrame.slots.root.values.shadow, '0 0 0 1px #5dd3ff');
assert.strictEqual(compactPrimaryFrame.slots.root.targetStyles.boxShadow, '0 0 0 1px var(--frd-role-border-active)');

const directFrame = createDesignFrame(editorDesign, {
  id: 'selection-ring',
  mode: 'dark',
  target: 'svg',
  styles: {
    root: {
      stroke: roleRef('border.active'),
      strokeWidth: 2,
      fill: 'none'
    }
  }
});
assert.strictEqual(directFrame.slots.root.targetStyles.stroke, 'var(--frd-role-border-active)');
assert.strictEqual(directFrame.slots.root.targetStyles.strokeWidth, 2);

const css = createCssVariables(editorDesign);
assert.ok(css.includes('--frd-color-ink-950: #0e1116;'));
assert.ok(css.includes('--frd-role-surface-panel: var(--frd-color-ink-900, #141821);'));
assert.ok(css.includes('[data-frontier-design-mode="light"]'));

const graph = createDesignRegistryGraph(editorDesign);
assert.strictEqual(graph.kind, 'frontier.registry.graph');
assert.ok(graph.entries.some((entry) => entry.id === 'design-recipe:inkwell.editor:editor.control'));
assert.ok(graph.edges.some((edge) => edge.kind === 'consumes' && edge.to === 'design-role:inkwell.editor:accent.primary'));

const dtcgDesign = defineDesignSystem({
  id: 'dtcg',
  modes: ['dark'],
  tokens: {
    color: {
      $type: 'color',
      base: {
        blue: {
          500: {
            $value: '#0969da',
            $description: 'Accent blue',
            $extensions: {
              'org.primer.overrides': {
                dark: { $value: '#58a6ff' }
              }
            }
          }
        }
      }
    },
    border: {
      $type: 'shadow',
      focus: {
        $value: '0 0 0 2px {color.base.blue.500}'
      }
    }
  },
  semanticTokens: {
    focus: {
      ring: {
        $value: '{border.focus}'
      }
    }
  }
});
assert.strictEqual(dtcgDesign.tokens['color.base.blue.500'].kind, 'color');
assert.strictEqual(dtcgDesign.tokens['border.focus'].kind, 'shadow');
assert.strictEqual(resolveDesignToken(dtcgDesign, 'color.base.blue.500', { mode: 'dark' }).value, '#58a6ff');
assert.strictEqual(resolveDesignToken(dtcgDesign, 'border.focus').value, '0 0 0 2px #0969da');
const borderString = resolveDesignString(dtcgDesign, 'solid 1px {color.base.blue.500}');
assert.strictEqual(borderString.value, 'solid 1px #0969da');
assert.strictEqual(borderString.variables, 'solid 1px var(--frd-color-base-blue-500)');
