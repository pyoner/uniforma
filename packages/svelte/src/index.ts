import { createForm } from "./controller.ts";
import { defaultFormComponents as components } from "./components/index.ts";
import Form from "./components/Form.svelte";
import * as extra from "./components/fields/extra/index.ts";

export { Form, components, createForm, extra };
export type {
  CreateFormOptions,
  FieldController,
  SubmitReturn,
  UniformaForm,
  ValidateReturn,
  ValidationMode,
} from "./controller.ts";
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
  FormPath,
  InferInput,
  InferOutput,
  JsonSchemaTarget,
  JSONSchema,
  NormalizedSchemaNode,
  UniformaErrorTree,
  UniformaSchema,
} from "./controller.ts";
