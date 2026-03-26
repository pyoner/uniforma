import {
  type FailureResult,
  getDefaultValue as getCoreDefaultValue,
  getMessagesAtPath,
  getAtPath,
  normalizeFormValue,
  type DeepPath,
  type JSONSchema,
  type NormalizedSchemaNode,
} from "@uniforma/core";

import type { FormComponents, Props, SvelteComponentProps } from "./types.ts";

export function createProps<TValue = unknown, TErrors = readonly string[] | FailureResult | null>(
  value: TValue | null = null,
) {
  return {
    value,
    errors: null as TErrors | null,
    schema: undefined,
    components: undefined,
    path: "" as DeepPath,
    form: undefined,
    props: {},
  };
}

export function defaultValue<TValue>(schema: JSONSchema, value: TValue | null): TValue | null {
  if (value === undefined || value === null) {
    const fallback = getCoreDefaultValue(schema);
    return (fallback ?? value) as TValue | null;
  }

  if (schema.type === "object" && value && typeof value === "object") {
    const result: Record<string, unknown> = { ...(value as Record<string, unknown>) };
    for (const [key, propertySchema] of Object.entries(schema.properties ?? {})) {
      result[key] = defaultValue(propertySchema, result[key] as TValue | null);
    }
    return result as TValue;
  }

  return value;
}

export function normalizeValue<TValue>(value: TValue): TValue {
  return normalizeFormValue(value);
}

export function getComponentFromContainer(container: SvelteComponentProps): unknown {
  return Array.isArray(container) ? container[0] : container;
}

export function getPropsFromContainer(container: SvelteComponentProps): Props {
  return Array.isArray(container) ? { ...container[1] } : {};
}

export function getComponent(
  schema: NormalizedSchemaNode,
  container: SvelteComponentProps,
): unknown {
  return getComponentFromContainer(container);
}

export function getProps(schema: NormalizedSchemaNode, container: SvelteComponentProps): Props {
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

export { getAtPath, getMessagesAtPath };
