<script lang="ts">
  import type { StandardSchemaV1 } from "@standard-schema/spec";
  import {
    cloneValue,
    createFormController,
    getMessagesAtPointer,
    hasErrors,
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
  import { readFormValue } from "../dom.ts";
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
  let formElement = $state<HTMLFormElement | null>(null);
  let currentErrors = $state<StandardSchemaV1.FailureResult | null>(null);
  let status = $state<FormStatus>("idle");
  let renderVersion = $state(0);
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
    currentErrors = null;
    status = "idle";
    renderVersion += 1;
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
          errors: currentErrors,
          status,
          getFieldErrors(pointer) {
            return getMessagesAtPointer(currentErrors, pointer);
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

    currentErrors = null;
    status = "idle";
    renderVersion += 1;
    onReset?.(
      cloneValue(controller.initialValue) as
        | StandardSchemaV1.InferInput<UniformaSchema>
        | undefined,
    );
  }

  async function handleEvent(event: "blur" | "change" | "submit") {
    if (!controller) {
      return;
    }

    const nextValue = readCurrentValue();

    if (event === "change") {
      onValueChange?.(
        nextValue as StandardSchemaV1.InferInput<UniformaSchema> | undefined,
      );
    }

    if (!controller.shouldValidate(event)) {
      return;
    }

    await validateFields(event, nextValue);
  }

  async function validateFields(
    event: "blur" | "change" | "submit",
    value = readCurrentValue(),
  ) {
    if (!controller) {
      throw new Error("controller is not ready");
    }

    status = event === "submit" ? "submitting" : "validating";
    const result = await controller.validate(value);
    currentErrors = result.issues ? result : null;
    status = "idle";
    return result;
  }

  function readCurrentValue(): unknown {
    if (!controller || !formElement) {
      return cloneValue(controller?.initialValue);
    }

    return readFormValue(formElement, controller.jsonSchema);
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
  bind:this={formElement}
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
        {#key renderVersion}
          <RootComponent
            {form}
            schema={jsonSchema}
            {components}
            path=""
            initialValue={controller?.initialValue}
            props={rootProps}
          />
        {/key}
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
