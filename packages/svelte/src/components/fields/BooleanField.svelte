<script lang="ts">
  import { defaultValue } from "../../helpers.ts";
  import type { FieldProps } from "../../types.ts";
  import Wrap from "../helpers/Wrap.svelte";

  let { form, schema, components, path }: FieldProps<boolean> = $props();

  let currentValue = $state<boolean | null | undefined>(undefined);
  let fieldErrors = $state<readonly string[]>([]);

  $effect(() => {
    const field = form.field(path);
    const unsubscribeValue = field.value.subscribe((nextValue) => {
      currentValue = nextValue as boolean | null | undefined;
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
      void form.patch(
        path,
        defaultValue<boolean>(schema.raw, currentValue ?? null) ?? false,
      );
    }
  });
</script>

<Wrap {schema} component={components.wrapper} errors={fieldErrors}>
  <input
    type="checkbox"
    checked={Boolean(currentValue)}
    onchange={(event) =>
      void form.patch(path, (event.currentTarget as HTMLInputElement).checked)}
    onblur={() => void form.blur(path)}
  />
</Wrap>
