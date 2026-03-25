import type {
  DeepPath,
  FormStore,
  InferInput,
  InferOutput,
  NormalizedSchemaNode,
  UniformaErrorTree,
  UniformaSchema,
  ValidationMode,
} from "@uniforma/core";

import type { Component, Snippet } from "svelte";

export type Props = Record<string, unknown>;
export type SvelteComponentLike = Component<any>;
export type SvelteComponentProps = SvelteComponentLike | readonly [SvelteComponentLike, Props];

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
  form: SvelteComponentProps;
  itemWrapper: SvelteComponentProps;
  itemCtrl: SvelteComponentProps;
  addItem: SvelteComponentProps;
  fields: FieldComponents;
}

export interface FieldProps<
  TValue = unknown,
  TErrors = readonly string[] | UniformaErrorTree | null,
> {
  readonly form: FormStore<any>;
  readonly schema: NormalizedSchemaNode;
  readonly components: FormComponents;
  readonly path: DeepPath;
  readonly value?: TValue;
  readonly errors?: TErrors;
  readonly props?: Props;
}

export interface FormRenderState {
  readonly errors: UniformaErrorTree | null;
  readonly rootErrors: readonly string[];
  readonly valid: boolean;
  readonly validating: boolean;
  readonly submitting: boolean;
}

export interface FormComponentProps<TSchema extends UniformaSchema = UniformaSchema> {
  readonly schema: TSchema;
  readonly value?: InferInput<TSchema>;
  readonly components?: FormComponents;
  readonly validateOn?: ValidationMode | readonly ValidationMode[];
  readonly onValueChange?: ((value: InferInput<TSchema>) => void) | undefined;
  readonly onSubmit?: ((value: InferOutput<TSchema>) => void | Promise<void>) | undefined;
  readonly onReset?: ((value: InferInput<TSchema>) => void) | undefined;
  readonly controls?: Snippet<[FormRenderState]> | undefined;
}

export type Errors = UniformaErrorTree | readonly string[] | null;
