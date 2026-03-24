<script lang="ts">
  import { defaultValue } from "../../helpers.ts";
  import type { FieldProps } from "../../types.ts";
  import Wrap from "../helpers/Wrap.svelte";

  let { form, schema, components, path }: FieldProps = $props();

  let currentValue = $state<string | null | undefined>(undefined);
  let fieldErrors = $state<readonly string[]>([]);

  $effect(() => {
    const field = form.field(path);
    const unsubscribeValue = field.value.subscribe((nextValue) => {
      currentValue = nextValue as string | null | undefined;
    });
    const unsubscribeErrors = field.errors.subscribe((nextErrors) => {
      fieldErrors = nextErrors;
    });

    return () => {
      unsubscribeValue();
      unsubscribeErrors();
    };
  });

  $effect(() => {
    if (currentValue == null) {
      const nextValue = defaultValue<string>(schema.raw, currentValue ?? null);
      if (nextValue != null) {
        void form.patch(path, nextValue);
      }
    }
  });

  function updateValue(nextValue: string) {
    void form.patch(path, nextValue);
  }
</script>

<Wrap {schema} component={components.wrapper} errors={fieldErrors}>
  {#if schema.kind === "enum" && (schema.enumValues?.length ?? 0) > 0}
    <select
      value={String(currentValue ?? "")}
      onchange={(event) =>
        updateValue((event.currentTarget as HTMLSelectElement).value)}
      onblur={() => void form.blur(path)}
    >
      {#each schema.enumValues ?? [] as option (String(option))}
        <option value={String(option)}>{String(option)}</option>
      {/each}
    </select>
  {:else if schema.format === "date-time"}
    <input
      type="datetime-local"
      value={currentValue ?? ""}
      oninput={(event) =>
        updateValue((event.currentTarget as HTMLInputElement).value)}
      onblur={() => void form.blur(path)}
    />
  {:else if schema.format === "date"}
    <input
      type="date"
      value={currentValue ?? ""}
      oninput={(event) =>
        updateValue((event.currentTarget as HTMLInputElement).value)}
      onblur={() => void form.blur(path)}
    />
  {:else if schema.format === "time"}
    <input
      type="time"
      value={currentValue ?? ""}
      oninput={(event) =>
        updateValue((event.currentTarget as HTMLInputElement).value)}
      onblur={() => void form.blur(path)}
    />
  {:else if schema.format === "email"}
    <input
      type="email"
      value={currentValue ?? ""}
      oninput={(event) =>
        updateValue((event.currentTarget as HTMLInputElement).value)}
      onblur={() => void form.blur(path)}
    />
  {:else if schema.format === "url"}
    <input
      type="url"
      value={currentValue ?? ""}
      oninput={(event) =>
        updateValue((event.currentTarget as HTMLInputElement).value)}
      onblur={() => void form.blur(path)}
    />
  {:else}
    <input
      type="text"
      value={currentValue ?? ""}
      oninput={(event) =>
        updateValue((event.currentTarget as HTMLInputElement).value)}
      onblur={() => void form.blur(path)}
    />
  {/if}
</Wrap>
