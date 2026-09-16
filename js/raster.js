/* Rasterization coverage demo */
(function () {
  "use strict";
  const W = 480, H = 320;
  let verts = [
    { x: 0.5, y: 0.12 },
    { x: 0.15, y: 0.85 },
    { x: 0.88, y: 0.78 },
  ];

  function edge(ax, ay, bx, by, px, py) {
    return (px - ax) * (by - ay) - (py - ay) * (bx - ax);
  }

  function draw() {
    const canvas = document.getElementById("ra-canvas");
    if (!canvas) return;
    const res = Number(document.getElementById("ra-res")?.value || 24);
    const useBary = document.getElementById("ra-bary")?.checked ?? true;
    document.getElementById("ra-res-v").textContent = String(res);

    const ctx = RL.fitCanvas(canvas, W, H);
    ctx.fillStyle = "#0d1426";
    ctx.fillRect(0, 0, W, H);

    const pad = 20;
    const gw = W - pad * 2;
    const gh = H - pad * 2;
    const cw = gw / res;
    const ch = gh / res;

    const A = { x: pad + verts[0].x * gw, y: pad + verts[0].y * gh };
    const B = { x: pad + verts[1].x * gw, y: pad + verts[1].y * gh };
    const C = { x: pad + verts[2].x * gw, y: pad + verts[2].y * gh };
    const area = edge(A.x, A.y, B.x, B.y, C.x, C.y);
    let count = 0;

    for (let j = 0; j < res; j++) {
      for (let i = 0; i < res; i++) {
        const px = pad + (i + 0.5) * cw;
        const py = pad + (j + 0.5) * ch;
        const w0 = edge(B.x, B.y, C.x, C.y, px, py);
        const w1 = edge(C.x, C.y, A.x, A.y, px, py);
        const w2 = edge(A.x, A.y, B.x, B.y, px, py);
        const inside = area > 0
          ? w0 >= 0 && w1 >= 0 && w2 >= 0
          : w0 <= 0 && w1 <= 0 && w2 <= 0;
        if (!inside) continue;
        count++;
        const b0 = w0 / area, b1 = w1 / area, b2 = w2 / area;
        ctx.fillStyle = useBary
          ? `rgb(${b0 * 200 + 40}, ${b1 * 200 + 40}, ${b2 * 200 + 40})`
          : "rgba(91,140,255,0.55)";
        ctx.fillRect(pad + i * cw, pad + j * ch, cw - 1, ch - 1);
      }
    }

    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.lineTo(C.x, C.y);
    ctx.closePath();
    ctx.stroke();

    [A, B, C].forEach((v) => {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(v.x, v.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    document.getElementById("ra-count").textContent = String(count);
  }

  function init() {
    document.getElementById("ra-res")?.addEventListener("input", draw);
    document.getElementById("ra-bary")?.addEventListener("change", draw);
    draw();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
