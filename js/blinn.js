/* Blinn vs Phong highlight comparison */
(function () {
  "use strict";
  const W = 420, H = 280;

  function draw() {
    const canvas = document.getElementById("bp-canvas");
    if (!canvas) return;
    const shininess = Number(document.getElementById("bp-alpha")?.value || 48);
    const useBlinn = document.getElementById("bp-use")?.checked ?? true;
    const aV = document.getElementById("bp-alpha-v");
    const mode = document.getElementById("bp-mode");
    if (aV) aV.textContent = String(shininess);
    if (mode) mode.textContent = useBlinn ? "Blinn-Phong" : "Phong (R·V)";

    const ctx = RL.fitCanvas(canvas, W, H);
    const cx = W / 2, cy = H / 2, R = 100;
    ctx.fillStyle = "#070b16";
    ctx.fillRect(0, 0, W, H);

    const L = [0.55, 0.55, 0.65];
    const n = Math.hypot(...L);
    L[0] /= n; L[1] /= n; L[2] /= n;
    const V = [0, 0, 1];
    const Hv = [L[0] + V[0], L[1] + V[1], L[2] + V[2]];
    const hn = Math.hypot(...Hv);
    Hv[0] /= hn; Hv[1] /= hn; Hv[2] /= hn;

    const img = ctx.createImageData(W, H);
    const data = img.data;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const dx = (x - cx) / R;
        const dy = -(y - cy) / R;
        const d2 = dx * dx + dy * dy;
        const i = (y * W + x) * 4;
        if (d2 > 1) {
          data[i] = 7; data[i + 1] = 11; data[i + 2] = 22; data[i + 3] = 255;
          continue;
        }
        const dz = Math.sqrt(1 - d2);
        const N = [dx, dy, dz];
        const ndl = Math.max(0, N[0] * L[0] + N[1] * L[1] + N[2] * L[2]);
        let spec;
        if (useBlinn) {
          spec = Math.pow(Math.max(0, N[0] * Hv[0] + N[1] * Hv[1] + N[2] * Hv[2]), shininess);
        } else {
          const ndl2 = ndl;
          const Rx = 2 * ndl2 * N[0] - L[0];
          const Ry = 2 * ndl2 * N[1] - L[1];
          const Rz = 2 * ndl2 * N[2] - L[2];
          spec = Math.pow(Math.max(0, Rx * V[0] + Ry * V[1] + Rz * V[2]), shininess);
        }
        const val = 0.08 + 0.35 * ndl + spec * 0.9;
        data[i] = Math.min(255, Math.pow(val * 0.7, 1 / 2.2) * 255);
        data[i + 1] = Math.min(255, Math.pow(val * 0.85, 1 / 2.2) * 255);
        data[i + 2] = Math.min(255, Math.pow(val, 1 / 2.2) * 255);
        data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  function init() {
    document.getElementById("bp-alpha")?.addEventListener("input", draw);
    document.getElementById("bp-use")?.addEventListener("change", draw);
    draw();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
