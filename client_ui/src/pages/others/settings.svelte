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

  onMount(() => {
    currentTheme = halfmoon.getPreferredMode() == "dark-mode";
  });

  function onThemeChange(event) {
    halfmoon.toggleDarkMode();
    currentTheme = !currentTheme;
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
        <h3 class="text-no-wrap">
          {currentTheme
            ? "🌑 Welcome To The Dark Side"
            : "😎 Here Comes The Sun"}
        </h3>
        <p>
          {#if currentTheme}
            <p>
              Oh, You think darkness is your ally? You merely adopted the dark.
              I was born in it, molded by it.
            </p>
            <br />
            <em class="text-muted"> ~ Bane (Batman)</em>
          {:else}
            <p>
              Happiness can be found even in the darkest of times, if one only
              remembers to turn on the light
            </p>
            <br />
            <em class="text-muted"> ~ Prof. Dumbledore (Harry Potter)</em>
          {/if}
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
    <p>
      Backup Database File, Give meaningful names for your backup file, such as
      appending a <strong>Date</strong> to remember it easily, ex.
      <code class="code">
        Backup_File_{new Date(Date.now())
          .toLocaleString()
          .replace(/[/]/g, "-")
          .replace(/[:]/g, "-")
          .replace(/[\,\s]/g, "_")}.db
      </code>.
    </p>
    <br />
    <button class="btn btn-block" on:click={() => window.utils.backup()}>
      BACKUP
    </button>
  </div>
  <br />
  <hr />
  <br />
  <!-- @ LOAD A BACKUP FILE -->
  <div class="card m-0 bg-light-lm">
    <div class="content-title ">LOAD BACKUP</div>
    <p>
      Load a Backup File, make sure that the Backup originated from the same
      app. The App will check if the Backup is Valid or Incompatible
    </p>
    <br />
    <button class="btn btn-block" on:click={() => window.utils.load()}
      >LOAD</button
    >
  </div>
  <br />
  <hr />
  <br />
  <div class="card m-0 bg-light-lm">
    <div class="content-title">DELETE AUDITED ITEMS (DISCARDED)</div>
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
  <br />
  <hr />
  <br />
  <div class="card m-0 bg-light-lm">
    <div class="content-title">FORECASTING (PROPOSED FEATURE)</div>
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
