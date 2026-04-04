import type { StandardJSONSchemaV1, StandardSchemaV1 } from "@standard-schema/spec";
import type { JSONSchema as Draft07JSONSchema } from "json-schema-typed/draft-07";
import type { JSONSchema as Draft202012JSONSchema } from "json-schema-typed/draft-2020-12";

export type JsonPointer = string;
export type JsonPointerSegment = string;
export type FlatFields = Record<JsonPointer, unknown>;

export type JSONSchema = Exclude<Draft07JSONSchema | Draft202012JSONSchema, boolean>;

export type UniformaSchema<Input = unknown, Output = Input> = StandardSchemaV1<Input, Output> &
  StandardJSONSchemaV1<Input, Output>;

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

export type NormalizedSchema = JSONSchema & {
  pointer: JsonPointer;
  properties?: Record<string, NormalizedSchema>;
  items?: NormalizedSchema | readonly NormalizedSchema[];
};

export interface JsonSchemaOptions {
  readonly target?: StandardJSONSchemaV1.Target;
  readonly libraryOptions?: Record<string, unknown>;
}

export interface ValidationOptions {
  readonly libraryOptions?: Record<string, unknown>;
}

export type ValidationEvent = "blur" | "change" | "submit";
export type FormStatus = "idle" | "submitting" | "validating";

export interface CreateFormControllerOptions<TSchema extends UniformaSchema> {
  readonly schema: TSchema;
  readonly initialValue?: StandardSchemaV1.InferInput<TSchema>;
  readonly jsonSchemaTarget?: StandardJSONSchemaV1.Target;
  readonly validateOn?: ValidationEvent | readonly ValidationEvent[];
  readonly libraryOptions?: Record<string, unknown>;
}

export interface FormController<TSchema extends UniformaSchema> {
  readonly schema: TSchema;
  readonly jsonSchema: JSONSchema;
  readonly normalizedSchema: NormalizedSchema;
  readonly initialValue: StandardSchemaV1.InferInput<TSchema> | undefined;
  readonly initialFields: FlatFields;
  readonly validateOn: readonly ValidationEvent[];
  flatten: (value: unknown) => FlatFields;
  inflate: (fields: FlatFields) => StandardSchemaV1.InferInput<TSchema>;
  validate: (
    fields: FlatFields,
  ) => Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>;
  shouldValidate: (event: ValidationEvent) => boolean;
}
