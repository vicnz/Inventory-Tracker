<!--
  @ INVENTORY (EDIT) PAGE
-->
<script>
  import { params, redirect, goto, beforeUrlChange } from "@roxi/routify";
  import { onMount } from "svelte";
  /**COMPONENTS*/
  import TitleBanner from "../_components/TitleBanner.svelte";
  import Fade from "../_components/Fade.svelte";
  import Input from "../_components/Input.svelte";
  import EnableForm from "../_components/EnableForm.svelte";
  import { pageLeaveHandler } from "../_components/utils";

  /**
   * * HANDLE PAGE EXIST
   */
  $beforeUrlChange(async (event, route) => {
    /**CHECK IF DATA IS MUTATED*/
    if (JSON.stringify(immutableSchema) === JSON.stringify(mutableSchema)) {
      return true;
    } else if (isSaved) {
      return true;
    } else {
      return pageLeaveHandler("Unsaved Changes, Do you want to proceed?");
    }
  });

  /**
   * * VARIABLES
   */
  const slug = $params.slug?.trim(); /**SLUG (PARAMETER)*/
  $: enableForm = false; /**ENABLE FORM EDITING*/
  $: isSaved = false; /**NOTIFY IF ITEM IS ON SAVING*/
  let categoryList = [];
  let warehouseList = [];
  $: immutableSchema = {};
  $: mutableSchema = { ...immutableSchema };

  /**
   * * PRELOAD EDIT DATA (INVENTORY)
   */
  async function preloadedData() {
    /**LOAD INVENTORY ITEM*/
    const result = await window.inventory.getOne(slug);
    if (result) {
      immutableSchema = result;
    } else {
      /**IF NOT FOUND RETURN A 404*/
      $redirect("../_fallback.svelte");
    }
    /**LOAD CATEGORY LIST*/
    const categories = await window.others.categories();
    categoryList = categories.data.map((item) => ({
      label: item.label,
      value: item.id,
    }));
    /**LOAD WAREHOUSES LIST*/
    const warehouses = await window.others.warehouses();
    warehouseList = warehouses.data.map((item) => ({
      label: `${item.label} - ${item.location}`,
      value: item.id,
    }));
  }

  /**PRELOAD DATA ON MOUNT*/
  onMount(() => {
    preloadedData();
  });

  /**
   * * FORM PROXY
   * @param {HTMLFormElement} node
   * @param {*} parameter
   */
  async function useForm(node, parameter) {
    /**LISTEN FOR SUBMIT ACTION*/
    node.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(node);
      const data = Object.fromEntries(formData);
      /**CONVERT VALUES*/
      const parsed = {
        id: data.id.trim(),
        product: data.product.trim(),
        description: data.description.trim(),
        category: data.category.trim(),
        max: +data.max,
        quantity: +data.quantity,
        unit_price: +data.unit_price,
        warehouse: data.warehouse.trim(),
      };
      /**PROMPT FOR UPDATING*/
      const dialog = await window.dialogs.message({
        type: "info",
        title: "Update",
        message: `Updating Product Item [${mutableSchema.product}],\ndo you want to proceed?`,
        buttons: ["OK", "Cancel"],
      });

      if (dialog.response === 0) {
        /**UPDATE TO DATABASE (INVENTORY)*/
        let result = await window.inventory.update([parsed]);
        if (result?.error) {
          /**HANDLE ERROR*/
          await window.dialogs.error({
            title: "Error",
            message: "Database Error",
          });
        } else {
          /**RETURN BACK TO INVENTORY AFTER SAVING*/
          isSaved = true;
          $goto("/inventory");
        }
      } else {
        return;
      }
    });
  }

  /**
   * * ON UNDO/RESET FIELDS
   */
  async function onUndo() {
    /**PROMPT USER FOR ACTION*/
    const dialog = await window.dialogs.message({
      type: "warning",
      title: "Undo",
      message: "Reverting Changes,\ndo you want to proceed?",
      buttons: ["OK", "Cancel"],
    });
    if (dialog.response === 0) {
      mutableSchema = { ...immutableSchema };
    } else {
      return;
    }
  }
</script>

<form action="/" class="content" use:useForm>
  <Fade animateIn>
    <!-- @FORM TITLEBAR -->
    <TitleBanner title="EDIT ITEM" hasBack="/inventory">
      <div class="btn-group">
        <!--@ SAVE BUTTON-->
        <input type="submit" value="Save" class="btn" disabled={!enableForm} />
        <!--@ UNDO BUTTON-->
        <button
          class="btn"
          on:click|preventDefault={onUndo}
          disabled={!enableForm}>Undo</button
        >
      </div>
    </TitleBanner>

    <!-- @FORM BODY -->
    <br />
    <div class="card m-0 p-0">
      <EnableForm
        value={enableForm}
        on:onchecked={(event) => (enableForm = event.detail.value)}
      />

      <div class="form-row row-eq-spacing-md p-card">
        <!-- @ID -->
        <input type="hidden" name="id" value={mutableSchema.id} />
        <div class="col-md form-group">
          <!-- @PRODUCT NAME -->
          <Input
            id="product"
            name="product"
            label="Product Name"
            required
            value={mutableSchema.product}
            placeholder="Apple Syrup"
            disabled={!enableForm}
            on:onchange={(event) =>
              (mutableSchema.product = event.detail.value)}
          />
          <!-- @PRODUCT DESCRIPTION -->
          <Input
            placeholder="Apple Syrup Large (Family Pack)"
            type="textarea"
            id="description"
            name="description"
            label="Product Description"
            value={mutableSchema.description}
            disabled={!enableForm}
            on:onchange={(event) =>
              (mutableSchema.description = event.detail.value)}
          />
          <!-- @PRODUCT CATEGORY -->
          <Input
            type="select"
            label="Category"
            name="category"
            id="category"
            required
            value={mutableSchema.category}
            selectChildren={categoryList}
            disabled={!enableForm}
            on:onchange={(event) =>
              (mutableSchema.category = event.detail.value)}
          />
        </div>
        <div class="col-md form-group">
          <!-- @MAX QUANTITY -->
          <Input
            id="quantity"
            name="max"
            type="number"
            label="Max Quantity"
            disabled={!enableForm}
            required
            min={1}
            value={mutableSchema.max}
            on:onchange={(event) => (mutableSchema.max = event.detail.value)}
          />
          <!-- @QUANTITY -->
          <Input
            id="quantity"
            name="quantity"
            type="number"
            label={`Quantity : (Max Quantity ${mutableSchema.max})`}
            disabled={!enableForm}
            value={mutableSchema.quantity}
            required
            max={mutableSchema.max}
            on:onchange={(event) =>
              (mutableSchema.quantity = event.detail.value)}
          />
          <!-- @UNIT PRICE -->
          <Input
            id="unit_price"
            name="unit_price"
            type="number"
            label="Unit Price"
            disabled={!enableForm}
            value={mutableSchema.unit_price}
            required
            step="0.01"
            on:onchange={(event) =>
              (mutableSchema.unit_price = event.detail.value)}
            isExtended="prepend"
          >
            <span class="input-group-text" slot="prepend">&#8369</span>
          </Input>
          <!-- @WAREHOUSE LOCATION -->
          <Input
            id="warehouse"
            required
            name="warehouse"
            type="select"
            label="Warehouse"
            disabled={!enableForm}
            value={mutableSchema.warehouse}
            selectChildren={warehouseList}
            on:onchange={(event) =>
              (mutableSchema.warehouse = event.detail.value)}
          />
        </div>
      </div>
    </div>
  </Fade>
</form>
