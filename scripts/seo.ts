// After `bun build` (package.json's build): gives every page of the site its own
// HTML file with its own head — title, description, canonical address,
// link-preview tags and structured data (src/content/seo.ts) — so search
// engines and link previews read each page's head without running the app.
// Also writes sitemap.xml and robots.txt.
//
//   dist/index.html          /            (the landing page)
//   dist/about.html          /about       (vercel.json's cleanUrls serves it)
//   dist/blog/<slug>.html    /blog/<slug>
//   dist/news/<slug>.html    /news/<slug>
//
// The app itself is the same in every file; any other address still falls back
// to index.html (vercel.json's rewrite).

import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { ALL_PAGES, OG_IMAGE, ORGANIZATION, SITE, SITE_NAME, WEBSITE, type PageSeo } from "../src/content/seo";

const DIST = join(import.meta.dir, "..", "dist");

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// JSON in a <script>: never let a "</script>" in the text close it.
const json = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

function head(seo: PageSeo) {
  const url = `${SITE}${seo.path}`;
  return [
    `<meta name="robots" content="${seo.noindex ? "noindex, follow" : "index, follow"}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:title" content="${escape(seo.title)}" />`,
    `<meta property="og:description" content="${escape(seo.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:type" content="${seo.type ?? "website"}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:image" content="${seo.image ?? OG_IMAGE}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:alt" content="${escape(seo.title)}" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escape(seo.title)}" />`,
    `<meta name="twitter:description" content="${escape(seo.description)}" />`,
    `<meta name="twitter:image" content="${seo.image ?? OG_IMAGE}" />`,
    `<script type="application/ld+json">${json([ORGANIZATION, WEBSITE])}</script>`,
    ...(seo.jsonLd?.length ? [`<script type="application/ld+json" id="page-jsonld">${json(seo.jsonLd)}</script>`] : []),
  ]
    .map((line) => `    ${line}`)
    .join("\n");
}

function pageHtml(template: string, seo: PageSeo) {
  return template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(seo.title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escape(seo.description)}" />`)
    .replace("</head>", `${head(seo)}\n  </head>`);
}

const fileFor = (path: string) => (path === "/" ? join(DIST, "index.html") : join(DIST, `${path.slice(1)}.html`));

const template = await Bun.file(join(DIST, "index.html")).text();
if (!/<title>/.test(template) || !/<meta name="description"/.test(template) || template.includes("og:title")) {
  throw new Error("dist/index.html isn't the fresh build's (no <title>/description, or already processed)");
}
for (const seo of ALL_PAGES) {
  const file = fileFor(seo.path);
  await mkdir(dirname(file), { recursive: true });
  await Bun.write(file, pageHtml(template, seo));
}

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ALL_PAGES.filter((seo) => !seo.noindex)
  .map(
    (seo) =>
      `  <url><loc>${SITE}${seo.path}</loc><lastmod>${today}</lastmod>${seo.changefreq ? `<changefreq>${seo.changefreq}</changefreq>` : ""}${seo.priority !== undefined ? `<priority>${seo.priority.toFixed(1)}</priority>` : ""}</url>`,
  )
  .join("\n")}
</urlset>
`;
await Bun.write(join(DIST, "sitemap.xml"), sitemap);
await Bun.write(
  join(DIST, "robots.txt"),
  `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /showcase\n\nSitemap: ${SITE}/sitemap.xml\n`,
);

console.log(`SEO: ${ALL_PAGES.length} pages, sitemap.xml, robots.txt`);
