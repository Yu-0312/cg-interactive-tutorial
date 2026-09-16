/* Cubic Bezier editor */
(function () {
  "use strict";
  const W = 520, H = 320;
  let pts = [
    { x: 60, y: 240 },
    { x: 160, y: 60 },
    { x: 340, y: 60 },
    { x: 460, y: 240 },
  ];
  let drag = -1;

  function bezier(t, p) {
    const u = 1 - t;
    const b0 = u * u * u;
    const b1 = 3 * u * u * t;
    const b2 = 3 * u * t * t;
    const b3 = t * t * t;
    return {
      x: b0 * p[0].x + b1 * p[1].x + b2 * p[2].x + b3 * p[3].x,
      y: b0 * p[0].y + b1 * p[1].y + b2 * p[2].y + b3 * p[3].y,
    };
  }

  function draw() {
    const canvas = document.getElementById("bz-canvas");
    if (!canvas) return;
    const n = Number(document.getElementById("bz-n")?.value || 24);
    document.getElementById("bz-n-v").textContent = String(n);

    const ctx = RL.fitCanvas(canvas, W, H);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0d1426";
    ctx.fillRect(0, 0, W, H);

    // control polygon
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < 4; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.setLineDash([]);

    // curve
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const p = bezier(i / n, pts);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = "#5b8cff";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    pts.forEach((p, i) => {
      ctx.fillStyle = ["#f0b429", "#3dd6c6", "#3dd6c6", "#f0b429"][i];
      ctx.fillRect(p.x - 6, p.y - 6, 12, 12);
    });

    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillText("黃=端點  青=控制柄", 16, 20);
  }

  function pos(e) {
    const canvas = document.getElementById("bz-canvas");
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.touches ? e.touches[0].clientX : e.clientX) - r.left) / r.width * W,
      y: ((e.touches ? e.touches[0].clientY : e.clientY) - r.top) / r.height * H,
    };
  }

  function nearest(p) {
    let best = -1, bd = 18;
    pts.forEach((v, i) => {
      const d = Math.hypot(v.x - p.x, v.y - p.y);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  }

  function init() {
    const canvas = document.getElementById("bz-canvas");
    if (!canvas) return;
    canvas.addEventListener("mousedown", (e) => {
      drag = nearest(pos(e));
      if (drag >= 0) e.preventDefault();
      draw();
    });
    window.addEventListener("mousemove", (e) => {
      if (drag < 0) return;
      const p = pos(e);
      pts[drag] = { x: Math.max(10, Math.min(W - 10, p.x)), y: Math.max(10, Math.min(H - 10, p.y)) };
      draw();
    });
    window.addEventListener("mouseup", () => { drag = -1; });
    canvas.addEventListener("touchstart", (e) => {
      drag = nearest(pos(e));
      e.preventDefault();
      draw();
    }, { passive: false });
    window.addEventListener("touchmove", (e) => {
      if (drag < 0) return;
      const p = pos(e);
      pts[drag] = { x: Math.max(10, Math.min(W - 10, p.x)), y: Math.max(10, Math.min(H - 10, p.y)) };
      e.preventDefault();
      draw();
    }, { passive: false });
    window.addEventListener("touchend", () => { drag = -1; });
    document.getElementById("bz-n")?.addEventListener("input", draw);
    document.getElementById("bz-reset")?.addEventListener("click", () => {
      pts = [
        { x: 60, y: 240 },
        { x: 160, y: 60 },
        { x: 340, y: 60 },
        { x: 460, y: 240 },
      ];
      draw();
    });
    draw();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
