// ====== KONFIGURASI ======
const PARTICLE_COUNT = 2600;
const RING_PARTICLE_COUNT = 2200;
const PLANET_RADIUS = 130;
const RING_INNER = PLANET_RADIUS * 1.55;
const RING_OUTER = PLANET_RADIUS * 2.7;
const RING_TILT = 0.42;
const ROTATE_SPEED = 0.09;
const RING_SPEED = 0.05;

const PHOTO_URLS = [
  "772112c2f5414a60aabc4b06a8cf83e1.jpg",
  "01813ed4d04e4b6a984cf13c7716bdbf.jpg",
  "7561a17f7d284e1a8f27daeda814b004.jpg",
  "83ada175342c4cfb9b005af7a0773d86.jpg",
  "5db6544efdec434881963eb72f4f3537.jpg",
  "1df2fa3c502d46a3a9f94ddc58d9c56e.jpg",
  "IMG_20260911_204134_111.jpg",
  "IMG_20260911_204124_769.jpg"
];

// ====== DATAFRAME LIRIK (Lesung Pipi - Raim Laode) ======
// Angka 'time' dalam detik, sesuaikan jika ada jeda yang kurang pas dengan MP3 kamu
const LYRICS = [
  { time: 0, text: "🎵🎵🎵🎵" },
  { time: 8, text: "Waktu bawa kita" },
  { time: 12, text: "ke tempat tak terduga" },
  { time: 16, text: "Kau hadir kembali" },
  { time: 19, text: "menyapa hidupku" },
  { time: 24, text: "Kau ada yang miliki" },
  { time: 28, text: "ku ada yang punyai" },
  { time: 32, text: "Juga ada rasa" },
  { time: 34, text: "yang belum sempat terucap" },
  { time: 42, text: "Tak banyak inginku" },
  { time: 46, text: "tak banyak inginmu" },
  { time: 48, text: "Kita dua hati yang bodoh" },
  { time: 53, text: "berjalan pada waktu" },
  { time: 60, text: "Itulah kenapa" },
  { time: 62, text: "jatuh cinta dikatakan jatuh" },
  { time: 68, text: "Karena sebagaimana kita jatuh" },
  { time: 72, text: "Kita tidak punya kuasa" },
  { time: 76, text: "Pilih jatuh pada hati yang mana" },
  { time: 83, text: "🎵🎵🎵🎵" },
  { time: 99, text: "Mengerti, mengertilah" },
  { time: 107, text: "Banyak hal yang tak kupahami" },
  { time: 115, text: "Kendati kau kusuka" },
  { time: 121, text: "Kita dua hati yang salah" },
  { time: 126, text: "Bodoh pada waktu" },
  { time: 133, text: "Itulah kenapa" },
  { time: 135, text: "jatuh cinta dikatakan jatuh" },
  { time: 141, text: "Karena sebagaimana kita jatuh" },
  { time: 145, text: "Kita tidak punya kuasa" },
  { time: 149, text: "Pilih jatuh pada hati yang..." },
  { time: 154,text: "Mana bisa kutahan" },
  { time: 158, text: "senyum sederhanamu" },
  { time: 161, text: "Karena tidak bisa kupunyai" },
  { time: 166,text: "Maka kudoakan kisah kita" },
  { time: 170, text: "satu di dunia yang nanti" }
];

// ====== SETUP CANVAS ======
const canvas = document.getElementById("saturn");
const ctx = canvas.getContext("2d");
let dpr = Math.min(window.devicePixelRatio || 1, 2);
let canvasWidth = 0;
let canvasHeight = 0;
let focal = 0;

function resizeCanvas() {
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;

  canvas.style.width = canvasWidth + "px";
  canvas.style.height = canvasHeight + "px";
  canvas.width = canvasWidth * dpr;
  canvas.height = canvasHeight * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const minDimension = Math.min(canvasWidth, canvasHeight);
  focal = PLANET_RADIUS * (minDimension / 400) * 3.2;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ====== TITIK BOLA PLANET ======
function buildSpherePoints(count, radius) {
  const points = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    points.push({
      type: "planet",
      lx: Math.cos(theta) * r * radius,
      ly: y * radius,
      lz: Math.sin(theta) * r * radius,
      band: y
    });
  }
  return points;
}

function planetColor(band) {
  const wave = Math.sin(band * 9) * 0.5 + 0.5;
  const light = [178, 219, 255];
  const dark = [22, 48, 102];
  const c = light.map((v, i) => Math.round(v * wave + dark[i] * (1 - wave)));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

// ====== TITIK PARTIKEL CINCIN ======
function buildRingPoints(count, inner, outer) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const r = inner + Math.random() * (outer - inner);
    const angle = Math.random() * Math.PI * 2;
    points.push({
      type: "ring",
      radius: r,
      angle,
      thickness: (Math.random() - 0.5) * 4,
      t: (r - inner) / (outer - inner)
    });
  }
  return points;
}

function ringColor(t) {
  const white = [255, 255, 255];
  const blue = [70, 130, 235];
  const c = white.map((v, i) => Math.round(v * (1 - t) + blue[i] * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

const spherePoints = buildSpherePoints(PARTICLE_COUNT, PLANET_RADIUS);
const ringPoints = buildRingPoints(RING_PARTICLE_COUNT, RING_INNER, RING_OUTER);

// ====== GENERATOR PARTIKEL LIRIK ======
let currentLyricText = "";
let lyricParticles = [];

function generateLyricParticles(text) {
  if (!text) return [];
  const offCanvas = document.createElement("canvas");
  offCanvas.width = 500;
  offCanvas.height = 100;
  const offCtx = offCanvas.getContext("2d");

  offCtx.fillStyle = "#ffffff";
  offCtx.font = "bold 26px 'Space Grotesk', sans-serif";
  offCtx.textAlign = "center";
  offCtx.textBaseline = "middle";
  offCtx.fillText(text, 250, 50);

  const imgData = offCtx.getImageData(0, 0, 500, 100);
  const data = imgData.data;
  const pts = [];

  const step = 3;
  for (let y = 0; y < 100; y += step) {
    for (let x = 0; x < 500; x += step) {
      const alpha = data[(y * 500 + x) * 4 + 3];
      if (alpha > 128) {
        pts.push({
          lx: (x - 250) * 0.7,
          ly: (y - 50) * 0.7 - PLANET_RADIUS * 1.5,
          lz: 0
        });
      }
    }
  }
  return pts;
}

// ====== FOTO DI CINCIN ======
const ringContainer = document.getElementById("ringContainer");
const PHOTO_RADIUS = RING_OUTER * 0.95;
const ringPhotos = PHOTO_URLS.map((url, i) => {
  const img = document.createElement("img");
  img.src = url;
  img.alt = "foto kenangan " + (i + 1);
  img.className = "ring-photo";
  img.loading = "lazy";
  ringContainer.appendChild(img);
  return { el: img, angle: (i / PHOTO_URLS.length) * Math.PI * 2 };
});

function projectRingLocal(radius, angle, yJitter, rotation) {
  const localX = radius * Math.cos(angle + rotation);
  const localZ = radius * Math.sin(angle + rotation);
  const y = yJitter * Math.cos(RING_TILT) - localZ * Math.sin(RING_TILT);
  const z = yJitter * Math.sin(RING_TILT) + localZ * Math.cos(RING_TILT);
  return { x: localX, y, z };
}

// ====== LOOP ANIMASI ======
let lastTime = performance.now();
let rotation = 0;
let ringRotation = 0;

let dragging = false;
let lastPointerAngle = 0;
let ringVelocity = 0;

function pointerAngle(e) {
  const rect = canvas.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return Math.atan2(e.clientY - cy, e.clientX - cx);
}

function normalizeAngleDelta(delta) {
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}

canvas.addEventListener("pointerdown", (e) => {
  dragging = true;
  canvas.setPointerCapture(e.pointerId);
  lastPointerAngle = pointerAngle(e);
  ringVelocity = 0;
  document.querySelector(".scene").classList.add("dragging");
});

canvas.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const currentAngle = pointerAngle(e);
  const delta = normalizeAngleDelta(currentAngle - lastPointerAngle);
  ringRotation += delta;
  ringVelocity = delta / 0.016;
  lastPointerAngle = currentAngle;
});

function endDrag() {
  dragging = false;
  document.querySelector(".scene").classList.remove("dragging");
}

canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointercancel", endDrag);

const bgMusic = document.getElementById("bgMusic");

function updateLyrics() {
  if (!bgMusic || bgMusic.paused) return;
  const currentTime = bgMusic.currentTime;

  let activeText = "";
  for (let i = LYRICS.length - 1; i >= 0; i--) {
    if (currentTime >= LYRICS[i].time) {
      activeText = LYRICS[i].text;
      break;
    }
  }

  if (activeText !== currentLyricText) {
    currentLyricText = activeText;
    lyricParticles = generateLyricParticles(currentLyricText);
  }
}

function render(dt) {
  rotation += ROTATE_SPEED * dt;

  if (!dragging) {
    ringRotation += RING_SPEED * dt;
    ringVelocity *= Math.pow(0.08, dt);
    ringRotation += ringVelocity * dt;
    if (Math.abs(ringVelocity) < 0.0005) ringVelocity = 0;
  }

  updateLyrics();

  const cx = canvasWidth / 2;
  const cy = canvasHeight / 2;
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const drawable = [];

  for (const p of spherePoints) {
    const x = p.lx * cosR - p.lz * sinR;
    const z = p.lx * sinR + p.lz * cosR;
    const scale = focal / (focal + z);
    drawable.push({
      sx: cx + x * scale,
      sy: cy + p.ly * scale,
      scale,
      z,
      color: planetColor(p.band),
      baseSize: 1.7
    });
  }

  for (const p of ringPoints) {
    const pos = projectRingLocal(p.radius, p.angle, p.thickness, ringRotation);
    const scale = focal / (focal + pos.z);
    drawable.push({
      sx: cx + pos.x * scale,
      sy: cy + pos.y * scale,
      scale,
      z: pos.z,
      color: ringColor(p.t),
      baseSize: 1.3
    });
  }

  for (const p of lyricParticles) {
    const scale = focal / (focal + p.lz);
    drawable.push({
      sx: cx + p.lx * scale,
      sy: cy + p.ly * scale,
      scale,
      z: p.lz,
      color: "rgb(234, 243, 255)",
      baseSize: 1.5
    });
  }

  drawable.sort((a, b) => a.z - b.z);
  for (const pt of drawable) {
    const size = Math.max(0.5, pt.baseSize * pt.scale);
    const alpha = Math.min(1, Math.max(0.2, pt.scale - 0.1));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = pt.color;
    ctx.beginPath();
    ctx.arc(pt.sx, pt.sy, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  for (const photo of ringPhotos) {
    const pos = projectRingLocal(PHOTO_RADIUS, photo.angle, 0, ringRotation);
    const scale = focal / (focal + pos.z);
    const x = pos.x * scale;
    const y = pos.y * scale;
    const depth = pos.z;
    const visualScale = Math.max(0.45, Math.min(1.25, scale));
    const opacity = Math.min(1, Math.max(0.3, scale - 0.15));

    photo.el.style.left = x + "px";
    photo.el.style.top = y + "px";
    photo.el.style.transform = `translate(-50%, -50%) scale(${visualScale})`;
    photo.el.style.opacity = opacity;
    photo.el.style.zIndex = depth < 0 ? 10 : 1;
  }
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  render(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ====== TOMBOL MUSIK ======
const musicBtn = document.getElementById("musicBtn");
const iconPlay = musicBtn.querySelector(".icon-play");
const iconPause = musicBtn.querySelector(".icon-pause");
let isPlaying = false;

musicBtn.addEventListener("click", () => {
  if (!isPlaying) {
    bgMusic.play().catch(() => {
      alert("Gagal memutar audio. Pastikan nama file audio di index.html sudah pas.");
    });
    iconPlay.style.display = "none";
    iconPause.style.display = "block";
  } else {
    bgMusic.pause();
    iconPlay.style.display = "block";
    iconPause.style.display = "none";
  }
  isPlaying = !isPlaying;
});
