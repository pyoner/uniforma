import {
  appendJsonPointer,
  getArrayItemSchema,
  getEnumValues,
  resolveSchemaKind,
  type JSONSchema,
  type JsonPointer,
} from "@uniforma/core";

type FormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export function readFormValue(form: HTMLFormElement, schema: JSONSchema): unknown {
  return readSchemaValue(form, schema, "");
}

function readSchemaValue(form: HTMLFormElement, schema: JSONSchema, path: JsonPointer): unknown {
  switch (resolveSchemaKind(schema)) {
    case "object":
      return readObjectValue(form, schema, path);
    case "array":
      return readArrayValue(form, schema, path);
    case "boolean":
      return readBooleanValue(form, path);
    case "integer":
    case "number":
      return readNumberValue(form, path);
    case "null":
      return readNullValue(form, path);
    case "enum":
      return readEnumValue(form, schema, path);
    case "string":
    case "unsupported":
    default:
      return readScalarValue(form, path);
  }
}

function readObjectValue(
  form: HTMLFormElement,
  schema: JSONSchema,
  path: JsonPointer,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, propertySchema] of Object.entries(schema.properties ?? {})) {
    if (!propertySchema || typeof propertySchema === "boolean") {
      continue;
    }

    const nextValue = readSchemaValue(form, propertySchema, appendJsonPointer(path, key));
    if (nextValue !== undefined) {
      result[key] = nextValue;
    }
  }

  return result;
}

function readArrayValue(form: HTMLFormElement, schema: JSONSchema, path: JsonPointer): unknown[] {
  const itemSchema = getArrayItemSchema(schema);
  if (!itemSchema) {
    return [];
  }

  return collectArrayIndices(form, path).map((index) =>
    readSchemaValue(form, itemSchema, appendJsonPointer(path, index)),
  );
}

function collectArrayIndices(form: HTMLFormElement, path: JsonPointer): number[] {
  const prefix = path === "" ? "/" : `${path}/`;
  const indices = new Set<number>();

  for (const control of getFormControls(form)) {
    if (!control.name.startsWith(prefix)) {
      continue;
    }

    const token = control.name.slice(prefix.length).split("/")[0];
    if (!token || !/^\d+$/.test(token)) {
      continue;
    }

    indices.add(Number(token));
  }

  return [...indices].sort((left, right) => left - right);
}

function readScalarValue(form: HTMLFormElement, path: JsonPointer): unknown {
  const control = getFirstControl(form, path);
  if (!control) {
    return undefined;
  }

  if (control instanceof HTMLInputElement && control.type === "file") {
    return control.files?.item(0) ?? undefined;
  }

  return control.value;
}

function readBooleanValue(form: HTMLFormElement, path: JsonPointer): boolean | undefined {
  const control = getFirstControl(form, path);
  return control instanceof HTMLInputElement ? control.checked : undefined;
}

function readNumberValue(form: HTMLFormElement, path: JsonPointer): number | undefined {
  const control = getFirstControl(form, path);
  if (!control) {
    return undefined;
  }

  const rawValue = control.value.trim();
  if (rawValue === "") {
    return undefined;
  }

  const parsedValue = Number(rawValue);
  return Number.isNaN(parsedValue) ? undefined : parsedValue;
}

function readNullValue(form: HTMLFormElement, path: JsonPointer): null | undefined {
  const control = getFirstControl(form, path);
  return control instanceof HTMLInputElement && control.checked ? null : undefined;
}

function readEnumValue(form: HTMLFormElement, schema: JSONSchema, path: JsonPointer): unknown {
  const rawValue = readScalarValue(form, path);
  if (rawValue === undefined) {
    return undefined;
  }

  const enumValues = getEnumValues(schema);
  if (!enumValues) {
    return rawValue;
  }

  return enumValues.find((candidate) => String(candidate) === rawValue) ?? rawValue;
}

function getFirstControl(form: HTMLFormElement, path: JsonPointer): FormControl | undefined {
  return getFormControls(form).find((control) => control.name === path);
}

function getFormControls(form: HTMLFormElement): FormControl[] {
  return Array.from(form.elements)
    .filter(isFormControl)
    .filter((control) => !control.disabled);
}

function isFormControl(element: Element): element is FormControl {
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
  );
}
