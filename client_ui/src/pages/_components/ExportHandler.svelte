<script>
  export let tableName = "";
  export let column = "id";
  export let checked = [];

  async function onExport(type) {
    if (checked.length > 0) {
      const ids = checked.map((item) => item[0]);
      await window.utils.export(ids, column, tableName, type);
    }
  }
</script>

<div class="dropdown">
  <button class="btn" disabled={checked.length < 1} data-toggle="dropdown">
    Export
  </button>
  <div class="dropdown-menu dropdown-menu-right">
    <div class="dropdown-content text-center">
      <p class="badge badge-pill">Selected: {checked.length}</p>
    </div>
    <!-- Export to CSV -->
    <div on:click={() => onExport("csv")} class="dropdown-item">CSV</div>
    <!-- Export to HTML -->
    <div on:click={() => onExport("html")} class="dropdown-item">HTML</div>
    <!-- Export to Markdown -->
    <div on:click={() => onExport("markdown")} class="dropdown-item">
      Markdown
    </div>
  </div>
</div>
