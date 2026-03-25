<script lang="ts">
  import { joinPath } from "@uniforma/core";

  import {
    getComponentFromContainer,
    getFieldComponent,
    getProps,
  } from "../../helpers.ts";
  import type { FieldProps } from "../../types.ts";
  import Wrap from "../helpers/Wrap.svelte";

  let { form, schema, components, path }: FieldProps = $props();

  let fieldErrors = $state<readonly string[]>([]);

  $effect(() => {
    const field = form.field(path);
    const unsubscribeErrors = field.$errors.subscribe((nextErrors) => {
      fieldErrors = nextErrors;
    });

    return () => {
      unsubscribeErrors();
    };
  });

  const entries = $derived(
    Object.entries(schema.properties ?? {}).map(([key, propertySchema]) => ({
      key,
      propertySchema,
      FieldComponent: getComponentFromContainer(
        getFieldComponent(propertySchema, components),
      ),
      fieldProps: getProps(
        propertySchema,
        getFieldComponent(propertySchema, components),
      ),
    })),
  );
</script>

<Wrap {schema} component={components.wrapper} errors={fieldErrors}>
  {#each entries as { key, propertySchema, FieldComponent, fieldProps } (key)}
    <FieldComponent
      {form}
      schema={propertySchema}
      {components}
      path={joinPath(path, key)}
      props={fieldProps}
    />
  {/each}
</Wrap>
