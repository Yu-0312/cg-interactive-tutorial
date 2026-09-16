/* Fragment-shader-like pattern toy */
(function () {
  "use strict";
  let t = 0;
  let playing = true;
  let raf = null;

  function draw() {
    const canvas = document.getElementById("sh-canvas");
    if (!canvas) return;
    const freq = Number(document.getElementById("sh-freq")?.value || 4);
    const speed = Number(document.getElementById("sh-speed")?.value || 1);
    const W = 400, H = 280;
    const ctx = RL.fitCanvas(canvas, W, H);
    // draw at lower res then scale for speed
    const img = ctx.createImageData(W, H);
    const data = img.data;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const u = (x / W) * freq;
        const v = (y / H) * freq;
        const r = 0.5 + 0.5 * Math.sin(u + t);
        const g = 0.5 + 0.5 * Math.sin(v - t * 0.7);
        const b = 0.5 + 0.5 * Math.sin((u + v) * 0.7 + t * 1.3);
        const i = (y * W + x) * 4;
        data[i] = r * 255;
        data[i + 1] = g * 255;
        data[i + 2] = b * 255;
        data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  function loop() {
    if (playing) {
      t += 0.03 * Number(document.getElementById("sh-speed")?.value || 1);
      draw();
    }
    raf = requestAnimationFrame(loop);
  }

  function init() {
    const freqIn = document.getElementById("sh-freq");
    const speedIn = document.getElementById("sh-speed");
    freqIn?.addEventListener("input", () => {
      document.getElementById("sh-freq-v").textContent = freqIn.value;
      draw();
    });
    speedIn?.addEventListener("input", () => {
      document.getElementById("sh-speed-v").textContent = Number(speedIn.value).toFixed(1);
    });
    document.getElementById("sh-play")?.addEventListener("click", () => {
      playing = !playing;
    });
    draw();
    loop();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
