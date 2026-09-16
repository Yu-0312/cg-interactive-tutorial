/* Flat / Gouraud / Phong shading compare on a low-poly sphere approx */
(function () {
  "use strict";

  function shade(N, L, V, ka) {
    const ndotl = Math.max(0, N[0] * L[0] + N[1] * L[1] + N[2] * L[2]);
    const H = [L[0] + V[0], L[1] + V[1], L[2] + V[2]];
    const hn = Math.hypot(H[0], H[1], H[2]) || 1;
    H[0] /= hn; H[1] /= hn; H[2] /= hn;
    const ndoth = Math.max(0, N[0] * H[0] + N[1] * H[1] + N[2] * H[2]);
    const spec = Math.pow(ndoth, 48);
    const val = ka + 0.75 * ndotl + 0.7 * spec;
    const c = Math.min(1, Math.pow(val, 1 / 2.2));
    return [c * 90, c * 140, c * 220];
  }

  function draw() {
    const canvas = document.getElementById("shz-canvas");
    if (!canvas) return;
    const mode = document.getElementById("sh-mode")?.value || "phong";
    const sub = Number(document.getElementById("sh-sub")?.value || 16);
    const ang = Number(document.getElementById("sh-ang")?.value || 40);
    const subV = document.getElementById("sh-sub-v");
    const angV = document.getElementById("sh-ang-v");
    if (subV) subV.textContent = String(sub);
    if (angV) angV.textContent = String(ang);

    const W = 420, H = 300;
    const ctx = RL.fitCanvas(canvas, W, H);
    ctx.fillStyle = "#070b16";
    ctx.fillRect(0, 0, W, H);

    const a = (ang * Math.PI) / 180;
    const L = [Math.cos(a) * 0.7, Math.sin(a) * 0.5, 0.7];
    const ln = Math.hypot(L[0], L[1], L[2]);
    L[0] /= ln; L[1] /= ln; L[2] /= ln;
    const V = [0, 0, 1];
    const R = 100, cx = W / 2, cy = H / 2;

    // draw as grid of quads
    const n = sub;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const u0 = (i / n) * 2 - 1;
        const u1 = ((i + 1) / n) * 2 - 1;
        const v0 = (j / n) * 2 - 1;
        const v1 = ((j + 1) / n) * 2 - 1;
        const corners = [
          [u0, v0], [u1, v0], [u1, v1], [u0, v1],
        ].map(([u, v]) => {
          const d2 = u * u + v * v;
          if (d2 > 1) return null;
          const w = Math.sqrt(1 - d2);
          return { u, v, w, N: [u, -v, w], x: cx + u * R, y: cy - v * R };
        });
        if (corners.some((c) => !c)) continue;

        let color;
        if (mode === "flat") {
          // face normal = average
          let N = [0, 0, 0];
          corners.forEach((c) => { N[0] += c.N[0]; N[1] += c.N[1]; N[2] += c.N[2]; });
          const nn = Math.hypot(N[0], N[1], N[2]) || 1;
          N = [N[0] / nn, N[1] / nn, N[2] / nn];
          const rgb = shade(N, L, V, 0.06);
          color = `rgb(${rgb[0] | 0},${rgb[1] | 0},${rgb[2] | 0})`;
          ctx.fillStyle = color;
          ctx.beginPath();
          corners.forEach((c, k) => (k ? ctx.lineTo(c.x, c.y) : ctx.moveTo(c.x, c.y)));
          ctx.closePath();
          ctx.fill();
        } else if (mode === "gouraud") {
          // shade corners, fill with average (cheap approximation)
          let acc = [0, 0, 0];
          corners.forEach((c) => {
            const rgb = shade(c.N, L, V, 0.06);
            acc[0] += rgb[0]; acc[1] += rgb[1]; acc[2] += rgb[2];
          });
          color = `rgb(${(acc[0] / 4) | 0},${(acc[1] / 4) | 0},${(acc[2] / 4) | 0})`;
          ctx.fillStyle = color;
          ctx.beginPath();
          corners.forEach((c, k) => (k ? ctx.lineTo(c.x, c.y) : ctx.moveTo(c.x, c.y)));
          ctx.closePath();
          ctx.fill();
        } else {
          // per-pixel-ish: finer by subdividing fill (use center + radial)
          const c = corners[2]; // any
          // fill pixel region by sampling a few points
          const minX = Math.min(...corners.map((p) => p.x));
          const maxX = Math.max(...corners.map((p) => p.x));
          const minY = Math.min(...corners.map((p) => p.y));
          const maxY = Math.max(...corners.map((p) => p.y));
          const step = 2;
          for (let y = minY; y < maxY; y += step) {
            for (let x = minX; x < maxX; x += step) {
              const u = (x - cx) / R;
              const v = -(y - cy) / R;
              const d2 = u * u + v * v;
              if (d2 > 1) continue;
              // point in quad? approximate with sphere
              const w = Math.sqrt(1 - d2);
              const rgb = shade([u, v, w], L, V, 0.06);
              ctx.fillStyle = `rgb(${rgb[0] | 0},${rgb[1] | 0},${rgb[2] | 0})`;
              ctx.fillRect(x, y, step, step);
            }
          }
        }
      }
    }

    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "12px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("模式：" + mode, 12, 20);
  }

  function init() {
    ["sh-mode", "sh-sub", "sh-ang"].forEach((id) => {
      document.getElementById(id)?.addEventListener("input", draw);
      document.getElementById(id)?.addEventListener("change", draw);
    });
    draw();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
