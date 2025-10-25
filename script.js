// =========================
// AUDIO AUTOPLAY ON FIRST CLICK
// =========================
(function initAudio() {
  const audio = document.getElementById("bgm");
  const tryPlay = () => {
    audio.play().catch(() => {});
    window.removeEventListener("pointerdown", tryPlay);
  };
  window.addEventListener("pointerdown", tryPlay);
})();

// =========================
// FIREWORKS BACKGROUND
// =========================
const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");
let W = (canvas.width = window.innerWidth);
let H = (canvas.height = window.innerHeight);

window.addEventListener("resize", () => {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
});

const particles = [];
function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function spawnFireworkBurst(x, y, power = 1) {
  const count = Math.floor(rand(15, 30) * power);
  const hue = rand(0, 360);
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = rand(1, 4) * power;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      decay: rand(0.01, 0.03),
      hue,
      size: rand(1, 3),
    });
  }
}
function spawnRandomFirework() {
  const x = rand(W * 0.2, W * 0.8);
  const y = rand(H * 0.1, H * 0.5);
  spawnFireworkBurst(x, y, 1);
}

function renderFireworks() {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(0, 0, W, H);

  ctx.globalCompositeOperation = "lighter";

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.02; // gravity
    p.alpha -= p.decay;

    if (p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = `hsl(${p.hue},100%,60%)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (Math.random() < 0.06) {
    spawnRandomFirework();
  }

  requestAnimationFrame(renderFireworks);
}
renderFireworks();

// =========================
// GAME LOGIC
// =========================
const TOTAL_TARGETS = 5;
const targetsLayer = document.getElementById("targets-layer");
const hitCountEl = document.getElementById("hit-count");
const totalCountEl = document.getElementById("total-count");
totalCountEl.textContent = TOTAL_TARGETS;

const centerEnvelopeWrap = document.getElementById("center-envelope-wrap");
const centerEnvelopeBtn = document.getElementById("center-envelope-btn");

const letterOverlay = document.getElementById("letter-overlay");
const letterClose = document.getElementById("letter-close");

let hitCount = 0;

// random vị trí trong màn hình, chừa mép
function randomPos() {
  const bubbleSize = 80; // px, nhớ sync với CSS .target-bubble width/height
  const padding = 80;    // chừa lề để tránh dính sát mép
  const maxX = window.innerWidth  - padding - bubbleSize;
  const maxY = window.innerHeight - padding - bubbleSize;

  const x = rand(padding, Math.max(padding, maxX));
  const y = rand(padding + 60, Math.max(padding + 60, maxY)); // +60 để né HUD trên đầu

  return { x, y };
}

// tạo 5 bong bóng
function createTargets() {
  for (let i = 0; i < TOTAL_TARGETS; i++) {
    const bubble = document.createElement("div");
    bubble.className = "target-bubble";
    bubble.innerHTML = `<span>🎁 Bấm tui<br/>(${i + 1})</span>`;

    const { x, y } = randomPos();
    bubble.style.left = x + "px";
    bubble.style.top  = y + "px";

    bubble.addEventListener("click", (e) => {
      // bắn pháo hoa tại vị trí click
      spawnFireworkBurst(e.clientX, e.clientY, 1.5);

      // nếu chưa nổ thì cho nổ
      if (!bubble.classList.contains("popped")) {
        bubble.classList.add("popped");
        hitCount++;
        hitCountEl.textContent = hitCount;
      }

      // nếu đã bấm đủ tất cả
      if (hitCount >= TOTAL_TARGETS) {
        winGame();
      }
    });

    targetsLayer.appendChild(bubble);
  }
}

function winGame() {
  // xóa bong bóng sau 400ms (cho animation popOut chạy)
  setTimeout(() => {
    targetsLayer.innerHTML = "";
  }, 400);

  // pháo hoa ăn mừng
  spawnFireworkBurst(W * 0.5, H * 0.4, 2.5);
  spawnFireworkBurst(W * 0.5, H * 0.6, 2.5);

  // show phong bì giữa màn
  centerEnvelopeWrap.classList.remove("hidden");
}

// bấm bao thư -> mở popup chúc mừng
centerEnvelopeBtn.addEventListener("click", () => {
  letterOverlay.style.display = "flex";
  spawnFireworkBurst(W * 0.5, H * 0.5, 3);
});

// đóng popup
letterClose.addEventListener("click", () => {
  letterOverlay.style.display = "none";
});

// khởi tạo game
createTargets();
