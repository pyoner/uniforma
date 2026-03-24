<script lang="ts">
  export let moveUp: () => void = () => undefined;
  export let moveDown: () => void = () => undefined;
  export let remove: () => void = () => undefined;
  export let position = 0;
  export let length = 0;
</script>

<div class="uniforma-array-actions">
  <button type="button" on:click={remove}>Remove</button>
  <button type="button" disabled={position <= 0} on:click={moveUp}>Up</button>
  <button type="button" disabled={position >= length - 1} on:click={moveDown}>Down</button>
</div>
