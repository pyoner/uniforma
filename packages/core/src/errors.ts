import type { StandardSchemaV1 } from "@standard-schema/spec";

import { issuePathToPointer } from "./paths.ts";
import type { JsonPointer } from "./types.ts";

export function getIssuePointer(issue: StandardSchemaV1.Issue): JsonPointer {
  return issuePathToPointer(issue.path);
}

export function getIssuesAtPointer(
  failure: StandardSchemaV1.FailureResult | null | undefined,
  pointer: JsonPointer,
): readonly StandardSchemaV1.Issue[] {
  if (!failure) {
    return [];
  }

  return failure.issues.filter((issue) => getIssuePointer(issue) === pointer);
}

export function getMessagesAtPointer(
  failure: StandardSchemaV1.FailureResult | null | undefined,
  pointer: JsonPointer,
): readonly string[] {
  return getIssuesAtPointer(failure, pointer).map((issue) => issue.message);
}

export function hasErrors(failure: StandardSchemaV1.FailureResult | null | undefined): boolean {
  return (failure?.issues.length ?? 0) > 0;
}
