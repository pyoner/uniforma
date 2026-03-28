import { getPath as getDeepMapPath, setPath as setDeepMapPath } from "@nanostores/deepmap";

import { pathToSegments } from "./paths.ts";
import type { FormPath, PathInput } from "./types.ts";

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
  if (typeof path === "string" && isDeepMapCompatiblePath(path)) {
    return getDeepMapPath(path as never, value as never) as unknown;
  }

  let cursor = value;

  for (const segment of pathToSegments(path)) {
    if (cursor == null || typeof cursor !== "object") {
      return undefined;
    }

    cursor = (cursor as Record<string, unknown>)[String(segment)];
  }

  return cursor;
}

export function setAtPath<T>(value: T, path: PathInput, nextValue: unknown): T {
  if (
    typeof path === "string" &&
    isDeepMapCompatiblePath(path) &&
    (path === "" || isPathContainer(value))
  ) {
    return setDeepMapPath(path as never, nextValue as never, value as never) as T;
  }

  const segments = pathToSegments(path);
  if (segments.length === 0) {
    return nextValue as T;
  }

  return setAtPathSegments(value, segments, nextValue);
}

export function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function serializeValue(value: unknown): string {
  return JSON.stringify(cloneValue(value));
}

function setAtPathSegments<T>(value: T, path: FormPath, nextValue: unknown): T {
  const [head, ...tail] = path;
  const key = typeof head === "number" ? head : String(head);

  if (Array.isArray(value)) {
    const clone = [...value];
    clone[key as number] =
      tail.length === 0 ? nextValue : setAtPathSegments(clone[key as number], tail, nextValue);
    return clone as T;
  }

  const base = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    ...base,
    [key]: tail.length === 0 ? nextValue : setAtPathSegments(base[key], tail, nextValue),
  } as T;
}

function isDeepMapCompatiblePath(path: string): boolean {
  for (let index = 0; index < path.length; index += 1) {
    if (path[index] !== "[") {
      continue;
    }

    const closing = path.indexOf("]", index);
    if (closing === -1) {
      return false;
    }

    if (!/^\d+$/.test(path.slice(index + 1, closing))) {
      return false;
    }

    index = closing;
  }

  return true;
}

function isPathContainer(value: unknown): value is Record<string, unknown> | unknown[] {
  return Array.isArray(value) || (!!value && typeof value === "object");
}
