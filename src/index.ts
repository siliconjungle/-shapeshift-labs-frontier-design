import type { JsonObject, JsonValue } from '@shapeshift-labs/frontier';
import {
  createFrontierRegistryGraph,
  type FrontierRegistryEdge,
  type FrontierRegistryEntry,
  type FrontierRegistryGraph
} from '@shapeshift-labs/frontier/registry';

export const FRONTIER_DESIGN_SYSTEM_KIND = 'frontier.design.system';
export const FRONTIER_DESIGN_SYSTEM_VERSION = 1;
export const FRONTIER_DESIGN_FRAME_KIND = 'frontier.design.frame';
export const FRONTIER_DESIGN_FRAME_VERSION = 1;

export type FrontierDesignMode = 'base' | 'light' | 'dark' | 'high-contrast' | string;
export type FrontierDesignTarget =
  | 'dom'
  | 'svg'
  | 'canvas2d'
  | 'webgl'
  | 'webgpu'
  | 'native'
  | 'terminal'
  | 'print'
  | string;

export type FrontierDesignTokenKind =
  | 'color'
  | 'space'
  | 'size'
  | 'radius'
  | 'shape'
  | 'font'
  | 'typography'
  | 'shadow'
  | 'duration'
  | 'easing'
  | 'opacity'
  | 'z'
  | 'scale'
  | 'position'
  | 'asset'
  | string;

export type FrontierDesignTokenLike = JsonValue | FrontierDesignTokenInput | FrontierDesignTokenTree;
export type FrontierDesignRoleLike = JsonValue | FrontierDesignRoleInput | FrontierDesignRoleTree;

export interface FrontierDesignTokenTree {
  [key: string]: FrontierDesignTokenLike | undefined;
}

export interface FrontierDesignRoleTree {
  [key: string]: FrontierDesignRoleLike | undefined;
}

export interface FrontierDesignTokenInput {
  value?: unknown;
  '$value'?: unknown;
  default?: unknown;
  values?: Record<string, unknown>;
  modes?: Record<string, unknown>;
  targets?: Record<string, unknown>;
  kind?: FrontierDesignTokenKind;
  type?: FrontierDesignTokenKind;
  '$type'?: FrontierDesignTokenKind;
  description?: string;
  '$description'?: string;
  unit?: string;
  deprecated?: boolean | string;
  '$deprecated'?: boolean | string;
  metadata?: unknown;
  '$extensions'?: unknown;
}

export interface FrontierDesignRoleInput {
  value?: unknown;
  '$value'?: unknown;
  default?: unknown;
  values?: Record<string, unknown>;
  modes?: Record<string, unknown>;
  targets?: Record<string, unknown>;
  kind?: string;
  type?: string;
  '$type'?: string;
  description?: string;
  '$description'?: string;
  deprecated?: boolean | string;
  '$deprecated'?: boolean | string;
  metadata?: unknown;
  '$extensions'?: unknown;
}

export interface FrontierDesignToken {
  path: string;
  kind: FrontierDesignTokenKind;
  value: JsonValue;
  modes: Record<string, JsonValue>;
  targets: Record<string, JsonValue>;
  variable: string;
  description?: string;
  unit?: string;
  deprecated?: boolean | string;
  metadata?: JsonObject;
}

export interface FrontierDesignRole {
  path: string;
  kind: string;
  value: JsonValue;
  modes: Record<string, JsonValue>;
  targets: Record<string, JsonValue>;
  variable: string;
  description?: string;
  deprecated?: boolean | string;
  metadata?: JsonObject;
}

export interface FrontierDesignStyle {
  [property: string]: unknown;
}

export interface FrontierDesignSlotStyles {
  [slot: string]: FrontierDesignStyle;
}

export interface FrontierDesignRecipeInput {
  id?: string;
  description?: string;
  slots?: readonly string[];
  base?: FrontierDesignSlotStyles | FrontierDesignStyle;
  variants?: Record<string, Record<string, FrontierDesignSlotStyles | FrontierDesignStyle>>;
  defaultVariants?: Record<string, string>;
  compoundVariants?: readonly FrontierDesignCompoundVariantInput[];
  metadata?: unknown;
}

export type FrontierDesignVariantValue = string | number | boolean;
export type FrontierDesignCompoundSelectionInput = Record<
  string,
  FrontierDesignVariantValue | readonly FrontierDesignVariantValue[] | undefined | null
>;
export type FrontierDesignCompoundSelection = Record<string, string[]>;

export interface FrontierDesignCompoundVariantInput {
  when: FrontierDesignCompoundSelectionInput;
  style?: FrontierDesignSlotStyles | FrontierDesignStyle;
  css?: FrontierDesignSlotStyles | FrontierDesignStyle;
}

export interface FrontierDesignRecipe {
  id: string;
  description?: string;
  slots: string[];
  base: FrontierDesignSlotStyles;
  variants: Record<string, Record<string, FrontierDesignSlotStyles>>;
  defaultVariants: Record<string, string>;
  compoundVariants: FrontierDesignCompoundVariant[];
  metadata?: JsonObject;
}

export interface FrontierDesignCompoundVariant {
  when: FrontierDesignCompoundSelection;
  style: FrontierDesignSlotStyles;
}

export interface FrontierDesignSystemInput {
  id: string;
  name?: string;
  package?: string;
  version?: string;
  modes?: readonly FrontierDesignMode[];
  targets?: readonly FrontierDesignTarget[];
  tokens?: FrontierDesignTokenTree;
  roles?: FrontierDesignRoleTree;
  semanticTokens?: FrontierDesignRoleTree;
  recipes?: Record<string, FrontierDesignRecipeInput>;
  metadata?: unknown;
}

export interface FrontierDesignSystemSummary {
  tokenCount: number;
  roleCount: number;
  recipeCount: number;
  modeCount: number;
  targetCount: number;
}

export interface FrontierDesignSystem {
  kind: typeof FRONTIER_DESIGN_SYSTEM_KIND;
  version: typeof FRONTIER_DESIGN_SYSTEM_VERSION;
  id: string;
  name?: string;
  package?: string;
  systemVersion?: string;
  modes: string[];
  targets: string[];
  tokens: Record<string, FrontierDesignToken>;
  roles: Record<string, FrontierDesignRole>;
  recipes: Record<string, FrontierDesignRecipe>;
  summary: FrontierDesignSystemSummary;
  metadata?: JsonObject;
}

export interface FrontierDesignResolveOptions {
  mode?: FrontierDesignMode;
  target?: FrontierDesignTarget;
}

export interface FrontierDesignResolveTraceStep {
  kind: 'token' | 'role';
  path: string;
  value: JsonValue;
  variable: string;
}

export interface FrontierDesignResolvedValue {
  kind: 'token' | 'role';
  path: string;
  value: JsonValue;
  variable: string;
  trace: FrontierDesignResolveTraceStep[];
}

export interface FrontierDesignResolvedString {
  value: string;
  variables: string;
  references: FrontierDesignResolvedValue[];
}

export interface FrontierDesignResolvedStyle {
  source: JsonObject;
  values: JsonObject;
  variables: Record<string, string>;
  targetStyles: Record<string, JsonValue>;
  references: FrontierDesignResolvedValue[];
}

export interface FrontierDesignFrameSlot {
  slot: string;
  source: JsonObject;
  values: JsonObject;
  variables: Record<string, string>;
  targetStyles: Record<string, JsonValue>;
  references: FrontierDesignResolvedValue[];
}

export interface FrontierDesignFrame {
  kind: typeof FRONTIER_DESIGN_FRAME_KIND;
  version: typeof FRONTIER_DESIGN_FRAME_VERSION;
  id: string;
  systemId: string;
  recipe?: string;
  mode: string;
  target: string;
  variants: Record<string, string>;
  slots: Record<string, FrontierDesignFrameSlot>;
  summary: {
    slotCount: number;
    referenceCount: number;
  };
}

export interface FrontierDesignFrameInput {
  id?: string;
  recipe?: string;
  styles?: FrontierDesignSlotStyles | FrontierDesignStyle;
  variants?: Record<string, string | number | boolean | undefined | null>;
  mode?: FrontierDesignMode;
  target?: FrontierDesignTarget;
  preferVariables?: boolean;
}

export interface FrontierDesignCssOptions extends FrontierDesignResolveOptions {
  selector?: string;
  prefix?: string;
  includeModes?: boolean;
  modeAttribute?: string;
}

export interface FrontierDesignValidationIssue {
  severity: 'error' | 'warning';
  code: string;
  path: string;
  message: string;
}

const DEFAULT_VARIABLE_PREFIX = 'frd';
const EXACT_REFERENCE_PATTERN = /^\{([^{}]+)\}$/;
const REFERENCE_PATTERN = /\{([^{}]+)\}/g;
const TOKEN_VALUE_KEYS = new Set(['value', '$value', 'values', 'modes', 'targets']);
const TOKEN_METADATA_KEYS = new Set([
  'kind',
  'type',
  '$type',
  'description',
  '$description',
  'unit',
  'deprecated',
  '$deprecated',
  'metadata',
  '$extensions'
]);
const GROUP_METADATA_KEYS = new Set(['$type', '$description', '$extensions', '$deprecated']);
const TOKEN_KNOWN_KEYS = new Set([...TOKEN_VALUE_KEYS, 'default', ...TOKEN_METADATA_KEYS]);

const STYLE_PROPERTY_TARGET_MAP: Record<string, Record<string, string>> = {
  dom: {
    fill: 'background',
    content: 'color',
    stroke: 'borderColor',
    strokeWidth: 'borderWidth',
    radius: 'borderRadius',
    cornerRadius: 'borderRadius',
    shadow: 'boxShadow',
    font: 'fontFamily',
    fontSize: 'fontSize',
    lineHeight: 'lineHeight'
  },
  svg: {
    content: 'fill',
    radius: 'rx',
    cornerRadius: 'rx'
  },
  canvas2d: {
    fill: 'fillStyle',
    content: 'color',
    stroke: 'strokeStyle',
    strokeWidth: 'lineWidth',
    shadow: 'shadowColor',
    font: 'font'
  }
};

export function defineDesignSystem(input: FrontierDesignSystemInput): FrontierDesignSystem {
  if (!input || typeof input !== 'object') throw new TypeError('frontier-design system input is required');
  if (typeof input.id !== 'string' || input.id.length === 0) throw new TypeError('frontier-design system id is required');

  const tokens = collectTokens(input.tokens ?? {});
  const roles = collectRoles({ ...(input.roles ?? {}), ...(input.semanticTokens ?? {}) });
  const recipes = collectRecipes(input.recipes ?? {});
  const modeSet = new Set<string>(['base']);
  const targetSet = new Set<string>();

  for (const mode of input.modes ?? []) modeSet.add(String(mode));
  for (const target of input.targets ?? []) targetSet.add(String(target));
  for (const token of Object.values(tokens)) {
    for (const mode of Object.keys(token.modes)) modeSet.add(mode);
    for (const target of Object.keys(token.targets)) targetSet.add(target);
  }
  for (const role of Object.values(roles)) {
    for (const mode of Object.keys(role.modes)) modeSet.add(mode);
    for (const target of Object.keys(role.targets)) targetSet.add(target);
  }

  return {
    kind: FRONTIER_DESIGN_SYSTEM_KIND,
    version: FRONTIER_DESIGN_SYSTEM_VERSION,
    id: input.id,
    name: input.name,
    package: input.package,
    systemVersion: input.version,
    modes: Array.from(modeSet).sort(),
    targets: Array.from(targetSet).sort(),
    tokens,
    roles,
    recipes,
    summary: {
      tokenCount: Object.keys(tokens).length,
      roleCount: Object.keys(roles).length,
      recipeCount: Object.keys(recipes).length,
      modeCount: modeSet.size,
      targetCount: targetSet.size
    },
    metadata: input.metadata === undefined ? undefined : toJsonObject(input.metadata, 'metadata')
  };
}

export function tokenRef(path: string): string {
  return '{' + normalizePath(path) + '}';
}

export function roleRef(path: string): string {
  return '{role.' + normalizeRolePath(path) + '}';
}

export function tokenVariable(path: string, prefix = DEFAULT_VARIABLE_PREFIX): string {
  return '--' + sanitizeIdentifier(prefix) + '-' + sanitizePath(normalizeTokenPath(path));
}

export function roleVariable(path: string, prefix = DEFAULT_VARIABLE_PREFIX): string {
  return '--' + sanitizeIdentifier(prefix) + '-role-' + sanitizePath(normalizeRolePath(path));
}

export function tokenVar(path: string, prefix = DEFAULT_VARIABLE_PREFIX): string {
  return 'var(' + tokenVariable(path, prefix) + ')';
}

export function roleVar(path: string, prefix = DEFAULT_VARIABLE_PREFIX): string {
  return 'var(' + roleVariable(path, prefix) + ')';
}

export function resolveDesignToken(
  system: FrontierDesignSystem,
  path: string,
  options: FrontierDesignResolveOptions = {}
): FrontierDesignResolvedValue {
  return resolveDesignTokenInternal(system, path, options, []);
}

export function resolveDesignValue(
  system: FrontierDesignSystem,
  value: unknown,
  options: FrontierDesignResolveOptions = {}
): JsonValue {
  const reference = parseReference(value);
  if (!reference) return resolveJsonValueReferences(system, toJsonValue(value, 'value'), options, []).value;
  return resolveDesignToken(system, reference, options).value;
}

export function resolveDesignString(
  system: FrontierDesignSystem,
  value: string,
  options: FrontierDesignResolveOptions = {}
): FrontierDesignResolvedString {
  return resolveReferenceString(system, value, options, { preferVariables: true });
}

export function resolveDesignStyle(
  system: FrontierDesignSystem,
  style: FrontierDesignStyle,
  options: FrontierDesignResolveOptions & { preferVariables?: boolean } = {}
): FrontierDesignResolvedStyle {
  const source = toJsonObject(style, 'style');
  const values: JsonObject = {};
  const variables: Record<string, string> = {};
  const targetStyles: Record<string, JsonValue> = {};
  const references: FrontierDesignResolvedValue[] = [];
  const target = options.target ?? 'dom';
  const preferVariables = options.preferVariables ?? isCssLikeTarget(target);

  for (const [property, raw] of Object.entries(style)) {
    if (raw === undefined) continue;
    const targetProperty = targetStyleProperty(property, target);
    const projection = resolveStyleValueProjection(system, raw, {
      ...options,
      target,
      preferVariables
    });
    values[property] = projection.value;
    targetStyles[targetProperty] = projection.targetValue;
    if (projection.variable !== undefined) variables[property] = projection.variable;
    for (const reference of projection.references) references[references.length] = reference;
  }

  return {
    source,
    values,
    variables,
    targetStyles,
    references
  };
}

function resolveStyleValueProjection(
  system: FrontierDesignSystem,
  raw: unknown,
  options: FrontierDesignResolveOptions & { preferVariables: boolean }
): {
  value: JsonValue;
  variable?: string;
  targetValue: JsonValue;
  references: FrontierDesignResolvedValue[];
} {
  const reference = parseReference(raw);
  if (reference) {
    const resolved = resolveDesignToken(system, reference, options);
    const variable = 'var(' + resolved.variable + ')';
    return {
      value: resolved.value,
      variable,
      targetValue: options.preferVariables ? (variable as JsonValue) : resolved.value,
      references: [resolved]
    };
  }

  if (typeof raw === 'string' && hasReferences(raw)) {
    const resolved = resolveReferenceString(system, raw, options, { preferVariables: true });
    return {
      value: resolved.value,
      variable: resolved.variables,
      targetValue: (options.preferVariables ? resolved.variables : resolved.value) as JsonValue,
      references: resolved.references
    };
  }

  const resolvedJson = resolveJsonValueReferences(system, toJsonValue(raw, 'style'), options, []);
  return {
    value: resolvedJson.value,
    targetValue: resolvedJson.value,
    references: traceValuesToResolvedReferences(resolvedJson.trace)
  };
}

function resolveReferenceString(
  system: FrontierDesignSystem,
  value: string,
  options: FrontierDesignResolveOptions,
  projection: { preferVariables: boolean },
  stack: string[] = []
): FrontierDesignResolvedString {
  const references: FrontierDesignResolvedValue[] = [];
  const valueText = replaceReferencesInString(value, (reference) => {
    const resolved = resolveDesignTokenInternal(system, reference, options, stack);
    references[references.length] = resolved;
    return formatCssValue(resolved.value);
  });
  const variableText = replaceReferencesInString(value, (reference) => {
    const resolved = resolveDesignTokenInternal(system, reference, options, stack);
    if (!projection.preferVariables) return formatCssValue(resolved.value);
    return 'var(' + resolved.variable + ')';
  });

  return {
    value: valueText,
    variables: variableText,
    references
  };
}

export function materializeDesignRecipe(
  system: FrontierDesignSystem,
  recipeId: string,
  options: Omit<FrontierDesignFrameInput, 'recipe' | 'styles'> = {}
): FrontierDesignFrame {
  const recipe = system.recipes[recipeId];
  if (!recipe) throw new TypeError('frontier-design recipe was not found: ' + recipeId);
  const variants = normalizeSelectedVariants(recipe, options.variants ?? {});
  const styles = materializeRecipeStyles(recipe, variants);
  return createDesignFrame(system, {
    id: options.id ?? recipeId,
    recipe: recipeId,
    styles,
    variants,
    mode: options.mode,
    target: options.target,
    preferVariables: options.preferVariables
  });
}

export function createDesignFrame(system: FrontierDesignSystem, input: FrontierDesignFrameInput): FrontierDesignFrame {
  const mode = String(input.mode ?? 'base');
  const target = String(input.target ?? 'dom');
  const slotsInput = normalizeSlotStyles(input.styles ?? {});
  const slots: Record<string, FrontierDesignFrameSlot> = {};
  let referenceCount = 0;

  for (const [slot, style] of Object.entries(slotsInput)) {
    const resolved = resolveDesignStyle(system, style, {
      mode,
      target,
      preferVariables: input.preferVariables
    });
    referenceCount += resolved.references.length;
    slots[slot] = {
      slot,
      source: resolved.source,
      values: resolved.values,
      variables: resolved.variables,
      targetStyles: resolved.targetStyles,
      references: resolved.references
    };
  }

  return {
    kind: FRONTIER_DESIGN_FRAME_KIND,
    version: FRONTIER_DESIGN_FRAME_VERSION,
    id: input.id ?? input.recipe ?? 'design-frame',
    systemId: system.id,
    recipe: input.recipe,
    mode,
    target,
    variants: normalizeVariantSelection(input.variants ?? {}),
    slots,
    summary: {
      slotCount: Object.keys(slots).length,
      referenceCount
    }
  };
}

export function createCssVariables(system: FrontierDesignSystem, options: FrontierDesignCssOptions = {}): string {
  const selector = options.selector ?? ':root';
  const includeModes = options.includeModes ?? options.mode === undefined;
  const modeAttribute = options.modeAttribute ?? 'data-frontier-design-mode';
  const blocks: string[] = [];

  blocks[blocks.length] = createCssVariableBlock(system, selector, { ...options, mode: options.mode ?? 'base' });
  if (includeModes) {
    for (const mode of system.modes) {
      if (mode === 'base') continue;
      blocks[blocks.length] = createCssVariableBlock(system, '[' + modeAttribute + '="' + escapeCssAttribute(mode) + '"]', {
        ...options,
        mode
      });
    }
  }

  return blocks.filter(Boolean).join('\n\n');
}

export function createDesignRegistryGraph(system: FrontierDesignSystem): FrontierRegistryGraph {
  const entries: FrontierRegistryEntry[] = [
    {
      id: 'design-system:' + system.id,
      kind: 'design-system',
      package: system.package,
      version: system.systemVersion,
      metadata: {
        tokenCount: system.summary.tokenCount,
        roleCount: system.summary.roleCount,
        recipeCount: system.summary.recipeCount
      }
    }
  ];
  const edges: FrontierRegistryEdge[] = [];

  for (const token of Object.values(system.tokens)) {
    const id = 'design-token:' + system.id + ':' + token.path;
    entries[entries.length] = {
      id,
      kind: 'design-token',
      package: system.package,
      tags: [token.kind],
      metadata: {
        path: token.path,
        variable: token.variable
      }
    };
    edges[edges.length] = { from: id, to: 'design-system:' + system.id, kind: 'belongs-to' };
  }

  for (const role of Object.values(system.roles)) {
    const id = 'design-role:' + system.id + ':' + role.path;
    entries[entries.length] = {
      id,
      kind: 'design-role',
      package: system.package,
      tags: [role.kind],
      metadata: {
        path: role.path,
        variable: role.variable
      }
    };
    edges[edges.length] = { from: id, to: 'design-system:' + system.id, kind: 'belongs-to' };
    for (const reference of referencesInValues([role.value, ...Object.values(role.modes), ...Object.values(role.targets)])) {
      edges[edges.length] = { from: id, to: registryIdForReference(system, reference), kind: 'depends-on' };
    }
  }

  for (const recipe of Object.values(system.recipes)) {
    const id = 'design-recipe:' + system.id + ':' + recipe.id;
    entries[entries.length] = {
      id,
      kind: 'design-recipe',
      package: system.package,
      metadata: {
        slots: recipe.slots,
        variants: Object.keys(recipe.variants)
      }
    };
    edges[edges.length] = { from: id, to: 'design-system:' + system.id, kind: 'belongs-to' };
    for (const reference of referencesInRecipe(recipe)) {
      edges[edges.length] = { from: id, to: registryIdForReference(system, reference), kind: 'consumes' };
    }
  }

  return createFrontierRegistryGraph({
    entries,
    edges,
    metadata: {
      designSystem: system.id
    }
  });
}

export function validateDesignSystem(system: FrontierDesignSystem): FrontierDesignValidationIssue[] {
  const issues: FrontierDesignValidationIssue[] = [];
  for (const token of Object.values(system.tokens)) {
    validateReferences(system, 'token.' + token.path, [token.value, ...Object.values(token.modes), ...Object.values(token.targets)], issues);
  }
  for (const role of Object.values(system.roles)) {
    validateReferences(system, 'role.' + role.path, [role.value, ...Object.values(role.modes), ...Object.values(role.targets)], issues);
  }
  for (const recipe of Object.values(system.recipes)) {
    for (const reference of referencesInRecipe(recipe)) {
      try {
        resolveDesignToken(system, reference);
      } catch (error) {
        issues[issues.length] = {
          severity: 'error',
          code: error instanceof Error && error.message.includes('circular token reference') ? 'circular-reference' : 'missing-reference',
          path: 'recipe.' + recipe.id,
          message: error instanceof Error ? error.message : String(error)
        };
      }
    }
  }
  return issues;
}

function collectTokens(input: FrontierDesignTokenTree): Record<string, FrontierDesignToken> {
  const tokens: Record<string, FrontierDesignToken> = {};
  collectTokenTree([], input, tokens, undefined);
  return sortRecord(tokens);
}

function collectTokenTree(
  path: string[],
  value: unknown,
  out: Record<string, FrontierDesignToken>,
  inheritedKind: string | undefined
): void {
  if (value === undefined) return;
  if (path.length > 0 && isTokenLeaf(value)) {
    const tokenPath = path.join('.');
    out[tokenPath] = normalizeToken(tokenPath, value, inheritedKind ?? path[0] ?? 'token');
    return;
  }
  if (!isPlainObject(value)) return;
  const nextKind = readDesignKind(value, inheritedKind);
  for (const [key, child] of Object.entries(value)) {
    if (GROUP_METADATA_KEYS.has(key)) continue;
    if (child === undefined) continue;
    collectTokenTree(path.concat(key), child, out, nextKind);
  }
}

function collectRoles(input: FrontierDesignRoleTree): Record<string, FrontierDesignRole> {
  const roles: Record<string, FrontierDesignRole> = {};
  collectRoleTree([], input, roles, undefined);
  return sortRecord(roles);
}

function collectRoleTree(
  path: string[],
  value: unknown,
  out: Record<string, FrontierDesignRole>,
  inheritedKind: string | undefined
): void {
  if (value === undefined) return;
  if (path.length > 0 && isTokenLeaf(value)) {
    const rolePath = path.join('.');
    out[rolePath] = normalizeRole(rolePath, value, inheritedKind ?? path[0] ?? 'role');
    return;
  }
  if (!isPlainObject(value)) return;
  const nextKind = readDesignKind(value, inheritedKind);
  for (const [key, child] of Object.entries(value)) {
    if (GROUP_METADATA_KEYS.has(key)) continue;
    if (child === undefined) continue;
    collectRoleTree(path.concat(key), child, out, nextKind);
  }
}

function normalizeToken(path: string, input: unknown, fallbackKind: string): FrontierDesignToken {
  const object = isPlainObject(input) ? input : { value: input };
  const modes = normalizeValueRecord({
    ...readExtensionModeValues(object),
    ...(readRecord(object, 'modes') ?? readRecord(object, 'values') ?? {})
  });
  const targets = normalizeValueRecord(readRecord(object, 'targets') ?? {});
  const baseValue =
    object.$value !== undefined ? object.$value :
    object.value !== undefined ? object.value :
    modes.base !== undefined ? modes.base :
    object.default !== undefined ? object.default :
    null;
  return {
    path,
    kind: readDesignKind(object, fallbackKind) ?? fallbackKind,
    value: toJsonValue(baseValue, 'token.' + path + '.value'),
    modes,
    targets,
    variable: tokenVariable(path),
    description: typeof object.$description === 'string' ? object.$description : typeof object.description === 'string' ? object.description : undefined,
    unit: typeof object.unit === 'string' ? object.unit : undefined,
    deprecated: normalizeDeprecated(object.$deprecated ?? object.deprecated),
    metadata: normalizeLeafMetadata(object, TOKEN_KNOWN_KEYS, 'token.' + path + '.metadata')
  };
}

function normalizeRole(path: string, input: unknown, fallbackKind: string): FrontierDesignRole {
  const object = isPlainObject(input) ? input : { value: input };
  const modes = normalizeValueRecord({
    ...readExtensionModeValues(object),
    ...(readRecord(object, 'modes') ?? readRecord(object, 'values') ?? {})
  });
  const targets = normalizeValueRecord(readRecord(object, 'targets') ?? {});
  const baseValue =
    object.$value !== undefined ? object.$value :
    object.value !== undefined ? object.value :
    modes.base !== undefined ? modes.base :
    object.default !== undefined ? object.default :
    null;
  return {
    path,
    kind: readDesignKind(object, fallbackKind) ?? fallbackKind,
    value: toJsonValue(baseValue, 'role.' + path + '.value'),
    modes,
    targets,
    variable: roleVariable(path),
    description: typeof object.$description === 'string' ? object.$description : typeof object.description === 'string' ? object.description : undefined,
    deprecated: normalizeDeprecated(object.$deprecated ?? object.deprecated),
    metadata: normalizeLeafMetadata(object, TOKEN_KNOWN_KEYS, 'role.' + path + '.metadata')
  };
}

function collectRecipes(input: Record<string, FrontierDesignRecipeInput>): Record<string, FrontierDesignRecipe> {
  const recipes: Record<string, FrontierDesignRecipe> = {};
  for (const [key, value] of Object.entries(input)) {
    recipes[key] = normalizeRecipe(key, value);
  }
  return sortRecord(recipes);
}

function normalizeRecipe(id: string, input: FrontierDesignRecipeInput): FrontierDesignRecipe {
  const base = normalizeSlotStyles(input.base ?? {});
  const variants: Record<string, Record<string, FrontierDesignSlotStyles>> = {};
  for (const [axis, axisInput] of Object.entries(input.variants ?? {})) {
    const axisVariants: Record<string, FrontierDesignSlotStyles> = {};
    for (const [variant, style] of Object.entries(axisInput)) {
      axisVariants[String(variant)] = normalizeSlotStyles(style);
    }
    variants[axis] = sortRecord(axisVariants);
  }
  const compoundVariants = (input.compoundVariants ?? []).map((compound) => ({
    when: normalizeCompoundSelection(compound.when),
    style: normalizeSlotStyles(compound.style ?? compound.css ?? {})
  }));
  const slotSet = new Set<string>(input.slots?.map(String) ?? []);
  for (const slot of Object.keys(base)) slotSet.add(slot);
  for (const axis of Object.values(variants)) {
    for (const style of Object.values(axis)) {
      for (const slot of Object.keys(style)) slotSet.add(slot);
    }
  }
  for (const compound of compoundVariants) {
    for (const slot of Object.keys(compound.style)) slotSet.add(slot);
  }

  return {
    id: input.id ?? id,
    description: input.description,
    slots: Array.from(slotSet).sort(),
    base,
    variants: sortRecord(variants),
    defaultVariants: normalizeVariantSelection(input.defaultVariants ?? {}),
    compoundVariants,
    metadata: input.metadata === undefined ? undefined : toJsonObject(input.metadata, 'recipe.' + id + '.metadata')
  };
}

function materializeRecipeStyles(recipe: FrontierDesignRecipe, variants: Record<string, string>): FrontierDesignSlotStyles {
  const styles = cloneSlotStyles(recipe.base);
  for (const [axis, variant] of Object.entries(variants)) {
    const slotStyles = recipe.variants[axis]?.[variant];
    if (slotStyles) mergeSlotStyles(styles, slotStyles);
  }
  for (const compound of recipe.compoundVariants) {
    if (matchesVariantSelection(variants, compound.when)) mergeSlotStyles(styles, compound.style);
  }
  return styles;
}

function normalizeSelectedVariants(
  recipe: FrontierDesignRecipe,
  input: Record<string, string | number | boolean | undefined | null>
): Record<string, string> {
  const variants = normalizeVariantSelection({ ...recipe.defaultVariants, ...input });
  for (const [axis, value] of Object.entries(variants)) {
    if (!recipe.variants[axis]?.[value]) {
      throw new TypeError('frontier-design recipe variant was not found: ' + recipe.id + '.' + axis + '=' + value);
    }
  }
  return variants;
}

function normalizeVariantSelection(input: Record<string, string | number | boolean | undefined | null>): Record<string, string> {
  const variants: Record<string, string> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) continue;
    variants[key] = String(value);
  }
  return sortRecord(variants);
}

function normalizeCompoundSelection(input: FrontierDesignCompoundSelectionInput): FrontierDesignCompoundSelection {
  const selection: FrontierDesignCompoundSelection = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) continue;
    const values = Array.isArray(value) ? value : [value];
    const normalized = Array.from(new Set(values.map((item) => String(item)))).sort();
    if (normalized.length > 0) selection[key] = normalized;
  }
  return sortRecord(selection);
}

function normalizeSlotStyles(input: FrontierDesignSlotStyles | FrontierDesignStyle): FrontierDesignSlotStyles {
  if (!isPlainObject(input)) return {};
  if (looksLikeSlotStyles(input)) {
    const slots: FrontierDesignSlotStyles = {};
    for (const [slot, style] of Object.entries(input)) {
      if (style === undefined) continue;
      if (!isPlainObject(style)) throw new TypeError('frontier-design slot style must be an object: ' + slot);
      slots[slot] = toJsonObject(style, 'slot.' + slot) as FrontierDesignStyle;
    }
    return sortRecord(slots);
  }
  return { root: toJsonObject(input, 'slot.root') as FrontierDesignStyle };
}

function looksLikeSlotStyles(input: Record<string, unknown>): boolean {
  const entries = Object.entries(input).filter(([, value]) => value !== undefined);
  if (entries.length === 0) return true;
  return entries.every(([key, value]) => isPlainObject(value) && !isLikelyStyleProperty(key));
}

function isLikelyStyleProperty(property: string): boolean {
  return (
    property === 'fill' ||
    property === 'stroke' ||
    property === 'content' ||
    property === 'radius' ||
    property === 'cornerRadius' ||
    property === 'shadow' ||
    property === 'font' ||
    property === 'fontSize' ||
    property === 'lineHeight' ||
    property === 'gap' ||
    property === 'padding' ||
    property === 'width' ||
    property === 'height' ||
    property === 'opacity' ||
    property === 'scale' ||
    property === 'x' ||
    property === 'y'
  );
}

function cloneSlotStyles(input: FrontierDesignSlotStyles): FrontierDesignSlotStyles {
  const next: FrontierDesignSlotStyles = {};
  for (const [slot, style] of Object.entries(input)) next[slot] = { ...style };
  return next;
}

function mergeSlotStyles(target: FrontierDesignSlotStyles, source: FrontierDesignSlotStyles): void {
  for (const [slot, style] of Object.entries(source)) {
    target[slot] = { ...(target[slot] ?? {}), ...style };
  }
}

function matchesVariantSelection(selection: Record<string, string>, when: FrontierDesignCompoundSelection): boolean {
  for (const [axis, values] of Object.entries(when)) {
    if (!values.includes(selection[axis] ?? '')) return false;
  }
  return true;
}

function resolveDesignTokenInternal(
  system: FrontierDesignSystem,
  path: string,
  options: FrontierDesignResolveOptions,
  stack: string[]
): FrontierDesignResolvedValue {
  const location = locateDesignValue(system, path);
  const stackId = location.kind + ':' + location.path;
  if (stack.includes(stackId)) throw new TypeError('frontier-design circular token reference: ' + stack.concat(stackId).join(' -> '));
  const raw = selectValueForModeAndTarget(location.entry, options);
  const step: FrontierDesignResolveTraceStep = {
    kind: location.kind,
    path: location.path,
    value: raw,
    variable: location.entry.variable
  };
  const resolved = resolveJsonValueReferences(system, raw, options, stack.concat(stackId));
  return {
    kind: location.kind,
    path: location.path,
    value: resolved.value,
    variable: location.entry.variable,
    trace: [step, ...resolved.trace]
  };
}

function locateDesignValue(
  system: FrontierDesignSystem,
  path: string
): { kind: 'token'; path: string; entry: FrontierDesignToken } | { kind: 'role'; path: string; entry: FrontierDesignRole } {
  const normalized = normalizePath(path);
  if (normalized.startsWith('role.')) {
    const rolePath = normalizeRolePath(normalized.slice('role.'.length));
    const role = system.roles[rolePath];
    if (!role) throw new TypeError('frontier-design role was not found: ' + rolePath);
    return { kind: 'role', path: rolePath, entry: role };
  }
  if (normalized.startsWith('token.')) {
    const tokenPath = normalizeTokenPath(normalized.slice('token.'.length));
    const token = system.tokens[tokenPath];
    if (!token) throw new TypeError('frontier-design token was not found: ' + tokenPath);
    return { kind: 'token', path: tokenPath, entry: token };
  }
  const token = system.tokens[normalized];
  if (token) return { kind: 'token', path: normalized, entry: token };
  const role = system.roles[normalized];
  if (role) return { kind: 'role', path: normalized, entry: role };
  throw new TypeError('frontier-design token or role was not found: ' + normalized);
}

function selectValueForModeAndTarget(
  entry: FrontierDesignToken | FrontierDesignRole,
  options: FrontierDesignResolveOptions
): JsonValue {
  if (options.target && entry.targets[String(options.target)] !== undefined) return entry.targets[String(options.target)];
  if (options.mode && entry.modes[String(options.mode)] !== undefined) return entry.modes[String(options.mode)];
  return entry.value;
}

function createCssVariableBlock(system: FrontierDesignSystem, selector: string, options: FrontierDesignCssOptions): string {
  const declarations: string[] = [];
  const prefix = options.prefix ?? DEFAULT_VARIABLE_PREFIX;
  for (const token of Object.values(system.tokens)) {
    const variable = tokenVariable(token.path, prefix);
    const value = selectValueForModeAndTarget(token, options);
    declarations[declarations.length] = '  ' + variable + ': ' + cssValueFor(system, value, options, prefix) + ';';
  }
  for (const role of Object.values(system.roles)) {
    const variable = roleVariable(role.path, prefix);
    const value = selectValueForModeAndTarget(role, options);
    declarations[declarations.length] = '  ' + variable + ': ' + cssValueFor(system, value, options, prefix) + ';';
  }
  return selector + ' {\n' + declarations.join('\n') + '\n}';
}

function cssValueFor(
  system: FrontierDesignSystem,
  value: JsonValue,
  options: FrontierDesignResolveOptions,
  prefix: string
): string {
  const reference = parseReference(value);
  if (reference) {
    const resolved = resolveDesignToken(system, reference, options);
    const variable =
      resolved.kind === 'role'
        ? roleVariable(resolved.path, prefix)
        : tokenVariable(resolved.path, prefix);
    return 'var(' + variable + ', ' + formatCssValue(resolved.value) + ')';
  }
  if (typeof value === 'string' && hasReferences(value)) {
    return replaceReferencesInString(value, (path) => {
      const resolved = resolveDesignToken(system, path, options);
      const variable =
        resolved.kind === 'role'
          ? roleVariable(resolved.path, prefix)
          : tokenVariable(resolved.path, prefix);
      return 'var(' + variable + ', ' + formatCssValue(resolved.value) + ')';
    });
  }
  return formatCssValue(resolveJsonValueReferences(system, value, options, []).value);
}

function formatCssValue(value: JsonValue): string {
  if (value === null) return '';
  if (Array.isArray(value)) return value.map(formatCssValue).join(' ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function targetStyleProperty(property: string, target: string): string {
  return STYLE_PROPERTY_TARGET_MAP[target]?.[property] ?? property;
}

function isCssLikeTarget(target: string): boolean {
  return target === 'dom' || target === 'svg';
}

function registryIdForReference(system: FrontierDesignSystem, reference: string): string {
  const location = locateDesignValue(system, reference);
  return 'design-' + location.kind + ':' + system.id + ':' + location.path;
}

function referencesInRecipe(recipe: FrontierDesignRecipe): string[] {
  const references: string[] = [];
  collectReferencesFromSlotStyles(recipe.base, references);
  for (const axis of Object.values(recipe.variants)) {
    for (const style of Object.values(axis)) collectReferencesFromSlotStyles(style, references);
  }
  for (const compound of recipe.compoundVariants) collectReferencesFromSlotStyles(compound.style, references);
  return Array.from(new Set(references)).sort();
}

function collectReferencesFromSlotStyles(style: FrontierDesignSlotStyles, out: string[]): void {
  for (const slotStyle of Object.values(style)) {
    for (const value of Object.values(slotStyle)) {
      collectReferencesFromValue(value, out);
    }
  }
}

function referencesInValues(values: readonly JsonValue[]): string[] {
  const references: string[] = [];
  for (const value of values) collectReferencesFromValue(value, references);
  return Array.from(new Set(references)).sort();
}

function validateReferences(
  system: FrontierDesignSystem,
  path: string,
  values: readonly JsonValue[],
  issues: FrontierDesignValidationIssue[]
): void {
  for (const reference of referencesInValues(values)) {
    try {
      resolveDesignToken(system, reference);
    } catch (error) {
      issues[issues.length] = {
        severity: 'error',
        code: error instanceof Error && error.message.includes('circular token reference') ? 'circular-reference' : 'missing-reference',
        path,
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

function parseReference(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const match = value.match(EXACT_REFERENCE_PATTERN);
  return match ? normalizePath(match[1] ?? '') : null;
}

function hasReferences(value: string): boolean {
  REFERENCE_PATTERN.lastIndex = 0;
  return REFERENCE_PATTERN.test(value);
}

function replaceReferencesInString(value: string, replace: (reference: string) => string): string {
  REFERENCE_PATTERN.lastIndex = 0;
  return value.replace(REFERENCE_PATTERN, (_match, reference: string) => replace(normalizePath(reference)));
}

function collectReferencesFromValue(value: unknown, out: string[]): void {
  if (typeof value === 'string') {
    const exact = parseReference(value);
    if (exact) {
      out[out.length] = exact;
      return;
    }
    replaceReferencesInString(value, (reference) => {
      out[out.length] = reference;
      return '';
    });
    return;
  }
  if (Array.isArray(value)) {
    for (const child of value) collectReferencesFromValue(child, out);
    return;
  }
  if (isPlainObject(value)) {
    for (const child of Object.values(value)) collectReferencesFromValue(child, out);
  }
}

function resolveJsonValueReferences(
  system: FrontierDesignSystem,
  value: JsonValue,
  options: FrontierDesignResolveOptions,
  stack: string[]
): { value: JsonValue; trace: FrontierDesignResolveTraceStep[] } {
  if (typeof value === 'string') {
    const reference = parseReference(value);
    if (reference) {
      const resolved = resolveDesignTokenInternal(system, reference, options, stack);
      return { value: resolved.value, trace: resolved.trace };
    }
    if (hasReferences(value)) {
      const trace: FrontierDesignResolveTraceStep[] = [];
      const resolvedText = replaceReferencesInString(value, (path) => {
        const resolved = resolveDesignTokenInternal(system, path, options, stack);
        for (const step of resolved.trace) trace[trace.length] = step;
        return formatCssValue(resolved.value);
      });
      return { value: resolvedText, trace };
    }
    return { value, trace: [] };
  }

  if (Array.isArray(value)) {
    const trace: FrontierDesignResolveTraceStep[] = [];
    const next = value.map((child) => {
      const resolved = resolveJsonValueReferences(system, child, options, stack);
      for (const step of resolved.trace) trace[trace.length] = step;
      return resolved.value;
    });
    return { value: next, trace };
  }

  if (isPlainObject(value)) {
    const trace: FrontierDesignResolveTraceStep[] = [];
    const next: JsonObject = {};
    for (const [key, child] of Object.entries(value)) {
      const resolved = resolveJsonValueReferences(system, child, options, stack);
      for (const step of resolved.trace) trace[trace.length] = step;
      next[key] = resolved.value;
    }
    return { value: next, trace };
  }

  return { value, trace: [] };
}

function traceValuesToResolvedReferences(trace: FrontierDesignResolveTraceStep[]): FrontierDesignResolvedValue[] {
  return trace.map((step) => ({
    kind: step.kind,
    path: step.path,
    value: step.value,
    variable: step.variable,
    trace: [step]
  }));
}

function normalizeValueRecord(input: Record<string, unknown>): Record<string, JsonValue> {
  const next: Record<string, JsonValue> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    next[key] = toJsonValue(value, key);
  }
  return sortRecord(next);
}

function readRecord(object: Record<string, unknown>, key: string): Record<string, unknown> | undefined {
  const value = object[key];
  return isPlainObject(value) ? value : undefined;
}

function readDesignKind(object: Record<string, unknown>, fallback: string | undefined): string | undefined {
  if (typeof object.$type === 'string') return object.$type;
  if (typeof object.kind === 'string') return object.kind;
  if (typeof object.type === 'string') return object.type;
  return fallback;
}

function readExtensionModeValues(object: Record<string, unknown>): Record<string, unknown> {
  const modes: Record<string, unknown> = {};
  const extensions = readRecord(object, '$extensions');
  if (!extensions) return modes;

  for (const key of ['frontier.modes', 'org.frontier.modes', 'org.primer.overrides']) {
    const overrides = readRecord(extensions, key);
    if (!overrides) continue;
    for (const [mode, override] of Object.entries(overrides)) {
      if (override === undefined) continue;
      modes[mode] = readOverrideValue(override);
    }
  }

  return modes;
}

function readOverrideValue(value: unknown): unknown {
  if (!isPlainObject(value)) return value;
  if (value.$value !== undefined) return value.$value;
  if (value.value !== undefined) return value.value;
  if (value.default !== undefined) return value.default;
  return value;
}

function normalizeDeprecated(value: unknown): boolean | string | undefined {
  return typeof value === 'boolean' || typeof value === 'string' ? value : undefined;
}

function normalizeLeafMetadata(
  object: Record<string, unknown>,
  knownKeys: Set<string>,
  path: string
): JsonObject | undefined {
  const metadata: JsonObject = {};
  if (object.metadata !== undefined) Object.assign(metadata, toJsonObject(object.metadata, path));
  if (object.$extensions !== undefined) metadata.$extensions = toJsonValue(object.$extensions, path + '.$extensions');
  for (const [key, value] of Object.entries(object)) {
    if (value === undefined || knownKeys.has(key)) continue;
    metadata[key] = toJsonValue(value, path + '.' + key);
  }
  return Object.keys(metadata).length === 0 ? undefined : metadata;
}

function isTokenLeaf(value: unknown): boolean {
  if (!isPlainObject(value)) return true;
  for (const key of TOKEN_VALUE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(value, key)) return true;
  }
  if (Object.prototype.hasOwnProperty.call(value, 'default')) {
    for (const key of TOKEN_METADATA_KEYS) {
      if (Object.prototype.hasOwnProperty.call(value, key)) return true;
    }
  }
  let hasMetadataOnlyLeaf = false;
  for (const [key, child] of Object.entries(value)) {
    if (child === undefined) continue;
    if (TOKEN_METADATA_KEYS.has(key)) {
      hasMetadataOnlyLeaf = true;
      continue;
    }
    return false;
  }
  return hasMetadataOnlyLeaf;
}

function normalizeTokenPath(path: string): string {
  return normalizePath(path);
}

function normalizeRolePath(path: string): string {
  return normalizePath(path).replace(/^role\./, '');
}

function normalizePath(path: string): string {
  return String(path).trim().replace(/^\{|\}$/g, '').replace(/\//g, '.').replace(/\.+/g, '.').replace(/^\.|\.$/g, '');
}

function sanitizePath(path: string): string {
  return normalizePath(path).split('.').map(sanitizeIdentifier).join('-');
}

function sanitizeIdentifier(value: string): string {
  const sanitized = String(value).trim().replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
  return sanitized || 'x';
}

function escapeCssAttribute(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function toJsonObject(value: unknown, path: string): JsonObject {
  const json = toJsonValue(value, path);
  if (!isPlainObject(json)) throw new TypeError('frontier-design expected object at ' + path);
  return json;
}

function toJsonValue(value: unknown, path: string): JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.map((item, index) => toJsonValue(item, path + '[' + index + ']'));
  if (isPlainObject(value)) {
    const object: JsonObject = {};
    for (const [key, child] of Object.entries(value)) {
      if (child === undefined) continue;
      object[key] = toJsonValue(child, path + '.' + key);
    }
    return object;
  }
  throw new TypeError('frontier-design values must be JSON-serializable at ' + path);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function sortRecord<T>(record: Record<string, T>): Record<string, T> {
  const next: Record<string, T> = {};
  for (const key of Object.keys(record).sort()) next[key] = record[key];
  return next;
}
