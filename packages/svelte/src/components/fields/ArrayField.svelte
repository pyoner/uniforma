<script lang="ts">
  import {
    defaultValue,
    getAtPath,
    getComponentFromContainer,
    getErrorTreeAtPath,
    getFieldComponent,
    getProps,
  } from "../../helpers.ts";
  import Wrap from "../helpers/Wrap.svelte";

  const p = {
    form: undefined,
    schema: undefined,
    components: undefined,
    path: [],
  };

  export let form = p.form;
  export let schema = p.schema;
  export let components = p.components;
  export let path = p.path;

  $: valueStore = form.value;
  $: errorStore = form.errors;
  $: items = (getAtPath($valueStore, path) as unknown[] | undefined) ?? [];
  $: itemSchema = schema.item ?? schema;
  $: itemComponent = getFieldComponent(itemSchema, components);

  function removeItem(index: number) {
    const next = items.filter((_, itemIndex) => itemIndex !== index);
    void form.patch(path, next);
  }

  function moveItem(index: number, position: number) {
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

<Wrap {schema} component={components.wrapper} errors={getErrorTreeAtPath($errorStore, path)}>
  {#each items as _, index (index)}
    <svelte:component this={getComponentFromContainer(components.itemWrapper) as never}>
      <svelte:component
        this={getComponentFromContainer(itemComponent) as never}
        {form}
        schema={itemSchema}
        {components}
        path={[...path, index]}
        props={getProps(itemSchema, itemComponent)} />

      <div slot="ctrl">
        <svelte:component
          this={getComponentFromContainer(components.itemCtrl) as never}
          remove={() => removeItem(index)}
          moveUp={() => moveItem(index, index - 1)}
          moveDown={() => moveItem(index, index + 1)}
          position={index}
          length={items.length} />
      </div>
    </svelte:component>
  {/each}

  <svelte:component this={getComponentFromContainer(components.addItem) as never} {addItem} props={{}} />
</Wrap>
