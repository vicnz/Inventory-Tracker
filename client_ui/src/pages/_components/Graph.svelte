<script>
  import { onMount } from "svelte";
  import { Chart } from "../../lib/chartjs/chart.esm";
  import { genRandom } from "../_components/utils";

  export let type = "line";
  export let labels = [];
  export let line = {};
  export let bar = {};
  export let pie = {};
  export let legend = {};
  export let layout = {};
  export let animation = {};
  export let tooltip = {};
  export let scales = {};
  export let options = {};
  export let data = []; /*{ label: "default label", data: [] } */

  /**VARIABLES*/
  let canvas = null;
  let chart = null;

  /**
   * TODO
   * function genRandomBackground(length) {
    let colorList = [];
    for (let i = 0; i < length; i++) {
      colorList.push(
        `rgb(${genRandom({ max: 255 })},${genRandom({
          max: 255,
        })},${genRandom({ max: 255 })},)`
      );
    }

    return colorList;
  }
   */

  onMount(() => {
    /**MULTIPLE DATASETS*/
    const chartData = data.map((item, index) => {
      return {
        backgroundColor: "lightgrey",
        ...item,
        ...line,
        ...bar,
        ...pie,
        label: item.label,
        data: item.data,
      };
    });

    /**DATASETS*/
    let dataSets = {
      labels,
      datasets: chartData,
    };

    /**CONFIG*/
    const config = {
      type: type,
      data: dataSets,
      options: {
        ...options,
        legend: {
          ...legend,
          labels,
        },
        layout: {
          ...layout,
        },
        animation: {
          ...animation,
        },
        tooltip: {
          ...tooltip,
        },
        scales: {
          ...scales,
        },
      },
    };
    /**CHART*/
    chart = new Chart(canvas, config);
  });
</script>

<div>
  <div class="container">
    <canvas bind:this={canvas} class="" />
  </div>
</div>

<style>
  .container {
    flex: 1;
    display: grid;
    place-items: center;
  }
  canvas {
    max-height: 250px;
    max-width: 350px;
  }
</style>
