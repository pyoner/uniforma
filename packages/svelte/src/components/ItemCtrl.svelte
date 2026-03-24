<script lang="ts">
  let {
    moveUp = () => undefined,
    moveDown = () => undefined,
    remove = () => undefined,
    position = 0,
    length = 0,
  }: {
    moveUp?: () => void;
    moveDown?: () => void;
    remove?: () => void;
    position?: number;
    length?: number;
  } = $props();
</script>

<div class="uniforma-array-actions">
  <button type="button" onclick={remove}>Remove</button>
  <button type="button" disabled={position <= 0} onclick={moveUp}>Up</button>
  <button type="button" disabled={position >= length - 1} onclick={moveDown}
    >Down</button
  >
</div>
