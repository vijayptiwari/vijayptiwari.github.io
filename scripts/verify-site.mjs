import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://vijayptiwari.github.io";
const failures = [];

const pages = [
  {
    file: "index.html",
    canonical: `${origin}/`,
    phrases: ["Agent Reliability Lead", "https://langstitch.com/", "Evidence-Grounded Agent Routing", "/research/evidence-grounded-agent-routing/"]
  },
  {
    file: "research/evidence-grounded-agent-routing/index.html",
    canonical: `${origin}/research/evidence-grounded-agent-routing/`,
    phrases: ["Routing Decision Record", "Claim boundary", "TechArticle"]
  },
  {
    file: "research/agent-engineering-framework/index.html",
    canonical: `${origin}/research/agent-engineering-framework/`,
    phrases: ["Ten coordinated control surfaces", "deterministic engineering envelope", "TechArticle"]
  },
  {
    file: "research/index.html",
    canonical: `${origin}/research/`,
    phrases: ["Seven journal publications", "numberOfItems", "CollectionPage"]
  },
  {
    file: "research/cloud-data-security-dna-cryptography/index.html",
    canonical: `${origin}/research/cloud-data-security-dna-cryptography/`,
    phrases: ["Python execution-time simulation", "Claim boundary", "ScholarlyArticle"]
  },
  {
    file: "research/dna-computing-implementations/index.html",
    canonical: `${origin}/research/dna-computing-implementations/`,
    phrases: ["molecular computation", "Claim boundary", "ScholarlyArticle"]
  },
  {
    file: "research/li-fi-technology/index.html",
    canonical: `${origin}/research/li-fi-technology/`,
    phrases: ["visible-light communication", "Claim boundary", "ScholarlyArticle"]
  },
  {
    file: "research/blue-brain-technology/index.html",
    canonical: `${origin}/research/blue-brain-technology/`,
    phrases: ["Separate established simulation research", "Claim boundary", "ScholarlyArticle"]
  },
  {
    file: "research/face-analysis-laser-focus/index.html",
    canonical: `${origin}/research/face-analysis-laser-focus/`,
    phrases: ["Verified correction", "Volume 3, Issue 4", "ScholarlyArticle"]
  },
  {
    file: "research/wearable-technology/index.html",
    canonical: `${origin}/research/wearable-technology/`,
    phrases: ["continuous computing", "Claim boundary", "ScholarlyArticle"]
  },
  {
    file: "research/augmented-reality-technologies/index.html",
    canonical: `${origin}/research/augmented-reality-technologies/`,
    phrases: ["systems-integration problem", "Claim boundary", "ScholarlyArticle"]
  }
];

function fail(message) {
  failures.push(message);
}

for (const page of pages) {
  const path = join(root, page.file);
  if (!existsSync(path)) {
    fail(`${page.file}: file is missing`);
    continue;
  }

  const html = readFileSync(path, "utf8");
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1]?.trim();
  const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1]?.trim();
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
  const h1Count = (html.match(/<h1(?:\s|>)/gi) || []).length;
  const robots = html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i)?.[1] || "";

  if (!title) fail(`${page.file}: title is missing`);
  if (!description || description.length < 80 || description.length > 170) {
    fail(`${page.file}: description should contain 80–170 characters`);
  }
  if (canonical !== page.canonical) fail(`${page.file}: canonical URL is incorrect`);
  if (h1Count !== 1) fail(`${page.file}: expected exactly one h1, found ${h1Count}`);
  if (!robots.includes("index") || robots.includes("noindex")) fail(`${page.file}: page is not indexable`);

  for (const phrase of page.phrases) {
    if (!html.includes(phrase)) fail(`${page.file}: required content is missing: ${phrase}`);
  }

  const jsonLdBlocks = [...html.matchAll(/<script\s+type="application\/ld\+json">\s*(.*?)\s*<\/script>/gis)];
  if (jsonLdBlocks.length === 0) fail(`${page.file}: JSON-LD is missing`);
  for (const [, json] of jsonLdBlocks) {
    try {
      JSON.parse(json);
    } catch (error) {
      fail(`${page.file}: invalid JSON-LD (${error.message})`);
    }
  }

  for (const [, asset] of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) {
    const localAsset = join(root, asset.replace(/^\//, ""));
    if (!existsSync(localAsset)) fail(`${page.file}: referenced asset is missing: ${asset}`);
  }
}

const sitemap = readFileSync(join(root, "sitemap-portfolio.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const duplicates = sitemapUrls.filter((url, index) => sitemapUrls.indexOf(url) !== index);

for (const page of pages) {
  if (!sitemapUrls.includes(page.canonical)) fail(`sitemap-portfolio.xml: missing ${page.canonical}`);
}
if (duplicates.length > 0) fail(`sitemap-portfolio.xml: duplicate URLs: ${[...new Set(duplicates)].join(", ")}`);
if (sitemapUrls.some((url) => url.endsWith("resume.html") || url.includes("resume-ats-"))) {
  fail("sitemap-portfolio.xml: noindex resume helper pages must not be submitted");
}

const robots = readFileSync(join(root, "robots.txt"), "utf8");
if (!robots.includes(`Sitemap: ${origin}/sitemap.xml`)) fail("robots.txt: root sitemap declaration is missing");

if (failures.length > 0) {
  console.error("Site verification failed:\n" + failures.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log(`Site verification passed for ${pages.length} indexable pages and ${sitemapUrls.length} sitemap URLs.`);
