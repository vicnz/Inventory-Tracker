<!--
  @ ADD (IMPORTS) PAGE
-->
<script>
  import { goto, beforeUrlChange } from "@roxi/routify";
  import { onMount } from "svelte";
  /**COMPONENTS*/
  import TitleBanner from "../_components/TitleBanner.svelte";
  import Fade from "../_components/Fade.svelte";
  import Input from "../_components/Input.svelte";
  import {
    clear,
    IMPORTED,
    pageLeaveHandler,
    dateClient,
  } from "../_components/utils";

  /**
   * * HANDLE PAGE EXIT
   */
  $beforeUrlChange(async (event, route) => {
    /**CHECK IF DATA IS MODIFIED*/
    if (JSON.stringify(IMPORTED) === JSON.stringify(template)) {
      return true;
    } else if (isSaving) {
      return true;
    } else {
      return await pageLeaveHandler("Unsaved Changes, proceed?");
    }
  });

  /**
   * * VARIABLES
   */
  let productList = [];
  let supplierList = [];
  let isSaving = false;
  let template = { ...IMPORTED };
  $: availableInventorySlot = 1;

  /**
   * * FORM PROXY
   * @param {HTMLFormElement}node
   * @param {*} params
   */
  function useForm(node, params) {
    /**LISTEN TO SUBMITION*/
    node.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const data = Object.fromEntries(formData);
      /**CONVERT STRING TO PRIMITIVE*/
      const parsed = {
        id: data.id.trim(),
        product: data.product,
        quantity: +data.quantity,
        supplier: data.supplier,
        shipment: dateClient(data.shipment),
        arrival: dateClient(data.arrival),
        arrived: 0,
      };

      /**REQUEST SAVE DIALOG*/
      const dialog = await window.dialogs.message({
        type: "info",
        title: "Save",
        message: "Saving this Order Item, do you want to proceed?",
        buttons: ["Ok", "Cancel"],
      });
      if (dialog.response === 0) {
        /**CHECK IF ID ALREADY EXISTS*/
        if (await window.imports.exists(parsed.id)) {
          /**HANDLE ERROR*/
          await window.dialogs.error({
            title: "Error",
            message: `Import Having ID [${parsed.id}] already Exist.`,
          });
          return;
        } else {
          /**INSERT NEW RECORD*/
          const result = await window.imports.insert([parsed]);
          if (result?.error) {
            /**HANDLE ERROR*/
            await window.dialogs.error({
              title: "Error",
              message: "Database Error",
            });
            return;
          } else {
            /**RETURN BACK TO IMPORTS*/
            isSaving = true;
            $goto("/imports");
          }
        }
      } else {
        return;
      }
    });
  }

  /**
   * * ON CLEAR/RESET FIELDS
   */
  async function onClear() {
    /**PROMPT USER FOR CONFIRMATION*/
    const dialog = await window.dialogs.message({
      type: "warning",
      title: "Clear",
      message: "Clearing field values, do you want to proceed?",
      buttons: ["OK", "Cancel"],
    });
    if (dialog.response === 0) {
      template = clear("imports");
    } else {
      return;
    }
  }

  /**
   * * PRELOAD DATA
   */
  async function preloadedData() {
    /**LOAD PRODUCT LIST*/
    const products = await window.others.products();
    productList = products.data.map((item) => ({
      value: item.id,
      label: item.product,
      remainder: item.remainder,
    }));
    /**LOAD SUPPLIER LIST*/
    const suppliers = await window.others.suppliers();
    supplierList = suppliers.data.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  }

  /**PRELOAD DATA ON MOUNT*/
  onMount(() => {
    preloadedData();
  });
</script>

<form class="content" use:useForm action="/">
  <Fade animateIn>
    <!-- @TITLE BANNER -->
    <TitleBanner title="ADD ORDER" hasBack="/imports">
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
        <!-- @ORDER ID -->
        <Input
          id="id"
          name="id"
          required
          label="ID"
          placeholder="apple-seed123"
          value={template.id}
          isExtended="append"
          on:onchange={(event) =>
            (template.id = event.detail.value.trim().replaceAll(/[\s]+/g, "-"))}
          minlength="5"
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
        <!-- @PRODUCT ITEM -->
        <Input
          type="select"
          id="product"
          name="product"
          label="Product Item"
          required
          value={template.product}
          selectChildren={productList}
          on:onchange={(event) => {
            template.product = event.detail.value;
            /**GET AVAILABLE QUANTITY*/
            availableInventorySlot = productList.filter((key) => {
              return key.value == event.detail.value;
            })[0].remainder;
          }}
        />
        <!-- @PRODUCT SUPPLIER -->
        <Input
          required
          type="select"
          id="supplier"
          name="supplier"
          label="Product Supplier"
          value={template.supplier}
          selectChildren={supplierList}
          on:onchange={(event) => (template.supplier = event.detail.value)}
        />
        <!-- @ORDER QUANTITY -->
        <Input
          id="quantity"
          name="quantity"
          type="number"
          min="1"
          required
          max={availableInventorySlot}
          value={template.quantity}
          label={`Order Quantity [Available Slots ${availableInventorySlot}]`}
          on:onchange={(event) => (template.quantity = event.detail.value)}
        />
      </div>
      <div class="col-md form-group">
        <!-- @SHIPMENT -->
        <Input
          required
          type="date"
          id="shipment"
          name="shipment"
          label="Shipment"
          value={template.shipment}
          on:onchange={(event) => (template.shipment = event.detail.value)}
        />
        <!-- @ARRIVAL -->
        <Input
          required
          type="date"
          id="arrival"
          name="arrival"
          label="Arrival Date"
          value={template.arrival}
          min={template.shipment}
          on:onchange={(event) => (template.arrival = event.detail.value)}
        />
        <input type="hidden" value={template.arrived} name="arrived" />
      </div>
    </div>
  </Fade>
</form>
