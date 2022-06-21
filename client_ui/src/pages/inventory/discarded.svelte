<script>
  import { goto, beforeUrlChange } from "@roxi/routify";
  import Fade from "../_components/Fade.svelte";
  import TitleBar from "../_components/TitleBanner.svelte";
  import Placeholder from "../_components/PlaceholderText.svelte";
  import DataTable from "../../lib/DataTable/index.svelte";
  import { pageLeaveHandler } from "../_components/utils";
  import { preloadDiscardedInventory as preload } from "../_components/preloads";

  /**HANDLE PAGE LEAV*/
  $beforeUrlChange(async (event, route) => {
    if (checked.length < 1) {
      return true;
    } else {
      if (await pageLeaveHandler("Some Item' are still active, proceed?")) {
        return true;
      } else {
        return false;
      }
    }
  });
  /**
   * *VARIABLES
   */
  let checked = [];
  let handleUpdate = false;

  /**RESTORE ITEM*/
  async function onRestore(event) {
    const response = await window.dialogs.message({
      type: "info",
      title: "Restore",
      message: "Restore This Item?",
      detail: "NOTE: Category and Warehouse Info will not be added.",
      buttons: ["Ok", "Cancel"],
    });
    if (response.response === 0) {
      $goto("/inventory/add", { restore: true, id: event.detail.data[0] });
      return;
    } else {
      return;
    }
  }

  /**DELETE ITEM FOREVER*/
  async function deleteForever(event) {
    if (checked.length > 0) {
      const result = await window.dialogs.message({
        type: "warning",
        title: "Delete",
        message: "Delete This Item Forever?",
        buttons: ["Ok", "Cancel"],
      });

      if (result.response === 0) {
        const ids = checked.map((item) => item[0]);
        const deletion = await window?.inventory?.discardedDelete(ids);
        if (deletion?.error) {
          await window.dialogs.error({
            title: "Error",
            message: "Database Error",
          });
        } else {
          checked = [];
          handleUpdate = !handleUpdate;
        }
      } else {
        return;
      }
    }
  }
</script>

<div class="content">
  <Fade animateIn>
    <!-- @ HEADER -->
    <TitleBar title="DISCONTINUED" hasBack="/inventory">
      <button class="btn" disabled={checked.length < 1} on:click={deleteForever}
        >Delete</button
      >
    </TitleBar>
    <br />
    <hr />
    <br />
    {#key handleUpdate}
      {#await preload()}
        <Placeholder />
      {:then data}
        <div class="card m-0 p-0">
          <div class="alert alert-primary p-card rounded-0 border-0">
            NOTE: When an item is marked as discarded/discontinoued all lying
            data is removed,
          </div>
          <DataTable
            columns={data.columns}
            rows={data.rows}
            on:item={onRestore}
            on:checked={(event) => (checked = event.detail.checked)}
          />
        </div>
      {/await}
    {/key}
  </Fade>
</div>
