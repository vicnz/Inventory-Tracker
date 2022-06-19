<script>
  import { createEventDispatcher } from "svelte";
  export let id = crypto.randomUUID();
  export let required = false;
  export let label = "Form Label";
  export let type = "text";
  export let value = null;
  export let name = "";
  export let isExtended = "";
  export let selectChildren = [];
  export let placeholder = "";
  const dispatch = createEventDispatcher();

  /**
   * * ON INPUT CHANGED
   * @param {DOMEvent} event
   */
  function onChange(event) {
    dispatch("onchange", { value: event.target.value });
  }
</script>

<!--
  @ TYPE [text, tel, number, password, date]
-->

{#if ["text", "tel", "number", "password"].includes(type)}
  <label for={id} class={required ? "required" : ""}>{label}</label>
  <div class={isExtended ? "input-group" : ""}>
    {#if isExtended == "prepend"}
      <div class="input-group-prepend">
        <slot name="prepend" />
      </div>
    {/if}
    <input
      {type}
      {name}
      {id}
      {required}
      {value}
      class={`form-control`}
      {placeholder}
      {...$$props}
      on:change|preventDefault={onChange}
      onkeydown="return event.key != 'Enter'"
    />
    <!--@HAS EXTENDED-->
    {#if isExtended === "append"}
      <div class="input-group-append">
        <slot name="append" />
      </div>
    {/if}
  </div>
  <!--
  @ TYPE [select]
  * required parameter - selectChildren: Array
-->
{:else if type === "select"}
  <label for={id} class={required ? "required" : ""}>{label}</label>
  <select
    {name}
    {id}
    class={`form-control`}
    {required}
    {value}
    {placeholder}
    on:change|preventDefault={onChange}
    {...$$props}
  >
    {#each selectChildren as child}
      <option value={child.value}>{child.label}</option>
    {/each}
  </select>
  <!--
    @ TYPE [Textarea]
  -->
{:else if type === "textarea"}
  <label for={id} class={required ? "required" : ""}>{label}</label>
  <textarea
    {name}
    {id}
    {value}
    {required}
    {placeholder}
    {...$$props}
    on:change|preventDefault={onChange}
    class={`form-control`}
  />
  <!--
    @ TYPE [checkbox]
  -->
{:else if type === "checkbox"}
  <div class="form-group">
    <div class="custom-checkbox">
      <input
        type="checkbox"
        {name}
        {id}
        {required}
        on:change={onChange}
        {value}
        {...$$slots}
      />
      <label for={id} class={required ? "required" : ""}>{label}</label>
    </div>
  </div>
  <!--
    @ TYPE [Switch]
  -->
{:else if type === "switch"}
  <div class="custom-switch">
    <input
      type="checkbox"
      {name}
      {id}
      {required}
      on:change|preventDefault={onChange}
      {value}
      {...$$slots}
    />
    <label for={id} class={required ? "required" : ""}>{label}</label>
  </div>
  <!--
    @ TYPE [radio]
  -->
{:else if type === "radio"}
  <input
    type="checkbox"
    {name}
    {id}
    {required}
    on:change|preventDefault={onChange}
    {value}
    {...$$slots}
  />
  <label for={id} class={required ? "required" : ""}>{label}</label>
  <!--
    @ TYPE [date]
  -->
{:else if type === "date"}
  <label for={id}>{label}</label>
  <input
    type="date"
    {name}
    {id}
    {required}
    class="form-control"
    {value}
    on:change|preventDefault={onChange}
    {...$$slots}
  />
  <!--
    @ TYPE [email]
  -->
{:else if type === "email"}
  <label for={id} class={`${required ? "required" : ""}`}>{label}</label>
  <input
    type="email"
    {name}
    {id}
    {required}
    class="form-control"
    {value}
    on:change|preventDefault={onChange}
    {...$$slots}
  />
{/if}
