<script lang="ts">
  import { appendJsonPointer } from "@uniforma/core";

  import {
    getComponentFromContainer,
    getFieldComponent,
    getProps,
  } from "../../helpers.ts";
  import type { FieldProps } from "../../types.ts";
  import Wrap from "../helpers/Wrap.svelte";

  let { form, schema, components, path, initialValue }: FieldProps = $props();

  const fieldErrors = $derived(form.getFieldErrors(path));

  const entries = $derived(
    Object.entries(schema.properties ?? {})
      .filter(
        ([, propertySchema]) =>
          propertySchema && typeof propertySchema !== "boolean",
      )
      .map(([key, propertySchema]) => ({
        key,
        propertySchema,
        initialValue:
          initialValue && typeof initialValue === "object"
            ? (initialValue as Record<string, unknown>)[key]
            : undefined,
        FieldComponent: getComponentFromContainer(
          getFieldComponent(propertySchema, components),
        ),
        fieldProps: getProps(getFieldComponent(propertySchema, components)),
      })),
  );
</script>

<Wrap {schema} component={components.wrapper} errors={fieldErrors}>
  {#each entries as { key, propertySchema, initialValue, FieldComponent, fieldProps } (key)}
    <FieldComponent
      {form}
      schema={propertySchema}
      {components}
      path={appendJsonPointer(path, key)}
      {initialValue}
      props={fieldProps}
    />
  {/each}
</Wrap>
