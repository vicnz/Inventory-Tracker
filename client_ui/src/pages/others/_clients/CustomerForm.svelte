<script>
  import Input from "../../_components/Input.svelte";
  import { CUSTOMER } from "../../_components/utils";
  export let type = "add";
  export let id = null;
  export let undo = {};
  const immutableData = {
    ...CUSTOMER,
  };
  let immutablePreloadedData = {};

  let mutable = { ...immutableData };

  //PRELOAD DATA FOR type=edit
  async function preloadData() {
    if (type === "add") {
      return { ...immutableData };
    } else {
      const data = await window.clients.getOne({ type: "customer", id: id });
      immutablePreloadedData = { ...data };
      mutable = { ...data };
      return data;
    }
  }
  //on undo
  $: {
    if (undo.result) {
      if (type === "add") {
        mutable = { ...immutableData };
      } else {
        mutable = { ...immutablePreloadedData };
      }
    }
  }
</script>

<input type="hidden" name="mode" value={type} />
<input type="hidden" name="type" value="customer" />

{#if type === "edit"}
  <input type="hidden" name="id" value={mutable.id} />
{/if}
{#await preloadData()}
  <p>loading...</p>
{:then data}
  <div class="card m-0">
    <div class="content-title text-capitalize">{type} Item</div>
    <br />
    <div class="form-row row-sm-eq-spacing">
      <div class="col-sm">
        <Input
          id="id"
          name="id"
          label="Client ID"
          placeholder="john-wick-123"
          required={type === "add"}
          disabled={type === "edit"}
          value={mutable.id}
          on:onchange={(event) => {
            mutable.id = event.detail?.value.trim().replace(/\s/g, "-");
          }}
          isExtended="append"
        >
          <button
            class="btn shadow-none"
            slot="append"
            data-toggle="tooltip"
            data-title="Generate ID"
            disabled={type === "edit"}
            on:click|preventDefault={async () => {
              mutable.id = window.utils.generateID();
            }}
            tabindex="-1"
          >
            <span class="ri ri-settings-2-line" />
          </button>
        </Input>
        <Input
          id="name"
          name="name"
          label="Client Name"
          placeholder="John Doe"
          required
          value={mutable.name}
          on:onchange={(event) => (mutable.name = event.detail.value.trim())}
        />
        <Input
          id="company"
          name="company"
          label="Client Company"
          placeholder="N/A"
          value={mutable.company}
          on:onchange={(event) =>
            (mutable.company =
              event.detail.value.trim().length < 1
                ? "N/A"
                : event.detail.value.trim())}
        />
        <Input
          type="textarea"
          id="address"
          name="address"
          label="Address"
          placeholder="North Bridge"
          value={mutable.address}
          on:onchange={(event) =>
            (mutable.address =
              event.detail.value.trim().length < 1
                ? "N/A"
                : event.detail.value.trim())}
        />
      </div>
      <div class="p-10" />
      <div class="col-sm">
        <Input
          id="contact"
          name="contact"
          required
          placeholder="9453682158"
          label="Client Contact"
          value={mutable.contact}
          on:onchange={(event) => (mutable.contact = event.detail.value.trim())}
        />
        <Input
          type="email"
          id="email"
          name="email"
          required
          placeholder="johndoe@email.com"
          label="Client Email"
          value={mutable.email}
          on:onchange={(event) => (mutable.email = event.detail.value.trim())}
        />
      </div>
    </div>
  </div>
{/await}
