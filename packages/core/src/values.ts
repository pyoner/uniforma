import pointer from "json-pointer";

import { appendJsonPointer, isJsonPointerDescendant, unescapeJsonPointerToken } from "./paths.ts";
import { getArrayItemSchema, getEnumValues, resolveSchemaKind } from "./schema.ts";
import type { FlatFields, JsonPointer, NormalizedSchema } from "./types.ts";

export function normalizeFormValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeFormValue(item)) as T;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(([key, entryValue]) => [key, normalizeFormValue(entryValue)]);
    return Object.fromEntries(entries) as T;
  }

  return value;
}

export function getValueAtPointer(value: unknown, path: JsonPointer): unknown {
  if (path === "") {
    return value;
  }

  if (value == null || typeof value !== "object") {
    return undefined;
  }

  return pointer.get(value as Record<string, unknown>, path);
}

export function setValueAtPointer<T>(value: T, path: JsonPointer, nextValue: unknown): T {
  if (path === "") {
    return cloneValue(nextValue) as T;
  }

  const base =
    value && typeof value === "object" ? cloneValue(value) : ({} as Record<string, unknown>);
  pointer.set(base as Record<string, unknown>, path, cloneValue(nextValue));
  return base as T;
}

export function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneValue(entry)) as T;
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [key, cloneValue(entryValue)]),
    ) as T;
  }

  return value;
}

export function flattenValue(value: unknown): FlatFields {
  const result: FlatFields = {};
  flattenInto(result, "", normalizeFormValue(cloneValue(value)));
  return result;
}

export function flattenValueAtPointer(path: JsonPointer, value: unknown): FlatFields {
  const result: FlatFields = {};
  flattenInto(result, path, normalizeFormValue(cloneValue(value)));
  return result;
}

export function inflateValue(fields: FlatFields, schema: NormalizedSchema): unknown {
  return inflateNode(fields, schema, schema.pointer);
}

export function replacePointerValue(
  fields: FlatFields,
  path: JsonPointer,
  nextValue: unknown,
): FlatFields {
  const nextFields: FlatFields = {};

  for (const [key, value] of Object.entries(fields)) {
    if (key === path || isJsonPointerDescendant(key, path)) {
      continue;
    }

    nextFields[key] = value;
  }

  return {
    ...nextFields,
    ...flattenValueAtPointer(path, nextValue),
  };
}

function flattenInto(result: FlatFields, path: JsonPointer, value: unknown): void {
  if (value === undefined) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      flattenInto(result, appendJsonPointer(path, index), entry);
    });
    return;
  }

  if (isPlainObject(value)) {
    Object.entries(value).forEach(([key, entryValue]) => {
      flattenInto(result, appendJsonPointer(path, key), entryValue);
    });
    return;
  }

  result[path] = value;
}

function inflateNode(
  fields: FlatFields,
  schema: NormalizedSchema,
  currentPointer: JsonPointer,
): unknown {
  switch (resolveSchemaKind(schema)) {
    case "object":
      return inflateObject(fields, schema, currentPointer);
    case "array":
      return inflateArray(fields, schema, currentPointer);
    case "boolean":
      return inflateBoolean(fields[currentPointer]);
    case "integer":
    case "number":
      return inflateNumber(fields[currentPointer]);
    case "null":
      return inflateNull(fields[currentPointer]);
    case "enum":
      return inflateEnum(fields[currentPointer], getEnumValues(schema));
    case "string":
    case "unsupported":
    default:
      return inflateScalar(fields[currentPointer]);
  }
}

function inflateObject(
  fields: FlatFields,
  schema: NormalizedSchema,
  currentPointer: JsonPointer,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, propertySchema] of Object.entries(schema.properties ?? {})) {
    const nextPointer = appendJsonPointer(currentPointer, key);
    const nextValue = inflateNode(fields, propertySchema as NormalizedSchema, nextPointer);
    if (nextValue !== undefined) {
      result[key] = nextValue;
    }
  }

  return result;
}

function inflateArray(
  fields: FlatFields,
  schema: NormalizedSchema,
  currentPointer: JsonPointer,
): unknown[] {
  const itemSchema = getArrayItemSchema(schema);
  if (!itemSchema) {
    return [];
  }

  return collectArrayIndices(fields, currentPointer).map((index) =>
    inflateNode(fields, itemSchema, appendJsonPointer(currentPointer, index)),
  );
}

function collectArrayIndices(fields: FlatFields, currentPointer: JsonPointer): number[] {
  const prefix = currentPointer === "" ? "/" : `${currentPointer}/`;
  const indices = new Set<number>();

  for (const key of Object.keys(fields)) {
    if (!key.startsWith(prefix)) {
      continue;
    }

    const token = key.slice(prefix.length).split("/")[0];
    if (!token) {
      continue;
    }

    const segment = unescapeJsonPointerToken(token);
    if (/^\d+$/.test(segment)) {
      indices.add(Number(segment));
    }
  }

  return [...indices].sort((left, right) => left - right);
}

function inflateScalar(value: unknown): unknown {
  return value === undefined ? undefined : value;
}

function inflateBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value === "false" || value === "0" || value === "") {
      return false;
    }

    if (value === "true" || value === "1" || value === "on") {
      return true;
    }
  }

  return Boolean(value);
}

function inflateNumber(value: unknown): unknown {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    if (normalized === "") {
      return undefined;
    }

    const nextValue = Number(normalized);
    return Number.isNaN(nextValue) ? value : nextValue;
  }

  return value;
}

function inflateNull(value: unknown): null | undefined {
  if (value === undefined || value === false || value === "") {
    return undefined;
  }

  return null;
}

function inflateEnum(value: unknown, enumValues: readonly unknown[] | undefined): unknown {
  if (value === undefined || !enumValues) {
    return value;
  }

  const directMatch = enumValues.find((candidate) => candidate === value);
  if (directMatch !== undefined) {
    return directMatch;
  }

  if (typeof value === "string") {
    return enumValues.find((candidate) => String(candidate) === value) ?? value;
  }

  return value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
