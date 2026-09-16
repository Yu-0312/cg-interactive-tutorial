/* Phong sphere lighting demo */
(function () {
  "use strict";
  const W = 420, H = 320;
  let lx = 0.6, ly = 0.5, lz = 0.8; // light dir-ish in view space
  let drag = false;

  function draw() {
    const canvas = document.getElementById("lt-canvas");
    if (!canvas) return;
    const shininess = Number(document.getElementById("lt-alpha")?.value || 32);
    const ka = Number(document.getElementById("lt-ka")?.value || 0.08);
    const alphaV = document.getElementById("lt-alpha-v");
    const kaV = document.getElementById("lt-ka-v");
    if (alphaV) alphaV.textContent = String(shininess);
    if (kaV) kaV.textContent = ka.toFixed(2);

    const ctx = RL.fitCanvas(canvas, W, H);
    const cx = W / 2, cy = H / 2, R = 110;

    ctx.fillStyle = "#070b16";
    ctx.fillRect(0, 0, W, H);

    // normalize light
    const L = [lx, ly, lz];
    const ln = Math.hypot(L[0], L[1], L[2]) || 1;
    L[0] /= ln; L[1] /= ln; L[2] /= ln;

    const img = ctx.createImageData(W, H);
    const data = img.data;
    const kd = [0.35, 0.55, 0.95];
    const ks = [1, 1, 1];

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const dx = (x - cx) / R;
        const dy = (y - cy) / R;
        const d2 = dx * dx + dy * dy;
        const i = (y * W + x) * 4;
        if (d2 > 1) {
          data[i] = 7; data[i + 1] = 11; data[i + 2] = 22; data[i + 3] = 255;
          continue;
        }
        const dz = Math.sqrt(1 - d2);
        const N = [dx, -dy, dz]; // flip y for canvas
        const ndotl = Math.max(0, N[0] * L[0] + N[1] * L[1] + N[2] * L[2]);
        // reflect L about N: R = 2(N·L)N - L
        const ndl = ndotl;
        const Rx = 2 * ndl * N[0] - L[0];
        const Ry = 2 * ndl * N[1] - L[1];
        const Rz = 2 * ndl * N[2] - L[2];
        const V = [0, 0, 1];
        const rdotv = Math.max(0, Rx * V[0] + Ry * V[1] + Rz * V[2]);
        const spec = Math.pow(rdotv, shininess);
        for (let c = 0; c < 3; c++) {
          const val = ka + kd[c] * ndotl + ks[c] * spec * 0.9;
          data[i + c] = Math.min(255, Math.pow(val, 1 / 2.2) * 255);
        }
        data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    // light gizmo
    const gx = cx + L[0] * R * 1.15;
    const gy = cy - L[1] * R * 1.15;
    ctx.fillStyle = "#f0b429";
    ctx.beginPath();
    ctx.arc(gx, gy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(240,180,41,0.5)";
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(cx, cy);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("拖曳黃點移動光源", 12, 18);
  }

  function setFromEvent(e) {
    const canvas = document.getElementById("lt-canvas");
    const r = canvas.getBoundingClientRect();
    const cx = W / 2, cy = H / 2, R = 110;
    const x = ((e.touches ? e.touches[0].clientX : e.clientX) - r.left) / r.width * W;
    const y = ((e.touches ? e.touches[0].clientY : e.clientY) - r.top) / r.height * H;
    lx = (x - cx) / R;
    ly = -(y - cy) / R;
    lz = 0.7;
    draw();
  }

  function init() {
    const canvas = document.getElementById("lt-canvas");
    if (!canvas) return;
    canvas.addEventListener("mousedown", (e) => { drag = true; setFromEvent(e); });
    window.addEventListener("mousemove", (e) => { if (drag) setFromEvent(e); });
    window.addEventListener("mouseup", () => { drag = false; });
    canvas.addEventListener("touchstart", (e) => { drag = true; setFromEvent(e); e.preventDefault(); }, { passive: false });
    window.addEventListener("touchmove", (e) => { if (drag) { setFromEvent(e); e.preventDefault(); } }, { passive: false });
    window.addEventListener("touchend", () => { drag = false; });
    document.getElementById("lt-alpha")?.addEventListener("input", draw);
    document.getElementById("lt-ka")?.addEventListener("input", draw);
    document.getElementById("lt-reset")?.addEventListener("click", () => {
      lx = 0.6; ly = 0.5; lz = 0.8; draw();
    });
    draw();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
