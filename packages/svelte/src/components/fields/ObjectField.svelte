<script lang="ts">
  import {
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

  $: errorStore = form.errors;
  $: entries = Object.entries(schema.properties ?? {}).map(([key, propertySchema]) => ({
    key,
    propertySchema,
    fieldComponent: getFieldComponent(propertySchema, components),
  }));
</script>

<Wrap {schema} component={components.wrapper} errors={getErrorTreeAtPath($errorStore, path)}>
  {#each entries as { key, propertySchema, fieldComponent } (key)}
    <svelte:component
      this={getComponentFromContainer(fieldComponent) as never}
      {form}
      schema={propertySchema}
      {components}
      path={[...path, key]}
      props={getProps(propertySchema, fieldComponent)} />
  {/each}
</Wrap>
