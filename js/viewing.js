/* Perspective frustum top-down view */
(function () {
  "use strict";

  function init() {
    const canvas = document.getElementById("vw-canvas");
    if (!canvas) return;
    const fovIn = document.getElementById("vw-fov");
    const aspectIn = document.getElementById("vw-aspect");
    if (!fovIn || !aspectIn) return;

    const pts = [];
    for (let i = 0; i < 40; i++) {
      pts.push({
        x: (Math.random() - 0.5) * 10,
        z: Math.random() * 10 + 1,
        y: (Math.random() - 0.5) * 6,
      });
    }

    function draw() {
      const fov = Number(fovIn.value);
      const aspect = Number(aspectIn.value);
      document.getElementById("vw-fov-v").textContent = String(fov);
      document.getElementById("vw-aspect-v").textContent = aspect.toFixed(2);

      const fovRad = (fov * Math.PI) / 180;
      const f = 1 / Math.tan(fovRad / 2);
      const near = 0.5, far = 12;
      const topN = near * Math.tan(fovRad / 2);
      document.getElementById("vw-f").textContent = f.toFixed(2);

      const W = 640, H = 360;
      const ctx = RL.fitCanvas(canvas, W, H);
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2, cy = H - 30;
      const scale = 28;
      function TX(x) { return cx + x * scale; }
      function TZ(z) { return cy - z * scale; }

      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      for (let x = -6; x <= 6; x++) {
        ctx.beginPath();
        ctx.moveTo(TX(x), TZ(0));
        ctx.lineTo(TX(x), TZ(12));
        ctx.stroke();
      }
      for (let z = 0; z <= 12; z++) {
        ctx.beginPath();
        ctx.moveTo(TX(-6), TZ(z));
        ctx.lineTo(TX(6), TZ(z));
        ctx.stroke();
      }

      const hn = near * Math.tan(fovRad / 2);
      const hf = far * Math.tan(fovRad / 2);
      const wn = hn * aspect, wf = hf * aspect;

      ctx.beginPath();
      ctx.moveTo(TX(-wn), TZ(near));
      ctx.lineTo(TX(wn), TZ(near));
      ctx.lineTo(TX(wf), TZ(far));
      ctx.lineTo(TX(-wf), TZ(far));
      ctx.closePath();
      ctx.fillStyle = "rgba(91,140,255,0.12)";
      ctx.fill();
      ctx.strokeStyle = "rgba(91,140,255,0.7)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#f0b429";
      ctx.beginPath();
      ctx.arc(TX(0), TZ(0), 6, 0, Math.PI * 2);
      ctx.fill();

      let inView = 0;
      pts.forEach((p) => {
        const h = p.z * Math.tan(fovRad / 2);
        const w = h * aspect;
        const inside = p.z >= near && p.z <= far && Math.abs(p.x) <= w && Math.abs(p.y) <= h;
        if (inside) inView++;
        ctx.fillStyle = inside ? "#3dd68c" : "rgba(255,107,122,0.45)";
        ctx.beginPath();
        ctx.arc(TX(p.x), TZ(p.z), 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
      document.getElementById("vw-count").textContent = inView + " / " + pts.length;

      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.font = "11px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("俯視視錐（X–Z 平面）", 16, 18);
    }

    fovIn.addEventListener("input", draw);
    aspectIn.addEventListener("input", draw);
    draw();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
