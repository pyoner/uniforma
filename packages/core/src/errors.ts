import type { StandardSchemaV1 } from "@standard-schema/spec";

import { pathToSegments } from "./paths.ts";
import type { MutableErrorTree, PathInput, UniformaErrorTree, UniformaIssue } from "./types.ts";

export function normalizeIssues(
  issues: readonly StandardSchemaV1.Issue[],
): readonly UniformaIssue[] {
  return issues.map((issue) => ({
    message: issue.message,
    path: normalizeIssuePath(issue.path),
    raw: issue,
  }));
}

export function issuesToErrorTree(issues: readonly UniformaIssue[]): UniformaErrorTree {
  const root: MutableErrorTree = {};

  for (const issue of issues) {
    let cursor = root;

    for (const segment of issue.path) {
      const key = String(segment);
      cursor.children ??= {};
      cursor.children[key] ??= {};
      cursor = cursor.children[key]!;
    }

    cursor._errors ??= [];
    cursor._errors.push(issue.message);
  }

  return freezeErrorTree(root);
}

export function getErrorsAtPath(
  errorTree: UniformaErrorTree | null | undefined,
  path: PathInput,
): readonly string[] {
  return getErrorTreeAtPath(errorTree, path)?._errors ?? [];
}

export function getErrorTreeAtPath(
  errorTree: UniformaErrorTree | null | undefined,
  path: PathInput,
): UniformaErrorTree | null {
  if (!errorTree) {
    return null;
  }

  let cursor: UniformaErrorTree | undefined = errorTree;

  for (const segment of pathToSegments(path)) {
    cursor = cursor.children?.[String(segment)];
    if (!cursor) {
      return null;
    }
  }

  return cursor;
}

export function hasErrors(errorTree: UniformaErrorTree | null | undefined): boolean {
  if (!errorTree) {
    return false;
  }

  if ((errorTree._errors?.length ?? 0) > 0) {
    return true;
  }

  return Object.values(errorTree.children ?? {}).some((child) => hasErrors(child));
}

function normalizeIssuePath(path: StandardSchemaV1.Issue["path"]): UniformaIssue["path"] {
  if (!path) {
    return [];
  }

  return path.map((segment) =>
    typeof segment === "object" && segment !== null && "key" in segment ? segment.key : segment,
  ) as UniformaIssue["path"];
}

function freezeErrorTree(node: MutableErrorTree): UniformaErrorTree {
  const children = node.children
    ? Object.fromEntries(
        Object.entries(node.children).map(([key, child]) => [key, freezeErrorTree(child)]),
      )
    : undefined;

  return {
    _errors: node._errors,
    children,
  };
}
