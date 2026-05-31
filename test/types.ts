import {
  createCssVariables,
  createDesignFrame,
  defineDesignSystem,
  materializeDesignRecipe,
  resolveDesignString,
  resolveDesignToken,
  roleRef,
  tokenRef,
  type FrontierDesignFrame,
  type FrontierDesignResolvedValue,
  type FrontierDesignSystem
} from '../dist/index.js';

const design: FrontierDesignSystem = defineDesignSystem({
  id: 'typed',
  targets: ['dom', 'canvas2d'],
  tokens: {
    color: {
      accent: { value: '#5dd3ff' }
    },
    space: {
      2: '8px'
    }
  },
  roles: {
    accent: {
      primary: tokenRef('color.accent')
    },
    layout: {
      gap: tokenRef('space.2')
    }
  },
  recipes: {
    control: {
      base: {
        root: {
          fill: roleRef('accent.primary'),
          padding: roleRef('layout.gap')
        }
      },
      compoundVariants: [
        {
          when: { tone: ['primary', 'danger'], disabled: false },
          css: {
            root: {
              stroke: roleRef('accent.primary')
            }
          }
        }
      ]
    }
  }
});

const resolved: FrontierDesignResolvedValue = resolveDesignToken(design, 'role.accent.primary');
const borderText: string = resolveDesignString(design, '1px solid {role.accent.primary}').value;
const recipeFrame: FrontierDesignFrame = materializeDesignRecipe(design, 'control', { target: 'dom' });
const directFrame: FrontierDesignFrame = createDesignFrame(design, {
  target: 'canvas2d',
  styles: {
    root: {
      fill: roleRef('accent.primary')
    }
  }
});
const css: string = createCssVariables(design);

void resolved;
void borderText;
void recipeFrame;
void directFrame;
void css;
