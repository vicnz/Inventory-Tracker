<script>
  import DataTable from "../../lib/DataTable/index.svelte";
  import Placeholder from "../_components/PlaceholderText.svelte";
  import Header from "../_components/TitleBanner.svelte";
  import Fade from "../_components/Fade.svelte";
  import Input from "../_components/Input.svelte";
  import { fly } from "svelte/transition";

  //PRELOADED DATA
  async function preloadData() {
    const categories = await window.categories.getAll();
    const columns = [
      { label: "ID", type: "string", name: "id" },
      { label: "Category Name", type: "string", name: "label" },
      {
        label: "Products (in this Category)",
        type: "number",
        name: "products",
      },
    ];
    const columnRef = columns.map((item) => item.name);
    const rows = categories?.data?.map((row) => {
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
  };
  let isAdding = false;
  $: checked = [];

  //on Add
  async function onAdd() {
    isAdding = true;
    sideData = {
      id: "",
      label: "",
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
        let res = await window.categories.exists(sideData.id);
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
            message: "Saving this Category Item, do you want to proceed?",
            buttons: ["Ok", "Cancel"],
          });

          if (dialog.response === 0) {
            //ADD DATA
            let response = await window.categories.insert([
              { id: sideData.id, label: sideData.label },
            ]);

            if (response?.error) {
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
          message: `Update "${sideData.label}" Category Item, do you want to proceed?`,
          buttons: ["Ok", "Cancel"],
        });

        if (dialog.response === 0) {
          //UPDATE ITEM TO DATABASE
          let response = await window.categories.update([
            {
              id: sideData.id,
              label: sideData.label,
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
  /**
   * @ EDIT CANCELED
   */
  async function onCancel(event) {
    isAdding = false;
    event.preventDefault();
    sideData = {
      id: "",
      label: "",
    };
    openSide = false;
  }

  /**
   * @ ITEM DOUBLE CLICKED
   */
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
        let data = await window.categories.getOne(event.detail.data[0]);
        sideData = {
          id: data.id,
          label: data.label,
        };
        openSide = true;
        updateTrigger = !updateTrigger;
      } else {
        return;
      }
    } else {
      isAdding = false;
      let data = await window.categories.getOne(event.detail.data[0]);
      sideData = {
        id: data.id,
        label: data.label,
      };
      openSide = true;
    }
  }

  /**
   * @ DELETE
   */
  async function onDelete() {
    if (checked.length > 0) {
      const dialog = await window.dialogs.message({
        type: "warning",
        title: "Delete",
        message: `Deleting ${checked.length} items, do you want to proceed?`,
        buttons: ["Ok", "Cancel"],
      });

      if (dialog.response === 0) {
        let ids = checked.map((item) => item[0]);
        let response = await window.categories.delete(ids);

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
    } else {
      return;
    }
  }
</script>

<div class="content">
  <Fade animateIn>
    <Header title="CATEGORY">
      <span class="ri ri-function-line" slot="icon" />
      <!-- @ HEADER CONTROLS -->
      <div class="btn-toolbar">
        <div class="btn-group">
          <!-- @ ADD NEW CATEGORY -->
          <button class="btn" on:click={onAdd}> Add </button>
          <!-- @ DELETE SELECTED CATEGORY -->
          <button class="btn" disabled={checked.length < 1} on:click={onDelete}
            >Delete</button
          >
        </div>
        &nbsp;
        <!-- TODO -->
        <div class="btn-group" data-title="TODO Feature" data-toggle="tooltip">
          <!-- @ IMPORT DATA -->
          <button class="btn">Import</button>
          <!-- @ EXPORT DATA -->
          <button class="btn">Export</button>
        </div>
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
            <h5>{isAdding ? "Adding New Category" : "Edit Category"}</h5>
            <!-- @ CATEGORY ID -->
            <Input
              required={isAdding}
              label="ID"
              isExtended="append"
              disabled={!isAdding}
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
            <!-- @ CATEGORY NAME -->
            <Input
              required
              label="Category Name"
              placeholder="Consumables..."
              type="textarea"
              style="resizable: y"
              value={sideData.label}
              on:onchange={(e) => (sideData.label = e.detail.value)}
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
              on:checked={(e) => {
                checked = e.detail.checked;
                openSide = false;
                isAdding = false;
              }}
            />
          </div>
        {/await}
      {/key}
    </div>
  </Fade>
</div>
