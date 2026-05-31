import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import {
  createCssVariables,
  createDesignRegistryGraph,
  defineDesignSystem,
  materializeDesignRecipe,
  roleRef,
  tokenRef,
  validateDesignSystem
} from '../dist/index.js';

const tokenCount = readNumberArg('--tokens', 512);
const roleCount = readNumberArg('--roles', 256);
const recipeCount = readNumberArg('--recipes', 96);
const iterations = readNumberArg('--iterations', 10);
const outPath = readStringArg('--out');

const input = makeInput(tokenCount, roleCount, recipeCount);
const defineMs = measure(() => defineDesignSystem(input), 1);
const system = defineDesignSystem(input);
const issues = validateDesignSystem(system);
if (issues.length > 0) throw new Error('benchmark fixture did not validate: ' + JSON.stringify(issues.slice(0, 3)));

const materializeMs = measure(() => {
  for (const recipeId of Object.keys(system.recipes)) {
    materializeDesignRecipe(system, recipeId, {
      target: 'dom',
      mode: 'dark',
      variants: { tone: 'primary', density: 'compact' }
    });
    materializeDesignRecipe(system, recipeId, {
      target: 'canvas2d',
      mode: 'base',
      variants: { tone: 'neutral', density: 'comfortable' }
    });
  }
}, iterations);

const cssMs = measure(() => createCssVariables(system), iterations);
const graphMs = measure(() => createDesignRegistryGraph(system), iterations);

const result = {
  package: '@shapeshift-labs/frontier-design',
  date: new Date().toISOString(),
  fixture: {
    tokenCount: system.summary.tokenCount,
    roleCount: system.summary.roleCount,
    recipeCount: system.summary.recipeCount
  },
  iterations,
  timingsMs: {
    define: defineMs,
    materializeAllRecipesTwice: materializeMs,
    createCssVariables: cssMs,
    createDesignRegistryGraph: graphMs
  }
};

if (outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n');
}

console.log(JSON.stringify(result, null, 2));

function makeInput(tokens, roles, recipes) {
  const color = {};
  for (let i = 0; i < tokens; i += 1) {
    color['c' + i] = i % 5 === 0 && i > 0 ? tokenRef('color.c' + (i - 1)) : colorFor(i);
  }

  const semanticRoles = {};
  for (let i = 0; i < roles; i += 1) {
    semanticRoles['r' + i] = {
      value: tokenRef('color.c' + (i % tokens)),
      modes: {
        dark: tokenRef('color.c' + ((i * 7) % tokens))
      }
    };
  }

  const recipeMap = {};
  for (let i = 0; i < recipes; i += 1) {
    recipeMap['control.' + i] = {
      base: {
        root: {
          fill: roleRef('color.r' + (i % roles)),
          stroke: roleRef('color.r' + ((i + 1) % roles)),
          content: roleRef('color.r' + ((i + 2) % roles)),
          shadow: '0 0 0 1px ' + roleRef('color.r' + ((i + 3) % roles))
        }
      },
      variants: {
        tone: {
          neutral: {},
          primary: {
            root: {
              fill: roleRef('color.r' + ((i + 4) % roles))
            }
          }
        },
        density: {
          compact: {
            root: { padding: '4px' }
          },
          comfortable: {
            root: { padding: '8px' }
          }
        }
      },
      defaultVariants: {
        tone: 'neutral',
        density: 'comfortable'
      },
      compoundVariants: [
        {
          when: { tone: ['neutral', 'primary'], density: 'compact' },
          css: {
            root: {
              strokeWidth: 2
            }
          }
        }
      ]
    };
  }

  return {
    id: 'bench.design',
    modes: ['dark'],
    targets: ['dom', 'canvas2d'],
    tokens: {
      color: {
        $type: 'color',
        ...color
      }
    },
    roles: {
      color: semanticRoles
    },
    recipes: recipeMap
  };
}

function colorFor(index) {
  return '#' + ((index * 2654435761) >>> 8).toString(16).slice(0, 6).padStart(6, '0');
}

function measure(run, iterations) {
  const started = performance.now();
  for (let i = 0; i < iterations; i += 1) run();
  return Number(((performance.now() - started) / iterations).toFixed(3));
}

function readNumberArg(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  const value = Number(process.argv[index + 1]);
  return Number.isFinite(value) ? value : fallback;
}

function readStringArg(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}
