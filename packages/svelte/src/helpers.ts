import { type NormalizedSchemaNode } from "@uniforma/core";

import type { FormComponents, Props, SvelteComponentProps } from "./types.ts";

export function getComponentFromContainer(container: SvelteComponentProps): unknown {
  return Array.isArray(container) ? container[0] : container;
}

export function getPropsFromContainer(container: SvelteComponentProps): Props {
  return Array.isArray(container) ? { ...container[1] } : {};
}

export function getComponent(container: SvelteComponentProps): unknown {
  return getComponentFromContainer(container);
}

export function getProps(container: SvelteComponentProps): Props {
  return getPropsFromContainer(container);
}

export function getFieldComponent(
  schema: NormalizedSchemaNode,
  components: FormComponents,
): SvelteComponentProps {
  switch (schema.kind) {
    case "array":
      return components.fields.array;
    case "boolean":
      return components.fields.boolean;
    case "integer":
      return components.fields.integer;
    case "null":
      return components.fields.null;
    case "number":
      return components.fields.number;
    case "object":
      return components.fields.object;
    case "string":
    case "enum":
    case "unsupported":
    default:
      return components.fields.string;
  }
}

export function getFieldErrors(errorTree: readonly string[] | null | undefined): readonly string[] {
  return errorTree ?? [];
}
