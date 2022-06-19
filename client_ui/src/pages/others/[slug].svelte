<script>
  import Fade from "../_components/Fade.svelte";
  import { params, goto } from "@roxi/routify";
  import Header from "../_components/TitleBanner.svelte";
  import CustomerForm from "./_clients/CustomerForm.svelte";
  import SupplierForm from "./_clients/SupplierForm.svelte";
  let { mode, type, slug } = $params;
  //UNDO OPERATION
  let undoClicked = { type, mode, result: null };

  //handle form submittion
  function handleForm(node, param) {
    node.addEventListener("submit", async (event) => {
      event.preventDefault();
      const rawData = new FormData(node);
      const data = Object.fromEntries(rawData);
      let { mode, type, ...formData } = data;

      /**
       * @ MODE = ADD
       */
      if (mode === "add") {
        //prompt add
        const prompt = await window.dialogs.message({
          type: "info",
          title: "ADD",
          message: `ADD NEW ${type}`.toUpperCase(),
          buttons: ["Ok", "Cancel"],
        });

        if (prompt.response === 0) {
          if (
            await window.clients.exists({
              type,
              id: formData.id,
            })
          ) {
            await window.dialogs.error({
              title: "Duplicate ID",
              message: `Item Id [${formData.id}] Already Exist.`,
            });
          } else {
            const result = await window?.clients?.insert({
              data: { ...formData, type },
            });
            if (result) {
              await window.dialogs.error({
                title: "Error",
                message: "Database Error",
              });
            } else {
              $goto("/others/clients", { type });
            }
          }
        } else {
          return;
        }

        /**
         * @ MODE = EDIT
         */
      } else if (mode === "edit") {
        //UPDATE ITEMS
        const prompt = await window.dialogs.message({
          type: "info",
          title: "UPDATE",
          message:
            `UPDATING ${type} [${formData.name}] Information`.toLowerCase(),
          buttons: ["Ok", "Cancel"],
        });

        if (prompt.response === 0) {
          //UPDATE ITEM
          let result = await window?.clients?.update({
            data: { ...formData, type },
          });
          if (result) {
            await window.dialogs.error({
              title: "Error",
              message: "Database Error",
            });
          } else {
            $goto("/others/clients", { type });
          }
        } else {
          return;
        }
      }
    });
  }

  //@ UNDO
  async function onUndo() {
    const prompt = await window.dialogs.message({
      type: "warning",
      title: "Clear",
      message: "Clear Unsave Changes?",
      buttons: ["Ok", "Cancel"],
    });

    undoClicked = { ...undoClicked, result: prompt.response === 0 };
  }
</script>

<Fade animateIn>
  <form class="content" action="/" use:handleForm>
    {#if type === "supplier"}
      <!-- @ SUPPLIER FORM -->
      <Header
        hasBack="/others/clients"
        params={{ type: "supplier" }}
        title={mode == "add" ? "Add New Supplier" : "Edit Supplier"}
      >
        <div>
          <button class="btn">Save</button>
          <button class="btn" on:click|preventDefault={onUndo}>Undo</button>
        </div>
      </Header>
      <br />
      <SupplierForm type={mode} id={slug} undo={undoClicked} />
    {:else if type === "customer"}
      <!-- @ CUSTOMER FORM -->
      <Header
        hasBack="/others/clients"
        params={{ type: "customer" }}
        title={mode == "add" ? "Add New Customer" : "Edit Customer"}
      >
        <div>
          <button class="btn">Save</button>
          <button class="btn" on:click|preventDefault={onUndo}>Undo</button>
        </div>
      </Header>
      <br />
      <CustomerForm type={mode} id={slug} undo={undoClicked} />
    {/if}
  </form>
</Fade>
