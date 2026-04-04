import { resolveSchemaKind, type NormalizedSchema } from "@uniforma/core";
import type { Component } from "svelte";

import type { FormComponents, Props, SvelteComponentProps } from "./types.ts";

export function getComponentFromContainer(container: SvelteComponentProps): Component<any> {
  return Array.isArray(container) ? container[0] : (container as Component<any>);
}

export function getPropsFromContainer(container: SvelteComponentProps): Props {
  return Array.isArray(container) ? { ...container[1] } : {};
}

export function getComponent(container: SvelteComponentProps): Component<any> {
  return getComponentFromContainer(container);
}

export function getProps(container: SvelteComponentProps): Props {
  return getPropsFromContainer(container);
}

export function getFieldComponent(
  schema: NormalizedSchema,
  components: FormComponents,
): SvelteComponentProps {
  switch (resolveSchemaKind(schema)) {
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
