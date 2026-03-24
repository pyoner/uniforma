<script lang="ts">
  import {
    createProps,
    defaultValue,
    getAtPath,
    getErrorTreeAtPath,
  } from "../../helpers.ts";
  import Wrap from "../helpers/Wrap.svelte";

  const p = createProps<boolean>();
  export let form = p.form;
  export let schema = p.schema;
  export let components = p.components;
  export let path = p.path;

  $: valueStore = form.value;
  $: errorStore = form.errors;
  $: currentValue = getAtPath($valueStore, path) as boolean | null | undefined;

  $: if (schema && currentValue == null) {
    void form.patch(
      path,
      defaultValue<boolean>(schema, currentValue ?? null) ?? false,
    );
  }
</script>

<Wrap
  {schema}
  component={components.wrapper}
  errors={getErrorTreeAtPath($errorStore, path)}
>
  <input
    type="checkbox"
    checked={Boolean(currentValue)}
    on:change={(event) =>
      void form.patch(path, (event.currentTarget as HTMLInputElement).checked)}
    on:blur={() => form.blur(path)}
  />
</Wrap>
