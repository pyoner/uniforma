export { createFormController, getMessagesAtPointer } from "@uniforma/core";
import { defaultFormComponents as components } from "./components/index.ts";
import Form from "./components/Form.svelte";
import * as extra from "./components/fields/extra/index.ts";

export { Form, components, extra };
export type {
  FieldComponents,
  FieldProps,
  FormComponentProps,
  FormComponents,
  FormRuntime,
  FormRenderState,
  Props,
  SvelteComponentProps,
} from "./types.ts";
export type {
  FormController,
  FormStatus,
  JsonPointer,
  JSONSchema,
  UniformaSchema,
  ValidationEvent,
} from "@uniforma/core";
