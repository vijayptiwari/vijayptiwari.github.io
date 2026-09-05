(function () {
  var SITE_ORIGIN = "https://vijayptiwari.github.io";
  var SITE_NAME = "Vijay Prakash Tiwari";
  var TWITTER = "@vijayptiwari";
  var AUTHOR = "Vijay Prakash Tiwari";
  var DEFAULT_IMAGE = SITE_ORIGIN + "/assets/photos/hero.png";

  var PAGES = {
    "index.html": {
      title: "Vijay Prakash Tiwari | Senior Software Engineer · Tech Lead · Agentic AI · Pune",
      description:
        "Portfolio of Vijay Prakash Tiwari — Tech Lead building distributed systems and agentic AI. Author of Evidence-Grounded Agent Routing and the Agent Engineering Framework.",
      keywords:
        "Vijay Prakash Tiwari, Tech Lead, Senior Software Engineer, Agentic AI, Evidence-Grounded Agent Routing, AI Agent Delegation, LangGraph, LangChain, LangStitch, Meridian, Eventore, Kafka, Kubernetes, Pune India, Software Portfolio",
      type: "profile"
    },
    "resume.html": {
      title: "Resume — Vijay Prakash Tiwari | Distributed Systems & Backend",
      description:
        "Resume of Vijay Prakash Tiwari — Senior Software Engineer and Tech Lead specializing in Java, Kafka, Kubernetes, and telecom-scale billing platforms.",
      keywords: "Vijay Tiwari resume, backend engineer resume, Java Kafka resume, tech lead resume",
      robots: "noindex, follow",
      canonical: SITE_ORIGIN + "/Vijay-Prakash-Tiwari-Resume.pdf"
    },
    "resume-ats-ai-systems.html": {
      title: "Resume — Vijay Prakash Tiwari | AI Systems & Agent Infrastructure",
      description:
        "AI-focused resume of Vijay Prakash Tiwari — agent platforms, LangGraph, MCP, RAG, guardrails, and production agent engineering.",
      keywords: "AI systems resume, agent engineer resume, LangGraph MCP RAG resume",
      robots: "noindex, nofollow"
    }
  };

  function fileName() {
    var segs = location.pathname.split("/").filter(Boolean);
    var last = segs[segs.length - 1] || "";
    if (!last || !/\.html$/i.test(last)) return "index.html";
    return last;
  }

  function upsertMeta(name, content, property) {
    if (!content) return;
    var sel = property ? 'meta[property="' + name + '"]' : 'meta[name="' + name + '"]';
    var node = document.head.querySelector(sel);
    if (!node) {
      node = document.createElement("meta");
      if (property) node.setAttribute("property", name);
      else node.setAttribute("name", name);
      document.head.appendChild(node);
    }
    node.setAttribute("content", content);
  }

  function upsertLink(rel, href) {
    if (!href) return;
    var node = document.head.querySelector('link[rel="' + rel + '"]');
    if (!node) {
      node = document.createElement("link");
      node.setAttribute("rel", rel);
      document.head.appendChild(node);
    }
    node.setAttribute("href", href);
  }

  var fn = fileName();
  var page = PAGES[fn];
  if (!page) return;

  var canonical = page.canonical || (fn === "index.html" ? SITE_ORIGIN + "/" : SITE_ORIGIN + "/" + fn);
  var image = page.image || DEFAULT_IMAGE;

  document.title = page.title;
  upsertMeta("description", page.description);
  upsertMeta("keywords", page.keywords);
  upsertMeta("author", AUTHOR);
  upsertMeta("robots", page.robots || "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
  upsertMeta("googlebot", page.robots || "index, follow, max-image-preview:large");
  upsertMeta("bingbot", page.robots || "index, follow");
  upsertLink("canonical", canonical);
  upsertLink("sitemap", SITE_ORIGIN + "/sitemap.xml", { type: "application/xml", title: "Sitemap index" });
  upsertLink("alternate", SITE_ORIGIN + "/sitemap-portfolio.xml", { type: "application/xml", title: "Portfolio sitemap" });
  upsertMeta("og:site_name", SITE_NAME, true);
  upsertMeta("og:type", page.type || "website", true);
  upsertMeta("og:url", canonical, true);
  upsertMeta("og:title", page.title, true);
  upsertMeta("og:description", page.description, true);
  upsertMeta("og:image", image, true);
  upsertMeta("og:locale", "en_IN", true);
  upsertMeta("twitter:card", "summary_large_image");
  upsertMeta("twitter:site", TWITTER);
  upsertMeta("twitter:title", page.title);
  upsertMeta("twitter:description", page.description);
  upsertMeta("twitter:image", image);
})();
