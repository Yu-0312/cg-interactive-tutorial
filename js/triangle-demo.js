/* Software-rasterized colored triangle (teaching interpolation) */
(function () {
  "use strict";

  function init() {
    const canvas = document.getElementById("tri-canvas");
    if (!canvas) return;
    const modeSel = document.getElementById("tri-mode");
    const rotIn = document.getElementById("tri-rot");
    const scaleIn = document.getElementById("tri-scale");
    const rotV = document.getElementById("tri-rot-v");
    const scaleV = document.getElementById("tri-scale-v");

    const W = 520, H = 360;

    function barycentric(px, py, ax, ay, bx, by, cx, cy) {
      const v0x = bx - ax, v0y = by - ay;
      const v1x = cx - ax, v1y = cy - ay;
      const v2x = px - ax, v2y = py - ay;
      const den = v0x * v1y - v1x * v0y;
      if (Math.abs(den) < 1e-12) return null;
      const u = (v2x * v1y - v1x * v2y) / den;
      const v = (v0x * v2y - v2x * v0y) / den;
      const w = 1 - u - v;
      return [w, u, v]; // weights for a, b, c
    }

    function draw() {
      const ctx = RL.fitCanvas(canvas, W, H);
      const mode = modeSel.value;
      const rot = (Number(rotIn.value) * Math.PI) / 180;
      const sc = Number(scaleIn.value);
      rotV.textContent = Number(rotIn.value) + "°";
      scaleV.textContent = sc.toFixed(2);

      ctx.fillStyle = "#0a0f1c";
      ctx.fillRect(0, 0, W, H);

      // grid
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      for (let x = 0; x < W; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      const cx = W / 2, cy = H / 2;
      const pts = [
        { x: 0, y: -110, r: 1, g: 0.2, b: 0.3 },
        { x: 100, y: 80, r: 0.2, g: 1, b: 0.4 },
        { x: -100, y: 80, r: 0.3, g: 0.4, b: 1 },
      ].map((p) => {
        const x = p.x * sc, y = p.y * sc;
        const xr = x * Math.cos(rot) - y * Math.sin(rot);
        const yr = x * Math.sin(rot) + y * Math.cos(rot);
        return { ...p, sx: cx + xr, sy: cy + yr };
      });

      // rasterize
      const img = ctx.createImageData(W, H);
      const data = img.data;
      const minX = Math.max(0, Math.floor(Math.min(...pts.map((p) => p.sx))) - 1);
      const maxX = Math.min(W - 1, Math.ceil(Math.max(...pts.map((p) => p.sx))) + 1);
      const minY = Math.max(0, Math.floor(Math.min(...pts.map((p) => p.sy))) - 1);
      const maxY = Math.min(H - 1, Math.ceil(Math.max(...pts.map((p) => p.sy))) + 1);

      const [A, B, C] = pts;
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const bc = barycentric(x + 0.5, y + 0.5, A.sx, A.sy, B.sx, B.sy, C.sx, C.sy);
          if (!bc) continue;
          const [w0, w1, w2] = bc;
          if (w0 < 0 || w1 < 0 || w2 < 0) continue;
          let r, g, b;
          if (mode === "flat") {
            r = 0.35; g = 0.55; b = 1;
          } else if (mode === "bary") {
            r = w0; g = w1; b = w2;
          } else {
            r = w0 * A.r + w1 * B.r + w2 * B.r * 0 + w1 * B.r + 0;
            // careful compute
            r = w0 * A.r + w1 * B.r + w2 * C.r;
            g = w0 * A.g + w1 * B.g + w2 * C.g;
            b = w0 * A.b + w1 * B.b + w2 * C.b;
          }
          const i = (y * W + x) * 4;
          data[i] = Math.floor(r * 255);
          data[i + 1] = Math.floor(g * 255);
          data[i + 2] = Math.floor(b * 255);
          data[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);

      // vertices
      pts.forEach((p) => {
        ctx.fillStyle = `rgb(${p.r * 255},${p.g * 255},${p.b * 255})`;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "12px system-ui, sans-serif";
      ctx.fillText(mode === "bary" ? "barycentric weights as RGB" : mode === "flat" ? "uniform color" : "interpolated vertex colors", 16, 24);
    }

    modeSel.addEventListener("change", draw);
    rotIn.addEventListener("input", draw);
    scaleIn.addEventListener("input", draw);
    draw();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
