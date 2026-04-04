<script lang="ts">
  import { resolveSchemaKind } from "@uniforma/core";

  import type { FieldProps, Props } from "../../types.ts";
  import Wrap from "../helpers/Wrap.svelte";

  let {
    form,
    schema,
    components,
    path,
    initialValue,
    props = {},
  }: FieldProps = $props();

  const fieldErrors = $derived(form.getFieldErrors(path));
  const schemaKind = $derived(resolveSchemaKind(schema));
</script>

<Wrap {schema} component={components.wrapper} errors={fieldErrors}>
  <input
    type="number"
    name={path}
    step={schemaKind === "integer"
      ? "1"
      : String(((props as Props).step as string | undefined) ?? "any")}
    defaultValue={initialValue === undefined ? "" : String(initialValue)}
    oninput={() => void form.handleEvent("change")}
    onblur={() => void form.handleEvent("blur")}
  />
</Wrap>
