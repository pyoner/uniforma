<script lang="ts">
  import { createProps, getAtPath, getErrorTreeAtPath } from "../../helpers.ts";
  import Wrap from "../helpers/Wrap.svelte";

  const p = createProps<null>();
  export let form = p.form;
  export let schema = p.schema;
  export let components = p.components;
  export let path = p.path;

  $: valueStore = form.value;
  $: errorStore = form.errors;
  $: currentValue = getAtPath($valueStore, path);
</script>

<Wrap
  {schema}
  component={components.wrapper}
  errors={getErrorTreeAtPath($errorStore, path)}
>
  <input
    type="checkbox"
    checked={currentValue === null}
    on:change={(event) =>
      void form.patch(
        path,
        (event.currentTarget as HTMLInputElement).checked ? null : undefined,
      )}
    on:blur={() => form.blur(path)}
  />
</Wrap>
