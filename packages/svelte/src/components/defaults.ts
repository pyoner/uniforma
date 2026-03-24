import type { FormComponents } from "../types.ts";

import AddItem from "./AddItem.svelte";
import ItemCtrl from "./ItemCtrl.svelte";
import ItemWrapper from "./ItemWrapper.svelte";
import Layout from "./Layout.svelte";
import Wrapper from "./Wrapper.svelte";
import { defaultFieldComponents as fields } from "./fields/index.ts";

export const defaultFormComponents: FormComponents = {
  layout: Layout,
  wrapper: Wrapper,
  form: Layout,
  itemWrapper: ItemWrapper,
  itemCtrl: ItemCtrl,
  addItem: AddItem,
  fields,
};
