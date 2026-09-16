/* Texture nearest vs bilinear sampling toy */
(function () {
  "use strict";
  function tex(u, v) {
    // procedural checker + gradient
    const c = ((Math.floor(u * 8) + Math.floor(v * 8)) & 1) === 0;
    return c ? [240, 180, 41] : [40, 70, 140];
  }
  function texF(u, v) {
    u = u - Math.floor(u);
    v = v - Math.floor(v);
    return tex(u, v);
  }
  function texBilinear(u, v) {
    const x = u * 8, y = v * 8;
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = x - x0, fy = y - y0;
    const c00 = texF(x0 / 8, y0 / 8);
    const c10 = texF((x0 + 1) / 8, y0 / 8);
    const c01 = texF(x0 / 8, (y0 + 1) / 8);
    const c11 = texF((x0 + 1) / 8, (y0 + 1) / 8);
    const out = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      const a = c00[i] * (1 - fx) + c10[i] * fx;
      const b = c01[i] * (1 - fx) + c11[i] * fx;
      out[i] = a * (1 - fy) + b * fy;
    }
    return out;
  }

  function draw() {
    const canvas = document.getElementById("tex-canvas");
    if (!canvas) return;
    const mode = document.getElementById("tex-mode")?.value || "bl";
    const zoom = Number(document.getElementById("tex-zoom")?.value || 6);
    document.getElementById("tex-zoom-v").textContent = zoom.toFixed(1);
    const W = 420, H = 300;
    const ctx = RL.fitCanvas(canvas, W, H);
    const img = ctx.createImageData(W, H);
    const d = img.data;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const u = (x / W) * zoom;
        const v = (y / H) * zoom * (H / W);
        // nearest: snap to texel center; bilinear: interpolate
        const cc = mode === "nn"
          ? texF((Math.floor(u * 8) + 0.5) / 8, (Math.floor(v * 8) + 0.5) / 8)
          : texBilinear(u, v);
        const i = (y * W + x) * 4;
        d[i] = cc[0]; d[i + 1] = cc[1]; d[i + 2] = cc[2]; d[i + 3] = 255;
      }
    }
    RL.blitPixels(ctx, canvas, img);
  }

  function init() {
    document.getElementById("tex-mode")?.addEventListener("change", draw);
    document.getElementById("tex-zoom")?.addEventListener("input", draw);
    draw();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
