<script lang="ts">
  export let title: string | undefined = undefined;
  export let description: string | undefined = undefined;
  export let errors: readonly string[] = [];
  export let isFieldset = false;
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

    <slot />

    {#if errors.length > 0}
      <ul class="uniforma-errors">
        {#each errors as message}
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

    <slot />

    {#if errors.length > 0}
      <ul class="uniforma-errors">
        {#each errors as message}
          <li>{message}</li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}
