import { derived, get, writable, type Readable, type Writable } from "svelte/store";

import {
  getDefaultValue,
  getErrorsAtPath,
  getInputJsonSchema,
  hasErrors,
  normalizeFormValue,
  normalizeJsonSchema,
  pathToKey,
  setAtPath,
  type FormPath,
  type InferInput,
  type InferOutput,
  type JsonSchemaTarget,
  type JSONSchema,
  type NormalizedSchemaNode,
  type UniformaErrorTree,
  type UniformaSchema,
  validateSchema,
} from "@uniforma/core";

export type ValidationMode = "blur" | "change" | "submit";

export interface CreateFormOptions<TSchema extends UniformaSchema> {
  readonly initialValue?: InferInput<TSchema>;
  readonly jsonSchemaTarget?: JsonSchemaTarget;
  readonly validateOn?: ValidationMode | readonly ValidationMode[];
}

export interface FieldController {
  readonly value: Readable<unknown>;
  readonly errors: Readable<readonly string[]>;
  readonly touched: Readable<boolean>;
  set: (nextValue: unknown) => void;
  blur: () => Promise<void>;
}

export interface UniformaForm<TSchema extends UniformaSchema> {
  readonly schema: TSchema;
  readonly jsonSchema: JSONSchema;
  readonly normalizedSchema: NormalizedSchemaNode;
  readonly value: Writable<InferInput<TSchema>>;
  readonly errors: Readable<UniformaErrorTree | null>;
  readonly touched: Readable<Readonly<Record<string, boolean>>>;
  readonly validating: Readable<boolean>;
  readonly submitting: Readable<boolean>;
  readonly valid: Readable<boolean>;
  readonly dirty: Readable<boolean>;
  setValue: (nextValue: InferInput<TSchema>) => Promise<void>;
  patch: (path: FormPath, nextValue: unknown) => Promise<void>;
  blur: (path: FormPath) => Promise<void>;
  field: (path: FormPath) => FieldController;
  validate: () => Promise<ValidateReturn<TSchema>>;
  submit: () => Promise<SubmitReturn<TSchema>>;
  reset: (nextValue?: InferInput<TSchema>) => void;
}

export type ValidateReturn<TSchema extends UniformaSchema> = Awaited<
  ReturnType<typeof validateSchema<TSchema>>
>;

export type SubmitReturn<TSchema extends UniformaSchema> =
  | { readonly success: true; readonly value: InferOutput<TSchema> }
  | { readonly success: false; readonly errors: UniformaErrorTree };

export function createForm<TSchema extends UniformaSchema>(
  schema: TSchema,
  options: CreateFormOptions<TSchema> = {},
): UniformaForm<TSchema> {
  const validateOn = normalizeModes(options.validateOn);
  const jsonSchema = getInputJsonSchema(
    schema,
    options.jsonSchemaTarget ? { target: options.jsonSchemaTarget } : undefined,
  );
  const normalizedSchema = normalizeJsonSchema(jsonSchema);
  const baseValue = (options.initialValue ??
    getDefaultValue(jsonSchema) ??
    {}) as InferInput<TSchema>;
  const initialValue = normalizeFormValue(baseValue);

  const value = writable(initialValue) as Writable<InferInput<TSchema>>;
  const errors = writable<UniformaErrorTree | null>(null);
  const touched = writable<Record<string, boolean>>({});
  const validating = writable(false);
  const submitting = writable(false);

  const valid = derived(errors, ($errors) => !hasErrors($errors));
  const dirty = derived(value, ($value) => JSON.stringify($value) !== JSON.stringify(initialValue));

  async function runValidation() {
    validating.set(true);
    const result = await validateSchema(schema, normalizeFormValue(get(value)));
    validating.set(false);

    if (result.success) {
      errors.set(null);
    } else {
      errors.set(result.errorTree);
    }

    return result;
  }

  async function setValue(nextValue: InferInput<TSchema>) {
    value.set(nextValue);
    if (validateOn.has("change")) {
      await runValidation();
    }
  }

  async function patch(path: FormPath, nextValue: unknown) {
    value.update(($value) => setAtPath($value, path, nextValue));
    if (validateOn.has("change")) {
      await runValidation();
    }
  }

  async function blur(path: FormPath) {
    touched.update(($touched) => ({
      ...$touched,
      [pathToKey(path)]: true,
    }));

    if (validateOn.has("blur")) {
      await runValidation();
    }
  }

  function field(path: FormPath): FieldController {
    return {
      value: derived(value, ($value) => getValueAtPath($value, path)),
      errors: derived(errors, ($errors) => getErrorsAtPath($errors, path)),
      touched: derived(touched, ($touched) => Boolean($touched[pathToKey(path)])),
      set(nextValue) {
        void patch(path, nextValue);
      },
      blur() {
        return blur(path);
      },
    };
  }

  async function validate() {
    return runValidation();
  }

  async function submit(): Promise<SubmitReturn<TSchema>> {
    submitting.set(true);
    const result = await runValidation();
    submitting.set(false);

    if (!result.success) {
      return {
        success: false,
        errors: result.errorTree,
      };
    }

    value.set(result.value as InferInput<TSchema>);
    return {
      success: true,
      value: result.value,
    };
  }

  function reset(nextValue = initialValue) {
    value.set(normalizeFormValue(nextValue));
    errors.set(null);
    touched.set({});
  }

  return {
    schema,
    jsonSchema,
    normalizedSchema,
    value,
    errors,
    touched,
    validating,
    submitting,
    valid,
    dirty,
    setValue,
    patch,
    blur,
    field,
    validate,
    submit,
    reset,
  };
}

function normalizeModes(
  value: CreateFormOptions<UniformaSchema>["validateOn"],
): Set<ValidationMode> {
  if (!value) {
    return new Set(["submit"]);
  }

  return new Set(Array.isArray(value) ? value : [value]);
}

function getValueAtPath(value: unknown, path: FormPath): unknown {
  let cursor = value;

  for (const segment of path) {
    if (cursor == null || typeof cursor !== "object") {
      return undefined;
    }

    cursor = (cursor as Record<string, unknown>)[String(segment)];
  }

  return cursor;
}

export type {
  FormPath,
  InferInput,
  InferOutput,
  JsonSchemaTarget,
  JSONSchema,
  NormalizedSchemaNode,
  UniformaErrorTree,
  UniformaSchema,
};
