import type { StandardJSONSchemaV1 } from "@standard-schema/spec";

import { appendJsonPointer } from "./paths.ts";
import { cloneValue } from "./values.ts";
import type {
  JsonSchemaOptions,
  JsonPointer,
  JSONSchema,
  NormalizedSchema,
  SchemaKind,
} from "./types.ts";

const DEFAULT_TARGET: StandardJSONSchemaV1.Target = "draft-2020-12";

export function getInputJsonSchema<TSchema extends StandardJSONSchemaV1>(
  schema: TSchema,
  options: JsonSchemaOptions = {},
): JSONSchema {
  return schema["~standard"].jsonSchema.input({
    target: options.target ?? DEFAULT_TARGET,
    libraryOptions: options.libraryOptions,
  }) as JSONSchema;
}

export function normalizeJsonSchema(
  schema: JSONSchema,
  pointer: JsonPointer = "",
): NormalizedSchema {
  const kind = resolveSchemaKind(schema);
  const node = { ...schema, pointer } as NormalizedSchema;

  if (kind === "object") {
    const properties: Record<string, NormalizedSchema> = {};
    for (const [key, value] of Object.entries(schema.properties ?? {})) {
      properties[key] = normalizeJsonSchema(value as JSONSchema, appendJsonPointer(pointer, key));
    }
    node.properties = properties;
  }

  if (kind === "array") {
    const itemSchema = Array.isArray(schema.items) ? schema.items[0] : schema.items;
    if (itemSchema) {
      node.items = normalizeJsonSchema(itemSchema as JSONSchema, appendJsonPointer(pointer, 0));
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
        const propertyValue = getDefaultValue(propertySchema as JSONSchema);
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

export function resolveSchemaKind(schema: JSONSchema): SchemaKind {
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
      return resolvedType as SchemaKind;
    default:
      return schema.properties ? "object" : schema.items ? "array" : "unsupported";
  }
}

export function getEnumValues(schema: JSONSchema): readonly unknown[] | undefined {
  return schema.enum ?? (schema.const === undefined ? undefined : [schema.const]);
}

export function getArrayItemSchema(schema: NormalizedSchema): NormalizedSchema | undefined {
  if (!schema.items) {
    return undefined;
  }

  return (Array.isArray(schema.items) ? schema.items[0] : schema.items) as NormalizedSchema;
}
