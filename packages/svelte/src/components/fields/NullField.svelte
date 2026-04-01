<script lang="ts">
  import type { FieldProps } from "../../types.ts";
  import Wrap from "../helpers/Wrap.svelte";

  let { form, schema, components, path }: FieldProps = $props();

  const currentValue = $derived(form.getFieldValue(path));
  const fieldErrors = $derived(form.getFieldErrors(path));
</script>

<Wrap {schema} component={components.wrapper} errors={fieldErrors}>
  <input
    type="checkbox"
    name={path}
    checked={currentValue === null}
    onchange={(event) =>
      void form.setFieldValue(
        path,
        (event.currentTarget as HTMLInputElement).checked ? null : undefined,
      )}
    onblur={() => void form.handleEvent("blur")}
  />
</Wrap>
