<script>
  export let columns = []; // columns must have a {label: string, type: 'string|currency|password'}
  export let rows = []; //rows
  export let width = 5; //pageination width
  export let primaryColumn = 0; //primary column (id) usually the ID that uniquely identifies a row

  import { createEventDispatcher } from "svelte";
  //
  import Row from "./Row.svelte";
  //
  import { paginate, search, sort } from "./util";
  ///

  const dispatcher = createEventDispatcher();
  const immutableValues = rows; //non-modifiable original rows used for "resets"
  $: mutableValues = rows; //modifiable list for (search, and sorting)
  $: searchQueryString = ""; //search string for (search)
  $: searchColumn = 0; //selected column for (search)
  $: checked = []; //store checked items
  $: checkedAll = false; //if (select all) is clicked
  $: activePage = 0; //active page current (0)
  $: totalPageCount =
    immutableValues.length % width === 0
      ? Math.floor(immutableValues.length / width) - 1
      : Math.floor(immutableValues.length / width);
  //page count
  $: ascending = true;
  $: sortColumn = 0;
  /**
   * Sort A Column Ascending / Descending
   * TODO: There is an Unidentified Bug needs to be fixed
   * @param {number} column
   */
  async function onSort(column) {
    if (sortColumn !== column) {
      mutableValues = await sort(immutableValues, column, ascending);
      searchQueryString = "";
      activePage = 0;
      ascending = true;
      sortColumn = column;
    } else {
      mutableValues = await sort(immutableValues, column, ascending);
      searchQueryString = "";
      activePage = 0;
      ascending = !ascending;
      sortColumn = column;
    }
  }

  /**
   * Change Active Page
   * @param {string} func
   */
  async function onPaginate(func) {
    switch (func) {
      case "first":
        activePage = 0;
        break;
      case "previous":
        activePage = activePage == 0 ? 0 : activePage - 1;
        break;
      case "next":
        activePage =
          activePage == totalPageCount ? totalPageCount : activePage + 1;
        break;
      case "last":
        activePage = totalPageCount;
        break;
      default:
        activePage = 0;
    }
  }
  /**
   * Search
   */
  async function onSeach() {
    if (searchQueryString == "") {
      mutableValues = immutableValues;
      activePage = 0;
      totalPageCount =
        immutableValues.length % width === 0
          ? Math.floor(immutableValues.length / width) - 1
          : Math.floor(immutableValues.length / width);
    } else {
      let searched = await search(
        immutableValues,
        searchQueryString,
        searchColumn,
        columns[searchColumn]?.type
      );
      mutableValues = searched;
      activePage = 0;
      totalPageCount =
        mutableValues.length % width === 0
          ? Math.floor(mutableValues.length / width) - 1
          : Math.floor(mutableValues.length / width);
    }
  }
  //on item is selected
  function onItemClicked(event) {
    dispatcher("item", {
      ...event.detail,
    });
  }

  ///on checkbox and dispatch event for parent component
  function onItemSelected(event) {
    if (event.detail.checked) {
      checked = [...checked, event.detail.data];
      dispatcher("checked", {
        checked,
      });
    } else {
      let temp = checked.filter((value) => {
        return value !== event.detail.data;
      });
      checked = temp;
      dispatcher("checked", {
        checked,
      });
    }
  }

  //select all
  ///TODO: uncheck when one item is unchecked
  function selectAll(event) {
    if (checkedAll) {
      checked = immutableValues;
    } else {
      checked = [];
    }
    dispatcher("checked", {
      checked,
    });
  }
</script>

<main>
  <!-- header section -->
  <div class="alert alert-primary p-card rounded-0 border-0">
    <div class="d-flex align-items-center flex-lg-row flex-column">
      <!-- search bar -->
      <div class="input-group flex-fill shadow-sm">
        <div class="input-group-prepend">
          <!-- select column for search -->
          <select
            class="form-control text-capitalize"
            bind:value={searchColumn}
          >
            {#each columns as col, idx}
              <option value={idx} class="text-capitalize">
                {col.label}
              </option>
            {/each}
          </select>
        </div>
        <!-- searchbox -->
        <input
          type="search"
          class="form-control"
          bind:value={searchQueryString}
          placeholder="<= select first which column to search to"
          on:keydown={(event) => {
            if (event.code === "Enter") {
              onSeach();
            }
          }}
        />
        <!-- search button -->
        <div class="input-group-append">
          <button class="btn shadow-none" on:click={() => onSeach()}>
            Search
          </button>
        </div>
      </div>
      <div class="p-10" />
      <!-- pagination controller -->
      <div class="btn-group">
        <button class="btn" on:click={() => onPaginate("first")}>
          First
        </button>
        <button class="btn" on:click={() => onPaginate("previous")}>
          Previous
        </button>
        <span class="btn btn-primary">
          {activePage + 1} of {totalPageCount + 1}
        </span>
        <button class="btn" on:click={() => onPaginate("next")}> Next </button>
        <button class="btn" on:click={() => onPaginate("last")}> Last </button>
      </div>
    </div>
  </div>

  <!-- table body -->
  <div class="table-responsive">
    <table class="table table-hover">
      <thead>
        <tr>
          <td>
            <!-- select all checkbox -->
            <div class="d-flex align-items-center justify-content-between">
              <div
                class="custom-checkbox"
                title={`${checkedAll ? "diselect all" : "select all"} `}
              >
                <input
                  type="checkbox"
                  id="select-all"
                  bind:checked={checkedAll}
                  on:change={selectAll}
                />
                <label for="select-all" />
              </div>
              <!-- selected count -->
              <span>
                [{checked.length}]
              </span>
            </div>
          </td>
          <!-- HEADERS -->
          {#if columns.length < 1}
            <td>{"No Item"}</td>
          {:else}
            {#each columns as col, idx}
              <td
                class="text-capitalize "
                on:click={() => onSort(idx)}
                style="cursor: pointer"
                title="sort"
              >
                {col.label}
              </td>
            {/each}
          {/if}
        </tr>
      </thead>
      <tbody>
        <!-- BODY -->
        {#key mutableValues}
          <!-- listen to any changes in the mutable search -->
          {#await paginate(mutableValues, width) then data}
            <!-- if there is no data return a (no data notice) -->
            {#if data.length < 1}
              <tr>
                <td colspan={columns.length + 1}> No Item </td>
              </tr>
            {:else}
              <!-- listen for changes in (activePage) -->
              {#key activePage}
                <!-- listen for changes in (checkedAll) -->
                {#key checkedAll}
                  <!-- iterate each rows -->
                  {#each data[activePage] as record, index}
                    <Row
                      datatypes={columns}
                      data={record}
                      selected={checked}
                      primaryCol={primaryColumn}
                      on:dbclick={onItemClicked}
                      on:checked={onItemSelected}
                    />
                  {/each}
                {/key}
              {/key}
            {/if}
          {/await}
        {/key}
      </tbody>
    </table>
  </div>
</main>
