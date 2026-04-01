<script lang="ts">
  import { appendJsonPointer, getDefaultValue } from "@uniforma/core";

  import {
    getComponentFromContainer,
    getFieldComponent,
    getProps,
    getPropsFromContainer,
  } from "../../helpers.ts";
  import type { FieldProps } from "../../types.ts";
  import Wrap from "../helpers/Wrap.svelte";

  let { form, schema, components, path }: FieldProps = $props();

  const items = $derived((form.getFieldValue(path) as unknown[] | undefined) ?? []);
  const fieldErrors = $derived(form.getFieldErrors(path));
  const itemSchema = $derived(schema.item ?? schema);
  const itemComponent = $derived(getFieldComponent(itemSchema, components));
  const ItemFieldComponent = $derived(getComponentFromContainer(itemComponent));
  const itemFieldProps = $derived(getProps(itemComponent));
  const ItemWrapperComponent = $derived(
    getComponentFromContainer(components.itemWrapper),
  );
  const itemWrapperProps = $derived(
    getPropsFromContainer(components.itemWrapper),
  );
  const ItemCtrlComponent = $derived(
    getComponentFromContainer(components.itemCtrl),
  );
  const itemCtrlProps = $derived(getPropsFromContainer(components.itemCtrl));
  const AddItemComponent = $derived(
    getComponentFromContainer(components.addItem),
  );
  const addItemProps = $derived(getPropsFromContainer(components.addItem));

  function removeItem(index: number) {
    const next = items.filter((_, itemIndex) => itemIndex !== index);
    void form.setFieldValue(path, next);
  }

  function moveItem(index: number, position: number) {
    if (position < 0 || position >= items.length) {
      return;
    }

    const next = [...items];
    const current = next[index];
    next[index] = next[position];
    next[position] = current;
    void form.setFieldValue(path, next);
  }

  function addItem() {
    const nextItem = schema.item ? (getDefaultValue(schema.item.raw) ?? null) : null;
    void form.setFieldValue(path, [...items, nextItem]);
  }
</script>

<Wrap {schema} component={components.wrapper} errors={fieldErrors}>
  {#each items as _, index (index)}
    <ItemWrapperComponent {...itemWrapperProps}>
      <ItemFieldComponent
        {form}
        schema={itemSchema}
        {components}
        path={appendJsonPointer(path, index)}
        props={itemFieldProps}
      />

      {#snippet controls()}
        <ItemCtrlComponent
          {...itemCtrlProps}
          remove={() => removeItem(index)}
          moveUp={() => moveItem(index, index - 1)}
          moveDown={() => moveItem(index, index + 1)}
          position={index}
          length={items.length}
        />
      {/snippet}
    </ItemWrapperComponent>
  {/each}

  <AddItemComponent {...addItemProps} {addItem} />
</Wrap>
