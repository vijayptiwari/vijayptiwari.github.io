const TYPED_ROLES = [
  "Senior Software Engineer",
  "Agentic Platform Tech Lead",
  "Creator of Meridian & Eventore",
  "Distributed Systems Engineer",
  "Kafka Platform Engineer"
];

const revealNodes = document.querySelectorAll(".reveal");
const header = document.querySelector(".header");
const nav = document.querySelector(".header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const trackedSections = document.querySelectorAll("main section[id]");
const filterPills = document.querySelectorAll(".filter-pill");
const projectCards = document.querySelectorAll("[data-project-category]");
const copyButtons = document.querySelectorAll(".copy-btn");
const typedEl = document.getElementById("typed-text");
const canvas = document.getElementById("particle-canvas");
const yearEl = document.getElementById("year");

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

function setScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  document.documentElement.style.setProperty("--progress", `${progress}%`);

  if (header) {
    header.classList.toggle("is-scrolled", scrollTop > 40);
  }
}

function initParticles() {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let particles = [];
  let animationId = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const count = Math.min(70, Math.floor((width * height) / 18000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 2 + 1
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(108, 99, 255, 0.35)";
      ctx.fill();

      for (let j = i + 1; j < particles.length; j += 1) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(108, 99, 255, ${0.14 * (1 - dist / 130)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    animationId = requestAnimationFrame(draw);
  }

  resize();
  draw();

  window.addEventListener("resize", resize);

  return () => {
    cancelAnimationFrame(animationId);
    window.removeEventListener("resize", resize);
  };
}

function initTyping() {
  if (!typedEl) return;

  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const current = TYPED_ROLES[roleIndex];

    if (!deleting) {
      typedEl.textContent = current.slice(0, charIndex + 1);
      charIndex += 1;

      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
    } else {
      typedEl.textContent = current.slice(0, charIndex - 1);
      charIndex -= 1;

      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % TYPED_ROLES.length;
      }
    }

    setTimeout(tick, deleting ? 40 : 70);
  }

  tick();
}

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

filterPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    const filter = pill.getAttribute("data-filter");

    filterPills.forEach((item) => {
      item.classList.toggle("is-active", item === pill);
      item.setAttribute("aria-selected", item === pill ? "true" : "false");
    });

    projectCards.forEach((card) => {
      const category = card.getAttribute("data-project-category");
      const show = filter === "all" || category === filter;
      card.classList.toggle("is-hidden", !show);
    });
  });
});

copyButtons.forEach((button) => {
  button.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const value = button.getAttribute("data-copy");
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      const original = button.textContent;
      button.textContent = "Copied!";
      window.setTimeout(() => {
        button.textContent = original;
      }, 1400);
    } catch {
      button.textContent = "Failed";
    }
  });
});

window.addEventListener("scroll", setScrollProgress, { passive: true });
setScrollProgress();
initParticles();
initTyping();

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
    { threshold: 0.1 }
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
    { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
  );

  trackedSections.forEach((section) => navObserver.observe(section));
} else {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
}
