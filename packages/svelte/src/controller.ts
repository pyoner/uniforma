import type { Store } from "nanostores";

import {
  createFormStore,
  pathToKey,
  type DeepPath,
  type FormStore,
  type InferInput,
  type InferOutput,
  type JsonSchemaTarget,
  type JSONSchema,
  type NormalizedSchemaNode,
  type SubmitResult,
  type UniformaErrorTree,
  type UniformaSchema,
  type ValidationMode,
  type ValidationResult,
} from "@uniforma/core";

export type FormPath = DeepPath | readonly (string | number)[];

export interface CreateFormOptions<TSchema extends UniformaSchema> {
  readonly initialValue?: InferInput<TSchema>;
  readonly jsonSchemaTarget?: JsonSchemaTarget;
  readonly validateOn?: ValidationMode | readonly ValidationMode[];
}

export interface FieldController {
  readonly value: Store<unknown>;
  readonly errors: Store<readonly string[]>;
  readonly touched: Store<boolean>;
  set: (nextValue: unknown) => void;
  blur: () => Promise<void>;
}

export interface UniformaForm<TSchema extends UniformaSchema> {
  readonly schema: TSchema;
  readonly jsonSchema: JSONSchema;
  readonly normalizedSchema: NormalizedSchemaNode;
  readonly value: Store<InferInput<TSchema>>;
  readonly errors: Store<UniformaErrorTree | null>;
  readonly touched: Store<Record<string, unknown>>;
  readonly validating: Store<boolean>;
  readonly submitting: Store<boolean>;
  readonly valid: Store<boolean>;
  readonly dirty: Store<boolean>;
  setValue: (nextValue: InferInput<TSchema>) => Promise<void>;
  patch: (path: FormPath, nextValue: unknown) => Promise<void>;
  blur: (path: FormPath) => Promise<void>;
  field: (path: FormPath) => FieldController;
  validate: () => Promise<ValidateReturn<TSchema>>;
  submit: () => Promise<SubmitReturn<TSchema>>;
  reset: (nextValue?: InferInput<TSchema>) => void;
}

export type ValidateReturn<TSchema extends UniformaSchema> = ValidationResult<InferOutput<TSchema>>;
export type SubmitReturn<TSchema extends UniformaSchema> = SubmitResult<TSchema>;

export function createForm<TSchema extends UniformaSchema>(
  schema: TSchema,
  options: CreateFormOptions<TSchema> = {},
): UniformaForm<TSchema> {
  const formStoreOptions = {
    schema,
    ...(options.initialValue !== undefined ? { initialValue: options.initialValue } : {}),
    ...(options.jsonSchemaTarget !== undefined
      ? { jsonSchemaTarget: options.jsonSchemaTarget }
      : {}),
    ...(options.validateOn !== undefined ? { validateOn: options.validateOn } : {}),
  };
  const formStore = createFormStore(formStoreOptions);
  const fieldControllers = new Map<string, FieldController>();

  function field(path: FormPath): FieldController {
    const normalizedPath = pathToKey(path);
    const existing = fieldControllers.get(normalizedPath);
    if (existing) {
      return existing;
    }

    const fieldStore = formStore.field(normalizedPath);
    const controller: FieldController = {
      value: fieldStore.$value,
      errors: fieldStore.$errors,
      touched: fieldStore.$touched,
      set(nextValue) {
        void fieldStore.set(nextValue);
      },
      blur() {
        return fieldStore.blur();
      },
    };

    fieldControllers.set(normalizedPath, controller);
    return controller;
  }

  return {
    schema,
    jsonSchema: formStore.jsonSchema,
    normalizedSchema: formStore.normalizedSchema,
    value: formStore.$value,
    errors: formStore.$errors,
    touched: formStore.$touched,
    validating: formStore.$validating,
    submitting: formStore.$submitting,
    valid: formStore.$valid,
    dirty: formStore.$dirty,
    setValue: formStore.setValue,
    patch(path, nextValue) {
      return formStore.setPathValue(pathToKey(path), nextValue);
    },
    blur(path) {
      return formStore.touch(pathToKey(path));
    },
    field,
    validate: formStore.validate,
    submit: formStore.submit,
    reset: formStore.reset,
  };
}

export type {
  DeepPath,
  InferInput,
  InferOutput,
  JsonSchemaTarget,
  JSONSchema,
  NormalizedSchemaNode,
  UniformaErrorTree,
  UniformaSchema,
  ValidationMode,
};

export type { FormStore } from "@uniforma/core";
