<script>
  export let animateIn = false;
  export let animateOut = false;
  export let paramsIn = {};
  export let paramsOut = {};
  import { fade } from "svelte/transition";
</script>

{#if animateIn && animateOut}
  <div in:fade={paramsIn} out:fade={paramsOut}>
    <slot />
  </div>
{:else if animateIn}
  <div in:fade={paramsIn}>
    <slot />
  </div>
{:else if animateOut}
  <div out:fade={paramsOut}>
    <slot />
  </div>
{:else}
  <div in:fade out:fade>
    <slot />
  </div>
{/if}
