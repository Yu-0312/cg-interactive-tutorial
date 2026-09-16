/* Two-link hierarchical arm */
(function () {
  "use strict";
  const W = 480, H = 320;
  let anim = false;
  let t = 0;

  function draw() {
    const canvas = document.getElementById("hg-canvas");
    if (!canvas) return;
    let a1 = Number(document.getElementById("hg-a1")?.value || 35);
    let a2 = Number(document.getElementById("hg-a2")?.value || -50);
    if (anim) {
      a1 = 40 * Math.sin(t);
      a2 = -60 + 30 * Math.sin(t * 1.7);
      const s1 = document.getElementById("hg-a1");
      const s2 = document.getElementById("hg-a2");
      if (s1) s1.value = String(Math.round(a1));
      if (s2) s2.value = String(Math.round(a2));
    }
    document.getElementById("hg-a1-v").textContent = String(Math.round(a1));
    document.getElementById("hg-a2-v").textContent = String(Math.round(a2));

    const ctx = RL.fitCanvas(canvas, W, H);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0d1426";
    ctx.fillRect(0, 0, W, H);

    const base = { x: W / 2, y: H - 40 };
    const L1 = 90, L2 = 80;

    function rot(p, angDeg, origin) {
      const a = (angDeg * Math.PI) / 180;
      const dx = p.x - origin.x, dy = p.y - origin.y;
      return {
        x: origin.x + dx * Math.cos(a) - dy * Math.sin(a),
        y: origin.y + dx * Math.sin(a) + dy * Math.cos(a),
      };
    }

    // local chain: up then apply angles
    const p0 = base;
    const p1 = { x: p0.x, y: p0.y - L1 };
    const p2raw = { x: p1.x, y: p1.y - L2 };
    // apply shoulder rotation to both links around p0
    const p1r = rot(p1, a1, p0);
    const p2r1 = rot(p2raw, a1, p0);
    // apply elbow around p1r
    const p2 = rot(p2r1, a2, p1r);

    // ground
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, base.y + 8);
    ctx.lineTo(W - 40, base.y + 8);
    ctx.stroke();

    // links
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#5b8cff";
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1r.x, p1r.y);
    ctx.stroke();
    ctx.strokeStyle = "#3dd6c6";
    ctx.beginPath();
    ctx.moveTo(p1r.x, p1r.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    // joints
    [{ p: p0, c: "#f0b429" }, { p: p1r, c: "#fff" }, { p: p2, c: "#ff6b7a" }].forEach((j) => {
      ctx.fillStyle = j.c;
      ctx.beginPath();
      ctx.arc(j.p.x, j.p.y, 7, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillText("黃=基座  白=肘  紅=末端", 16, 20);
  }

  function loop() {
    if (anim) {
      t += 0.03;
      draw();
    }
    requestAnimationFrame(loop);
  }

  function init() {
    document.getElementById("hg-a1")?.addEventListener("input", draw);
    document.getElementById("hg-a2")?.addEventListener("input", draw);
    document.getElementById("hg-anim")?.addEventListener("click", () => {
      anim = !anim;
    });
    draw();
    loop();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
