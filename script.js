document.addEventListener("DOMContentLoaded", () => {
  const layer = document.getElementById("candle-layer");
  let audioContext, analyser, microphone;

  function randomPick(arr, count) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  function placeCandle(xPercent, yPercent) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = `calc(${xPercent}% - 6px)`;
    candle.style.top = `calc(${yPercent}% - 30px)`;

    const flame = document.createElement("div");
    flame.className = "flame";

    candle.appendChild(flame);
    layer.appendChild(candle);
  }

  function addCandles() {
    const heartPositions = [
      { x: 52, y: 33 },
      { x: 48, y: 33 },
      { x: 54, y: 30 },
      { x: 46, y: 30 },
      { x: 57, y: 27 },
      { x: 43, y: 27 },
      { x: 60, y: 24 },
      { x: 40, y: 24 },
      { x: 62, y: 18 },
      { x: 38, y: 18 },
      { x: 59, y: 16 },
      { x: 41, y: 16 },
      { x: 56, y: 16 },
      { x: 44, y: 16 },
      { x: 53, y: 18 },
      { x: 47, y: 18 },
      { x: 50, y: 38 },
      { x: 50, y: 20 },
    ];

    const vPositions = [
      { x: 36, y: 35 },
      { x: 64, y: 34 },
      { x: 33, y: 25 },
      { x: 66, y: 25 },
    ];

    heartPositions.forEach((p) => placeCandle(p.x, p.y));
    vPositions.forEach((p) => placeCandle(p.x, p.y));
  }

  addCandles();

  const candles = Array.from(document.querySelectorAll(".candle"));

  function blowCandle(candle) {
    if (candle.classList.contains("out")) return;

    const flame = candle.querySelector(".flame");
    flame.classList.add("blowing");

    setTimeout(() => {
      flame.style.opacity = "0";
      flame.style.transform = "scale(0.3)";
      setTimeout(() => {
        candle.classList.add("out");

        const smoke = document.createElement("div");
        smoke.classList.add("smoke");
        candle.appendChild(smoke);
        setTimeout(() => smoke.remove(), 1000);
      }, 250);
    }, 250);
  }

  function isBlowing() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
    const average = sum / bufferLength;

    return average > 45;
  }

  function monitor() {
    setInterval(() => {
      const strength = getBlowStrength();
      if (strength > 40) {
        naturalBlow(strength);
      }
    }, 120);
  }

  function getBlowStrength() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
    return sum / bufferLength;
  }

  function naturalBlow(strength) {
    const lit = candles.filter((c) => !c.classList.contains("out"));
    if (lit.length === 0) return;

    let count;

    if (strength < 55) count = 1 + Math.floor(Math.random() * 2);
    else if (strength < 70) count = 2 + Math.floor(Math.random() * 3);
    else if (strength < 85) count = 4 + Math.floor(Math.random() * 4);
    else count = 7 + Math.floor(Math.random() * 5);

    count = Math.min(count, lit.length);

    const chosen = randomPick(lit, count);
    chosen.forEach((candle) => blowCandle(candle));
  }

  function setupMic() {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);

        microphone.connect(analyser);
        analyser.fftSize = 256;

        setTimeout(monitor, 1500);
      })
      .catch((err) => console.log("Mic error:", err));
  }

  setupMic();
});
