<script lang="ts">
  import type { StandardSchemaV1 } from "@standard-schema/spec";
  import {
    cloneValue,
    createFormController,
    getMessagesAtPointer,
    getValueAtPointer,
    hasErrors,
    setValueAtPointer,
    type FormController,
    type FormStatus,
    type UniformaSchema,
  } from "@uniforma/core";

  import {
    getComponentFromContainer,
    getFieldComponent,
    getProps,
    getPropsFromContainer,
  } from "../helpers.ts";
  import type {
    FormComponentProps,
    FormComponents,
    FormRuntime,
    FormRenderState,
  } from "../types.ts";
  import { defaultFormComponents as componentsFallback } from "./defaults.ts";

  let {
    schema,
    initialValue = undefined,
    components = componentsFallback,
    validateOn = undefined,
    onValueChange,
    onSubmit,
    onReset,
    controls: controlsSnippet,
  }: FormComponentProps = $props();

  let controller = $state<FormController<UniformaSchema> | null>(null);
  let currentValue = $state<
    StandardSchemaV1.InferInput<UniformaSchema> | undefined
  >(undefined);
  let currentErrors = $state<StandardSchemaV1.FailureResult | null>(null);
  let status = $state<FormStatus>("idle");
  let lastSchema = $state<UniformaSchema | null>(null);
  let lastInitialValueKey = $state<string | undefined>(undefined);
  let lastValidateOnKey = $state<string>("submit");

  $effect(() => {
    const nextInitialValueKey = toValueKey(initialValue);
    const nextValidateOnKey = toValidateOnKey(validateOn);

    if (
      controller &&
      lastSchema === schema &&
      lastInitialValueKey === nextInitialValueKey &&
      lastValidateOnKey === nextValidateOnKey
    ) {
      return;
    }

    controller = createFormController({
      schema,
      ...(initialValue !== undefined ? { initialValue } : {}),
      ...(validateOn !== undefined ? { validateOn } : {}),
    });
    currentValue = cloneValue(controller.initialValue) as
      | StandardSchemaV1.InferInput<UniformaSchema>
      | undefined;
    currentErrors = null;
    status = "idle";
    lastSchema = schema;
    lastInitialValueKey = nextInitialValueKey;
    lastValidateOnKey = nextValidateOnKey;
  });

  const jsonSchema = $derived(controller?.jsonSchema ?? null);
  const rootField = $derived(
    jsonSchema ? getFieldComponent(jsonSchema, components) : null,
  );
  const LayoutComponent = $derived(
    getComponentFromContainer(components.layout),
  );
  const layoutProps = $derived(getPropsFromContainer(components.layout));
  const RootComponent = $derived(
    rootField ? getComponentFromContainer(rootField) : null,
  );
  const rootProps = $derived(
    jsonSchema && rootField ? getProps(rootField) : {},
  );
  const form = $derived<FormRuntime<UniformaSchema> | null>(
    controller
      ? {
          controller,
          value: currentValue,
          errors: currentErrors,
          status,
          getFieldErrors(pointer) {
            return getMessagesAtPointer(currentErrors, pointer);
          },
          getFieldInput(pointer) {
            return getValueAtPointer(currentValue, pointer);
          },
          getFieldValue(pointer) {
            return getValueAtPointer(currentValue, pointer);
          },
          setFieldValue(pointer, value) {
            return updateFieldValue(pointer, value);
          },
          handleEvent(event) {
            return handleEvent(event);
          },
          reset() {
            reset();
          },
        }
      : null,
  );
  const renderState = $derived<FormRenderState>({
    errors: currentErrors,
    rootErrors: getMessagesAtPointer(currentErrors, ""),
    valid: !hasErrors(currentErrors),
    status,
  });

  async function submit() {
    if (!controller) {
      return;
    }

    const result = await validateFields("submit");
    if (!result.issues) {
      await onSubmit?.(result.value);
    }
  }

  function reset() {
    if (!controller) {
      return;
    }

    const nextValue = cloneValue(controller.initialValue) as
      | StandardSchemaV1.InferInput<UniformaSchema>
      | undefined;
    currentValue = nextValue;
    currentErrors = null;
    status = "idle";
    onReset?.(nextValue);
  }

  async function updateFieldValue(pointer: string, value: unknown) {
    if (!controller) {
      return;
    }

    const nextValue = setValueAtPointer(currentValue, pointer, value) as
      | StandardSchemaV1.InferInput<UniformaSchema>
      | undefined;
    currentValue = nextValue;
    onValueChange?.(nextValue);
    await handleEvent("change");
  }

  async function handleEvent(event: "blur" | "change" | "submit") {
    if (!controller || !controller.shouldValidate(event)) {
      return;
    }

    await validateFields(event);
  }

  async function validateFields(event: "blur" | "change" | "submit") {
    if (!controller) {
      throw new Error("controller is not ready");
    }

    status = event === "submit" ? "submitting" : "validating";
    const result = await controller.validate(currentValue);
    currentErrors = result.issues ? result : null;
    status = "idle";
    return result;
  }

  function toValidateOnKey(
    nextValue: FormComponentProps["validateOn"],
  ): string {
    if (nextValue === undefined) {
      return "submit";
    }

    return JSON.stringify(Array.isArray(nextValue) ? nextValue : [nextValue]);
  }

  function toValueKey(nextValue: unknown): string | undefined {
    if (nextValue === undefined) {
      return undefined;
    }

    return JSON.stringify($state.snapshot(nextValue));
  }
</script>

<form
  onsubmit={(event) => {
    event.preventDefault();
    void submit();
  }}
  onreset={(event) => {
    event.preventDefault();
    reset();
  }}
>
  <LayoutComponent {...layoutProps}>
    {#snippet fields()}
      {#if form && jsonSchema && RootComponent}
        <RootComponent
          {form}
          schema={jsonSchema}
          {components}
          path=""
          props={rootProps}
        />
      {/if}
    {/snippet}

    {#snippet controls()}
      {#if controlsSnippet}
        {@render controlsSnippet(renderState)}
      {:else}
        <div class="uniforma-form-controls">
          <button type="reset">Reset</button>
          <button type="submit">Submit</button>
        </div>
      {/if}
    {/snippet}
  </LayoutComponent>
</form>
