<script>
  import { genRandom } from "./utils";
</script>

<div class="grid content">
  <div class="wrapper">
    <div class="d-flex body">
      <div class="image-holder shimmer" />
      <div class="text-holder d-flex flex-column justify-content h-full w-full">
        <div
          class="holder-row shimmer"
          style={`width: ${genRandom({ min: 50, max: 100 })}%`}
        />
        <div
          class="holder-row shimmer"
          style={`width: ${genRandom({ min: 50, max: 100 })}%`}
        />
        <div
          class="holder-row shimmer"
          style={`width: ${genRandom({ min: 50, max: 100 })}%`}
        />
        <div
          class="holder-row shimmer"
          style={`width: ${genRandom({ min: 50, max: 100 })}%`}
        />
        <div
          class="holder-row shimmer"
          style={`width: ${genRandom({ min: 50, max: 100 })}%`}
        />
        <div
          class="holder-row shimmer"
          style={`width: ${genRandom({ min: 50, max: 100 })}%`}
        />
      </div>
    </div>
  </div>
</div>

<style>
  .wrapper {
    height: 200px;
    width: auto;
    position: relative;
    display: flex;
  }
  .wrapper .body {
    padding: 1em;
    height: 100%;
    width: 100%;
    align-items: center;
    gap: 1em;
  }
  .image-holder {
    opacity: 0.3;
    height: 170px;
    width: 170px;
    border-radius: 10px;
  }
  .text-holder {
    flex: 2;
    gap: 10px;
    justify-content: space-between;
  }
  .holder-row {
    height: 10px;
    width: auto;
    opacity: 0.3;
    border-radius: 10px;
  }
  @keyframes -global-shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  .shimmer {
    animation: shimmer 2s infinite linear;
    background: -webkit-linear-gradient(
      0deg,
      rgba(230, 230, 230, 0),
      rgba(126, 126, 126, 0.5),
      rgba(230, 230, 230, 0)
    );
    background-size: 1000px 100%;
  }
</style>
