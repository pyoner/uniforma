<script lang="ts">
  import { fieldName } from "../../../helpers.ts";
  import type { FieldProps } from "../../../types.ts";
  import Wrap from "../../helpers/Wrap.svelte";

  let { form, schema, components, path }: FieldProps<string> = $props();

  const currentValue = $derived(form.getFieldInput(path) as string | null | undefined);
  const fieldErrors = $derived(form.getFieldErrors(path));
</script>

<Wrap {schema} component={components.wrapper} errors={fieldErrors}>
  <textarea
    name={fieldName(path)}
    value={currentValue ?? ""}
    oninput={(event) =>
      void form.setFieldValue(path, (event.currentTarget as HTMLTextAreaElement).value)}
    onblur={() => void form.handleEvent("blur")}
  ></textarea>
</Wrap>
