<!--
  @ EDIT (IMPORTS)
-->
<script>
  import { params, redirect, goto, beforeUrlChange } from "@roxi/routify";
  import { onMount } from "svelte";
  /**COMPONENTS*/
  import TitleBanner from "../_components/TitleBanner.svelte";
  import Fade from "../_components/Fade.svelte";
  import Input from "../_components/Input.svelte";
  import EnableForm from "../_components/EnableForm.svelte";
  import { pageLeaveHandler, dateClient } from "../_components/utils";

  /**
   * * HANDLE PAGE EXIT
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
  const slug = $params.slug?.trim(); /**SLUG PARAMETER*/
  $: enableForm = false; /**ENABLE FORM*/
  $: isSaved = false;
  $: selectedProductMax = 1;
  let productList = [];
  let supplierList = [];
  $: immutableSchema = {};
  $: mutableSchema = { ...immutableSchema };

  /**
   * * PRELOAD DATA
   */
  async function preloadedData() {
    /**LOAD IMPORT ITEM*/
    const result = await window.imports.getOne(slug);
    if (result) {
      immutableSchema = { ...result };
    } else {
      $redirect("../_fallback.svelte");
    }
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

    /**INITIAL SELECTED PRODUCT QUANTITY*/
    selectedProductMax = productList.filter((key) => {
      return key.value == mutableSchema.product;
    })[0].remainder;
  }

  /**PRELOAD DATA ON MOUNT*/
  onMount(() => {
    preloadedData();
  });

  /**
   * * FORM PROXY
   * @param {HTMLFormElement} node
   * @param {*} paramter
   */
  async function useForm(node, paramter) {
    /**LISTEN TO SUBMITTION*/
    node.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(node);
      const data = Object.fromEntries(formData);
      /**CONVERT STRING TO PRIMITIVE*/
      const parsed = {
        id: data.id.trim(),
        product: data.product,
        supplier: data.supplier,
        quantity: +data.quantity,
        shipment: dateClient(data.shipment),
        arrival: dateClient(data.arrival),
        arrived: new Boolean(data.arrived).valueOf() ? 1 : 0,
      };

      /**PROMPT UPDATE ITEM TO USER*/
      const dialog = await window.dialogs.message({
        type: "info",
        title: "Update",
        message: `Updating Product Item [${mutableSchema.product}],\ndo you want to proceed?`,
        buttons: ["OK", "Cancel"],
      });
      if (dialog.response === 0) {
        /**UPDATE NEW IMPORTS*/
        let result = await window.imports.update([parsed]);
        if (result?.error) {
          /**HANDLE ERROR*/
          await window.dialogs.error({
            title: "Error",
            message: "Database Error",
          });
          return;
        } else {
          /**RETURN BACK TO IMPORTS*/
          isSaved = true;
          $goto("/imports");
        }
      } else {
        return;
      }
    });
  }

  /**
   * * ON UNDO
   */
  async function onUndo() {
    /**PROMPT USER FOR CONFIRMATION*/
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

  /**
   * * ON TOGGLE FINAL / AUDITED
   * @param {HTMLElementEvent} event
   */
  async function onToggleFinal(event) {
    let value = event.target.checked;
    if (value) {
      const dialog = await window.dialogs.message({
        type: "info",
        title: "Mark Item as Final",
        message: "Mark This Order Item as Shipped and Arrived on Destination.",
        detail:
          "NOTE: once an item is marked as shipped it can no longer be modified",
        buttons: ["Ok", "Cancel"],
      });
      console.log(mutableSchema.arrived);
      if (dialog.response === 0) {
        mutableSchema.arrived = event.target.checked;
        event.target.checked = true;
        return;
      } else {
        mutableSchema.arrived = event.target.checked;
        event.target.checked = false;
        return;
      }
    }
  }
</script>

<form action="/" class="content" use:useForm>
  <Fade animateIn>
    <!-- @FORM TITLEBAR -->
    <TitleBanner title="EDIT ITEM" hasBack="/imports">
      <div class="btn-group">
        <!--@ SAVE BUTTON-->
        <input type="submit" value="Save" class="btn" disabled={!enableForm} />
        <!--@ DELETE BUTTOn-->
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
      <!--@ ENABLE FORM EDITING-->
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
            type="select"
            id="product"
            name="product"
            label="Product Name"
            required
            selectChildren={productList}
            value={mutableSchema.product}
            disabled={!enableForm}
            on:onchange={(event) => {
              selectedProductMax = productList.filter((key) => {
                return key.value == event.detail.value;
              })[0].remainder;
              mutableSchema.product = event.detail.value;
            }}
          />
          <!-- @SUPPLIER -->
          <Input
            type="select"
            id="supplier"
            required
            name="supplier"
            label="Supplier"
            selectChildren={supplierList}
            value={mutableSchema.supplier}
            disabled={!enableForm}
            on:onchange={(event) =>
              (mutableSchema.supplier = event.detail.value)}
          />
          <!-- @QUANTITYY -->
          <Input
            type="number"
            label={`Quantity [Available Slots: ${selectedProductMax}]`}
            name="quantity"
            id="quantity"
            max={selectedProductMax}
            required
            value={mutableSchema.quantity}
            disabled={!enableForm}
            on:onchange={(event) =>
              (mutableSchema.quantity = event.detail.value)}
          />
        </div>
        <div class="col-md form-group">
          <!-- @SHIPMENT -->
          <Input
            id="shipment"
            name="shipment"
            type="date"
            label="Shipment"
            disabled={!enableForm}
            required
            value={dateClient(mutableSchema.shipment)}
            on:onchange={(event) =>
              (mutableSchema.shipment = event.detail.value)}
          />
          <!-- @ARRIVAL -->
          <Input
            id="arrival"
            name="arrival"
            type="date"
            label="Arrival"
            disabled={!enableForm}
            value={dateClient(mutableSchema.arrival)}
            required
            min={dateClient(mutableSchema.shipment)}
            on:onchange={(event) =>
              (mutableSchema.arrival = event.detail.value)}
          />
          <br />
          <hr />
          <br />
          <!-- @ARRIVED -->
          <div class="custom-checkbox">
            <input
              type="checkbox"
              id="arrived"
              name="arrived"
              disabled={!enableForm}
              value={mutableSchema.arrived}
              on:change={onToggleFinal}
            />
            <label for="arrived">Mark Item As Shipped ✔️</label>
          </div>
        </div>
      </div>
    </div>
  </Fade>
</form>
