<script>
  export let value = false;
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  function onChecked() {
    dispatch("onchecked", { value: !value });
  }
</script>

<div class="alert alert-primary p-card border-0 rounded-0">
  <div class="custom-checkbox">
    <input
      type="checkbox"
      id="enable-form"
      {value}
      on:change|preventDefault={onChecked}
    />
    <label for="enable-form">
      Enable Form Editing.
      <slot />
    </label>
  </div>
</div>
