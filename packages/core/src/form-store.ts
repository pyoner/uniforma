import { deepMap } from "@nanostores/deepmap";
import { atom, computed } from "nanostores";

import { getErrorsAtPath, hasErrors } from "./errors.ts";
import { normalizePath, touchedPath } from "./paths.ts";
import {
  getDefaultValue,
  getInputJsonSchema,
  normalizeJsonSchema,
  validateSchema,
} from "./schema.ts";
import { cloneValue, getAtPath, normalizeFormValue, serializeValue, setAtPath } from "./values.ts";
import type {
  CreateFormStoreOptions,
  DeepPath,
  FormFieldStore,
  InferInput,
  InternalValueStore,
  UniformaErrorTree,
  SubmitResult,
  FormStore,
  UniformaSchema,
  ValidationMode,
  ValidationOptions,
} from "./types.ts";

export function createFormStore<TSchema extends UniformaSchema>(
  options: CreateFormStoreOptions<TSchema>,
): FormStore<TSchema> {
  const validateOn = normalizeValidationModes(options.validateOn);
  const jsonSchema = getInputJsonSchema(options.schema, {
    ...(options.jsonSchemaTarget !== undefined ? { target: options.jsonSchemaTarget } : {}),
    ...(options.libraryOptions !== undefined ? { libraryOptions: options.libraryOptions } : {}),
  });
  const normalizedSchema = normalizeJsonSchema(jsonSchema);
  const baseValue = (options.initialValue ??
    getDefaultValue(jsonSchema) ??
    {}) as InferInput<TSchema>;
  const initialValue = cloneValue(normalizeFormValue(baseValue));

  const valueStore = createValueStore(initialValue);
  const errorsStore = atom<UniformaErrorTree | null>(null);
  const touchedStore = deepMap<Record<string, unknown>>({});
  const validatingStore = atom(false);
  const submittingStore = atom(false);
  const validStore = computed(errorsStore, (errors) => !hasErrors(errors));
  const dirtyStore = computed(
    valueStore,
    (value) => serializeValue(value) !== serializeValue(initialValue),
  );
  const fieldStores = new Map<DeepPath, FormFieldStore>();

  async function runValidation() {
    validatingStore.set(true);
    const validationOptions: ValidationOptions =
      options.libraryOptions !== undefined ? { libraryOptions: options.libraryOptions } : {};
    const result = await validateSchema(
      options.schema,
      normalizeFormValue(getCurrentValue()),
      validationOptions,
    );
    validatingStore.set(false);
    errorsStore.set(result.success ? null : result.errorTree);
    return result;
  }

  async function setValue(nextValue: InferInput<TSchema>) {
    setCurrentValue(normalizeFormValue(nextValue));
    if (validateOn.has("change")) {
      await runValidation();
    }
  }

  async function setPathValue(path: DeepPath, nextValue: unknown) {
    if (path === "") {
      setCurrentValue(nextValue as InferInput<TSchema>);
    } else if (hasDeepSetKey(valueStore)) {
      valueStore.setKey(path, nextValue);
    } else {
      valueStore.set(setAtPath(valueStore.get(), path, nextValue) as InferInput<TSchema>);
    }

    if (validateOn.has("change")) {
      await runValidation();
    }
  }

  async function touch(path: DeepPath) {
    touchedStore.setKey(touchedPath(path) as never, true as never);
    if (validateOn.has("blur")) {
      await runValidation();
    }
  }

  function field(path: DeepPath): FormFieldStore {
    const normalizedPath = normalizePath(path);
    const existing = fieldStores.get(normalizedPath);
    if (existing) {
      return existing;
    }

    const nextFieldStore: FormFieldStore = {
      path: normalizedPath,
      $value: computed(valueStore, (value) => getAtPath(value, normalizedPath)),
      $errors: computed(errorsStore, (errors) => getErrorsAtPath(errors, normalizedPath)),
      $touched: computed(touchedStore, (touched) =>
        Boolean(getAtPath(touched, touchedPath(normalizedPath))),
      ),
      set(nextValue) {
        return setPathValue(normalizedPath, nextValue);
      },
      blur() {
        return touch(normalizedPath);
      },
    };

    fieldStores.set(normalizedPath, nextFieldStore);
    return nextFieldStore;
  }

  async function submit(): Promise<SubmitResult<TSchema>> {
    submittingStore.set(true);
    const result = await runValidation();
    submittingStore.set(false);

    if (!result.success) {
      return {
        success: false,
        errors: result.errorTree,
      };
    }

    setCurrentValue(result.value as InferInput<TSchema>);
    return {
      success: true,
      value: result.value,
    };
  }

  function reset(nextValue = initialValue) {
    setCurrentValue(normalizeFormValue(nextValue));
    errorsStore.set(null);
    touchedStore.set({});
  }

  function getCurrentValue() {
    return valueStore.get() as InferInput<TSchema>;
  }

  function setCurrentValue(nextValue: InferInput<TSchema>) {
    valueStore.set(cloneValue(nextValue) as InferInput<TSchema>);
  }

  return {
    schema: options.schema,
    jsonSchema,
    normalizedSchema,
    $value: valueStore,
    $errors: errorsStore,
    $touched: touchedStore,
    $validating: validatingStore,
    $submitting: submittingStore,
    $valid: validStore,
    $dirty: dirtyStore,
    getValue: getCurrentValue,
    getPathValue(path) {
      return getAtPath(getCurrentValue(), path);
    },
    setValue,
    setPathValue,
    touch,
    field,
    validate: runValidation,
    submit,
    reset,
  };
}

function createValueStore<T>(initialValue: T): InternalValueStore<T> {
  return isDeepMapValue(initialValue)
    ? (deepMap(
        cloneValue(initialValue) as Record<string, unknown> | unknown[],
      ) as unknown as InternalValueStore<T>)
    : (atom(cloneValue(initialValue)) as InternalValueStore<T>);
}

function hasDeepSetKey<T>(store: InternalValueStore<T>): store is InternalValueStore<T> & {
  setKey: (path: string, value: unknown) => void;
} {
  return typeof store.setKey === "function";
}

function isDeepMapValue(value: unknown): value is Record<string, unknown> | unknown[] {
  return Array.isArray(value) || (!!value && typeof value === "object");
}

function normalizeValidationModes(
  value: CreateFormStoreOptions<UniformaSchema>["validateOn"],
): Set<ValidationMode> {
  if (!value) {
    return new Set(["submit"]);
  }

  return new Set(Array.isArray(value) ? value : [value]);
}
