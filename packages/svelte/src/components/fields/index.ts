import type { FieldComponents } from "../../types.ts";

import ArrayField from "./ArrayField.svelte";
import BooleanField from "./BooleanField.svelte";
import NullField from "./NullField.svelte";
import NumberField from "./NumberField.svelte";
import ObjectField from "./ObjectField.svelte";
import StringField from "./StringField.svelte";

export const defaultFieldComponents: FieldComponents = {
  boolean: BooleanField,
  null: NullField,
  number: NumberField,
  integer: [NumberField, { step: 1 }],
  string: StringField,
  object: ObjectField,
  array: ArrayField,
};

export { ArrayField, BooleanField, NullField, NumberField, ObjectField, StringField };
