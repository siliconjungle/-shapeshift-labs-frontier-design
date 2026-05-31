import assert from 'node:assert';
import {
  createCssVariables,
  createDesignFrame,
  defineDesignSystem,
  materializeDesignRecipe,
  resolveDesignToken,
  roleRef,
  tokenRef,
  validateDesignSystem
} from '../dist/index.js';

const cases = readNumberArg('--cases', 200);
const seed = readNumberArg('--seed', 0xdecafbad);
const random = createRandom(seed);

for (let index = 0; index < cases; index += 1) {
  const system = makeSystem(index, random);
  const issues = validateDesignSystem(system);
  assert.deepStrictEqual(issues, [], 'case ' + index + ' should validate');

  const mode = random() > 0.5 ? 'dark' : 'base';
  const colorIndex = Math.floor(random() * system.summary.tokenCount) % 8;
  const resolvedRole = resolveDesignToken(system, 'role.accent.primary', { mode });
  assert.strictEqual(typeof resolvedRole.value, 'string');

  const directFrame = createDesignFrame(system, {
    id: 'direct-' + index,
    target: randomTarget(random),
    mode,
    styles: {
      root: {
        fill: roleRef('accent.primary'),
        stroke: roleRef('border.focus'),
        shadow: '0 0 0 1px ' + tokenRef('color.c' + colorIndex)
      }
    }
  });
  assert.ok(directFrame.slots.root.targetStyles);
  assert.doesNotThrow(() => JSON.stringify(directFrame));

  const recipeFrame = materializeDesignRecipe(system, 'control', {
    mode,
    target: randomTarget(random),
    variants: {
      tone: random() > 0.5 ? 'primary' : 'danger',
      density: random() > 0.5 ? 'compact' : 'comfortable'
    }
  });
  assert.ok(recipeFrame.summary.referenceCount > 0);
  assert.doesNotThrow(() => JSON.stringify(recipeFrame));

  const css = createCssVariables(system);
  assert.ok(css.includes('--frd-role-accent-primary'));
}

const circular = defineDesignSystem({
  id: 'circular',
  tokens: {
    color: {
      a: tokenRef('color.b'),
      b: tokenRef('color.a')
    }
  }
});
assert.ok(validateDesignSystem(circular).some((issue) => issue.code === 'circular-reference'));
assert.throws(() => resolveDesignToken(circular, 'color.a'), /circular token reference/);

const missing = defineDesignSystem({
  id: 'missing',
  tokens: {
    color: {
      a: tokenRef('color.nope')
    }
  }
});
assert.ok(validateDesignSystem(missing).some((issue) => issue.code === 'missing-reference'));

function makeSystem(index, random) {
  const color = {};
  for (let i = 0; i < 8; i += 1) {
    if (i === 0 || random() > 0.35) {
      color['c' + i] = randomColor(random);
    } else {
      color['c' + i] = {
        $value: tokenRef('color.c' + Math.floor(random() * i)),
        $type: 'color',
        $extensions: random() > 0.5 ? { 'org.primer.overrides': { dark: randomColor(random) } } : undefined
      };
    }
  }

  return defineDesignSystem({
    id: 'fuzz.' + index,
    modes: ['dark'],
    targets: ['dom', 'svg', 'canvas2d'],
    tokens: {
      color: {
        $type: 'color',
        ...color
      },
      space: {
        $type: 'dimension',
        s1: '4px',
        s2: '8px',
        s3: '12px'
      },
      shadow: {
        $type: 'shadow',
        focus: '0 0 0 1px {color.c0}',
        raised: ['0', '2px', '8px', tokenRef('color.c1')]
      }
    },
    roles: {
      accent: {
        primary: tokenRef('color.c' + Math.floor(random() * 8)),
        danger: tokenRef('color.c' + Math.floor(random() * 8))
      },
      border: {
        focus: tokenRef('color.c' + Math.floor(random() * 8))
      },
      layout: {
        gap: tokenRef('space.s2')
      },
      elevation: {
        focus: tokenRef('shadow.focus')
      }
    },
    recipes: {
      control: {
        base: {
          root: {
            fill: roleRef('accent.primary'),
            stroke: roleRef('border.focus'),
            shadow: roleRef('elevation.focus'),
            padding: roleRef('layout.gap')
          }
        },
        variants: {
          tone: {
            primary: {
              root: {
                fill: roleRef('accent.primary')
              }
            },
            danger: {
              root: {
                fill: roleRef('accent.danger')
              }
            }
          },
          density: {
            compact: {
              root: {
                padding: tokenRef('space.s1')
              }
            },
            comfortable: {
              root: {
                padding: tokenRef('space.s3')
              }
            }
          }
        },
        defaultVariants: {
          tone: 'primary',
          density: 'comfortable'
        },
        compoundVariants: [
          {
            when: { tone: ['primary', 'danger'], density: 'compact' },
            css: {
              root: {
                shadow: '0 0 0 2px ' + roleRef('border.focus')
              }
            }
          }
        ]
      }
    }
  });
}

function randomTarget(random) {
  const targets = ['dom', 'svg', 'canvas2d'];
  return targets[Math.floor(random() * targets.length)];
}

function randomColor(random) {
  const value = Math.floor(random() * 0xffffff);
  return '#' + value.toString(16).padStart(6, '0');
}

function createRandom(initialSeed) {
  let state = initialSeed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function readNumberArg(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  const value = Number(process.argv[index + 1]);
  return Number.isFinite(value) ? value : fallback;
}
