<script lang="ts">
  import {
    defaultValue,
    getComponentFromContainer,
    getFieldComponent,
    getProps,
    getPropsFromContainer,
  } from "../../helpers.ts";
  import type { FieldProps } from "../../types.ts";
  import Wrap from "../helpers/Wrap.svelte";

  let { form, schema, components, path }: FieldProps = $props();

  let fieldValue = $state<unknown[] | undefined>(undefined);
  let fieldErrors = $state<readonly string[]>([]);

  $effect(() => {
    const field = form.field(path);
    const unsubscribeValue = field.value.subscribe((nextValue) => {
      fieldValue = nextValue as unknown[] | undefined;
    });
    const unsubscribeErrors = field.errors.subscribe((nextErrors) => {
      fieldErrors = nextErrors;
    });

    return () => {
      unsubscribeValue();
      unsubscribeErrors();
    };
  });

  const items = $derived(fieldValue ?? []);
  const itemSchema = $derived(schema.item ?? schema);
  const itemComponent = $derived(getFieldComponent(itemSchema, components));
  const ItemFieldComponent = $derived(getComponentFromContainer(itemComponent));
  const itemFieldProps = $derived(getProps(itemSchema, itemComponent));
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
    void form.patch(path, next);
  }

  function moveItem(index: number, position: number) {
    if (position < 0 || position >= items.length) {
      return;
    }

    const next = [...items];
    const current = next[index];
    next[index] = next[position];
    next[position] = current;
    void form.patch(path, next);
  }

  function addItem() {
    const nextItem = schema.item ? defaultValue(schema.item.raw, null) : null;
    void form.patch(path, [...items, nextItem]);
  }
</script>

<Wrap {schema} component={components.wrapper} errors={fieldErrors}>
  {#each items as _, index (index)}
    <ItemWrapperComponent {...itemWrapperProps}>
      <ItemFieldComponent
        {form}
        schema={itemSchema}
        {components}
        path={[...path, index]}
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
