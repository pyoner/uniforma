<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import {
    getErrorsAtPath,
    type InferInput,
    type UniformaSchema,
  } from "@uniforma/core";

  import { createForm, type ValidationMode } from "../controller.ts";
  import {
    getComponentFromContainer,
    getFieldComponent,
    getProps,
    getPropsFromContainer,
  } from "../helpers.ts";
  import type { FormComponents } from "../types.ts";
  import { defaultFormComponents as componentsFallback } from "./defaults.ts";

  export let schema: UniformaSchema = undefined as never;
  export let value: InferInput<typeof schema> | undefined = undefined;
  export let components: FormComponents = componentsFallback;
  export let validateOn:
    | ValidationMode
    | readonly ValidationMode[]
    | undefined = undefined;

  const dispatch = createEventDispatcher<{
    submit: unknown;
    reset: unknown;
  }>();

  const form = createForm(schema, {
    initialValue: value,
    validateOn,
  });
  const valueStore = form.value;
  const errorStore = form.errors;
  const validStore = form.valid;
  const validatingStore = form.validating;
  const submittingStore = form.submitting;

  $: rootField = getFieldComponent(form.normalizedSchema, components);

  $: value = $valueStore;

  async function submit() {
    const result = await form.submit();
    if (result.success) {
      dispatch("submit", result.value);
    }
  }

  function reset() {
    form.reset();
    dispatch("reset", value);
  }
</script>

<form on:submit|preventDefault={submit} on:reset|preventDefault={reset}>
  <svelte:component
    this={getComponentFromContainer(components.layout) as never}
    {...getPropsFromContainer(components.layout)}
  >
    <div slot="fields">
      <svelte:component
        this={getComponentFromContainer(rootField) as never}
        {form}
        schema={form.normalizedSchema}
        {components}
        path={[]}
        props={getProps(form.normalizedSchema, rootField)}
      />
    </div>

    <div slot="ctrl">
      <slot
        errors={$errorStore}
        rootErrors={getErrorsAtPath($errorStore, [])}
        valid={$validStore}
        validating={$validatingStore}
        submitting={$submittingStore}
      />
    </div>
  </svelte:component>
</form>
