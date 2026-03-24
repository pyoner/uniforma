<script lang="ts">
  import { defaultValue } from "../../../helpers.ts";
  import type { FieldProps } from "../../../types.ts";
  import Wrap from "../../helpers/Wrap.svelte";

  let { form, schema, components, path }: FieldProps<string> = $props();

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
</script>

<Wrap {schema} component={components.wrapper} errors={fieldErrors}>
  <textarea
    value={currentValue ?? ""}
    oninput={(event) =>
      void form.patch(path, (event.currentTarget as HTMLTextAreaElement).value)}
    onblur={() => void form.blur(path)}
  ></textarea>
</Wrap>
