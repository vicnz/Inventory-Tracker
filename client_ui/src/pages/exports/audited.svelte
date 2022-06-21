<script>
  import TitleBar from "../_components/TitleBanner.svelte";
  import DataTable from "../../lib/DataTable/index.svelte";
  import Fade from "../_components/Fade.svelte";
  import Placeholder from "../_components/PlaceholderText.svelte";
  import { exportsDataAudited as preload } from "../_components/preloads";

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
        const result = await window?.exports?.deleteAudited(ids);
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
    <TitleBar title="AUDITED" hasBack="/exports">
      <!-- @ ON DELETE BUTTON -->
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
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Iure
            consectetur quia obcaecati pariatur delectus sapiente itaque sunt.
            Ex voluptate cumque fuga. Maiores nesciunt repellat molestiae.
            Reiciendis maiores tenetur vel laudantium!
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
