import type { FlatFields } from "@uniforma/core";

export function formDataToFlatFields(formData: FormData): FlatFields {
  const fields: FlatFields = {};

  for (const [name, value] of formData.entries()) {
    fields[name] = value;
  }

  return fields;
}

export function formToFlatFields(form: HTMLFormElement): FlatFields {
  const fields = formDataToFlatFields(new FormData(form));

  for (const element of Array.from(form.elements)) {
    if (!(element instanceof HTMLInputElement)) {
      continue;
    }

    if (!element.name || element.disabled) {
      continue;
    }

    if (element.type === "checkbox") {
      fields[element.name] = element.checked;
      continue;
    }

    if (element.type === "file") {
      fields[element.name] = element.files?.item(0) ?? undefined;
    }
  }

  return fields;
}
