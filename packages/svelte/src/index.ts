export { createFormController, getMessagesAtPointer } from "@uniforma/core";
import { defaultFormComponents as components } from "./components/index.ts";
import Form from "./components/Form.svelte";
import { formDataToFlatFields, formToFlatFields } from "./dom.ts";
import * as extra from "./components/fields/extra/index.ts";

export { Form, components, extra, formDataToFlatFields, formToFlatFields };
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
  FlatFields,
  FormController,
  FormStatus,
  JsonPointer,
  JSONSchema,
  NormalizedSchema,
  UniformaSchema,
  ValidationEvent,
} from "@uniforma/core";
