<script lang="ts">
  import { tick } from "svelte";
  import {
    appendJsonPointer,
    getArrayItemSchema,
    getDefaultValue,
  } from "@uniforma/core";

  import {
    getComponentFromContainer,
    getFieldComponent,
    getProps,
    getPropsFromContainer,
  } from "../../helpers.ts";
  import type { FieldProps } from "../../types.ts";
  import Wrap from "../helpers/Wrap.svelte";

  interface ArrayItemState {
    readonly id: string;
    readonly initialValue: unknown;
  }

  let { form, schema, components, path, initialValue }: FieldProps = $props();

  let nextItemId = 0;
  let hasInitialized = false;

  function createArrayItemState(value: unknown): ArrayItemState {
    nextItemId += 1;
    return {
      id: `${path || "root"}-${nextItemId}`,
      initialValue: value,
    };
  }

  let items = $state<ArrayItemState[]>([]);

  $effect(() => {
    if (hasInitialized) {
      return;
    }

    items = (Array.isArray(initialValue) ? initialValue : []).map((value) =>
      createArrayItemState(value),
    );
    hasInitialized = true;
  });

  const fieldErrors = $derived(form.getFieldErrors(path));
  const arrayItemSchema = $derived(getArrayItemSchema(schema));
  const itemSchema = $derived(arrayItemSchema ?? schema);
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

  async function removeItem(index: number) {
    items = items.filter((_, itemIndex) => itemIndex !== index);
    await tick();
    await form.handleEvent("change");
  }

  async function moveItem(index: number, position: number) {
    if (position < 0 || position >= items.length) {
      return;
    }

    const nextItems = [...items];
    const current = nextItems[index];
    nextItems[index] = nextItems[position];
    nextItems[position] = current;
    items = nextItems;
    await tick();
    await form.handleEvent("change");
  }

  async function addItem() {
    const nextItem = arrayItemSchema
      ? (getDefaultValue(arrayItemSchema) ?? null)
      : null;
    items = [...items, createArrayItemState(nextItem)];
    await tick();
    await form.handleEvent("change");
  }
</script>

<Wrap {schema} component={components.wrapper} errors={fieldErrors}>
  {#each items as item, index (item.id)}
    <ItemWrapperComponent {...itemWrapperProps}>
      <ItemFieldComponent
        {form}
        schema={itemSchema}
        {components}
        path={appendJsonPointer(path, index)}
        initialValue={item.initialValue}
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
