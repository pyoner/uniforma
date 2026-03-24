import type { StandardJSONSchemaV1, StandardSchemaV1 } from "@standard-schema/spec";

export type JsonSchemaTarget = StandardJSONSchemaV1.Target;
export type PathKey = string | number;
export type FormPath = readonly PathKey[];

export interface JSONSchema {
  readonly type?: string | readonly string[];
  readonly title?: string;
  readonly description?: string;
  readonly default?: unknown;
  readonly enum?: readonly unknown[];
  readonly const?: unknown;
  readonly format?: string;
  readonly properties?: Record<string, JSONSchema>;
  readonly required?: readonly string[];
  readonly items?: JSONSchema | readonly JSONSchema[];
  readonly minItems?: number;
  readonly anyOf?: readonly JSONSchema[];
  readonly oneOf?: readonly JSONSchema[];
  readonly allOf?: readonly JSONSchema[];
  readonly [key: string]: unknown;
}

export type UniformaSchema<Input = unknown, Output = Input> = StandardSchemaV1<Input, Output> &
  StandardJSONSchemaV1<Input, Output>;

export type InferInput<TSchema extends StandardSchemaV1> = StandardSchemaV1.InferInput<TSchema>;
export type InferOutput<TSchema extends StandardSchemaV1> = StandardSchemaV1.InferOutput<TSchema>;

export interface UniformaIssue {
  readonly message: string;
  readonly path: FormPath;
  readonly raw: StandardSchemaV1.Issue;
}

export interface UniformaErrorTree {
  readonly _errors?: readonly string[] | undefined;
  readonly children?: Readonly<Record<string, UniformaErrorTree>> | undefined;
}

export type SchemaKind =
  | "array"
  | "boolean"
  | "enum"
  | "integer"
  | "null"
  | "number"
  | "object"
  | "string"
  | "unsupported";

export interface NormalizedSchemaNode {
  readonly kind: SchemaKind;
  readonly path: FormPath;
  readonly key?: PathKey | undefined;
  readonly title?: string | undefined;
  readonly description?: string | undefined;
  readonly format?: string | undefined;
  readonly defaultValue?: unknown;
  readonly enumValues?: readonly unknown[] | undefined;
  readonly required?: readonly string[] | undefined;
  readonly properties?: Readonly<Record<string, NormalizedSchemaNode>> | undefined;
  readonly item?: NormalizedSchemaNode | undefined;
  readonly raw: JSONSchema;
}

export interface ValidationSuccess<TOutput> {
  readonly success: true;
  readonly value: TOutput;
  readonly issues: readonly [];
  readonly errorTree: null;
}

export interface ValidationFailure {
  readonly success: false;
  readonly value?: undefined;
  readonly issues: readonly UniformaIssue[];
  readonly errorTree: UniformaErrorTree;
}

export type ValidationResult<TOutput> = ValidationSuccess<TOutput> | ValidationFailure;

export interface JsonSchemaOptions {
  readonly target?: JsonSchemaTarget;
  readonly libraryOptions?: Record<string, unknown>;
}

export interface ValidationOptions {
  readonly libraryOptions?: Record<string, unknown>;
}

const DEFAULT_TARGET: JsonSchemaTarget = "draft-2020-12";

export function getInputJsonSchema<TSchema extends StandardJSONSchemaV1>(
  schema: TSchema,
  options: JsonSchemaOptions = {},
): JSONSchema {
  return schema["~standard"].jsonSchema.input({
    target: options.target ?? DEFAULT_TARGET,
    libraryOptions: options.libraryOptions,
  }) as JSONSchema;
}

export function getOutputJsonSchema<TSchema extends StandardJSONSchemaV1>(
  schema: TSchema,
  options: JsonSchemaOptions = {},
): JSONSchema {
  return schema["~standard"].jsonSchema.output({
    target: options.target ?? DEFAULT_TARGET,
    libraryOptions: options.libraryOptions,
  }) as JSONSchema;
}

export async function validateSchema<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  value: unknown,
  options: ValidationOptions = {},
): Promise<ValidationResult<InferOutput<TSchema>>> {
  const result = await schema["~standard"].validate(value, {
    libraryOptions: options.libraryOptions,
  });

  if (result.issues) {
    const issues = normalizeIssues(result.issues);
    return {
      success: false,
      issues,
      errorTree: issuesToErrorTree(issues),
    };
  }

  return {
    success: true,
    value: result.value as InferOutput<TSchema>,
    issues: [],
    errorTree: null,
  };
}

export function normalizeIssues(
  issues: readonly StandardSchemaV1.Issue[],
): readonly UniformaIssue[] {
  return issues.map((issue) => ({
    message: issue.message,
    path: normalizeIssuePath(issue.path),
    raw: issue,
  }));
}

export function issuesToErrorTree(issues: readonly UniformaIssue[]): UniformaErrorTree {
  const root: MutableErrorTree = {};

  for (const issue of issues) {
    let cursor = root;

    for (const segment of issue.path) {
      const key = String(segment);
      cursor.children ??= {};
      cursor.children[key] ??= {};
      cursor = cursor.children[key]!;
    }

    cursor._errors ??= [];
    cursor._errors.push(issue.message);
  }

  return freezeErrorTree(root);
}

export function getErrorsAtPath(
  errorTree: UniformaErrorTree | null | undefined,
  path: FormPath,
): readonly string[] {
  const node = getErrorTreeAtPath(errorTree, path);
  return node?._errors ?? [];
}

export function getErrorTreeAtPath(
  errorTree: UniformaErrorTree | null | undefined,
  path: FormPath,
): UniformaErrorTree | null {
  if (!errorTree) {
    return null;
  }

  let cursor: UniformaErrorTree | undefined = errorTree;

  for (const segment of path) {
    cursor = cursor.children?.[String(segment)];
    if (!cursor) {
      return null;
    }
  }

  return cursor;
}

export function hasErrors(errorTree: UniformaErrorTree | null | undefined): boolean {
  if (!errorTree) {
    return false;
  }

  if ((errorTree._errors?.length ?? 0) > 0) {
    return true;
  }

  if (!errorTree.children) {
    return false;
  }

  return Object.values(errorTree.children).some((child) => hasErrors(child));
}

export function normalizeJsonSchema(schema: JSONSchema, path: FormPath = []): NormalizedSchemaNode {
  const kind = resolveSchemaKind(schema);
  const node: MutableNormalizedNode = {
    kind,
    path,
    title: schema.title,
    description: schema.description,
    format: schema.format,
    defaultValue: schema.default,
    raw: schema,
  };

  if (kind === "enum") {
    node.enumValues = schema.enum ?? (schema.const === undefined ? undefined : [schema.const]);
  }

  if (kind === "object") {
    node.required = schema.required;
    const properties = schema.properties ?? {};
    const normalizedProperties: Record<string, NormalizedSchemaNode> = {};
    for (const [key, value] of Object.entries(properties)) {
      normalizedProperties[key] = normalizeJsonSchema(value, [...path, key]);
    }
    node.properties = normalizedProperties;
  }

  if (kind === "array") {
    const itemSchema = Array.isArray(schema.items) ? schema.items[0] : schema.items;
    if (itemSchema) {
      node.item = normalizeJsonSchema(itemSchema, [...path, 0]);
    }
  }

  return node;
}

export function getDefaultValue(schema: JSONSchema): unknown {
  if (schema.default !== undefined) {
    return cloneValue(schema.default);
  }

  const kind = resolveSchemaKind(schema);

  if (kind === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, propertySchema] of Object.entries(schema.properties ?? {})) {
      const propertyValue = getDefaultValue(propertySchema);
      if (propertyValue !== undefined) {
        result[key] = propertyValue;
      }
    }
    return result;
  }

  if (kind === "array") {
    return [];
  }

  if (kind === "boolean") {
    return false;
  }

  if (kind === "null") {
    return null;
  }

  return undefined;
}

export function normalizeFormValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeFormValue(item)) as T;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(([key, entryValue]) => [key, normalizeFormValue(entryValue)]);
    return Object.fromEntries(entries) as T;
  }

  return value;
}

export function getAtPath(value: unknown, path: FormPath): unknown {
  let cursor = value;

  for (const segment of path) {
    if (cursor == null || typeof cursor !== "object") {
      return undefined;
    }

    cursor = (cursor as Record<string, unknown>)[String(segment)];
  }

  return cursor;
}

export function setAtPath<T>(value: T, path: FormPath, nextValue: unknown): T {
  if (path.length === 0) {
    return nextValue as T;
  }

  const [head, ...tail] = path;
  const key = typeof head === "number" ? head : String(head);

  if (Array.isArray(value)) {
    const clone = [...value];
    clone[key as number] = setAtPath(clone[key as number], tail, nextValue);
    return clone as T;
  }

  const base = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    ...base,
    [key]: setAtPath(base[key], tail, nextValue),
  } as T;
}

export function pathToKey(path: FormPath): string {
  return path.map(String).join(".");
}

function normalizeIssuePath(path: StandardSchemaV1.Issue["path"]): FormPath {
  if (!path) {
    return [];
  }

  return path.map((segment) =>
    typeof segment === "object" && segment !== null && "key" in segment
      ? (segment.key as PathKey)
      : (segment as PathKey),
  );
}

function resolveSchemaKind(schema: JSONSchema): SchemaKind {
  if (schema.const !== undefined || (schema.enum?.length ?? 0) > 0) {
    return "enum";
  }

  const type = schema.type;
  const resolvedType = Array.isArray(type)
    ? (type.find((candidate) => candidate !== "null") ?? type[0])
    : type;

  switch (resolvedType) {
    case "array":
    case "boolean":
    case "integer":
    case "null":
    case "number":
    case "object":
    case "string":
      return resolvedType;
    default:
      return schema.properties ? "object" : schema.items ? "array" : "unsupported";
  }
}

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function freezeErrorTree(node: MutableErrorTree): UniformaErrorTree {
  const children = node.children
    ? Object.fromEntries(
        Object.entries(node.children).map(([key, child]) => [key, freezeErrorTree(child)]),
      )
    : undefined;

  return {
    _errors: node._errors,
    children,
  };
}

interface MutableErrorTree {
  _errors?: string[];
  children?: Record<string, MutableErrorTree>;
}

type MutableNormalizedNode = {
  -readonly [Key in keyof NormalizedSchemaNode]: NormalizedSchemaNode[Key];
};
