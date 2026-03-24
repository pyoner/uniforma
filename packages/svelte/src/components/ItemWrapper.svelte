<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    children,
    controls,
  }: {
    children?: Snippet;
    controls?: Snippet;
  } = $props();
</script>

<div class="uniforma-array-row">
  {@render children?.()}
  {@render controls?.()}
</div>
