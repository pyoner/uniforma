<script lang="ts">
  import { fieldName } from "../../helpers.ts";
  import type { FieldProps } from "../../types.ts";
  import Wrap from "../helpers/Wrap.svelte";

  let { form, schema, components, path }: FieldProps = $props();

  const currentValue = $derived(form.getFieldInput(path) as string | null | undefined);
  const fieldErrors = $derived(form.getFieldErrors(path));

  function updateValue(nextValue: string) {
    void form.setFieldValue(path, nextValue);
  }
</script>

<Wrap {schema} component={components.wrapper} errors={fieldErrors}>
  {#if schema.kind === "enum" && (schema.enumValues?.length ?? 0) > 0}
    <select
      name={fieldName(path)}
      value={String(currentValue ?? "")}
      onchange={(event) =>
        updateValue((event.currentTarget as HTMLSelectElement).value)}
      onblur={() => void form.handleEvent("blur")}
    >
      {#each schema.enumValues ?? [] as option (String(option))}
        <option value={String(option)}>{String(option)}</option>
      {/each}
    </select>
  {:else if schema.format === "date-time"}
    <input
      type="datetime-local"
      name={fieldName(path)}
      value={currentValue ?? ""}
      oninput={(event) =>
        updateValue((event.currentTarget as HTMLInputElement).value)}
      onblur={() => void form.handleEvent("blur")}
    />
  {:else if schema.format === "date"}
    <input
      type="date"
      name={fieldName(path)}
      value={currentValue ?? ""}
      oninput={(event) =>
        updateValue((event.currentTarget as HTMLInputElement).value)}
      onblur={() => void form.handleEvent("blur")}
    />
  {:else if schema.format === "time"}
    <input
      type="time"
      name={fieldName(path)}
      value={currentValue ?? ""}
      oninput={(event) =>
        updateValue((event.currentTarget as HTMLInputElement).value)}
      onblur={() => void form.handleEvent("blur")}
    />
  {:else if schema.format === "email"}
    <input
      type="email"
      name={fieldName(path)}
      value={currentValue ?? ""}
      oninput={(event) =>
        updateValue((event.currentTarget as HTMLInputElement).value)}
      onblur={() => void form.handleEvent("blur")}
    />
  {:else if schema.format === "url"}
    <input
      type="url"
      name={fieldName(path)}
      value={currentValue ?? ""}
      oninput={(event) =>
        updateValue((event.currentTarget as HTMLInputElement).value)}
      onblur={() => void form.handleEvent("blur")}
    />
  {:else}
    <input
      type="text"
      name={fieldName(path)}
      value={currentValue ?? ""}
      oninput={(event) =>
        updateValue((event.currentTarget as HTMLInputElement).value)}
      onblur={() => void form.handleEvent("blur")}
    />
  {/if}
</Wrap>
