<!--
  @ APP BAR SECTION
-->
<script>
  import { isActive, url } from "@roxi/routify";
  export let title = "Default Name";
  /**
   * @ URL PATHS
   */
  const paths = [
    { label: "Dashboard", path: "/index" },
    { label: "Inventory", path: "/inventory" },
    { label: "Imports", path: "/imports" },
    { label: "Exports", path: "/exports" },
  ];
  /**
   * URL PATHS For (Others Section)
   */
  const pathsOthers = [
    { label: "Categories", path: "/others/category" },
    { label: "Warehouses", path: "/others/warehouse" },
    {
      label: "Supplier",
      path: "/others/clients",
      params: { type: "supplier" },
    },
    {
      label: "Customer",
      path: "/others/clients",
      params: { type: "customer" },
    },
    { label: "Settings", path: "/others/settings" },
  ];
</script>

<nav class="navbar">
  <div class="navbar-text text-uppercase d-flex align-items-center">
    <span class="ri ri-archive-fill" />
    &nbsp;
    {title}
  </div>
  <!-- @Navigation Links (Shown Only On Larger Screen) -->
  <div class="flex-fill navbar-nav hidden-sm-and-down justify-content-center">
    {#each paths as item}
      <div class={`nav-item ${$isActive(item.path) ? "active" : ""}`}>
        <a href={$url(item.path)} class="nav-link">
          {item.label}
        </a>
      </div>
    {/each}
    <!-- @OTHERS -->
    <div class="nav-item dropdown">
      <!-- svelte-ignore a11y-missing-attribute -->
      <a class="nav-link" data-toggle="dropdown">Others</a>
      <div class="dropdown-menu">
        {#each pathsOthers as other}
          <a
            href={$url(other.path, other.params)}
            class={`dropdown-item ${$isActive(other.path) ? "active" : ""}`}
          >
            {other.label}
          </a>
        {/each}
      </div>
    </div>
  </div>

  <!-- @Navigation Links Dropdown (Shown Only On Smaller Screen) -->
  <div class="navbar-content hidden-md-and-up">
    <div class="dropdown with-arrow">
      <button class="btn" data-toggle="dropdown">Menu</button>
      <div class="dropdown-menu">
        <div class="dropdown-header text-primary">Navigation</div>
        {#each paths as item}
          <a
            class={`dropdown-item ${$isActive(item.path) ? "active" : ""}`}
            href={$url(item.path)}
          >
            {item.label}
          </a>
        {/each}
        <div class="dropdown-divider" />
        {#each pathsOthers as other}
          <a
            class={`dropdown-item ${$isActive(other.path) ? "active" : ""}`}
            href={$url(other.path, other.params)}
          >
            {other.label}
          </a>
        {/each}
      </div>
    </div>
  </div>
  <div class="flex-fill hidden-md-and-up" />

  <!-- @Window Controllers -->
  <div class="navbar-content">
    <div class="btn-group">
      <!--@MINIMIZE-->
      <button
        class="btn btn-square shadow-none"
        on:click={() => window.controller.minimize()}
        title="Minimize"
      >
        <span class="ri ri-subtract-line" />
      </button>
      <!--@MAXIMIZE/UNMAXIMIZE-->
      <button
        class="btn btn-square shadow-none"
        on:click={() => window.controller.maximize()}
        title="(Un)Maximize"
      >
        <span class="ri ri-add-line" />
      </button>
      <!--@EXIT-->
      <button
        class="btn btn-square shadow-none"
        on:click={() => window.controller.close()}
        title="Close"
      >
        <span class="ri ri-close-line" />
      </button>
    </div>
  </div>
</nav>

<style>
  .navbar {
    display: relative;
  }
  .navbar::after {
    content: "";
    height: 15px;
    width: inherit;
    top: 0;
    left: 0;
    right: 0;
    position: absolute;
    z-index: 10;
    -webkit-app-region: drag;
  }
</style>
