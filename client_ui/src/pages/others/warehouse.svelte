<script>
  import DataTable from "../../lib/DataTable/index.svelte";
  import Header from "../_components/TitleBanner.svelte";
  import Fade from "../_components/Fade.svelte";
  import Placeholder from "../_components/PlaceholderText.svelte";
  import Input from "../_components/Input.svelte";
  import { fly } from "svelte/transition";
  import ExportHandler from "../_components/ExportHandler.svelte";

  //PRELOAD DATA
  async function preloadData() {
    const warehouses = await window.warehouses.getAll();
    const columns = [
      { label: "ID", type: "string", name: "id" },
      { label: "Name", type: "string", name: "label" },
      { label: "Address", type: "string", name: "location" },
      {
        label: "Products (in this Warehouse)",
        type: "number",
        name: "products",
      },
    ];
    const columnRef = columns.map((item) => item.name);
    const rows = warehouses?.data?.map((row) => {
      return columnRef.map((key) => {
        return row[key];
      });
    });

    return {
      columns,
      rows,
    };
  }

  //@ VARIABLES
  $: updateTrigger = false;
  let openSide = false;
  let sideData = {
    id: crypto.randomUUID(),
    label: "",
    location: "",
  };
  let isAdding = false;
  let checked = [];

  //on Add
  async function onAdd() {
    isAdding = true;
    sideData = {
      id: "",
      label: "",
      location: "",
    };
    openSide = true;
  }
  //on Item Save
  async function onSave(node) {
    //TODO SAVE
    node.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (isAdding) {
        /**
         * @ SAVE ITEM (SAVE)
         */
        /**
         * @ CHECKING FOR DUPLICATE ID
         */
        let res = await window.warehouses.exists(sideData.id);
        if (res) {
          await window.dialogs.error({
            title: "Duplicate Error",
            message: `Item "ID" [${sideData.id}] already exists`,
          });
          return;
        } else {
          //PROMPT
          const dialog = await window.dialogs.message({
            type: "info",
            title: "Save",
            message: "Saving this Warehouse Item, do you want to proceed?",
            buttons: ["Ok", "Cancel"],
          });

          //IF OK THEN
          if (dialog.response === 0) {
            /**
             * @ DATA INSERTION
             */
            let response = await window.warehouses.insert([
              {
                id: sideData.id,
                label: sideData.label,
                location: sideData.location,
              },
            ]);

            if (response?.error) {
              /**
               * @ DATA INSERTION ERROR
               */
              await window.dialogs.error({
                title: "Database Error",
                message: "Data Insertion Failed",
              });
            }
            updateTrigger = !updateTrigger; //REFRESH CLIENT DATA
          }
        }
        openSide = false;
        isAdding = false;
      } else {
        /**
         * @ UPDATE ITEM (SAVE)
         */
        isAdding = false;
        const dialog = await window.dialogs.message({
          type: "info",
          title: "Updating",
          message: `Update "${sideData.label}" Warehouse Item, do you want to proceed?`,
          buttons: ["Ok", "Cancel"],
        });

        if (dialog.response === 0) {
          let response = await window.warehouses.update([
            {
              id: sideData.id,
              label: sideData.label,
              location: sideData.location,
            },
          ]);
          if (response?.error) {
            await window.dialogs.error({
              title: "Database Error",
              message: "Data Update Failed",
            });
          }
        }
        updateTrigger = !updateTrigger; //UPDATE TRIGGER
        openSide = false;
      }
    });
  }
  //on Item Cancel
  async function onCancel(event) {
    event.preventDefault();
    isAdding = false;
    sideData = {
      id: "",
      label: "",
      location: "",
    };
    openSide = false;
  }
  //on Item Clicked
  async function onItemOpen(event) {
    if (checked.length > 0) {
      const dialog = await window.dialogs.message({
        type: "info",
        title: "Checked Items",
        message: `Some Items are still active, do you want to proceed?`,
        buttons: ["Ok", "Cancel"],
      });
      if (dialog.response === 0) {
        checked = [];
        isAdding = false;
        let data = await window.warehouses.getOne(event.detail.data[0]);
        sideData = {
          id: data.id,
          label: data.label,
          location: data.location,
        };
        openSide = true;
        updateTrigger = !updateTrigger;
      } else {
        return;
      }
    } else {
      isAdding = false;
      let data = await window.warehouses.getOne(event.detail.data[0]);
      sideData = {
        id: data.id,
        label: data.label,
        location: data.location,
      };
      openSide = true;
    }
  }

  /**
   * @ ON DELETE
   */
  async function onDelete(event) {
    if (checked.length > 0) {
      const dialog = await window.dialogs.message({
        type: "warning",
        title: "Delete",
        message: `Deleting ${checked.length} items, do you want to proceed?`,
        buttons: ["Ok", "Cancel"],
      });

      if (dialog.response === 0) {
        let ids = checked.map((item) => item[0]);
        let response = await window.warehouses.delete(ids);

        if (response?.error) {
          await window.dialogs.error({
            title: "Error",
            message:
              "Data Deletion Failed,\nSome inventory item(s) are still dependent on the selected item(s)",
          });
        } else {
          checked = [];
          updateTrigger = !updateTrigger;
          return;
        }
      } else {
        return;
      }
    }
  }
</script>

<div class="content">
  <Fade animateIn>
    <Header title="WAREHOUSE">
      <span class="ri ri-building-2-line" slot="icon" />
      <!-- @ HEADER CONTROLS -->
      <div class="btn-toolbar">
        <div class="btn-group">
          <!-- @ ADD NEW WAREHOUSE -->
          <button class="btn" on:click={onAdd}> Add </button>
          <!-- @ DELETE SELECTED WAREHOUSE -->
          <button class="btn" disabled={checked.length < 1} on:click={onDelete}
            >Delete</button
          >
        </div>
        &nbsp;
        <!-- TODO -->
        <button class="btn" data-toggle="tooltip" data-title="TODO feature"
          >Import</button
        >
        &nbsp;
        <ExportHandler
          {checked}
          column="id"
          dataType="csv"
          tableName="warehouse_items"
        />
      </div>
    </Header>
    <br />
    <div class="d-flex flex-column flex-lg-row" style="gap: 1em">
      <!-- @ SIDEBAR -->
      {#if openSide}
        <div
          class="card m-0 mb-10 mb-md-0 w-lg-300 bg-light-lm"
          in:fly={{ x: -100 }}
          out:fly={{ x: -100 }}
        >
          <!-- @ FORM -->
          <form class="form-group d-flex flex-column" use:onSave action="/">
            <h5>{isAdding ? "Add New Warehouse" : "Edit Warehouse"}</h5>
            <!-- @ CATEGORY ID -->
            <Input
              required
              disabled={!isAdding}
              name="id"
              label="ID"
              isExtended="append"
              value={sideData.id}
              on:onchange={(e) =>
                (sideData.id = e.detail.value.replace(/\s/g, "-"))}
            >
              <!-- GENERATE ID -->
              <button
                data-toggle="tooltip"
                data-title="Generate ID"
                disabled={!isAdding}
                class="btn shadow-none"
                slot="append"
                on:click|preventDefault={async () => {
                  sideData = {
                    ...sideData,
                    id: await window.utils.generateID(),
                  };
                }}
              >
                <span class="ri ri-settings-2-line" />
              </button>
            </Input>
            <!-- @ WAREHOUSE NAME -->
            <Input
              required
              name="label"
              label="Warehouse Name"
              placeholder="Warehouse Name..."
              value={sideData.label}
              on:onchange={(e) => (sideData.label = e.detail.value)}
            />
            <!-- @ WAREHOUSE LOCATION -->
            <Input
              name="location"
              label="Address"
              placeholder="Warehouse Address..."
              type="textarea"
              style="resizable: y"
              value={sideData.location}
              on:onchange={(e) => (sideData.location = e.detail.value)}
            />

            <div class="spacer flex-fill" />
            <!-- @ BUTTONS -->
            <br />
            <div class="d-flex justify-content-right">
              <!-- ON CANCEL -->
              <button class="btn btn-danger" on:click|preventDefault={onCancel}
                >Cancel</button
              >
              &nbsp;
              <!-- ON SAVE -->
              <button class="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      {/if}
      <!-- @ DATA-TABLE -->
      {#key updateTrigger}
        {#await preloadData()}
          <div class="flex-fill">
            <Placeholder />
          </div>
        {:then data}
          <div class="card m-0 p-0 flex-fill">
            <DataTable
              columns={data.columns}
              rows={data.rows}
              width={7}
              on:item={onItemOpen}
              on:checked={(e) => (checked = e.detail.checked)}
            />
          </div>
        {/await}
      {/key}
    </div>
  </Fade>
</div>
