<!--
  @ IMPORTS PAGE
-->
<script>
  import { goto, beforeUrlChange } from "@roxi/routify";
  /**COMPONENTS*/
  import Placeholder from "../_components/PlaceholderText.svelte";
  import TitleBanner from "../_components/TitleBanner.svelte";
  import DataTable from "../../lib/DataTable/index.svelte";
  import Fade from "../_components/Fade.svelte";
  import { pageLeaveHandler } from "../_components/utils";
  import { importsData as preload } from "../_components/preloads";

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
   * */
  let checked = [];
  let updateTrigger = false;

  /**
   * * ON DELETE
   * @param {DOMElementEvent} event
   */
  async function onDelete(event) {
    if (checked.length > 0) {
      /**PROMPT USER FOR CONFIRMATION*/
      const prompt = await window.dialogs.message({
        type: "warning",
        title: "Delete",
        message: `Deleting [${checked.length}] Import item(s), Do you want to proceed?`,
        buttons: ["Ok", "Cancel"],
      });

      if (prompt.response === 0) {
        const ids = checked.map((item) => item[0]);
        /**INITIALIZE ITEM DELETION*/
        const result = await window.imports.delete([ids]);
        if (result?.error) {
          /**HANDLE ERROR*/
          await window.dialogs.error({
            title: "Error",
            message: "Database Error",
          });
          return;
        } else {
          /**RESET CHECKED AND REFRESH TABLE VIEW*/
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
    <!--@ TABLE HEADER-->
    <TitleBanner title="IMPORTS">
      <span class="ri ri-ship-2-line" slot="icon" />
      <div class="btn-toolbar">
        <div class="btn-group">
          <!--@ ADD IMPORTS-->
          <button class="btn" on:click={(event) => $goto("/imports/add")}>
            Add
          </button>
          <!--@ DELETE IMPORTS-->
          <button class="btn" disabled={checked.length < 1} on:click={onDelete}
            >Delete</button
          >
        </div>
        &nbsp;
        <!--TODO-->
        <div class="btn-group" data-title="TODO Feature" data-toggle="tooltip">
          <button class="btn">Import</button>
          <button class="btn">Export</button>
        </div>
        &nbsp;
        <button class="btn" data-title="TODO Feature" data-toggle="tooltip"
          >Audited</button
        >
        <!--TODO-->
      </div>
    </TitleBanner>
    <br />
    <hr />
    <br />
    <!--@ UPDATE TRIGGER-->
    {#key updateTrigger}
      {#await preload()}
        <Placeholder />
      {:then data}
        <!--@ TABLE VIEW-->
        <div class="card m-0 p-0">
          <DataTable
            columns={data.columns}
            rows={data.rows}
            width={5}
            on:item={(event) => {
              $goto("/imports/:slug", { slug: event.detail.data[0] });
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
