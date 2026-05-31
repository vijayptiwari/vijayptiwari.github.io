const revealNodes = document.querySelectorAll(".reveal");
const nav = document.querySelector(".nav");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const trackedSections = document.querySelectorAll("main section[id]");
const themeToggle = document.querySelector(".theme-toggle");
const filterPills = document.querySelectorAll(".filter-pill");
const projectCards = document.querySelectorAll("[data-project-category]");
const copyButtons = document.querySelectorAll(".copy-btn");

const THEME_KEY = "portfolio-theme";

function setScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  document.documentElement.style.setProperty("--progress", `${progress}%`);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);

  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    themeToggle.textContent = theme === "light" ? "Dark mode" : "Light mode";
  }
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const preferred = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  applyTheme(saved || preferred);
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    applyTheme(current === "dark" ? "light" : "dark");
  });
}

if (nav && navToggle) {
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
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      const original = button.textContent;
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.textContent = original;
      }, 1400);
    } catch {
      button.textContent = "Copy failed";
    }
  });
});

window.addEventListener("scroll", setScrollProgress, { passive: true });
setScrollProgress();
initTheme();

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
    { threshold: 0.12 }
  );

  revealNodes.forEach((node) => revealObserver.observe(node));

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const activeId = entry.target.getAttribute("id");

        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
        });
      });
    },
    {
      rootMargin: "-25% 0px -55% 0px",
      threshold: 0
    }
  );

  trackedSections.forEach((section) => navObserver.observe(section));
} else {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
}
