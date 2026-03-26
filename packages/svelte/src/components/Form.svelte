<script lang="ts">
  import {
    createFormStore,
    type FailureResult,
    getMessagesAtPath,
    type FormStore,
    type InferInput,
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
    FormRenderState,
  } from "../types.ts";
  import { defaultFormComponents as componentsFallback } from "./defaults.ts";

  let {
    schema,
    value = undefined,
    components = componentsFallback,
    validateOn = undefined,
    onValueChange,
    onSubmit,
    onReset,
    controls: controlsSnippet,
  }: FormComponentProps = $props();

  let form = $state<FormStore<UniformaSchema> | null>(null);
  let currentValue = $state<InferInput<UniformaSchema> | undefined>(undefined);
  let currentErrors = $state<FailureResult | null>(null);
  let currentValid = $state(true);
  let currentValidating = $state(false);
  let currentSubmitting = $state(false);
  let lastSyncedPropValueKey = $state<string | undefined>(undefined);

  $effect.pre(() => {
    if (!form) {
      form = createFormStore({
        schema,
        ...(value !== undefined ? { initialValue: value } : {}),
        ...(validateOn !== undefined ? { validateOn } : {}),
      });
      currentValue = value as InferInput<UniformaSchema> | undefined;
      lastSyncedPropValueKey = toValueKey(value);
    }
  });

  $effect(() => {
    if (!form) {
      return;
    }

    const unsubscribeValue = form.$value.subscribe((nextValue) => {
      const nextValueKey = toValueKey(nextValue);
      currentValue = nextValue as InferInput<UniformaSchema>;

      if (nextValueKey === lastSyncedPropValueKey) {
        return;
      }

      onValueChange?.(nextValue as InferInput<UniformaSchema>);
    });
    const unsubscribeErrors = form.$errors.subscribe((nextErrors) => {
      currentErrors = nextErrors;
    });
    const unsubscribeValid = form.$valid.subscribe((nextValid) => {
      currentValid = nextValid;
    });
    const unsubscribeValidating = form.$validating.subscribe(
      (nextValidating) => {
        currentValidating = nextValidating;
      },
    );
    const unsubscribeSubmitting = form.$submitting.subscribe(
      (nextSubmitting) => {
        currentSubmitting = nextSubmitting;
      },
    );

    return () => {
      unsubscribeValue();
      unsubscribeErrors();
      unsubscribeValid();
      unsubscribeValidating();
      unsubscribeSubmitting();
    };
  });

  const normalizedSchema = $derived(form?.normalizedSchema ?? null);
  const rootField = $derived(
    normalizedSchema ? getFieldComponent(normalizedSchema, components) : null,
  );
  const LayoutComponent = $derived(
    getComponentFromContainer(components.layout),
  );
  const layoutProps = $derived(getPropsFromContainer(components.layout));
  const RootComponent = $derived(
    rootField ? getComponentFromContainer(rootField) : null,
  );
  const rootProps = $derived(
    normalizedSchema && rootField ? getProps(normalizedSchema, rootField) : {},
  );
  const renderState = $derived<FormRenderState>({
    errors: currentErrors,
    rootErrors: getMessagesAtPath(currentErrors, ""),
    valid: currentValid,
    validating: currentValidating,
    submitting: currentSubmitting,
  });

  $effect(() => {
    const nextPropValueKey = toValueKey(value);

    if (
      form &&
      value !== undefined &&
      nextPropValueKey !== toValueKey(currentValue)
    ) {
      lastSyncedPropValueKey = nextPropValueKey;
      void form.setValue(value as InferInput<UniformaSchema>);
    }
  });

  async function submit() {
    if (!form) {
      return;
    }

    const result = await form.submit();
    if (result.success) {
      await onSubmit?.(result.value);
    }
  }

  function reset() {
    if (!form) {
      return;
    }

    form.reset();
    if (currentValue !== undefined) {
      onReset?.(currentValue);
    }
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
      {#if form && normalizedSchema && RootComponent}
        <RootComponent
          {form}
          schema={normalizedSchema}
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
