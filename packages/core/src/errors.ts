import type { StandardSchemaV1 } from "@standard-schema/spec";

import { pathToSegments } from "./paths.ts";
import type { PathInput } from "./types.ts";

export function getIssuesAtPath(
  failure: StandardSchemaV1.FailureResult | null | undefined,
  path: PathInput,
): readonly StandardSchemaV1.Issue[] {
  if (!failure) {
    return [];
  }

  const expected = pathToSegments(path);
  return failure.issues.filter((issue) => pathMatches(issue.path, expected));
}

export function getMessagesAtPath(
  failure: StandardSchemaV1.FailureResult | null | undefined,
  path: PathInput,
): readonly string[] {
  return getIssuesAtPath(failure, path).map((issue) => issue.message);
}

export function hasErrors(failure: StandardSchemaV1.FailureResult | null | undefined): boolean {
  return (failure?.issues.length ?? 0) > 0;
}

function pathMatches(
  issuePath: StandardSchemaV1.Issue["path"],
  expected: readonly (string | number)[],
): boolean {
  const actual = normalizeIssuePath(issuePath);
  if (actual.length !== expected.length) {
    return false;
  }

  return actual.every((segment, index) => segment === expected[index]);
}

function normalizeIssuePath(path: StandardSchemaV1.Issue["path"]): readonly (string | number)[] {
  if (!path) {
    return [];
  }

  return path.map((segment) =>
    typeof segment === "object" && segment !== null && "key" in segment
      ? (segment.key as string | number)
      : (segment as string | number),
  );
}
