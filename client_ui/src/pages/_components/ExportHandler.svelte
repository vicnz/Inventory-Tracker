<script>
  export let tableName = "";
  export let dataType = "csv";
  export let column = "id";
  export let checked = [];

  async function onExport() {
    if (checked.length > 0) {
      const ids = checked.map((item) => item[0]);
      await window.utils.export(ids, column, tableName);
    }
  }
</script>

<div class="dropdown">
  <button class="btn" disabled={checked.length < 1} data-toggle="dropdown">
    Export
  </button>
  <div class="dropdown-menu dropdown-menu-center">
    <div
      on:click={onExport}
      class="dropdown-item d-flex align-items-center justify-content-between"
    >
      <span>CSV</span>
      <span class="badge">{checked.length}</span>
    </div>
    <div class="dropdown-content">
      <p class="text-muted">
        For now the only available exported format is CSV (Comma Delimited
        Value) others formats will be added later.
      </p>
    </div>
  </div>
</div>
