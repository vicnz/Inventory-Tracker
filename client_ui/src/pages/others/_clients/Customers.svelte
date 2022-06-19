<script>
  import { createEventDispatcher } from "svelte";
  import Placeholder from "../../_components/PlaceholderText.svelte";
  import DataTable from "../../../lib/DataTable/index.svelte";
  const dispatcher = createEventDispatcher();
  export let rows = [];

  async function preloadData() {
    const columns = [
      { label: "Id", type: "string", name: "id" },
      { label: "Customer Name", type: "string", name: "name" },
      { label: "Customer Company", type: "string", name: "company" },
      { label: "Suppler Address", type: "string", name: "address" },
      { label: "Suppler Contact", type: "string", name: "contact" },
      { label: "Suppler Email", type: "string", name: "email" },
      { label: "No. of Orders", type: "number", name: "orders" },
    ];

    rows = rows.map((item) => [
      item.id,
      item.name,
      item.company,
      item.address,
      item.contact,
      item.email,
      item.orders,
    ]);

    return {
      columns,
      rows,
    };
  }

  async function onItem(event) {
    dispatcher("select", event.detail?.data[0]);
  }

  async function onCheck(event) {
    dispatcher("checked", event.detail?.checked);
  }
</script>

<div class="">
  <h3 class="ml-0">Customers</h3>
  <hr />
  {#await preloadData()}
    <Placeholder />
  {:then data}
    <div class="card m-0 p-0">
      <DataTable
        columns={data.columns}
        rows={data.rows}
        width={5}
        on:item={onItem}
        on:checked={onCheck}
      />
    </div>
  {/await}
</div>
