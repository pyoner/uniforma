<script lang="ts">
  import { resolveSchemaKind } from "@uniforma/core";

  import type { FieldProps, Props } from "../../types.ts";
  import Wrap from "../helpers/Wrap.svelte";

  let { form, schema, components, path, props = {} }: FieldProps = $props();

  const currentValue = $derived(
    form.getFieldInput(path) as string | number | null | undefined,
  );
  const fieldErrors = $derived(form.getFieldErrors(path));
  const schemaKind = $derived(resolveSchemaKind(schema));

  function updateValue(nextValue: string) {
    if (nextValue === "") {
      void form.setFieldValue(path, undefined);
      return;
    }

    const parsedValue = Number(nextValue);
    void form.setFieldValue(
      path,
      Number.isNaN(parsedValue) ? nextValue : parsedValue,
    );
  }
</script>

<Wrap {schema} component={components.wrapper} errors={fieldErrors}>
  <input
    type="number"
    name={path}
    step={schemaKind === "integer"
      ? "1"
      : String(((props as Props).step as string | undefined) ?? "any")}
    value={currentValue ?? ""}
    oninput={(event) =>
      updateValue((event.currentTarget as HTMLInputElement).value)}
    onblur={() => void form.handleEvent("blur")}
  />
</Wrap>
