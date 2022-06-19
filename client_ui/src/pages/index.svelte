<!--
  @ DASHBOARD PAGE
-->
<script>
  import TitleBanner from "./_components/TitleBanner.svelte";
  import Placeholder from "./_components/PlaceholderText.svelte";
  import Graph from "./_components/Graph.svelte";
  import DashboardItem from "./_components/DashboardGraphItem.svelte";
  import { dashboardData as preload } from "./_components/preloads";
</script>

<div class="content">
  <TitleBanner title="DASHBOARD">
    <span class="ri ri-dashboard-2-line" slot="icon" />
  </TitleBanner>
</div>
{#await preload()}
  <Placeholder />
{:then data}
  <!-- TODO CREATE PREVIEW CHART -->

  <div class="alert alert-primary rounded-0">
    <div class="text-center">
      <div
        class="badge-group"
        data-title="Total Inventory Items"
        data-toggle="tooltip"
      >
        <span class="font-size-18 badge">Main Inventory</span>
        <span class="font-size-18 badge bg-muted ">{data.totals[0]}</span>
      </div>
      <div
        class="badge-group"
        data-title="Total Imports Items"
        data-toggle="tooltip"
      >
        <span class="font-size-18 badge  ">Imports</span>
        <span class="font-size-18 badge bg-muted  ">{data.totals[1]}</span>
      </div>
      <div
        class="badge-group"
        data-title="Total Exports Items"
        data-toggle="tooltip"
      >
        <span class="font-size-18 badge ">Exports</span>
        <span class="font-size-18 badge bg-muted">{data.totals[2]}</span>
      </div>
    </div>
  </div>

  <!-- @ TOTAL QUANTITY -->
  <DashboardItem
    type="bar"
    labels={["Inventory", "Imports", "Exports"]}
    data={[
      {
        label: "Total Quantity",
        data: [...data.quantity],
        bgColor: "steelblue",
      },
    ]}
    scales={{
      y: { ticks: { precision: 0 } },
    }}
  >
    <div class="description flex-fill">
      <div class="content-title">QUANTITY</div>
      <br />
      <div class="table-responsive">
        <table class="table">
          <caption class="badge  ">Items Having Most Quantities</caption>
          <tbody>
            <tr>
              <td>Inventory</td>
              <td>{data.itemTotals[0]}</td>
              <td>{data.maxQty[0]}</td>
            </tr>
            <tr>
              <td>Imports</td>
              <td>{data.itemTotals[1]}</td>
              <td>{data.maxQty[1]}</td>
            </tr>
            <tr>
              <td>Exports</td>
              <td>{data.itemTotals[2]}</td>
              <td>{data.maxQty[2]}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DashboardItem>
  <!-- @ TOTAL COUNTED PRICE -->
  <DashboardItem
    type="line"
    labels={["Inventory", "Imports", "Exports"]}
    data={[
      {
        label: "Total Prices",
        data: [...data.price],
      },
    ]}
    line={{
      backgroundColor: "steelblue",
      fill: true,
    }}
  >
    <div class="description">
      <div class="content-title">PRICE</div>
      <br />
      <p>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Harum, modi
        eos, rem similique eveniet pariatur laboriosam molestias beatae
        aspernatur, voluptas soluta alias. Molestias necessitatibus, voluptates
        nisi distinctio quibusdam eos sint.
      </p>
    </div>
  </DashboardItem>

  <div class="card bg-light-lm d-flex flex-column flex-md-row" style="gap: 1em">
    <Graph
      type="bar"
      labels={["Imports", "Exports"]}
      data={[
        {
          label: "Unaudited",
          data: [...data.audits.unaudited],
          backgroundColor: "steelblue",
        },
        {
          label: "Audited",
          data: [...data.audits.audited],
          backgroundColor: "teal",
        },
      ]}
      scales={{
        y: { ticks: { precision: 0 } },
      }}
    />
    <div class="description">
      <div class="content-title">Audits</div>
      <br />
      <p>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Harum, modi
        eos, rem similique eveniet pariatur laboriosam molestias beatae
        aspernatur, voluptas soluta alias. Molestias necessitatibus, voluptates
        nisi distinctio quibusdam eos sint.
      </p>
    </div>
  </div>

  <div class="content">
    <p class="text-center text-secondary">TODO (Add More Dashboard Items)</p>
  </div>
{/await}
