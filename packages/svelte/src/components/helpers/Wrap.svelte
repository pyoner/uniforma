<script lang="ts">
  import type { Snippet } from "svelte";

  import { resolveSchemaKind, type JSONSchema } from "@uniforma/core";
  import { getComponent, getFieldErrors, getProps } from "../../helpers.ts";
  import type { SvelteComponentProps } from "../../types.ts";

  let {
    schema,
    component,
    errors = null,
    children,
  }: {
    schema: JSONSchema;
    component: SvelteComponentProps;
    errors?: readonly string[] | null;
    children?: Snippet;
  } = $props();

  const WrapperComponent = $derived(getComponent(component));
  const wrapperProps = $derived(getProps(component));
  const fieldErrors = $derived(getFieldErrors(errors));
  const schemaKind = $derived(resolveSchemaKind(schema));
</script>

<WrapperComponent
  {...wrapperProps}
  title={schema.title}
  description={schema.description}
  isFieldset={schemaKind === "object" || schemaKind === "array"}
  errors={fieldErrors}
>
  {@render children?.()}
</WrapperComponent>
