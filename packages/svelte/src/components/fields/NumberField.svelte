<script lang="ts">
  import { createProps, defaultValue, getAtPath, getErrorTreeAtPath } from "../../helpers.ts";
  import Wrap from "../helpers/Wrap.svelte";

  const p = createProps<number>();
  export let form = p.form;
  export let schema = p.schema;
  export let components = p.components;
  export let path = p.path;
  export let props = p.props;

  $: valueStore = form.value;
  $: errorStore = form.errors;
  $: currentValue = getAtPath($valueStore, path) as number | null | undefined;

  $: if (schema && currentValue == null) {
    const nextValue = defaultValue<number>(schema, currentValue ?? null);
    if (nextValue != null) {
      void form.patch(path, nextValue);
    }
  }

  function updateValue(nextValue: string) {
    void form.patch(path, nextValue === "" ? undefined : Number(nextValue));
  }
</script>

<Wrap {schema} component={components.wrapper} errors={getErrorTreeAtPath($errorStore, path)}>
  <input
    type="number"
    step={schema.kind === "integer" ? "1" : String((props?.step as string | undefined) ?? "any")}
    value={currentValue ?? ""}
    on:input={(event) => updateValue((event.currentTarget as HTMLInputElement).value)}
    on:blur={() => form.blur(path)} />
</Wrap>
