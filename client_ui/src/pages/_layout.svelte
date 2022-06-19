<script>
  import NavigationBar from "./_components/AppBar.svelte";
</script>

<div class="page-wrapper with-navbar">
  <div class="sticky-alerts" />
  <NavigationBar title="Inventory Tracker" />
  <div class="content-wrapper">
    <slot />
  </div>
</div>
