const rotatingLines = [
  "Designing AI-capable backend systems.",
  "Building agent-ready enterprise platforms.",
  "Shipping scalable microservices with confidence.",
  "Modernizing integration-heavy business systems."
];

const focusRotator = document.getElementById("focus-rotator");
let lineIndex = 0;

if (focusRotator) {
  window.setInterval(() => {
    lineIndex = (lineIndex + 1) % rotatingLines.length;
    focusRotator.textContent = rotatingLines[lineIndex];
  }, 2800);
}

const revealNodes = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18
    }
  );

  revealNodes.forEach((node) => observer.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
}
