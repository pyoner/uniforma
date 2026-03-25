<script lang="ts">
  import { defaultValue } from "../../helpers.ts";
  import type { FieldProps, Props } from "../../types.ts";
  import Wrap from "../helpers/Wrap.svelte";

  let {
    form,
    schema,
    components,
    path,
    props = {},
  }: FieldProps<number> = $props();

  let currentValue = $state<number | null | undefined>(undefined);
  let fieldErrors = $state<readonly string[]>([]);

  $effect(() => {
    const field = form.field(path);
    const unsubscribeValue = field.$value.subscribe((nextValue) => {
      currentValue = nextValue as number | null | undefined;
    });
    const unsubscribeErrors = field.$errors.subscribe((nextErrors) => {
      fieldErrors = nextErrors;
    });

    return () => {
      unsubscribeValue();
      unsubscribeErrors();
    };
  });

  $effect(() => {
    if (currentValue == null) {
      const nextValue = defaultValue<number>(schema.raw, currentValue ?? null);
      if (nextValue != null) {
        void form.setPathValue(path, nextValue);
      }
    }
  });

  function updateValue(nextValue: string) {
    void form.setPathValue(path, nextValue === "" ? undefined : Number(nextValue));
  }
</script>

<Wrap {schema} component={components.wrapper} errors={fieldErrors}>
  <input
    type="number"
    step={schema.kind === "integer"
      ? "1"
      : String(((props as Props).step as string | undefined) ?? "any")}
    value={currentValue ?? ""}
    oninput={(event) =>
      updateValue((event.currentTarget as HTMLInputElement).value)}
    onblur={() => void form.touch(path)}
  />
</Wrap>
