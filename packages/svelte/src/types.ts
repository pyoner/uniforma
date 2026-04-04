import type { StandardSchemaV1 } from "@standard-schema/spec";
import type {
  FormController,
  FormStatus,
  JsonPointer,
  JSONSchema,
  UniformaSchema,
  ValidationEvent,
} from "@uniforma/core";

import type { Component, Snippet } from "svelte";

export type Props = Record<string, unknown>;
export type SvelteComponentProps = Component<any> | readonly [Component<any>, Props];

export interface FieldComponents {
  boolean: SvelteComponentProps;
  null: SvelteComponentProps;
  integer: SvelteComponentProps;
  number: SvelteComponentProps;
  string: SvelteComponentProps;
  array: SvelteComponentProps;
  object: SvelteComponentProps;
}

export interface FormComponents {
  layout: SvelteComponentProps;
  wrapper: SvelteComponentProps;
  itemWrapper: SvelteComponentProps;
  itemCtrl: SvelteComponentProps;
  addItem: SvelteComponentProps;
  fields: FieldComponents;
}

export interface FieldProps {
  readonly form: FormRuntime<any>;
  readonly schema: JSONSchema;
  readonly components: FormComponents;
  readonly path: JsonPointer;
  readonly props?: Props;
}

export interface FormRuntime<TSchema extends UniformaSchema = UniformaSchema> {
  readonly controller: FormController<TSchema>;
  readonly value: StandardSchemaV1.InferInput<TSchema> | undefined;
  readonly errors: StandardSchemaV1.FailureResult | null;
  readonly status: FormStatus;
  getFieldErrors: (pointer: JsonPointer) => readonly string[];
  getFieldInput: (pointer: JsonPointer) => unknown;
  getFieldValue: (pointer: JsonPointer) => unknown;
  setFieldValue: (pointer: JsonPointer, value: unknown) => Promise<void>;
  handleEvent: (event: ValidationEvent) => Promise<void>;
  reset: () => void;
}

export interface FormRenderState {
  readonly errors: StandardSchemaV1.FailureResult | null;
  readonly rootErrors: readonly string[];
  readonly valid: boolean;
  readonly status: FormStatus;
}

export interface FormComponentProps<TSchema extends UniformaSchema = UniformaSchema> {
  readonly schema: TSchema;
  readonly initialValue?: StandardSchemaV1.InferInput<TSchema>;
  readonly components?: FormComponents;
  readonly validateOn?: ValidationEvent | readonly ValidationEvent[];
  readonly onValueChange?:
    | ((value: StandardSchemaV1.InferInput<TSchema> | undefined) => void)
    | undefined;
  readonly onSubmit?:
    | ((value: StandardSchemaV1.InferOutput<TSchema>) => void | Promise<void>)
    | undefined;
  readonly onReset?:
    | ((value: StandardSchemaV1.InferInput<TSchema> | undefined) => void)
    | undefined;
  readonly controls?: Snippet<[FormRenderState]> | undefined;
}
