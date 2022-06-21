<script>
  import { Router } from "@roxi/routify";
  import { routes } from "../.routify/routes";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  /**REGISTER CHART JS*/
  import { Chart, registerables } from "./lib/chartjs/chart.esm";
  let splashscreen = true; //toggle false during development

  onMount(() => {
    Chart.register(...registerables); /**REGISTER CHARTS*/
    setTimeout(() => {
      splashscreen = false;
    }, 3000);
  }, []);
</script>

<!-- @ SPLASH SCREEN -->
{#if splashscreen}
  <div
    class="splashscreen d-flex justify-content-center align-items-center"
    out:fade={{ duration: 800 }}
  >
    <div class="text-center">
      <h1 class="text-uppercase text-white-lm">Welcome</h1>
      <div class="progress">
        <div class="progress-bar progress-bar-animated w-full alt-dm" />
      </div>
      <br />
      <h5 class="text-primary-lm">
        Inventory Management Software. Made ♥️ NEONZONE
      </h5>
    </div>
  </div>
{/if}
<!-- @ MAIN ROUTES -->
<Router {routes} />

<style>
  .splashscreen {
    position: absolute;
    z-index: 1000;
    top: 0;
    right: 0;
    height: 100%;
    width: 100%;
    background-color: rgba(130, 130, 130, 0.5);
    backdrop-filter: blur(5px);
  }
</style>
