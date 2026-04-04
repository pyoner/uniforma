<script lang="ts">
  import { getEnumValues, resolveSchemaKind } from "@uniforma/core";

  import type { FieldProps } from "../../types.ts";
  import Wrap from "../helpers/Wrap.svelte";

  let { form, schema, components, path, initialValue }: FieldProps = $props();

  const fieldErrors = $derived(form.getFieldErrors(path));
  const schemaKind = $derived(resolveSchemaKind(schema));
  const enumValues = $derived(getEnumValues(schema) ?? []);
</script>

<Wrap {schema} component={components.wrapper} errors={fieldErrors}>
  {#if schemaKind === "enum" && enumValues.length > 0}
    <select
      name={path}
      defaultValue={String(initialValue ?? "")}
      onchange={() => void form.handleEvent("change")}
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
      defaultValue={String(initialValue ?? "")}
      oninput={() => void form.handleEvent("change")}
      onblur={() => void form.handleEvent("blur")}
    />
  {:else if schema.format === "date"}
    <input
      type="date"
      name={path}
      defaultValue={String(initialValue ?? "")}
      oninput={() => void form.handleEvent("change")}
      onblur={() => void form.handleEvent("blur")}
    />
  {:else if schema.format === "time"}
    <input
      type="time"
      name={path}
      defaultValue={String(initialValue ?? "")}
      oninput={() => void form.handleEvent("change")}
      onblur={() => void form.handleEvent("blur")}
    />
  {:else if schema.format === "email"}
    <input
      type="email"
      name={path}
      defaultValue={String(initialValue ?? "")}
      oninput={() => void form.handleEvent("change")}
      onblur={() => void form.handleEvent("blur")}
    />
  {:else if schema.format === "url"}
    <input
      type="url"
      name={path}
      defaultValue={String(initialValue ?? "")}
      oninput={() => void form.handleEvent("change")}
      onblur={() => void form.handleEvent("blur")}
    />
  {:else}
    <input
      type="text"
      name={path}
      defaultValue={String(initialValue ?? "")}
      oninput={() => void form.handleEvent("change")}
      onblur={() => void form.handleEvent("blur")}
    />
  {/if}
</Wrap>
