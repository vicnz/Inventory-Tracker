<!--
  @ INVENTORY PAGE
-->
<script>
  import { goto, beforeUrlChange } from "@roxi/routify";
  import Placeholder from "../_components/PlaceholderText.svelte";
  import TitleBanner from "../_components/TitleBanner.svelte";
  import DataTable from "../../lib/DataTable/index.svelte";
  import Fade from "../_components/Fade.svelte";
  import { pageLeaveHandler } from "../_components/utils";
  import { inventoryData as preload } from "../_components/preloads";
  /**
   * * HANDLE PAGE EXIT
   */
  $beforeUrlChange(async (event, route) => {
    if (checked.length > 0) {
      return await pageLeaveHandler();
    } else {
      return true;
    }
  });

  /**
   * * VARIABLES
   */
  let checked = [];
  let updateTrigger = false;

  /**
   * * ON DELETE (CHECKED ITEMS)
   */
  async function onDelete() {
    if (checked.length > 0) {
      /**AWAIT USER PROMPT*/
      const dialog = await window.dialogs.message({
        title: "Delete",
        type: "warning",
        message: `Deleting [${checked.length}] Inventory Items,\nDo you want to proceed?`,
        detail: `NOTE: This will also remove related "Imports" and "Exports" Data`,
        buttons: ["OK", "Cancel"],
      });

      if (dialog.response === 0) {
        let ids = checked.map((item) => item[0]);
        /**INITIATE ITEM DELETION*/
        console.log(ids);
        let result = await window.inventory.delete(ids);
        if (result?.error) {
          /**IF ERROR OCCURS ABORT DELETION*/
          await window.dialogs.error({
            title: "Error",
            message: "Database Error",
          });
          return;
        } else {
          /**RESET CHECKED ITEMS & UPDATE TABLE VIEW*/
          checked = [];
          updateTrigger = !updateTrigger;
        }
        return;
      } else {
        return;
      }
    }
  }
</script>

<div class="content">
  <Fade animateIn>
    <!--@ TITLE BANNER-->
    <TitleBanner title="INVENTORY">
      <span class="ri ri-archive-drawer-line" slot="icon" />
      <div class="btn-toolbar">
        <div class="btn-group">
          <!--@ ADD (INVENTORY) PAGE -->
          <button class="btn" on:click={() => $goto("/inventory/add")}>
            Add
          </button>
          <!--@ DELETE (INVENTORY) ITEMS-->
          <button class="btn" on:click={onDelete} disabled={checked.length < 1}>
            Delete
          </button>
        </div>
        &nbsp;
        <!--TODO-->
        <div class="btn-group" data-title="TODO Feature" data-toggle="tooltip">
          <button class="btn">Import</button>
          <button class="btn">Export</button>
        </div>
        &nbsp;
        <button class="btn" data-title="TODO Feature" data-toggle="tooltip"
          >Discarded</button
        >
        <!--TODO-->
      </div>
    </TitleBanner>
    <br />
    <hr />
    <br />
    <!--@UPDATE TRIGGER (TABLE REFRESH)-->
    {#key updateTrigger}
      {#await preload()}
        <Placeholder />
      {:then data}
        <div class="card m-0 p-0">
          <!--@ TABLE VIEW-->
          <DataTable
            columns={data.columns}
            rows={data.rows}
            on:item={(event) => {
              $goto("/inventory/:slug", { slug: event.detail.data[0] });
            }}
            on:checked={(event) => {
              return (checked = event.detail.checked);
            }}
          />
        </div>
      {/await}
    {/key}
    <br />
    <p>
      TIP!: When searching the table for numbers/dates you can use comparison
      search (<span class="badge">&lt;52</span>,
      <span class="badge">&gt;52</span>, <span class="badge">52~65</span>, or
      <span class="badge">52^65</span>). Ex.
      <span class="badge">&lt;52</span> will show any items having the value
      less than 52, and <span class="badge">52~65</span> will show any "In"
      between the two numbers, and <span class="badge">52^65</span> will show "Not
      In" between the two numbers
    </p>
  </Fade>
</div>
