<script>
  import { params, goto } from "@roxi/routify";
  import Suppliers from "./_clients/Suppliers.svelte";
  import Customers from "./_clients/Customers.svelte";
  import { fly } from "svelte/transition";
  import Placeholder from "../_components/PlaceholderText.svelte";
  import ExportHandler from "../_components/ExportHandler.svelte";

  //VARIABLES
  let updateTrigger = false;
  let activeTab = $params.type == "supplier" ? 0 : 1;
  let checked = {
    type: null,
    data: [],
  };

  //PRELOAD DATA
  async function preloadData() {
    let { data: suppliers } = await window.clients.getAll({ type: "supplier" });
    let { data: customers } = await window.clients.getAll({ type: "customer" });
    return {
      suppliers,
      customers,
    };
  }

  //GOTO SPECIFIC ITEM
  async function gotoClient() {
    let proceed = true;
    if (checked.data.length > 0) {
      const prompt = await window.dialogs.message({
        type: "info",
        title: "ACTIVE ITEMS",
        message: "Some Item's are still active, do you want to proceed?",
        buttons: ["Ok", "Cancel"],
      });
      proceed = prompt.response === 0;
      if (proceed) {
        if (activeTab == 0) {
          $goto("/others/:slug/?type=supplier&mode=add", { slug: "supplier" });
        } else {
          $goto("/others/:slug/?type=customer&mode=add", { slug: "customer" });
        }
      } else {
        return;
      }
    } else {
      if (activeTab == 0) {
        $goto("/others/:slug/?type=supplier&mode=add", { slug: "supplier" });
      } else {
        $goto("/others/:slug/?type=customer&mode=add", { slug: "customer" });
      }
    }
  }

  //GOTO ADD PAGE
  async function gotoAdd(param) {
    const { type, value } = param;
    let proceed = true;
    if (checked.data.length > 0) {
      const prompt = await window.dialogs.message({
        type: "info",
        title: "ACTIVE ITEMS",
        message: "Some Item's are still active, do you want to proceed?",
        buttons: ["Ok", "Cancel"],
      });
      proceed = prompt.response === 0;
      if (proceed) {
        if (type == "customer") {
          $goto("/others/:slug/?type=customer&mode=edit", { slug: value });
        } else if (type == "supplier") {
          $goto("/others/:slug/?type=supplier&mode=edit", { slug: value });
        }
      } else {
        return;
      }
    } else {
      if (type == "customer") {
        $goto("/others/:slug/?type=customer&mode=edit", { slug: value });
      } else if (type == "supplier") {
        $goto("/others/:slug/?type=supplier&mode=edit", { slug: value });
      }
    }
  }

  //ON ITEM DELETE
  async function onDelete() {
    let ids = checked.data.map((item) => item[0]);
    const prompt = await window.dialogs.message({
      type: "warning",
      title: "Delete",
      message: `Deleting [${ids.length}] items?`,
      buttons: ["Ok", "Cancel"],
    });

    if (prompt.response === 0) {
      let result = await window.clients.delete({ data: ids });
      if (result) {
        await window.dialogs.error({
          title: "Error",
          message:
            "Data Deletion Failed,\nSome inventory item(s) are still dependent on the selected item(s)",
        });
      } else {
        checked = { type: checked.type, data: [] };
        updateTrigger = !updateTrigger;
        return;
      }
    } else {
      return;
    }
  }
  $: {
    activeTab;
    checked.data = [];
  }
</script>

<div class="content">
  <h3 class="text-center d-flex align-items-center justify-content-center">
    <span class="ri ri-user-3-line" />
    &nbsp; Clients
  </h3>
  <br />
  <div
    class="d-flex justify-content-between align-items-center flex-md-row flex-column"
  >
    <div class="btn-toolbar btn-lg">
      <button
        class={`btn ${activeTab == 0 ? "btn-primary" : ""}`}
        on:click={() => (activeTab = 0)}>Suppliers</button
      >
      &nbsp;
      <button
        class={`btn ${activeTab == 1 ? "btn-primary" : ""}`}
        on:click={() => (activeTab = 1)}>Customers</button
      >
    </div>
    <div class="btn-toolbar">
      <div class="btn-group">
        <button class="btn" on:click={gotoClient}>Add</button>
        <button
          class="btn"
          on:click={onDelete}
          disabled={checked.data.length < 1}
        >
          Delete
        </button>
      </div>
      &nbsp;
      <!-- TODO -->
      <button class="btn">Imports</button>
      &nbsp;
      <ExportHandler
        checked={checked.data}
        column="id"
        dataType="csv"
        tableName={checked.type === "supplier"
          ? "clients_supplier"
          : "clients_customer"}
      />
    </div>
  </div>

  <div>
    {#key updateTrigger}
      {#await preloadData()}
        <Placeholder />
      {:then data}
        {#if activeTab == 0}
          <!-- @ SUPPLIER TABLE -->
          <div in:fly={{ x: -100 }}>
            <Suppliers
              rows={data.suppliers}
              on:checked={(event) => {
                checked = {
                  type: "supplier",
                  data: [],
                };
                checked.data = event.detail;
              }}
              on:select={(event) =>
                gotoAdd({ type: "supplier", value: event.detail })}
            />
          </div>
        {:else}
          <!-- @ CUSTOMER TABLE -->
          <div in:fly={{ x: 100 }}>
            <Customers
              rows={data.customers}
              on:checked={(event) => {
                checked = {
                  type: "customer",
                  data: [],
                };
                checked.data = event.detail;
              }}
              on:select={(event) =>
                gotoAdd({ type: "customer", value: event.detail })}
            />
          </div>
        {/if}
      {/await}
    {/key}
  </div>
</div>
