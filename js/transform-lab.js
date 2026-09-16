/* 2D SRT transform lab */
(function () {
  "use strict";
  const W = 560, H = 360;

  function applyTRS(x, y, s, rotDeg, tx, ty, order) {
    let p = { x, y };
    const rot = (r, deg) => {
      const a = (deg * Math.PI) / 180;
      return { x: r.x * Math.cos(a) - r.y * Math.sin(a), y: r.x * Math.sin(a) + r.y * Math.cos(a) };
    };
    const scale = (r, s) => ({ x: r.x * s, y: r.y * s });
    const trans = (r, tx, ty) => ({ x: r.x + tx, y: r.y + ty });
    const ops = order.split("").map((c) => {
      if (c === "t") return (r) => trans(r, tx, ty);
      if (c === "r") return (r) => rot(r, rotDeg);
      return (r) => scale(r, s);
    });
    // matrix multiply on column vectors applies right-to-left: first S, then R, then T for T·R·S
    // order string is composition M = first·second·third meaning apply third first
    for (let i = ops.length - 1; i >= 0; i--) p = ops[i](p);
    return p;
  }

  function draw() {
    const canvas = document.getElementById("tf-canvas");
    if (!canvas) return;
    const tx = Number(document.getElementById("tf-tx").value);
    const ty = Number(document.getElementById("tf-ty").value);
    const rot = Number(document.getElementById("tf-rot").value);
    const s = Number(document.getElementById("tf-s").value);
    const order = document.getElementById("tf-order").value;
    document.getElementById("tf-tx-v").textContent = tx;
    document.getElementById("tf-ty-v").textContent = ty;
    document.getElementById("tf-rot-v").textContent = rot;
    document.getElementById("tf-s-v").textContent = s.toFixed(2);
    const labels = { trs: "T·R·S", rts: "R·T·S", str: "S·T·R" };
    document.getElementById("tf-ord").textContent = labels[order];

    const ctx = RL.fitCanvas(canvas, W, H);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0d1426";
    ctx.fillRect(0, 0, W, H);

    // axes
    const cx = W / 2, cy = H / 2;
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(W, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, H);
    ctx.stroke();

    // original square corners around origin
    const half = 40;
    const corners = [
      { x: -half, y: -half },
      { x: half, y: -half },
      { x: half, y: half },
      { x: -half, y: half },
    ];

    // ghost original
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath();
    corners.forEach((c, i) => {
      const x = cx + c.x, y = cy - c.y;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const mapped = corners.map((c) => applyTRS(c.x, c.y, s, rot, tx, ty, order));
    ctx.beginPath();
    mapped.forEach((c, i) => {
      const x = cx + c.x, y = cy - c.y;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(91,140,255,0.45)";
    ctx.strokeStyle = "#5b8cff";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // origin mark
    ctx.fillStyle = "#f0b429";
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  function init() {
    ["tf-tx", "tf-ty", "tf-rot", "tf-s", "tf-order"].forEach((id) => {
      document.getElementById(id)?.addEventListener("input", draw);
      document.getElementById(id)?.addEventListener("change", draw);
    });
    draw();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
