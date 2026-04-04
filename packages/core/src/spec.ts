import pointer from "json-pointer";
import type { StandardSchemaV1, StandardJSONSchemaV1 } from "@standard-schema/spec";

export function issuePathToSegments(
  path: StandardSchemaV1.Issue["path"] | null | undefined,
): string[] {
  if (!path) {
    return [];
  }

  return path.map((segment) => {
    const key =
      typeof segment === "object" && segment !== null && "key" in segment ? segment.key : segment;

    return String(key);
  });
}

export function issuePathToJsonPointer(
  path: StandardSchemaV1.Issue["path"] | null | undefined,
): string {
  return pointer.compile(issuePathToSegments(path));
}

export class Uniforma {
  readonly standardSchema: StandardSchemaV1;
  readonly standardJSONSchema: StandardJSONSchemaV1;

  constructor(standardSchema: StandardSchemaV1, standardJSONSchema: StandardJSONSchemaV1) {
    this.standardSchema = standardSchema;
    this.standardJSONSchema = standardJSONSchema;
  }

  getJSONSchema(): StandardJSONSchemaV1.InferInput<typeof this.standardJSONSchema> {
    return this.standardJSONSchema["~standard"].jsonSchema.input;
  }

  validate(data: unknown) {
    return this.standardSchema["~standard"].validate(data);
  }
}
