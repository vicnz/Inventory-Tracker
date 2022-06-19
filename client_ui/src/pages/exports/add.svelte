<!--
  @ ADD (EXPORT) PAGE
-->
<script>
  import { onMount } from "svelte";
  import { beforeUrlChange, goto } from "@roxi/routify";
  /**COMPONENTS*/
  import TitleBanner from "../_components/TitleBanner.svelte";
  import Fade from "../_components/Fade.svelte";
  import Input from "../_components/Input.svelte";
  import {
    clear,
    EXPORTED,
    pageLeaveHandler,
    dateClient,
  } from "../_components/utils";

  /**
   * * HANDLE PAGE EXIT
   */
  $beforeUrlChange(async (event, route) => {
    /**CHECK IF DATA IS MUTATED*/
    if (JSON.stringify(EXPORTED) === JSON.stringify(template)) {
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
  let customerList = [];
  let isSaving = false;
  let template = { ...EXPORTED };
  $: ramainingInventorySlot = 1;

  /**
   * * FORM PROXY
   * @param {HTMLFormElement} node
   * @param {*} params
   */
  function useForm(node, params) {
    node.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const data = Object.fromEntries(formData);
      /**CONVERT STRING TO PRIMITIVES*/
      const parsed = {
        id: data.id.trim(),
        product: data.product,
        quantity: +data.quantity,
        client: data.client,
        shipment: dateClient(data.shipment),
        arrived: 0,
      };

      /**REQUEST SAVING DIALOG*/
      const dialog = await window.dialogs.message({
        type: "info",
        title: "Save",
        message: "Saving this Order Item, do you want to proceed?",
        buttons: ["Ok", "Cancel"],
      });
      if (dialog.response === 0) {
        /**CHECK IF ID ALREADY EXIST*/
        if (await window.exports.exists(template.id)) {
          await window.dialogs.error({
            title: "Error",
            message: `Duplicate ID [${template.id}], Id already Exist`,
          });
        } else {
          /**INSERT NEW EXPORT RECORD*/
          const result = await window.exports.insert([parsed]);
          if (result?.error) {
            /**HANDLE ERROR*/
            await window.dialogs.error({
              title: "Error",
              message: "Database Error",
            });
          } else {
            /**RETURN BACK TO EXPORTS PAGE*/
            isSaving = true;
            $goto("/exports");
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
      template = clear("exports");
    } else {
      return;
    }
  }

  /**
   * * PRELOAD DATA
   */
  async function preloadedData() {
    /**LOAD PRODUCT LISTS*/
    const products = await window.others.products();
    productList = products.data.map((item) => ({
      value: item.id,
      label: item.product,
      remainder: item.remainder,
      quantity: item.quantity,
    }));
    /**LOAD CUSTOMER LIST*/
    const customers = await window.others.customers();
    customerList = customers.data.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  }

  /**PRELOAD ON MOUNT*/
  onMount(() => {
    preloadedData();
  });
</script>

<form class="content" use:useForm action="/">
  <Fade animateIn>
    <!-- @TITLE BANNER -->
    <TitleBanner title="Add New Export" hasBack="/exports">
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
        <!-- @EXPORT ID -->
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
            ramainingInventorySlot = productList.filter((key) => {
              return key.value == event.detail.value;
            })[0]?.quantity;
          }}
        />
        <!-- @PRODUCT SUPPLIER -->
        <Input
          required
          type="select"
          id="client"
          name="client"
          label="Product Customer"
          value={template.client}
          selectChildren={customerList}
          on:onchange={(event) => (template.client = event.detail.value)}
        />
        <!-- @ORDER QUANTITY -->
        <Input
          id="quantity"
          name="quantity"
          type="number"
          min="1"
          required
          max={ramainingInventorySlot}
          value={template.quantity}
          label={`Order Quantity [Available Slots ${ramainingInventorySlot}]`}
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
          min={dateClient(new Date(Date.now()))}
          on:onchange={(event) => {
            template.shipment = event.detail.value;
          }}
        />
        <input type="hidden" value={template.arrived} name="arrived" />
      </div>
    </div>
  </Fade>
</form>
