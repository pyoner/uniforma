<script lang="ts">
  import type { Snippet } from "svelte";

  import { getComponent, getFieldErrors, getProps } from "../../helpers.ts";
  import type { NormalizedSchemaNode } from "@uniforma/core";
  import type { SvelteComponentProps } from "../../types.ts";

  let {
    schema,
    component,
    errors = null,
    children,
  }: {
    schema: NormalizedSchemaNode;
    component: SvelteComponentProps;
    errors?: readonly string[] | null;
    children?: Snippet;
  } = $props();

  const WrapperComponent = $derived(getComponent(component));
  const wrapperProps = $derived(getProps(component));
  const fieldErrors = $derived(getFieldErrors(errors));
</script>

<WrapperComponent
  {...wrapperProps}
  title={schema.title}
  description={schema.description}
  isFieldset={schema.kind === "object" || schema.kind === "array"}
  errors={fieldErrors}
>
  {@render children?.()}
</WrapperComponent>
