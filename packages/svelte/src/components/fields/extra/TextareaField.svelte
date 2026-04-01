<script lang="ts">
  import type { FieldProps } from "../../../types.ts";
  import Wrap from "../../helpers/Wrap.svelte";

  let { form, schema, components, path }: FieldProps = $props();

  const currentValue = $derived(form.getFieldInput(path) as string | null | undefined);
  const fieldErrors = $derived(form.getFieldErrors(path));
</script>

<Wrap {schema} component={components.wrapper} errors={fieldErrors}>
  <textarea
    name={path}
    value={currentValue ?? ""}
    oninput={(event) =>
      void form.setFieldValue(path, (event.currentTarget as HTMLTextAreaElement).value)}
    onblur={() => void form.handleEvent("blur")}
  ></textarea>
</Wrap>
