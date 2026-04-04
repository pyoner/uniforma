<script lang="ts">
  import type { FieldProps } from "../../types.ts";
  import Wrap from "../helpers/Wrap.svelte";

  let { form, schema, components, path, initialValue }: FieldProps = $props();

  const fieldErrors = $derived(form.getFieldErrors(path));
</script>

<Wrap {schema} component={components.wrapper} errors={fieldErrors}>
  <input
    type="checkbox"
    name={path}
    defaultChecked={Boolean(initialValue)}
    onchange={() => void form.handleEvent("change")}
    onblur={() => void form.handleEvent("blur")}
  />
</Wrap>
