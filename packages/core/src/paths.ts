import type { StandardSchemaV1 } from "@standard-schema/spec";
import pointer from "json-pointer";

import type { JsonPointer, JsonPointerSegment } from "./types.ts";

export function appendJsonPointer(base: JsonPointer, segment: PropertyKey): JsonPointer {
  const token = escapeJsonPointerToken(segment);
  return base === "" ? `/${token}` : `${base}/${token}`;
}

export function segmentsToPointer(segments: readonly PropertyKey[]): JsonPointer {
  return pointer.compile(segments.map((segment) => normalizePointerSegment(segment)));
}

export function pointerToSegments(path: JsonPointer): readonly JsonPointerSegment[] {
  return path === "" ? [] : pointer.parse(path);
}

export function issuePathToPointer(
  path: StandardSchemaV1.Issue["path"] | null | undefined,
): JsonPointer {
  if (!path) {
    return "";
  }

  return segmentsToPointer(
    path.map((segment) =>
      typeof segment === "object" && segment !== null && "key" in segment ? segment.key : segment,
    ),
  );
}

export function isJsonPointerDescendant(path: JsonPointer, base: JsonPointer): boolean {
  if (base === "") {
    return path !== "";
  }

  return path.startsWith(`${base}/`);
}

export function escapeJsonPointerToken(token: PropertyKey): string {
  return pointer.escape(normalizePointerSegment(token));
}

export function unescapeJsonPointerToken(token: string): string {
  return pointer.unescape(token);
}

function normalizePointerSegment(segment: PropertyKey): string {
  return typeof segment === "symbol" ? String(segment) : String(segment);
}
