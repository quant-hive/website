// The site's pages and their addresses:
//
//   /         the QuantHive landing page
//   /flash    Flash's page (old /#flash and /#product links still open it)
//   /about    the About page (old /#about-us links still open it)
//   /team     the Team page
//   /contact  the Contact page
//   /careers  the Careers page
//   /terms, /privacy, /license  the legal pages
//   /blog     the Blog page
//   /news     the News page
//   /blog/<slug>  an article (src/content/articles.ts)
//   /news/<slug>  a news item's article (src/content/news.ts), on the same template
//   anything else an "under maintenance" note, until that page is built
//
// Moving between them never reloads: navigate() pushes the address and App.tsx
// changes page (with its transition) on that, on back/forward, and on a change of
// hash.
//
// To add a page: add it to Page and PAGE_URL below (and a title in App.tsx). The
// hosts already serve the app at any path (vercel.json, server.ts), so a refresh
// on the new address works with nothing else to set up.

export type Page = "landing" | "product" | "about" | "team" | "contact" | "careers" | "terms" | "privacy" | "license" | "blog" | "news" | "article" | "maintenance";

export const PAGE_URL: Record<Page, string> = {
  landing: "/",
  product: "/flash",
  about: "/about",
  team: "/team",
  contact: "/contact",
  careers: "/careers",
  terms: "/terms",
  privacy: "/privacy",
  license: "/license",
  blog: "/blog",
  news: "/news",
  article: "/blog", // an article lives at /blog/<slug> or /news/<slug>, never at /blog alone
  maintenance: "/maintenance", // any address with no page yet
};

// Addresses the site used before, still honoured: shown as the page's own.
const OLD_HASHES: Record<string, Page> = {
  "#flash": "product",
  "#product": "product",
  "#about-us": "about",
};

const NAVIGATE_EVENT = "quanthive:navigate";

const trimPath = (path: string) => path.replace(/\/+$/, "") || "/";

/** The page at a path, or null if it isn't one of the site's pages. */
export function pageAt(pathname: string): Page | null {
  const path = trimPath(pathname);
  if (/^\/(blog|news)\/[^/]+$/.test(path)) return "article";
  const page = (Object.keys(PAGE_URL) as Page[]).find((name) => name !== "article" && PAGE_URL[name] === path);
  if (page) return page;
  // Any other page-like address (not a file, not the API) has no page yet.
  if (!/\.[a-z0-9]+$/i.test(path) && !path.startsWith("/api/") && path !== "/showcase") return "maintenance";
  return null;
}

/** The page a location (or URL) shows. Unknown paths show the landing page. */
export function pageFrom(location: { pathname: string; hash: string } = window.location): Page {
  return OLD_HASHES[location.hash] ?? pageAt(location.pathname) ?? "landing";
}

/** Old hash addresses are shown as the page's own path (no new history entry). */
export function canonicaliseAddress() {
  const page = OLD_HASHES[window.location.hash];
  if (page) window.history.replaceState(null, "", PAGE_URL[page]);
}

/** Goes to a page of the site without reloading. */
export function navigate(url: string) {
  window.history.pushState(null, "", url);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
}

/** Calls `onChange` whenever the address changes (navigate, back/forward, hash). */
export function onAddressChange(onChange: () => void) {
  window.addEventListener(NAVIGATE_EVENT, onChange);
  window.addEventListener("popstate", onChange);
  window.addEventListener("hashchange", onChange);
  return () => {
    window.removeEventListener(NAVIGATE_EVENT, onChange);
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("hashchange", onChange);
  };
}
