import type { StandardJSONSchemaV1, StandardSchemaV1 } from "@standard-schema/spec";

export type JsonSchemaTarget = StandardJSONSchemaV1.Target;
export type JsonPointer = string;
export type JsonPointerSegment = string;
export type FlatFields = Record<JsonPointer, unknown>;

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
export type FailureResult = StandardSchemaV1.FailureResult;
export type IssuePath = StandardSchemaV1.Issue["path"];

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
  readonly pointer: JsonPointer;
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
}

export interface ValidationFailure {
  readonly success: false;
  readonly error: FailureResult;
}

export type ValidationResult<TOutput> = ValidationSuccess<TOutput> | ValidationFailure;

export interface JsonSchemaOptions {
  readonly target?: JsonSchemaTarget;
  readonly libraryOptions?: Record<string, unknown>;
}

export interface ValidationOptions {
  readonly libraryOptions?: Record<string, unknown>;
}

export type ValidationEvent = "blur" | "change" | "submit";
export type FormStatus = "idle" | "submitting" | "validating";

export interface CreateFormControllerOptions<TSchema extends UniformaSchema> {
  readonly schema: TSchema;
  readonly initialValue?: InferInput<TSchema>;
  readonly jsonSchemaTarget?: JsonSchemaTarget;
  readonly validateOn?: ValidationEvent | readonly ValidationEvent[];
  readonly libraryOptions?: Record<string, unknown>;
}

export interface FormController<TSchema extends UniformaSchema> {
  readonly schema: TSchema;
  readonly jsonSchema: JSONSchema;
  readonly normalizedSchema: NormalizedSchemaNode;
  readonly initialValue: InferInput<TSchema> | undefined;
  readonly initialFields: FlatFields;
  readonly validateOn: readonly ValidationEvent[];
  flatten: (value: unknown) => FlatFields;
  inflate: (fields: FlatFields) => InferInput<TSchema>;
  validate: (fields: FlatFields) => Promise<ValidationResult<InferOutput<TSchema>>>;
  shouldValidate: (event: ValidationEvent) => boolean;
}
