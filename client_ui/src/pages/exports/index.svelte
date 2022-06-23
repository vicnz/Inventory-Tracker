<!--
  @ EXPORTS PAGE
-->
<script>
  import { goto, beforeUrlChange } from "@roxi/routify";
  /**COMPONENTS*/
  import Placeholder from "../_components/PlaceholderText.svelte";
  import TitleBanner from "../_components/TitleBanner.svelte";
  import DataTable from "../../lib/DataTable/index.svelte";
  import Fade from "../_components/Fade.svelte";
  import { pageLeaveHandler } from "../_components/utils";
  import { exportsData as preload } from "../_components/preloads";
  import ExportHandler from "../_components/ExportHandler.svelte";

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
   * * ON DELETE
   * @param {DOMEvent} event
   */
  async function onDelete(event) {
    if (checked.length > 0) {
      const prompt = await window.dialogs.message({
        type: "warning",
        title: "Delete",
        message: `Deleting [${checked.length}] export item(s), do you want to proceed?`,
        buttons: ["Ok", "Cancel"],
      });

      if (prompt.response === 0) {
        let ids = checked.map((item) => item[0]);
        /**INITIALIZE ITEM DELETION*/
        const result = await window.exports.delete(ids);
        if (result?.error) {
          /**HANDLE ERROR*/
          await window.dialogs.error({
            title: "Error",
            message: "Database Error",
          });
        } else {
          /**RESET CHECKED & UPDATE TABLE VIEW*/
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
    <!--@ TITLE BANNER-->
    <TitleBanner title="EXPORTS">
      <span class="ri ri-truck-line" slot="icon" />
      <div class="btn-toolbar">
        <div class="btn-group">
          <!--@ ADD BUTTON-->
          <button class="btn" on:click={(event) => $goto("/exports/add")}>
            Add
          </button>
          <!-- @ DELETE BUTTON-->
          <button class="btn" disabled={checked.length < 1} on:click={onDelete}
            >Delete</button
          >
        </div>
        &nbsp;
        <!--TODO-->
        <button class="btn">Import</button>
        &nbsp;
        <ExportHandler
          column="id"
          {checked}
          dataType="csv"
          tableName="outgoing_view"
        />
        &nbsp;
        <button class="btn" on:click={() => $goto("/exports/audited")}>
          Audited
        </button>
        <!--TODO-->
      </div>
    </TitleBanner>
    <br />
    <hr />
    <br />
    <!--@ UPDATE TABLE VIEW-->
    {#key updateTrigger}
      {#await preload()}
        <Placeholder />
      {:then data}
        <div class="card m-0 p-0">
          <!--@ TABLE VIEW-->
          <DataTable
            columns={data.columns}
            rows={data.rows}
            width={5}
            on:item={(event) => {
              $goto("/exports/:slug", { slug: event.detail.data[0] });
            }}
            on:checked={(event) => (checked = event.detail.checked)}
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
