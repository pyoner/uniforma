<script lang="ts">
  import {
    createProps,
    defaultValue,
    getAtPath,
    getErrorTreeAtPath,
  } from "../../helpers.ts";
  import Wrap from "../helpers/Wrap.svelte";

  const p = createProps<string>();
  export let form = p.form;
  export let schema = p.schema;
  export let components = p.components;
  export let path = p.path;

  $: valueStore = form.value;
  $: errorStore = form.errors;
  $: currentValue = getAtPath($valueStore, path) as string | null | undefined;

  $: if (schema && currentValue == null) {
    const nextValue = defaultValue<string>(schema, currentValue ?? null);
    if (nextValue != null) {
      void form.patch(path, nextValue);
    }
  }

  function updateValue(nextValue: string) {
    void form.patch(path, nextValue);
  }
</script>

<Wrap
  {schema}
  component={components.wrapper}
  errors={getErrorTreeAtPath($errorStore, path)}
>
  {#if schema.kind === "enum" && (schema.enumValues?.length ?? 0) > 0}
    <select
      value={String(currentValue ?? "")}
      on:change={(event) =>
        updateValue((event.currentTarget as HTMLSelectElement).value)}
      on:blur={() => form.blur(path)}
    >
      {#each schema.enumValues ?? [] as option (String(option))}
        <option value={String(option)}>{String(option)}</option>
      {/each}
    </select>
  {:else if schema.format === "date-time"}
    <input
      type="datetime-local"
      value={currentValue ?? ""}
      on:input={(event) =>
        updateValue((event.currentTarget as HTMLInputElement).value)}
      on:blur={() => form.blur(path)}
    />
  {:else if schema.format === "date"}
    <input
      type="date"
      value={currentValue ?? ""}
      on:input={(event) =>
        updateValue((event.currentTarget as HTMLInputElement).value)}
      on:blur={() => form.blur(path)}
    />
  {:else if schema.format === "time"}
    <input
      type="time"
      value={currentValue ?? ""}
      on:input={(event) =>
        updateValue((event.currentTarget as HTMLInputElement).value)}
      on:blur={() => form.blur(path)}
    />
  {:else if schema.format === "email"}
    <input
      type="email"
      value={currentValue ?? ""}
      on:input={(event) =>
        updateValue((event.currentTarget as HTMLInputElement).value)}
      on:blur={() => form.blur(path)}
    />
  {:else if schema.format === "url"}
    <input
      type="url"
      value={currentValue ?? ""}
      on:input={(event) =>
        updateValue((event.currentTarget as HTMLInputElement).value)}
      on:blur={() => form.blur(path)}
    />
  {:else}
    <input
      type="text"
      value={currentValue ?? ""}
      on:input={(event) =>
        updateValue((event.currentTarget as HTMLInputElement).value)}
      on:blur={() => form.blur(path)}
    />
  {/if}
</Wrap>
