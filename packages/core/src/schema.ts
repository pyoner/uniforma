import type { StandardJSONSchemaV1, StandardSchemaV1 } from "@standard-schema/spec";

import { cloneValue } from "./values.ts";
import type {
  InferOutput,
  JsonSchemaOptions,
  JsonSchemaTarget,
  JSONSchema,
  MutableNormalizedNode,
  NormalizedSchemaNode,
  ValidationOptions,
  ValidationResult,
} from "./types.ts";

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
    return {
      success: false,
      error: result,
    };
  }

  return {
    success: true,
    value: result.value as InferOutput<TSchema>,
  };
}

export function normalizeJsonSchema(
  schema: JSONSchema,
  path: NormalizedSchemaNode["path"] = [],
): NormalizedSchemaNode {
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
    const properties: Record<string, NormalizedSchemaNode> = {};
    for (const [key, value] of Object.entries(schema.properties ?? {})) {
      properties[key] = normalizeJsonSchema(value, [...path, key]);
    }
    node.properties = properties;
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

  switch (resolveSchemaKind(schema)) {
    case "object": {
      const result: Record<string, unknown> = {};
      for (const [key, propertySchema] of Object.entries(schema.properties ?? {})) {
        const propertyValue = getDefaultValue(propertySchema);
        if (propertyValue !== undefined) {
          result[key] = propertyValue;
        }
      }
      return result;
    }
    case "array":
      return [];
    case "boolean":
      return false;
    case "null":
      return null;
    default:
      return undefined;
  }
}

function resolveSchemaKind(schema: JSONSchema): NormalizedSchemaNode["kind"] {
  if (schema.const !== undefined || (schema.enum?.length ?? 0) > 0) {
    return "enum";
  }

  const resolvedType = Array.isArray(schema.type)
    ? (schema.type.find((candidate) => candidate !== "null") ?? schema.type[0])
    : schema.type;

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
