<script lang="ts">
  import { fieldName } from "../../helpers.ts";
  import type { FieldProps } from "../../types.ts";
  import Wrap from "../helpers/Wrap.svelte";

  let { form, schema, components, path }: FieldProps<boolean> = $props();

  const currentValue = $derived(Boolean(form.getFieldValue(path)));
  const fieldErrors = $derived(form.getFieldErrors(path));
</script>

<Wrap {schema} component={components.wrapper} errors={fieldErrors}>
  <input
    type="checkbox"
    name={fieldName(path)}
    checked={currentValue}
    onchange={(event) =>
      void form.setFieldValue(path, (event.currentTarget as HTMLInputElement).checked)}
    onblur={() => void form.handleEvent("blur")}
  />
</Wrap>
