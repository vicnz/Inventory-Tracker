<!--
  @ INVENTORY (ADD) PAGE
-->
<script>
  import { goto, beforeUrlChange } from "@roxi/routify";
  import { onMount } from "svelte";
  /**COMPONENTS*/
  import TitleBanner from "../_components/TitleBanner.svelte";
  import Fade from "../_components/Fade.svelte";
  import Input from "../_components/Input.svelte";
  import { clear, INVENTORY, pageLeaveHandler } from "../_components/utils";

  /**
   * * HANDLE PAGE EXIT
   */
  $beforeUrlChange(async (event, route) => {
    /**CHECK IF DATA IS MUTATED OR ISSAVING*/
    if (JSON.stringify(INVENTORY) === JSON.stringify(template)) {
      return true;
    } else if (isSaving) {
      return true;
    } else {
      const request = await pageLeaveHandler("Unsaved Changes, proceed?");
      if (request) {
        return true;
      } else {
        return false;
      }
    }
  });

  /**
   * * VARIABLES
   */
  let categoryList = [];
  let warehouseList = [];
  let isSaving = false;
  let template = { ...INVENTORY };

  /**
   *  * FORM PROXY
   * @param {HTMLFormElement} node
   * @param {*} params
   */
  function useForm(node, params) {
    node.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const data = Object.fromEntries(formData);
      /**CONVERT TEXT VALUE TO PRIMITIVE VALUES*/
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

      /*PROMPT FOR SAVING CONFIRMATION*/
      const dialog = await window.dialogs.message({
        type: "info",
        title: "Save",
        message: "Saving this Inventory Item, do you want to proceed?",
        buttons: ["Ok", "Cancel"],
      });

      if (dialog.response === 0) {
        /**CHECK IF ID ALREADY EXIST OR NOT*/
        if (await window.inventory.exists(parsed.id)) {
          await window.dialogs.error({
            title: "Duplicate",
            message: `Item Id [${parsed.id}] already Exists.`,
          });
          return;
        } else {
          /**DATABASE INSERTION*/
          let result = await window.inventory.insert([parsed]);
          if (result?.error) {
            /**HANDLE DATABASE ERROR*/
            await window.dialogs.error({
              title: "Error",
              message: "Database Error",
            });
            return;
          } else {
            /**INSERTION SUCCESSFUL RETURN BACK TO INVENTORY PAGE*/
            isSaving = true;
            $goto("/inventory");
          }
        }
      } else {
        return;
      }
    });
  }

  /**
   * * CLEAR (RESET) FIELD VALUES
   */
  async function onClear() {
    /**PROMPT FOR CONFIRMATION*/
    const dialog = await window.dialogs.message({
      type: "warning",
      title: "Clear",
      message: "Clearing field values, do you want to proceed?",
      buttons: ["OK", "Cancel"],
    });
    if (dialog.response === 0) {
      template = clear("inventory");
    } else {
      return;
    }
  }

  /**
   * * PRELOADED DATA (CATEGORY LIST, WAREHOUSE LIST)
   */
  async function preloadedData() {
    /**LOAD CATEGORIES*/
    const categories = await window.others.categories();
    categoryList = categories.data.map((item) => ({
      label: item.label,
      value: item.id,
    }));
    /**LOAD WAREHOUSES*/
    const warehouses = await window.others.warehouses();
    warehouseList = warehouses.data.map((item) => ({
      label: `${item.label} - ${item.location}`,
      value: item.id,
    }));
  }

  /**ON MOUNT PRELOAD*/
  onMount(() => {
    preloadedData();
  });
</script>

<form class="content" use:useForm action="/">
  <Fade animateIn>
    <!-- @TITLE BANNER -->
    <TitleBanner title="Add Inventory" hasBack="/inventory">
      <div class="btn-group">
        <!-- @ON SUBMIT BUTTON -->
        <input type="submit" value="Add New" class="btn" />
        <!-- @ON CLEAR FORM BUTTON -->
        <button class="btn" on:click|preventDefault={onClear}> Clear </button>
      </div>
    </TitleBanner>

    <!-- @FORM CONTROLS -->
    <br />
    <div class="card m-0 form-row row-eq-spacing-md">
      <div class="col-md form-group">
        <!-- @PRODUCT ID -->
        <Input
          id="id"
          name="id"
          required
          label="ID"
          placeholder="apple-seed123"
          isExtended="append"
          minlength={5}
          value={template.id}
          on:onchange={(event) =>
            (template.id = event.detail.value.trim().replaceAll(/[\s]+/g, "-"))}
        >
          <button
            data-title="Generate ID"
            data-toggle="tooltip"
            tabindex="-1"
            class="btn shadow-none"
            slot="append"
            on:click|preventDefault={(event) =>
              (template.id = window.utils.generateID())}
          >
            <span class="ri ri-settings-2-line" />
          </button>
        </Input>
        <!-- @PRODUCT NAME -->
        <Input
          id="name"
          name="product"
          placeholder="Apple Syrup"
          label="Product Name"
          required
          minlength={8}
          value={template.product}
          on:onchange={(event) => (template.product = event.detail.value)}
        />
        <!-- @PRODUCT DESCRIPTION -->
        <Input
          type="textarea"
          id="desc"
          name="description"
          label="Product Description"
          value={template.description.trim()}
          on:onchange={(event) => (template.description = event.detail.value)}
        />
        <!-- @PRODUCT CATEGORY -->
        <Input
          type="select"
          id="category"
          name="category"
          label="Product Category"
          placeholder="Consumables"
          required
          value={template.category}
          selectChildren={categoryList}
          on:onchange={(event) => (template.category = event.detail.value)}
        />
      </div>
      <div class="col-md form-group">
        <!-- @PRODUCT MAX QUANTITY -->
        <Input
          min="1"
          type="number"
          label="Max Quantity"
          name="max"
          required
          id="max_qty"
          value={template.max}
          on:onchange={(event) => (template.max = event.detail.value)}
        />
        <!-- @PRODUCT QUANTITY -->
        <Input
          type="number"
          label={`Initial Quantity (Max Value: ${template.max})`}
          name="quantity"
          required
          id="qty"
          min="0"
          max={template.max}
          value={template.quantity}
          on:onchange={(event) => (template.quantity = event.detail.value)}
        />
        <!-- @PRODUCT UNIT PRICE -->
        <Input
          type="number"
          label="Unit Price"
          name="unit_price"
          required
          id="qty"
          step="0.01"
          min="0"
          isExtended="prepend"
          value={template.unit_price}
          on:onchange={(event) => (template.unit_price = event.detail.value)}
        >
          <div class="input-group-text" slot="prepend">&#8369</div>
        </Input>
        <!-- @PRODUCT WAREHOUSE LOCATION -->
        <Input
          type="select"
          id="warehouses"
          name="warehouse"
          label="Warehouse No."
          required
          value={template.warehouse}
          selectChildren={warehouseList}
          on:onchange={(event) => (template.warehouse = event.detail.value)}
        />
      </div>
    </div>
  </Fade>
</form>
