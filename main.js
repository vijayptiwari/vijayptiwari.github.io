const PRELOADER_LABELS = [
  "Warming up the stack",
  "Loading distributed nodes",
  "Syncing Meridian agents",
  "Ready"
];

const TOPOLOGY_NODES = [
  { label: "Kafka", angle: 0, color: "#5eead4" },
  { label: "LangGraph", angle: 1.26, color: "#fbbf24" },
  { label: "MCP", angle: 2.51, color: "#a78bfa" },
  { label: "Meridian", angle: 3.77, color: "#38bdf8" },
  { label: "RAG", angle: 5.03, color: "#fb7185" }
];

const revealNodes = document.querySelectorAll(".reveal");
const header = document.querySelector(".header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const trackedSections = document.querySelectorAll("main section[id]");
const heroInner = document.querySelector(".hero-visual-inner");
const preloader = document.getElementById("preloader");
const preloaderBar = document.getElementById("preloader-bar");
const preloaderLabel = document.getElementById("preloader-label");
const bgMesh = document.getElementById("bg-mesh");
const topologyCanvas = document.getElementById("hero-topology");
const yearEl = document.getElementById("year");
const tiltElements = document.querySelectorAll(".parallax-tilt");
const scrollShiftElements = document.querySelectorAll(".project-slide__content, .timeline-item, .about-text p");

const motionEnabled = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let targetProgress = 0;
let currentProgress = 0;
let targetPX = 0;
let targetPY = 0;
let currentPX = 0;
let currentPY = 0;
let pointerClientX = window.innerWidth * 0.5;
let pointerClientY = window.innerHeight * 0.5;
let meshPointerX = 0;
let meshPointerY = 0;

const tiltControllers = [];

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

  document.documentElement.style.setProperty("--scroll-y", String(scrollTop));
}

function initPointerTracking() {
  if (!motionEnabled) return;

  document.addEventListener(
    "pointermove",
    (event) => {
      pointerClientX = event.clientX;
      pointerClientY = event.clientY;
      targetPX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetPY = (event.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true }
  );

  document.addEventListener(
    "pointerleave",
    () => {
      targetPX = 0;
      targetPY = 0;
    },
    { passive: true }
  );
}

function initParallaxTilt() {
  if (!motionEnabled) return;

  tiltElements.forEach((element) => {
    const maxTilt = parseFloat(element.dataset.tiltMax || "3");
    const inner = element.querySelector(".parallax-tilt-inner") || element;
    const state = {
      element,
      inner,
      maxTilt,
      localX: 0,
      localY: 0,
      targetLX: 0,
      targetLY: 0,
      hovering: false
    };

    element.addEventListener("mouseenter", () => {
      state.hovering = true;
      element.classList.add("is-hovered");
    });

    element.addEventListener("mouseleave", () => {
      state.hovering = false;
      element.classList.remove("is-hovered");
      state.targetLX = 0;
      state.targetLY = 0;
    });

    element.addEventListener("mousemove", (event) => {
      const rect = element.getBoundingClientRect();
      state.targetLX = ((event.clientX - rect.left) / rect.width - 0.5) * state.maxTilt;
      state.targetLY = ((event.clientY - rect.top) / rect.height - 0.5) * -state.maxTilt;
    });

    tiltControllers.push(state);
  });
}

function updateTiltControllers() {
  tiltControllers.forEach((state) => {
    const ease = state.hovering ? 0.14 : 0.07;
    state.localX = lerp(state.localX, state.targetLX, ease);
    state.localY = lerp(state.localY, state.targetLY, ease);

    const rect = state.element.getBoundingClientRect();
    const dx = (pointerClientX - (rect.left + rect.width / 2)) / window.innerWidth;
    const dy = (pointerClientY - (rect.top + rect.height / 2)) / window.innerHeight;
    const globalX = dx * 5;
    const globalY = dy * 3;
    const scrollDelta = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
    const scrollShift = scrollDelta * -6;

    state.inner.style.transform =
      `perspective(900px) rotateY(${state.localX + dx * 1.2}deg) rotateX(${state.localY - dy * 1.2}deg) translate3d(${globalX}px, ${globalY + scrollShift}px, 0)`;
  });
}

function updateScrollShiftElements() {
  if (!motionEnabled) return;

  scrollShiftElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const centerOffset = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
    const dx = (pointerClientX - window.innerWidth / 2) / window.innerWidth;
    const shiftY = centerOffset * -8;
    const shiftX = dx * 3;

    element.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0)`;
  });
}

function tickMotion() {
  currentProgress = lerp(currentProgress, targetProgress, 0.12);
  currentPX = lerp(currentPX, targetPX, 0.06);
  currentPY = lerp(currentPY, targetPY, 0.06);
  meshPointerX = lerp(meshPointerX, currentPX, 0.05);
  meshPointerY = lerp(meshPointerY, currentPY, 0.05);

  document.documentElement.style.setProperty("--progress", `${currentProgress}%`);
  document.documentElement.style.setProperty("--px", String(currentPX));
  document.documentElement.style.setProperty("--py", String(currentPY));

  const spotX = 50 + currentPX * 8;
  const spotY = 40 + currentPY * 6;
  document.documentElement.style.setProperty("--spot-x", `${spotX}%`);
  document.documentElement.style.setProperty("--spot-y", `${spotY}%`);

  if (heroInner && motionEnabled) {
    const scrollTop = window.scrollY;
    const scrollTilt = scrollTop < window.innerHeight ? scrollTop * 0.008 : 0;
    const scrollLift = scrollTop < window.innerHeight ? scrollTop * 0.03 : 0;
    const tiltY = currentPX * 6;
    const tiltX = -currentPY * 4;

    heroInner.style.transform =
      `perspective(900px) rotateY(${-6 + tiltY + scrollTilt}deg) rotateX(${4 + tiltX}deg) translateY(${scrollLift}px)`;
  }

  updateTiltControllers();
  updateScrollShiftElements();

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
  if (!bgMesh || !motionEnabled) return;

  const ctx = bgMesh.getContext("2d");
  let width = 0;
  let height = 0;
  let time = 0;

  const blobs = [
    { x: 0.2, y: 0.25, r: 0.35, color: [94, 234, 212], drift: 1.2 },
    { x: 0.75, y: 0.15, r: 0.28, color: [167, 139, 250], drift: 0.9 },
    { x: 0.6, y: 0.7, r: 0.32, color: [251, 191, 36], drift: 1.5 }
  ];

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    bgMesh.width = width;
    bgMesh.height = height;
  }

  function draw() {
    time += 0.0035;
    ctx.clearRect(0, 0, width, height);

    blobs.forEach((blob, index) => {
      const ox = Math.sin(time + index * 1.7) * 0.05;
      const oy = Math.cos(time * 0.9 + index) * 0.04;
      const px = meshPointerX * 0.06 * blob.drift;
      const py = meshPointerY * 0.05 * blob.drift;
      const cx = (blob.x + ox + px) * width;
      const cy = (blob.y + oy + py) * height;
      const radius = blob.r * Math.min(width, height);

      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      gradient.addColorStop(0, `rgba(${blob.color.join(",")}, 0.15)`);
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
  if (!topologyCanvas || !motionEnabled) return;

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
    time += 0.01;
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2 + meshPointerX * 8;
    const cy = size / 2 + meshPointerY * 6;
    const orbit = size * 0.36;
    const points = TOPOLOGY_NODES.map((node, i) => {
      const a = node.angle + time * (0.28 + i * 0.035);
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
        const alpha = Math.max(0, 0.2 - dist / (size * 1.4));
        ctx.strokeStyle = `rgba(94, 234, 212, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(94, 234, 212, 0.16)";
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

      ctx.fillStyle = "rgba(244, 244, 248, 0.62)";
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

revealNodes.forEach((node, index) => {
  node.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
});

window.addEventListener("scroll", setScrollProgress, { passive: true });
setScrollProgress();
initPointerTracking();
initParallaxTilt();
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
