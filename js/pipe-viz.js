/* Pipeline stage visualizer */
(function () {
  "use strict";
  let stage = 0;
  const names = ["幾何", "變換", "投影", "光柵化", "著色"];
  const descs = [
    "準備頂點與索引",
    "套用 Model-View 矩陣",
    "投影 + 透視除法 + 視口",
    "三角形覆蓋測試 → fragment",
    "貼圖 / 光照 → 寫入幀緩衝",
  ];

  function draw() {
    const canvas = document.getElementById("pipe-canvas");
    if (!canvas) return;
    const W = 640, H = 220;
    const ctx = RL.fitCanvas(canvas, W, H);
    ctx.clearRect(0, 0, W, H);

    const n = names.length;
    const pad = 30;
    const gap = (W - pad * 2) / (n - 1);

    // connecting line
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, H / 2);
    ctx.lineTo(W - pad, H / 2);
    ctx.stroke();

    // progress
    ctx.strokeStyle = "#5b8cff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pad, H / 2);
    ctx.lineTo(pad + gap * stage, H / 2);
    ctx.stroke();

    names.forEach((name, i) => {
      const x = pad + gap * i;
      const active = i <= stage;
      const current = i === stage;
      ctx.beginPath();
      ctx.arc(x, H / 2, current ? 16 : 12, 0, Math.PI * 2);
      ctx.fillStyle = current ? "#5b8cff" : active ? "#2dd4bf" : "#1c2a48";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.stroke();

      ctx.fillStyle = current ? "#fff" : "rgba(255,255,255,0.55)";
      ctx.font = "600 12px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(name, x, H / 2 + 36);
    });

    document.getElementById("pipe-stage").textContent = stage + " · " + names[stage];
    document.getElementById("pipe-desc").textContent = descs[stage];
  }

  function init() {
    document.getElementById("pipe-next")?.addEventListener("click", () => {
      stage = (stage + 1) % names.length;
      draw();
    });
    document.getElementById("pipe-reset")?.addEventListener("click", () => {
      stage = 0;
      draw();
    });
    draw();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
