import pointer from "json-pointer";

import type { JsonPointer } from "./types.ts";

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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
