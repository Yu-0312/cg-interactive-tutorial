/* Draggable triangle lab */
(function () {
  "use strict";
  const W = 520, H = 360;
  let verts = [
    { x: 260, y: 60 },
    { x: 80, y: 300 },
    { x: 440, y: 300 },
  ];
  let drag = -1;

  function area() {
    const [a, b, c] = verts;
    return Math.abs((a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2);
  }

  function draw() {
    const canvas = document.getElementById("tri-canvas");
    if (!canvas) return;
    const ctx = RL.fitCanvas(canvas, W, H);
    const showGrid = document.getElementById("tri-grid")?.checked ?? true;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0d1426";
    ctx.fillRect(0, 0, W, H);

    if (showGrid) {
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= W; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y <= H; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
    }

    // triangle with barycentric-ish color wash
    const grad = ctx.createLinearGradient(verts[0].x, verts[0].y, verts[2].x, verts[2].y);
    grad.addColorStop(0, "rgba(91,140,255,0.55)");
    grad.addColorStop(0.5, "rgba(61,214,198,0.45)");
    grad.addColorStop(1, "rgba(240,180,41,0.55)");
    ctx.beginPath();
    ctx.moveTo(verts[0].x, verts[0].y);
    ctx.lineTo(verts[1].x, verts[1].y);
    ctx.lineTo(verts[2].x, verts[2].y);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();

    verts.forEach((v, i) => {
      ctx.beginPath();
      ctx.arc(v.x, v.y, drag === i ? 10 : 7, 0, Math.PI * 2);
      ctx.fillStyle = ["#5b8cff", "#3dd6c6", "#f0b429"][i];
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    const el = document.getElementById("tri-area");
    if (el) el.textContent = area().toFixed(0);
  }

  function pos(e) {
    const canvas = document.getElementById("tri-canvas");
    const r = canvas.getBoundingClientRect();
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    const cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
    return { x: (cx / r.width) * W, y: (cy / r.height) * H };
  }

  function nearest(p) {
    let best = -1, bd = 22;
    verts.forEach((v, i) => {
      const d = Math.hypot(v.x - p.x, v.y - p.y);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  }

  function init() {
    const canvas = document.getElementById("tri-canvas");
    if (!canvas) return;
    const down = (e) => {
      drag = nearest(pos(e));
      if (drag >= 0) e.preventDefault();
      draw();
    };
    const move = (e) => {
      if (drag < 0) return;
      const p = pos(e);
      verts[drag] = { x: Math.max(10, Math.min(W - 10, p.x)), y: Math.max(10, Math.min(H - 10, p.y)) };
      e.preventDefault();
      draw();
    };
    const up = () => { drag = -1; draw(); };
    canvas.addEventListener("mousedown", down);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    canvas.addEventListener("touchstart", down, { passive: false });
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
    document.getElementById("tri-grid")?.addEventListener("change", draw);
    document.getElementById("tri-reset")?.addEventListener("click", () => {
      verts = [
        { x: 260, y: 60 },
        { x: 80, y: 300 },
        { x: 440, y: 300 },
      ];
      draw();
    });
    draw();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
