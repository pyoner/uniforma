<script lang="ts">
  import { fieldName } from "../../helpers.ts";
  import type { FieldProps, Props } from "../../types.ts";
  import Wrap from "../helpers/Wrap.svelte";

  let {
    form,
    schema,
    components,
    path,
    props = {},
  }: FieldProps<number> = $props();

  const currentValue = $derived(form.getFieldInput(path) as string | number | null | undefined);
  const fieldErrors = $derived(form.getFieldErrors(path));

  function updateValue(nextValue: string) {
    void form.setFieldValue(path, nextValue === "" ? undefined : nextValue);
  }
</script>

<Wrap {schema} component={components.wrapper} errors={fieldErrors}>
  <input
    type="number"
    name={fieldName(path)}
    step={schema.kind === "integer"
      ? "1"
      : String(((props as Props).step as string | undefined) ?? "any")}
    value={currentValue ?? ""}
    oninput={(event) =>
      updateValue((event.currentTarget as HTMLInputElement).value)}
    onblur={() => void form.handleEvent("blur")}
  />
</Wrap>
