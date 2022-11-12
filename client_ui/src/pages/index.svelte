<!--
  @ DASHBOARD PAGE
-->
<script>
  import TitleBanner from "./_components/TitleBanner.svelte";
  import Placeholder from "./_components/PlaceholderText.svelte";
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
        <span class="font-size-18 badge bg-muted ">{data.count[0]?.value}</span>
      </div>
      <div
        class="badge-group"
        data-title="Total Imports Items"
        data-toggle="tooltip"
      >
        <span class="font-size-18 badge  ">Imports</span>
        <span class="font-size-18 badge bg-muted  ">{data.count[1]?.value}</span
        >
      </div>
      <div
        class="badge-group"
        data-title="Total Exports Items"
        data-toggle="tooltip"
      >
        <span class="font-size-18 badge ">Exports</span>
        <span class="font-size-18 badge bg-muted">{data.count[2]?.value}</span>
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
        data: data.quantity.map((item) => item.value),
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
            {#each data.quantityItem as item}
              <tr current={item.name}>
                <td class="text-capitalize">{item.name}</td>
                <td>{item.product}</td>
                <td
                  >{item.value
                    .toFixed(2)
                    .replace(/\d(?=(\d{3})+\.)/g, "$&,")}</td
                >
              </tr>
            {/each}
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
        data: data.price.map((item) => item.value),
      },
    ]}
    line={{
      backgroundColor: "steelblue",
      fill: true,
    }}
  >
    <div class="description flex-fill">
      <div class="content-title">PRICES</div>
      <br />
      <div class="table-responsive">
        <table class="table">
          <caption class="badge">Items Highest Price</caption>
          <tbody>
            {#each data.priceItem as item}
              <tr current={item.name}>
                <td class="text-capitalize">{item.name}</td>
                <td>{item.product}</td>
                <td
                  >{item.value
                    .toFixed(2)
                    .replace(/\d(?=(\d{3})+\.)/g, "$&,")}</td
                >
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </DashboardItem>

  <!--AUDITS-->
  <DashboardItem
    type="bar"
    labels={["Imports", "Exports"]}
    data={[
      {
        label: "Audited",
        backgroundColor: "steelblue",
        data: [data.audit.audited.imports, data.audit.audited.exports],
      },
      {
        label: "Unaudited",
        backgroundColor: "teal",
        data: [data.audit.unaudited.imports, data.audit.unaudited.exports],
      },
    ]}
  >
    <div class="description flex-fill">
      <div class="content-title">AUDITED/UNAUDITED</div>
      <br />
      <div class="text-center">
        Audited/Shipped/Final overview of total audited and unaudited IMPORTS,
        EXPORTS inventory orders.
        <br />
        <p class="text-muted">Goto Audited Items.</p>
        <br />
        <div class="d-flex justify-content-center">
          <a href="/imports/audited" class="btn-link">Imports</a>
          &nbsp;&nbsp;
          <a href="/exports/audited" class="btn-link">Exports</a>
        </div>
      </div>
    </div>
  </DashboardItem>

  <div class="content">
    <p class="text-center text-secondary">TODO (Add More Dashboard Items)</p>
  </div>
{/await}
