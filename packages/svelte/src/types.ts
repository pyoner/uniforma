import type { UniformaErrorTree, UniformaSchema } from "@uniforma/core";

import type { UniformaForm, ValidationMode } from "./controller.ts";

export type Props = Record<string, unknown>;
export type SvelteComponentLike = (...args: any[]) => any;
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
  readonly form: UniformaForm<any>;
  readonly schema: UniformaSchema;
  readonly components: FormComponents;
  readonly path: readonly (string | number)[];
  readonly value?: TValue;
  readonly errors?: TErrors;
  readonly props?: Props;
}

export interface FormComponentProps {
  readonly schema: UniformaSchema;
  readonly value?: unknown;
  readonly components?: FormComponents;
  readonly validateOn?: ValidationMode | readonly ValidationMode[];
}

export type Errors = UniformaErrorTree | readonly string[] | null;
