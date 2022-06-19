<script>
  import { goto } from "@roxi/routify";
  export let title = "Default Title";
  export let hasBack = undefined;
  export let params = {};
</script>

<div
  class="d-flex align-items-center justify-content-between flex-column flex-sm-row"
>
  {#if hasBack}
    <button
      class="btn"
      on:click|preventDefault={() => $goto(hasBack || "../.", { ...params })}
    >
      Back
    </button>
    <div class="flex-fill text-center content-title">
      <div class="d-flex align-items-center justify-content-center">
        <slot name="icon" />
        &nbsp;
        {title}
      </div>
    </div>
  {:else}
    <div class="content-title">
      <div class="d-flex align-items-center">
        <slot name="icon" />
        &nbsp;
        {title}
      </div>
    </div>
  {/if}
  <slot />
</div>
