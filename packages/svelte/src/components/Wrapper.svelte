<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    title = undefined,
    description = undefined,
    errors = [],
    isFieldset = false,
    children,
  }: {
    title?: string | undefined;
    description?: string | undefined;
    errors?: readonly string[];
    isFieldset?: boolean;
    children?: Snippet;
  } = $props();
</script>

{#if isFieldset}
  <fieldset class="uniforma-fieldset">
    {#if title || description}
      <div class="uniforma-heading">
        {#if title}
          <legend>{title}</legend>
        {/if}
        {#if description}
          <p>{description}</p>
        {/if}
      </div>
    {/if}

    {@render children?.()}

    {#if errors.length > 0}
      <ul class="uniforma-errors">
        {#each errors as message (message)}
          <li>{message}</li>
        {/each}
      </ul>
    {/if}
  </fieldset>
{:else}
  <div class="uniforma-field">
    {#if title || description}
      <div class="uniforma-heading">
        <div>
          {#if title}
            <div>{title}</div>
          {/if}
          {#if description}
            <p>{description}</p>
          {/if}
        </div>
      </div>
    {/if}

    {@render children?.()}

    {#if errors.length > 0}
      <ul class="uniforma-errors">
        {#each errors as message (message)}
          <li>{message}</li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}
