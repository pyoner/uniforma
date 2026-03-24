<script lang="ts">
  import {
    createProps,
    defaultValue,
    getAtPath,
    getErrorTreeAtPath,
  } from "../../../helpers.ts";
  import Wrap from "../../helpers/Wrap.svelte";

  const p = createProps<string>();
  export let form = p.form;
  export let schema = p.schema;
  export let components = p.components;
  export let path = p.path;

  $: valueStore = form.value;
  $: errorStore = form.errors;
  $: currentValue = getAtPath($valueStore, path) as string | null | undefined;

  $: if (schema && currentValue == null) {
    const nextValue = defaultValue<string>(schema, currentValue ?? null);
    if (nextValue != null) {
      void form.patch(path, nextValue);
    }
  }
</script>

<Wrap
  {schema}
  component={components.wrapper}
  errors={getErrorTreeAtPath($errorStore, path)}
>
  <textarea
    value={currentValue ?? ""}
    on:input={(event) =>
      void form.patch(path, (event.currentTarget as HTMLTextAreaElement).value)}
    on:blur={() => form.blur(path)}
  ></textarea>
</Wrap>
