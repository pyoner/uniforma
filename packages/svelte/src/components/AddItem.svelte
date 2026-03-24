<script lang="ts">
  import type { Props } from "../types.ts";

  let {
    addItem = () => undefined,
    props = {},
  }: {
    addItem?: () => void;
    props?: Props;
  } = $props();
</script>

<button type="button" {...props} onclick={addItem}>Add item</button>
