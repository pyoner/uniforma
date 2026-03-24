<script lang="ts">
  import { getComponent, getFieldErrors, getProps } from "../../helpers.ts";
  import type { NormalizedSchemaNode } from "@uniforma/core";
  import type { SvelteComponentProps } from "../../types.ts";

  export let schema: NormalizedSchemaNode = undefined as never;
  export let component: SvelteComponentProps = undefined as never;
  export let errors = null;
</script>

<svelte:component
  this={getComponent(schema, component)}
  {...getProps(schema, component)}
  title={schema.title}
  description={schema.description}
  isFieldset={schema.kind === "object" || schema.kind === "array"}
  errors={getFieldErrors(errors)}
>
  <slot />
</svelte:component>
