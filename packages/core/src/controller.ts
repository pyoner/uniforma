import type { StandardSchemaV1 } from "@standard-schema/spec";

import { getDefaultValue, getInputJsonSchema, normalizeJsonSchema } from "./schema.ts";
import { flattenValue, inflateValue, normalizeFormValue } from "./values.ts";
import type {
  CreateFormControllerOptions,
  FormController,
  UniformaSchema,
  ValidationEvent,
  ValidationOptions,
} from "./types.ts";

export function createFormController<TSchema extends UniformaSchema>(
  options: CreateFormControllerOptions<TSchema>,
): FormController<TSchema> {
  const jsonSchema = getInputJsonSchema(options.schema, {
    ...(options.jsonSchemaTarget !== undefined ? { target: options.jsonSchemaTarget } : {}),
    ...(options.libraryOptions !== undefined ? { libraryOptions: options.libraryOptions } : {}),
  });
  const normalizedSchema = normalizeJsonSchema(jsonSchema);
  const initialValue = normalizeFormValue(
    (options.initialValue ?? getDefaultValue(jsonSchema)) as
      | StandardSchemaV1.InferInput<TSchema>
      | undefined,
  );
  const initialFields = flattenValue(initialValue);
  const validateOn = normalizeValidationEvents(options.validateOn);

  return {
    schema: options.schema,
    jsonSchema,
    normalizedSchema,
    initialValue,
    initialFields,
    validateOn,
    flatten(value) {
      return flattenValue(normalizeFormValue(value));
    },
    inflate(fields) {
      return inflateValue(fields, normalizedSchema) as StandardSchemaV1.InferInput<TSchema>;
    },
    validate(fields) {
      const validationOptions: ValidationOptions =
        options.libraryOptions !== undefined ? { libraryOptions: options.libraryOptions } : {};

      return options.schema["~standard"].validate(
        inflateValue(fields, normalizedSchema),
        validationOptions,
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
