import type { Store } from "nanostores";
import type { StandardJSONSchemaV1, StandardSchemaV1 } from "@standard-schema/spec";

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

export interface MutableErrorTree {
  _errors?: string[];
  children?: Record<string, MutableErrorTree>;
}

export type MutableNormalizedNode = {
  -readonly [Key in keyof NormalizedSchemaNode]: NormalizedSchemaNode[Key];
};

export type InternalValueStore<T> = Store<T> & {
  set: (value: T) => void;
  setKey?: ((path: string, value: unknown) => void) | undefined;
};
