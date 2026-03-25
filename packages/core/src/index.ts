import type { StandardJSONSchemaV1, StandardSchemaV1 } from "@standard-schema/spec";
import { deepMap } from "@nanostores/deepmap";
import { atom, computed, type Store } from "nanostores";

export type JsonSchemaTarget = StandardJSONSchemaV1.Target;
export type PathKey = string | number;
export type FormPath = readonly PathKey[];
export type DeepPath = string;
export type PathInput = DeepPath | FormPath;

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

export type ValidationMode = "blur" | "change" | "submit";

export interface CreateFormStoreOptions<TSchema extends UniformaSchema> {
  readonly schema: TSchema;
  readonly initialValue?: InferInput<TSchema>;
  readonly jsonSchemaTarget?: JsonSchemaTarget;
  readonly validateOn?: ValidationMode | readonly ValidationMode[];
  readonly libraryOptions?: Record<string, unknown>;
}

export interface FormFieldStore {
  readonly path: DeepPath;
  readonly $value: Store<unknown>;
  readonly $errors: Store<readonly string[]>;
  readonly $touched: Store<boolean>;
  set: (value: unknown) => Promise<void>;
  blur: () => Promise<void>;
}

export interface SubmitSuccess<TSchema extends UniformaSchema> {
  readonly success: true;
  readonly value: InferOutput<TSchema>;
}

export interface SubmitFailure {
  readonly success: false;
  readonly errors: UniformaErrorTree;
}

export type SubmitResult<TSchema extends UniformaSchema> = SubmitSuccess<TSchema> | SubmitFailure;

export interface FormStore<TSchema extends UniformaSchema> {
  readonly schema: TSchema;
  readonly jsonSchema: JSONSchema;
  readonly normalizedSchema: NormalizedSchemaNode;
  readonly $value: Store<InferInput<TSchema>>;
  readonly $errors: Store<UniformaErrorTree | null>;
  readonly $touched: Store<Record<string, unknown>>;
  readonly $validating: Store<boolean>;
  readonly $submitting: Store<boolean>;
  readonly $valid: Store<boolean>;
  readonly $dirty: Store<boolean>;
  getValue: () => InferInput<TSchema>;
  getPathValue: (path: DeepPath) => unknown;
  setValue: (value: InferInput<TSchema>) => Promise<void>;
  setPathValue: (path: DeepPath, value: unknown) => Promise<void>;
  touch: (path: DeepPath) => Promise<void>;
  field: (path: DeepPath) => FormFieldStore;
  validate: () => Promise<ValidationResult<InferOutput<TSchema>>>;
  submit: () => Promise<SubmitResult<TSchema>>;
  reset: (value?: InferInput<TSchema>) => void;
}

type InternalValueStore<T> = Store<T> & {
  set: (value: T) => void;
  setKey?: ((path: string, value: unknown) => void) | undefined;
};

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
  path: PathInput,
): readonly string[] {
  const node = getErrorTreeAtPath(errorTree, path);
  return node?._errors ?? [];
}

export function getErrorTreeAtPath(
  errorTree: UniformaErrorTree | null | undefined,
  path: PathInput,
): UniformaErrorTree | null {
  if (!errorTree) {
    return null;
  }

  let cursor: UniformaErrorTree | undefined = errorTree;

  for (const segment of pathToSegments(path)) {
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

export function getAtPath(value: unknown, path: PathInput): unknown {
  for (const segment of pathToSegments(path)) {
    if (value == null || typeof value !== "object") {
      return undefined;
    }

    value = (value as Record<string, unknown>)[String(segment)];
  }

  return value;
}

export function setAtPath<T>(value: T, path: PathInput, nextValue: unknown): T {
  const segments = pathToSegments(path);
  if (segments.length === 0) {
    return nextValue as T;
  }

  return setAtPathSegments(value, segments, nextValue);
}

export function pathToKey(path: PathInput): DeepPath {
  return typeof path === "string" ? path : segmentsToPath(path);
}

export function joinPath(base: DeepPath, segment: PathKey): DeepPath {
  if (typeof segment === "number") {
    return `${base}[${segment}]`;
  }

  return base ? `${base}.${segment}` : segment;
}

export function pathToSegments(path: PathInput): FormPath {
  if (Array.isArray(path)) {
    return path;
  }

  if (path === "") {
    return [];
  }

  return parseDeepPath(path as DeepPath);
}

export function normalizePath(path: PathInput): DeepPath {
  return pathToKey(path);
}

function getAtPathInternal(value: unknown, path: PathInput): unknown {
  let cursor = value;

  for (const segment of pathToSegments(path)) {
    if (cursor == null || typeof cursor !== "object") {
      return undefined;
    }

    cursor = (cursor as Record<string, unknown>)[String(segment)];
  }

  return cursor;
}

export function createFormStore<TSchema extends UniformaSchema>(
  options: CreateFormStoreOptions<TSchema>,
): FormStore<TSchema> {
  const validateOn = normalizeValidationModes(options.validateOn);
  const jsonSchemaOptions: JsonSchemaOptions = {
    ...(options.jsonSchemaTarget !== undefined ? { target: options.jsonSchemaTarget } : {}),
    ...(options.libraryOptions !== undefined ? { libraryOptions: options.libraryOptions } : {}),
  };
  const jsonSchema = getInputJsonSchema(options.schema, jsonSchemaOptions);
  const normalizedSchema = normalizeJsonSchema(jsonSchema);
  const baseValue = (options.initialValue ??
    getDefaultValue(jsonSchema) ??
    {}) as InferInput<TSchema>;
  const initialValue = cloneValue(normalizeFormValue(baseValue));

  const valueStore = createValueStore(initialValue);
  const errorsStore = atom<UniformaErrorTree | null>(null);
  const touchedStore = deepMap<Record<string, unknown>>({});
  const validatingStore = atom(false);
  const submittingStore = atom(false);
  const validStore = computed(errorsStore, (errors) => !hasErrors(errors));
  const dirtyStore = computed(
    valueStore as Store<InferInput<TSchema>>,
    (value) => serializeValue(value) !== serializeValue(initialValue),
  );
  const fieldStores = new Map<DeepPath, FormFieldStore>();

  async function runValidation() {
    validatingStore.set(true);
    const validationOptions: ValidationOptions =
      options.libraryOptions !== undefined ? { libraryOptions: options.libraryOptions } : {};
    const result = await validateSchema(
      options.schema,
      normalizeFormValue(getCurrentValue()),
      validationOptions,
    );
    validatingStore.set(false);

    errorsStore.set(result.success ? null : result.errorTree);
    return result;
  }

  async function setValue(nextValue: InferInput<TSchema>) {
    setCurrentValue(normalizeFormValue(nextValue));
    if (validateOn.has("change")) {
      await runValidation();
    }
  }

  async function setPathValue(path: DeepPath, nextValue: unknown) {
    if (path === "") {
      setCurrentValue(nextValue as InferInput<TSchema>);
    } else if (isDeepValueStore(valueStore)) {
      valueStore.setKey(path, nextValue);
    } else {
      valueStore.set(setAtPath(valueStore.get(), path, nextValue) as InferInput<TSchema>);
    }

    if (validateOn.has("change")) {
      await runValidation();
    }
  }

  async function touch(path: DeepPath) {
    touchedStore.setKey(touchedPath(path) as never, true as never);

    if (validateOn.has("blur")) {
      await runValidation();
    }
  }

  function field(path: DeepPath): FormFieldStore {
    const normalizedPath = pathToKey(path);
    const existing = fieldStores.get(normalizedPath);
    if (existing) {
      return existing;
    }

    const fieldStore: FormFieldStore = {
      path: normalizedPath,
      $value: computed(valueStore as Store<InferInput<TSchema>>, (value) =>
        getAtPathInternal(value, normalizedPath),
      ),
      $errors: computed(errorsStore, (errors) => getErrorsAtPath(errors, normalizedPath)),
      $touched: computed(touchedStore, (touched) =>
        Boolean(getAtPathInternal(touched, touchedPath(normalizedPath))),
      ),
      set(nextValue) {
        return setPathValue(normalizedPath, nextValue);
      },
      blur() {
        return touch(normalizedPath);
      },
    };

    fieldStores.set(normalizedPath, fieldStore);
    return fieldStore;
  }

  async function submit(): Promise<SubmitResult<TSchema>> {
    submittingStore.set(true);
    const result = await runValidation();
    submittingStore.set(false);

    if (!result.success) {
      return {
        success: false,
        errors: result.errorTree,
      };
    }

    setCurrentValue(result.value as InferInput<TSchema>);
    return {
      success: true,
      value: result.value,
    };
  }

  function reset(nextValue = initialValue) {
    setCurrentValue(normalizeFormValue(nextValue));
    errorsStore.set(null);
    touchedStore.set({});
  }

  function getCurrentValue() {
    return valueStore.get() as InferInput<TSchema>;
  }

  function setCurrentValue(nextValue: InferInput<TSchema>) {
    valueStore.set(cloneValue(nextValue) as InferInput<TSchema>);
  }

  return {
    schema: options.schema,
    jsonSchema,
    normalizedSchema,
    $value: valueStore as Store<InferInput<TSchema>>,
    $errors: errorsStore,
    $touched: touchedStore,
    $validating: validatingStore,
    $submitting: submittingStore,
    $valid: validStore,
    $dirty: dirtyStore,
    getValue: getCurrentValue,
    getPathValue(path) {
      return getAtPathInternal(getCurrentValue(), path);
    },
    setValue,
    setPathValue,
    touch,
    field,
    validate: runValidation,
    submit,
    reset,
  };
}

function setAtPathSegments<T>(value: T, path: FormPath, nextValue: unknown): T {
  const [head, ...tail] = path;
  const key = typeof head === "number" ? head : String(head);

  if (Array.isArray(value)) {
    const clone = [...value];
    clone[key as number] = setAtPathSegments(clone[key as number], tail, nextValue);
    return clone as T;
  }

  const base = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    ...base,
    [key]: tail.length === 0 ? nextValue : setAtPathSegments(base[key], tail, nextValue),
  } as T;
}

function createValueStore<T>(initialValue: T): InternalValueStore<T> {
  return isDeepMapValue(initialValue)
    ? (deepMap(
        cloneValue(initialValue) as Record<string, unknown> | unknown[],
      ) as unknown as InternalValueStore<T>)
    : (atom(cloneValue(initialValue)) as InternalValueStore<T>);
}

function isDeepMapValue(value: unknown): value is Record<string, unknown> | unknown[] {
  return Array.isArray(value) || (!!value && typeof value === "object");
}

function isDeepValueStore<T>(
  store: InternalValueStore<T>,
): store is InternalValueStore<T> & { setKey: (path: string, value: unknown) => void } {
  return typeof store.setKey === "function";
}

function normalizeValidationModes(
  value: CreateFormStoreOptions<UniformaSchema>["validateOn"],
): Set<ValidationMode> {
  if (!value) {
    return new Set(["submit"]);
  }

  return new Set(Array.isArray(value) ? value : [value]);
}

function touchedPath(path: DeepPath): DeepPath {
  return path === "" ? "$" : path;
}

function segmentsToPath(path: FormPath): DeepPath {
  return path.reduce<DeepPath>((result, segment) => joinPath(result, segment), "");
}

function parseDeepPath(path: DeepPath): FormPath {
  const segments: PathKey[] = [];
  let current = "";

  for (let index = 0; index < path.length; index += 1) {
    const char = path[index];

    if (char === ".") {
      if (current) {
        segments.push(current);
        current = "";
      }
      continue;
    }

    if (char === "[") {
      if (current) {
        segments.push(current);
        current = "";
      }

      const closing = path.indexOf("]", index);
      const token = path.slice(index + 1, closing);
      segments.push(/^\d+$/.test(token) ? Number(token) : token);
      index = closing;
      continue;
    }

    current += char;
  }

  if (current) {
    segments.push(current);
  }

  return segments;
}

function serializeValue(value: unknown): string {
  return JSON.stringify(cloneValue(value));
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
