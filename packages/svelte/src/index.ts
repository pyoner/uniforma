export { createFormStore } from "@uniforma/core";
import { defaultFormComponents as components } from "./components/index.ts";
import Form from "./components/Form.svelte";
import * as extra from "./components/fields/extra/index.ts";

export { Form, components, extra };
export type {
  Errors,
  FieldComponents,
  FieldProps,
  FormComponentProps,
  FormComponents,
  FormRenderState,
  Props,
  SvelteComponentProps,
} from "./types.ts";
export type {
  DeepPath,
  FormFieldStore,
  FormStore,
  InferInput,
  InferOutput,
  JsonSchemaTarget,
  JSONSchema,
  NormalizedSchemaNode,
  SubmitResult,
  UniformaErrorTree,
  UniformaSchema,
  ValidationMode,
  ValidationResult,
} from "@uniforma/core";
