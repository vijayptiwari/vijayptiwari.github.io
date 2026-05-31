const revealNodes = document.querySelectorAll(".reveal");
const header = document.querySelector(".header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const trackedSections = document.querySelectorAll("main section[id]");
const heroVisual = document.getElementById("hero-visual");
const heroInner = document.querySelector(".hero-visual-inner");

function setScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  document.documentElement.style.setProperty("--progress", `${progress}%`);

  if (header) {
    header.classList.toggle("is-scrolled", scrollTop > 24);
  }

  if (heroInner && scrollTop < window.innerHeight) {
    const offset = scrollTop * 0.08;
    const rotate = -12 + scrollTop * 0.015;
    heroInner.style.transform = `rotateY(${rotate}deg) rotateX(8deg) translateY(${offset}px)`;
  }
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

window.addEventListener("scroll", setScrollProgress, { passive: true });
setScrollProgress();

if (heroVisual) {
  heroVisual.addEventListener("mousemove", (event) => {
    const rect = heroVisual.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    if (heroInner) {
      heroInner.style.transform = `rotateY(${-12 + x * 18}deg) rotateX(${8 - y * 12}deg)`;
    }
  });

  heroVisual.addEventListener("mouseleave", () => {
    if (heroInner) {
      heroInner.style.transform = "rotateY(-12deg) rotateX(8deg)";
    }
  });
}

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
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
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
