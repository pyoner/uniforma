<script lang="ts">
  import { getEnumValues, resolveSchemaKind } from "@uniforma/core";

  import type { FieldProps } from "../../types.ts";
  import Wrap from "../helpers/Wrap.svelte";

  let { form, schema, components, path }: FieldProps = $props();

  const currentValue = $derived(
    form.getFieldInput(path) as string | null | undefined,
  );
  const fieldErrors = $derived(form.getFieldErrors(path));
  const schemaKind = $derived(resolveSchemaKind(schema));
  const enumValues = $derived(getEnumValues(schema) ?? []);

  function updateValue(nextValue: string) {
    void form.setFieldValue(path, nextValue);
  }
</script>

<Wrap {schema} component={components.wrapper} errors={fieldErrors}>
  {#if schemaKind === "enum" && enumValues.length > 0}
    <select
      name={path}
      value={String(currentValue ?? "")}
      onchange={(event) =>
        updateValue((event.currentTarget as HTMLSelectElement).value)}
      onblur={() => void form.handleEvent("blur")}
    >
      {#each enumValues as option (String(option))}
        <option value={String(option)}>{String(option)}</option>
      {/each}
    </select>
  {:else if schema.format === "date-time"}
    <input
      type="datetime-local"
      name={path}
      value={currentValue ?? ""}
      oninput={(event) =>
        updateValue((event.currentTarget as HTMLInputElement).value)}
      onblur={() => void form.handleEvent("blur")}
    />
  {:else if schema.format === "date"}
    <input
      type="date"
      name={path}
      value={currentValue ?? ""}
      oninput={(event) =>
        updateValue((event.currentTarget as HTMLInputElement).value)}
      onblur={() => void form.handleEvent("blur")}
    />
  {:else if schema.format === "time"}
    <input
      type="time"
      name={path}
      value={currentValue ?? ""}
      oninput={(event) =>
        updateValue((event.currentTarget as HTMLInputElement).value)}
      onblur={() => void form.handleEvent("blur")}
    />
  {:else if schema.format === "email"}
    <input
      type="email"
      name={path}
      value={currentValue ?? ""}
      oninput={(event) =>
        updateValue((event.currentTarget as HTMLInputElement).value)}
      onblur={() => void form.handleEvent("blur")}
    />
  {:else if schema.format === "url"}
    <input
      type="url"
      name={path}
      value={currentValue ?? ""}
      oninput={(event) =>
        updateValue((event.currentTarget as HTMLInputElement).value)}
      onblur={() => void form.handleEvent("blur")}
    />
  {:else}
    <input
      type="text"
      name={path}
      value={currentValue ?? ""}
      oninput={(event) =>
        updateValue((event.currentTarget as HTMLInputElement).value)}
      onblur={() => void form.handleEvent("blur")}
    />
  {/if}
</Wrap>
