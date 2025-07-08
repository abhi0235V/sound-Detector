/* Theme toggle */
document.getElementById("theme-toggle").onclick = () => {
  const root = document.documentElement;
  const isDark = root.getAttribute("data-theme") === "dark";
  root.setAttribute("data-theme", isDark ? "light" : "dark");
};

/* Noise meter */
const startBtn = document.getElementById("start-btn");
const decibelEl = document.getElementById("decibel");
const fillEl = document.getElementById("level-fill");

startBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;

    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    const buffer = new Uint8Array(analyser.fftSize);

    const render = () => {
      analyser.getByteTimeDomainData(buffer);
      let sum = 0;
      for (const v of buffer) {
        const diff = v - 128;
        sum += diff * diff;
      }
      const rms = Math.sqrt(sum / buffer.length);
      const dB = Math.min(Math.max(20 * Math.log10(rms), 0), 120);
      decibelEl.textContent = isNaN(dB) ? "--" : dB.toFixed(0);

      const pct = isNaN(dB) ? 0 : (dB / 120) * 100;
      fillEl.style.width = pct + "%";

      requestAnimationFrame(render);
    };
    render();
  } catch (err) {
    console.error("Microphone error:", err);
    decibelEl.textContent = "Err";
  }
};
