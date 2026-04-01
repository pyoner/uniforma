<script lang="ts">
  import { appendJsonPointer } from "@uniforma/core";

  import {
    getComponentFromContainer,
    getFieldComponent,
    getProps,
  } from "../../helpers.ts";
  import type { FieldProps } from "../../types.ts";
  import Wrap from "../helpers/Wrap.svelte";

  let { form, schema, components, path }: FieldProps = $props();

  const fieldErrors = $derived(form.getFieldErrors(path));

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
        path={appendJsonPointer(path, key)}
        props={fieldProps}
      />
    {/each}
</Wrap>
