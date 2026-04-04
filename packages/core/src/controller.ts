import type { StandardSchemaV1 } from "@standard-schema/spec";

import { getDefaultValue, getInputJsonSchema } from "./schema.ts";
import { normalizeFormValue } from "./values.ts";
import type {
  CreateFormControllerOptions,
  FormController,
  UniformaSchema,
  ValidationEvent,
} from "./types.ts";

export function createFormController<TSchema extends UniformaSchema>(
  options: CreateFormControllerOptions<TSchema>,
): FormController<TSchema> {
  const jsonSchema = getInputJsonSchema(options.schema, {
    ...(options.jsonSchemaTarget !== undefined ? { target: options.jsonSchemaTarget } : {}),
    ...(options.libraryOptions !== undefined ? { libraryOptions: options.libraryOptions } : {}),
  });
  const initialValue = normalizeFormValue(
    (options.initialValue ?? getDefaultValue(jsonSchema)) as
      | StandardSchemaV1.InferInput<TSchema>
      | undefined,
  );
  const validateOn = normalizeValidationEvents(options.validateOn);

  return {
    schema: options.schema,
    jsonSchema,
    initialValue,
    validateOn,
    validate(value) {
      return options.schema["~standard"].validate(
        normalizeFormValue(value),
        options.libraryOptions !== undefined ? { libraryOptions: options.libraryOptions } : {},
      ) as Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>;
    },
    shouldValidate(event) {
      return validateOn.includes(event);
    },
  };
}

function normalizeValidationEvents(
  value: CreateFormControllerOptions<UniformaSchema>["validateOn"],
): readonly ValidationEvent[] {
  if (!value) {
    return ["submit"];
  }

  return [...new Set(Array.isArray(value) ? value : [value])];
}
