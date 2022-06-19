<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  //FILE NAME DATE
  let curdate = new Date(Date.now());
  let date = curdate.toLocaleDateString().replace(/\//g, "-");
  let time = curdate.toLocaleTimeString().replace(/[:\s]/g, "-");
  let dateString = `${date}_&_${time}`;

  //VARIABLES
  $: currentTheme = null;
  $: backupfileName = {
    name: "",
    date: dateString,
  };
  onMount(() => {
    currentTheme = halfmoon.getPreferredMode() == "dark-mode";
  });

  function onThemeChange(event) {
    halfmoon.toggleDarkMode();
    currentTheme = !currentTheme;
  }
  function onBackup(event) {
    //TODO
  }
</script>

<div class="container w-full w-lg-half" in:fade>
  <h3 class="card m-0 border-0 pl-md-0 bg-transparent">Settings</h3>
  <br />
  <div class="card m-0 bg-light-lm">
    <div class="content-title">THEME</div>
    <br />
    <div
      class="card m-0 h300 d-flex align-items-center border-0 bg-transparent"
    >
      {#if currentTheme}
        <p in:fade><span class="ri ri-moon-fill ri-5x text-secondary" /></p>
      {:else}
        <p in:fade><span class="ri ri-sun-fill ri-5x text-secondary" /></p>
      {/if}
      <div class="p-10" />
      <div>
        <h4 class="text-no-wrap">
          {currentTheme ? "🌑Welcome to the Dark Side" : "😎Here comes the sun"}
        </h4>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima,
          voluptatibus. Quisquam vero quos porro velit maiores, inventore ea.
          Tenetur voluptates fuga sunt nihil sint quisquam odio perferendis
          alias iure corporis?
        </p>
      </div>
    </div>
    <br />
    <div class="custom-switch">
      <input
        type="checkbox"
        name="check"
        id="toggle-theme"
        checked={currentTheme}
        on:change={onThemeChange}
      />
      <label for="toggle-theme">
        {currentTheme ? "Toggle Light" : "Toggle Dark"}
      </label>
    </div>
  </div>
  <br />
  <hr />
  <br />
  <!-- @ BACKUP  -->
  <div class="card m-0 bg-light-lm">
    <div class="content-title">BACKUP</div>
    <p class="text-secondary">TODO Feature</p>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nemo placeat
      pariatur non excepturi delectus dolor, aut rerum porro. Quas vero
      reprehenderit tempore voluptas voluptatum non temporibus perferendis nobis
      ipsum ex.
    </p>
    <br />
    <div class="form-group form-inline">
      <label for="file-name">File Name</label>
      <div class="input-group">
        <input
          type="text"
          class="form-control"
          placeholder="Provide a file name (exclude the file type)"
          value={backupfileName.name}
        />
        <div class="input-group-append">
          <div class="input-group-text">
            {backupfileName.date}
          </div>
        </div>
      </div>
    </div>
    <button class="btn btn-block" disabled>BACKUP</button>
  </div>
  <br />
  <hr />
  <br />
  <!-- @ LOAD A BACKUP FILE -->
  <div class="card m-0 bg-light-lm">
    <div class="content-title">LOAD BACKUP</div>
    <p class="text-secondary">TODO Feature</p>
    <p>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia eos illo
      enim sit quibusdam repellendus dicta nihil beatae voluptas error est nam
      suscipit autem quis explicabo sapiente consectetur, voluptatum soluta.
    </p>
    <br />
    <button class="btn btn-block" disabled>LOAD</button>
  </div>
  <br />
  <hr />
  <br />
  <div class="card m-0 bg-light-lm">
    <div class="content-title">DELETE AUDITED ITEMS</div>
    <p class="text-secondary">TODO Feature</p>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nemo placeat
      pariatur non excepturi delectus dolor, aut rerum porro. Quas vero
      reprehenderit tempore voluptas voluptatum non temporibus perferendis nobis
      ipsum ex.
    </p>
  </div>
  <br />
  <hr />
  <br />
  <div class="card m-0 bg-light-lm">
    <div class="content-title">DELETE DISCARDED (INVENTORY)</div>
    <p class="text-secondary">TODO Feature</p>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nemo placeat
      pariatur non excepturi delectus dolor, aut rerum porro. Quas vero
      reprehenderit tempore voluptas voluptatum non temporibus perferendis nobis
      ipsum ex.
    </p>
  </div>
  <div class="h-50" />
</div>
