import type { StandardSchemaV1 } from "@standard-schema/spec";

import { issuePathToSegments, pathToSegments } from "./paths.ts";
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
  const actual = issuePathToSegments(issuePath);
  if (actual.length !== expected.length) {
    return false;
  }

  return actual.every((segment, index) => segment === expected[index]);
}
