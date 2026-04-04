import pointer from "json-pointer";
import type { JSONSchema as Draft07JSONSchema } from "json-schema-typed/draft-07";
import type { JSONSchema as Draft202012JSONSchema } from "json-schema-typed/draft-2020-12";
import type { StandardSchemaV1, StandardJSONSchemaV1 } from "@standard-schema/spec";

const DEFAULT_TARGET = "draft-2020-12";

export type JsonSchemaTarget = "draft-07" | "draft-2020-12";
export type UniformaJSONSchema = Exclude<Draft07JSONSchema | Draft202012JSONSchema, boolean>;
export type UniformaSchema<Input = unknown, Output = Input> = StandardSchemaV1<Input, Output> &
  StandardJSONSchemaV1<Input, Output>;

export interface JsonSchemaOptions {
  readonly target?: JsonSchemaTarget;
  readonly libraryOptions?: Record<string, unknown>;
}

export interface ValidationOptions {
  readonly libraryOptions?: Record<string, unknown>;
}

export interface ValidationSuccess<TOutput> {
  readonly success: true;
  readonly value: TOutput;
}

export interface ValidationFailure {
  readonly success: false;
  readonly error: StandardSchemaV1.FailureResult;
}

export type ValidationResult<TOutput> = ValidationSuccess<TOutput> | ValidationFailure;

export function issuePathToSegments(
  path: StandardSchemaV1.Issue["path"] | null | undefined,
): string[] {
  if (!path) {
    return [];
  }

  return path.map((segment) => {
    const key =
      typeof segment === "object" && segment !== null && "key" in segment ? segment.key : segment;

    return String(key);
  });
}

export function issuePathToJsonPointer(
  path: StandardSchemaV1.Issue["path"] | null | undefined,
): string {
  return pointer.compile(issuePathToSegments(path));
}

export class Uniforma<Input = unknown, Output = Input> {
  readonly standardSchema: StandardSchemaV1<Input, Output>;
  readonly standardJSONSchema: StandardJSONSchemaV1<Input, Output>;

  constructor(schema: UniformaSchema<Input, Output>);
  constructor(
    standardSchema: StandardSchemaV1<Input, Output>,
    standardJSONSchema: StandardJSONSchemaV1<Input, Output>,
  );
  constructor(
    standardSchema: UniformaSchema<Input, Output> | StandardSchemaV1<Input, Output>,
    standardJSONSchema?: StandardJSONSchemaV1<Input, Output>,
  ) {
    this.standardSchema = standardSchema;
    this.standardJSONSchema =
      standardJSONSchema ?? (standardSchema as UniformaSchema<Input, Output>);
  }

  getJSONSchema(options: JsonSchemaOptions = {}): UniformaJSONSchema {
    return this.standardJSONSchema["~standard"].jsonSchema.input({
      target: options.target ?? DEFAULT_TARGET,
      libraryOptions: options.libraryOptions,
    }) as UniformaJSONSchema;
  }

  validate(data: unknown, options: ValidationOptions = {}): Promise<ValidationResult<Output>> {
    return normalizeValidationResult(this.standardSchema, data, options);
  }
}

async function normalizeValidationResult<Input, Output>(
  schema: StandardSchemaV1<Input, Output>,
  data: unknown,
  options: ValidationOptions,
): Promise<ValidationResult<Output>> {
  const result = await schema["~standard"].validate(data, {
    libraryOptions: options.libraryOptions,
  });

  if (result.issues) {
    return {
      success: false,
      error: result,
    };
  }

  return {
    success: true,
    value: result.value as Output,
  };
}
