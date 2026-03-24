<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    fields,
    controls,
  }: {
    fields?: Snippet;
    controls?: Snippet;
  } = $props();
</script>

{@render fields?.()}
{@render controls?.()}
