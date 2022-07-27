<script>
  import TitleBar from "../_components/TitleBanner.svelte";
  import DataTable from "../../lib/DataTable/index.svelte";
  import Fade from "../_components/Fade.svelte";
  import Placeholder from "../_components/PlaceholderText.svelte";
  import { importsDataAudited as preload } from "../_components/preloads";
  import ExportHandler from "../_components/ExportHandler.svelte";

  /**VARIABLES*/
  let checked = [];
  let updateTrigger = false;

  /**ON DELETE*/
  async function onDelete() {
    if (checked.length > 0) {
      const prompt = await window.dialogs.message({
        type: "warning",
        title: "Delete",
        message: `Deleting [${checked.length}] items, proceed?`,
        buttons: ["Ok", "Cancel"],
      });
      if (prompt.response === 0) {
        const ids = checked.map((item) => item[0]);
        const result = await window?.imports?.deleteAudited(ids);
        if (result?.error) {
          await window.dialogs.error({
            title: "Error",
            message: "Database Error",
          });
        } else {
          checked = [];
          updateTrigger = !updateTrigger;
        }
      } else {
        return;
      }
    }
  }
</script>

<div class="content">
  <Fade animateIn>
    <!-- @ TITLE BAR -->
    <TitleBar title="AUDITED" hasBack="/imports">
      <!-- @ ON DELETE BUTTON -->
      <ExportHandler
        {checked}
        column="id"
        dataType="csv"
        tableName="ingoing_arrived_view"
      />
      &nbsp;
      <button class="btn" disabled={checked.length < 1} on:click={onDelete}>
        Delete
      </button>
    </TitleBar>
    <br />
    <hr />
    <br />
    {#key updateTrigger}
      {#await preload()}
        <Placeholder />
      {:then data}
        <div class="card m-0 p-0">
          <div class="alert alert-primary rounded-0 border-0">
            NOTE: All audited items can no longer be modified, updated as they
            are already marked as FINAL.
          </div>
          <DataTable
            columns={data.columns}
            rows={data.rows}
            on:checked={(event) => (checked = event.detail.checked)}
            on:item={(event) =>
              window?.dialogs.message({
                type: "info",
                title: "Audited",
                message: "Item Can no longer be modified.",
              })}
          />
        </div>
      {/await}
    {/key}
  </Fade>
</div>
