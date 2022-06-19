<script>
  import Graph from "./Graph.svelte";
</script>

<div class="card bg-light-lm d-flex flex-column flex-md-row" style="gap: 1em;">
  <Graph {...$$props} />
  <slot />
</div>
