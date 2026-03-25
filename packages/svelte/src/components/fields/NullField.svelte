<script lang="ts">
  import type { FieldProps } from "../../types.ts";
  import Wrap from "../helpers/Wrap.svelte";

  let { form, schema, components, path }: FieldProps<null> = $props();

  let currentValue = $state<unknown>(undefined);
  let fieldErrors = $state<readonly string[]>([]);

  $effect(() => {
    const field = form.field(path);
    const unsubscribeValue = field.$value.subscribe((nextValue) => {
      currentValue = nextValue;
    });
    const unsubscribeErrors = field.$errors.subscribe((nextErrors) => {
      fieldErrors = nextErrors;
    });

    return () => {
      unsubscribeValue();
      unsubscribeErrors();
    };
  });
</script>

<Wrap {schema} component={components.wrapper} errors={fieldErrors}>
  <input
    type="checkbox"
    checked={currentValue === null}
    onchange={(event) =>
      void form.setPathValue(
        path,
        (event.currentTarget as HTMLInputElement).checked ? null : undefined,
      )}
    onblur={() => void form.touch(path)}
  />
</Wrap>
