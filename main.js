const PRELOADER_LABELS = [
  "Warming up the stack",
  "Loading distributed nodes",
  "Syncing Meridian agents",
  "Ready"
];

const TOPOLOGY_NODES = [
  { label: "Kafka", angle: 0, color: "#5eead4" },
  { label: "Java", angle: 1.26, color: "#fbbf24" },
  { label: "K8s", angle: 2.51, color: "#a78bfa" },
  { label: "Meridian", angle: 3.77, color: "#38bdf8" },
  { label: "API", angle: 5.03, color: "#fb7185" }
];

const revealNodes = document.querySelectorAll(".reveal");
const header = document.querySelector(".header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const trackedSections = document.querySelectorAll("main section[id]");
const heroVisual = document.getElementById("hero-visual");
const heroInner = document.querySelector(".hero-visual-inner");
const preloader = document.getElementById("preloader");
const preloaderBar = document.getElementById("preloader-bar");
const preloaderLabel = document.getElementById("preloader-label");
const bgMesh = document.getElementById("bg-mesh");
const topologyCanvas = document.getElementById("hero-topology");
const yearEl = document.getElementById("year");

let targetProgress = 0;
let currentProgress = 0;
let targetHeroX = 0;
let targetHeroY = 0;
let currentHeroX = 0;
let currentHeroY = 0;
let mouseX = 0;
let mouseY = 0;

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function setScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  targetProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  if (header) {
    header.classList.toggle("is-scrolled", scrollTop > 24);
  }
}

function tickMotion() {
  currentProgress = lerp(currentProgress, targetProgress, 0.12);
  document.documentElement.style.setProperty("--progress", `${currentProgress}%`);

  currentHeroX = lerp(currentHeroX, targetHeroX, 0.08);
  currentHeroY = lerp(currentHeroY, targetHeroY, 0.08);

  if (heroInner) {
    const scrollTop = window.scrollY;
    const scrollTilt = scrollTop < window.innerHeight ? scrollTop * 0.012 : 0;
    const scrollLift = scrollTop < window.innerHeight ? scrollTop * 0.04 : 0;
    heroInner.style.transform = `perspective(900px) rotateY(${-8 + currentHeroX + scrollTilt}deg) rotateX(${6 - currentHeroY}deg) translateY(${scrollLift}px)`;
  }

  requestAnimationFrame(tickMotion);
}

function initPreloader() {
  if (!preloader || !preloaderBar) {
    document.body.classList.add("is-loaded");
    document.documentElement.classList.remove("is-loading");
    return;
  }

  let progress = 0;
  let labelIndex = 0;

  const step = () => {
    progress = Math.min(progress + Math.random() * 14 + 4, 96);
    preloaderBar.style.width = `${progress}%`;

    const nextLabel = Math.floor((progress / 100) * (PRELOADER_LABELS.length - 1));
    if (nextLabel !== labelIndex && preloaderLabel) {
      labelIndex = nextLabel;
      preloaderLabel.textContent = PRELOADER_LABELS[labelIndex];
    }

    if (progress < 96) {
      window.setTimeout(step, 120 + Math.random() * 180);
    }
  };

  step();

  const finish = () => {
    if (preloaderBar) preloaderBar.style.width = "100%";
    if (preloaderLabel) preloaderLabel.textContent = PRELOADER_LABELS[PRELOADER_LABELS.length - 1];

    window.setTimeout(() => {
      preloader.classList.add("is-done");
      document.body.classList.add("is-loaded");
      document.documentElement.classList.remove("is-loading");
    }, 420);
  };

  if (document.readyState === "complete") {
    window.setTimeout(finish, 680);
  } else {
    window.addEventListener("load", () => window.setTimeout(finish, 680), { once: true });
  }
}

function initBackgroundMesh() {
  if (!bgMesh) return;

  const ctx = bgMesh.getContext("2d");
  let width = 0;
  let height = 0;
  let time = 0;

  const blobs = [
    { x: 0.2, y: 0.25, r: 0.35, color: [94, 234, 212] },
    { x: 0.75, y: 0.15, r: 0.28, color: [167, 139, 250] },
    { x: 0.6, y: 0.7, r: 0.32, color: [251, 191, 36] }
  ];

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    bgMesh.width = width;
    bgMesh.height = height;
  }

  function draw() {
    time += 0.004;
    ctx.clearRect(0, 0, width, height);

    blobs.forEach((blob, index) => {
      const ox = Math.sin(time + index * 1.7) * 0.06;
      const oy = Math.cos(time * 0.9 + index) * 0.05;
      const cx = (blob.x + ox) * width;
      const cy = (blob.y + oy) * height;
      const radius = blob.r * Math.min(width, height);

      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      gradient.addColorStop(0, `rgba(${blob.color.join(",")}, 0.14)`);
      gradient.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    });

    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize);
}

function initTopology() {
  if (!topologyCanvas) return;

  const ctx = topologyCanvas.getContext("2d");
  const parent = topologyCanvas.parentElement;
  let size = 0;
  let time = 0;

  function resize() {
    size = Math.min(parent.clientWidth, parent.clientHeight, 400);
    topologyCanvas.width = size;
    topologyCanvas.height = size;
  }

  function draw() {
    time += 0.012;
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const orbit = size * 0.36;
    const points = TOPOLOGY_NODES.map((node, i) => {
      const a = node.angle + time * (0.3 + i * 0.04);
      return {
        x: cx + Math.cos(a) * orbit,
        y: cy + Math.sin(a) * orbit,
        label: node.label,
        color: node.color
      };
    });

    ctx.lineWidth = 1;
    points.forEach((point, i) => {
      for (let j = i + 1; j < points.length; j += 1) {
        const other = points[j];
        const dist = Math.hypot(point.x - other.x, point.y - other.y);
        const alpha = Math.max(0, 0.22 - dist / (size * 1.4));
        ctx.strokeStyle = `rgba(94, 234, 212, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }

      ctx.strokeStyle = `rgba(94, 234, 212, 0.18)`;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    });

    points.forEach((point) => {
      ctx.fillStyle = point.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(244, 244, 248, 0.65)";
      ctx.font = "600 10px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText(point.label, point.x, point.y - 12);
    });

    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize);
}

if (navToggle && header) {
  navToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (heroVisual) {
  heroVisual.addEventListener("mousemove", (event) => {
    const rect = heroVisual.getBoundingClientRect();
    mouseX = (event.clientX - rect.left) / rect.width - 0.5;
    mouseY = (event.clientY - rect.top) / rect.height - 0.5;
    targetHeroX = mouseX * 14;
    targetHeroY = mouseY * 10;
  });

  heroVisual.addEventListener("mouseleave", () => {
    targetHeroX = 0;
    targetHeroY = 0;
  });
}

revealNodes.forEach((node, index) => {
  node.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
});

window.addEventListener("scroll", setScrollProgress, { passive: true });
setScrollProgress();
tickMotion();
initPreloader();
initBackgroundMesh();
initTopology();

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
  );

  revealNodes.forEach((node) => revealObserver.observe(node));

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const activeId = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
        });
      });
    },
    { rootMargin: "-35% 0px -50% 0px", threshold: 0 }
  );

  trackedSections.forEach((section) => navObserver.observe(section));
} else {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
}
