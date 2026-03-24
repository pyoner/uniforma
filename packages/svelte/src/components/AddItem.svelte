<script lang="ts">
  import type { Props } from "../types.ts";

  export let addItem: () => void = () => undefined;
  export let props: Props = {};
</script>

<button type="button" {...props} on:click={addItem}>Add item</button>
