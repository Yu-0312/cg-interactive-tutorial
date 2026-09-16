/* Value-noise fBm */
(function () {
  "use strict";
  let seed = 1;
  function hash(x, y) {
    let n = x * 374761393 + y * 668265263 + seed * 1274126177;
    n = (n ^ (n >> 13)) * 1274126177;
    return ((n ^ (n >> 16)) >>> 0) / 4294967295;
  }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function valueNoise(x, y) {
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = smooth(x - x0), fy = smooth(y - y0);
    const v00 = hash(x0, y0), v10 = hash(x0 + 1, y0);
    const v01 = hash(x0, y0 + 1), v11 = hash(x0 + 1, y0 + 1);
    const a = v00 * (1 - fx) + v10 * fx;
    const b = v01 * (1 - fx) + v11 * fx;
    return a * (1 - fy) + b * fy;
  }
  function fbm(x, y, octaves, gain) {
    let amp = 0.5, freq = 1, sum = 0, norm = 0;
    for (let i = 0; i < octaves; i++) {
      sum += amp * valueNoise(x * freq, y * freq);
      norm += amp;
      amp *= gain;
      freq *= 2;
    }
    return sum / norm;
  }

  function draw() {
    const canvas = document.getElementById("nz-canvas");
    if (!canvas) return;
    const oct = Number(document.getElementById("nz-oct")?.value || 4);
    const gain = Number(document.getElementById("nz-gain")?.value || 0.5);
    document.getElementById("nz-oct-v").textContent = String(oct);
    document.getElementById("nz-gain-v").textContent = gain.toFixed(2);

    const W = 400, H = 280;
    const ctx = RL.fitCanvas(canvas, W, H);
    const img = ctx.createImageData(W, H);
    const d = img.data;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const v = fbm((x / W) * 6, (y / H) * 4.2, oct, gain);
        const i = (y * W + x) * 4;
        d[i] = 40 + v * 180;
        d[i + 1] = 70 + v * 160;
        d[i + 2] = 90 + v * 120;
        d[i + 3] = 255;
      }
    }
    RL.blitPixels(ctx, canvas, img);
  }

  function init() {
    document.getElementById("nz-oct")?.addEventListener("input", draw);
    document.getElementById("nz-gain")?.addEventListener("input", draw);
    document.getElementById("nz-reseed")?.addEventListener("click", () => {
      seed = Math.floor(Math.random() * 1e6) + 1;
      draw();
    });
    draw();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
