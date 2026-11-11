import { MAINTENANCE_SEO, PAGES } from "./content/seo";
import { applySeo } from "./lib/seo";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import AbstractLines from "./components/AbstractLines";
import AnnouncementBar from "./components/AnnouncementBar";
import ArticlePage from "./components/ArticlePage";
import BlogPage from "./components/BlogPage";
import Capabilities from "./components/Capabilities";
import CareersPage from "./components/CareersPage";
import ContactPage from "./components/ContactPage";
import LegalPage from "./components/LegalPage";
import MaintenancePage from "./components/MaintenancePage";
import NewsPage from "./components/NewsPage";
import TeamPage from "./components/TeamPage";
import EdgeMotifs from "./components/EdgeMotifs";
import FlashProductPage from "./components/FlashProductPage";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Nav from "./components/Nav";
import About from "./components/About";
import AboutPage from "./components/AboutPage";
import WaitlistDialog, { onWaitlistRequest } from "./components/WaitlistDialog";
import Showcase from "./components/Showcase";
import { canonicaliseAddress, navigate, onAddressChange, PAGE_URL, pageAt, pageFrom, type Page } from "./lib/router";
import { jumpPageTo } from "./lib/smoothScroll";
import "./styles/page-transition.css";

// Pages and their addresses: src/lib/router.ts. (#about, unlike #about-us, is the
// landing page's own About section, so it stays on the landing page.)
if (typeof window !== "undefined") canonicaliseAddress();

// The old app shell (sidebar, chat, watchlist, clock, palette, both glass themes)
// is still on disk and untouched — only this entry point changed, so
// `git checkout src/App.tsx` brings the whole thing back.
//
// The menu's open state lives here rather than inside Nav because both pages react
// to it: the lockup, caption, the edge motifs and the clock all recess while the
// dropdown is down. Explicit props keep that relationship visible.
//
// Nav renders last so its panel and scrim paint over the page without depending on
// z-index alone.
// /showcase: the About panel's demo alone, full screen, for a display.
const SHOWCASE_ONLY = typeof window !== "undefined" && window.location.pathname.replace(/\/+$/, "") === "/showcase";

// What each page tells search engines and link previews (its title is the
// tab's): src/content/seo.ts.
const seoFor = (page: Page) =>
  page === "maintenance" ? MAINTENANCE_SEO : PAGES.find((p) => p.path === PAGE_URL[page]) ?? PAGES[0]!;

// The pages that open on a hero; changing between two of them hands one hero
// over to the other (page-transition.css).
const isHero = (page: string | undefined) => page === "landing" || page === "product";

export default function App() {
  if (SHOWCASE_ONLY) return <Showcase />;
  return <Site />;
}

function Site() {
  const [menuOpen, setMenuOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("menu") === "open";
    }
    return false;
  });
  // Scroll-driven material blend for the edge motifs: Problem writes it every
  // frame, EdgeMotifs reads it every frame. Problem (the clock section) is no
  // longer mounted — the card carousel replaced it — so both refs rest at 0 and
  // the motifs hold their opening material. A ref rather than state because it
  // changes continuously — as state it would re-render the whole tree per frame.
  const toneRef = useRef(0);
  // Same shape, same reason: the ornaments change metal with the second clock, and
  // that is written by Problem every frame too.
  const alloyRef = useRef(0);
  // Only a visit that starts on the landing page plays the hero hand-over, so only
  // then does the nav's wordmark wait for it.
  const [introOnLanding] = useState(
    () => typeof window !== "undefined" && pageFrom() !== "product",
  );
  const [page, setPage] = useState<Page>(() => (typeof window !== "undefined" ? pageFrom() : "landing"));
  // Arrived from the other hero by the page change below: the arriving hero waits
  // for the change (--page-t0) and its edge marks morph across rather than enter.
  const [handoff, setHandoff] = useState(false);

  // The page's colours follow it: the nav and announcement bar invert on Flash's
  // dark hero (Nav.css, AnnouncementBar.css), and so does the page ground.
  useEffect(() => {
    document.documentElement.dataset.page = page;
    if (page !== "article") applySeo(seoFor(page)); // ArticlePage sets its own
  }, [page]);

  // Changing page is one view transition, not a reload (page-transition.css): the
  // new page rises over the old in a wave from the bottom, turning the ground and
  // its lattice; the old hero's centre then lifts away, and the new one's logo
  // rises into its place. Browsers without view transitions (or with reduced
  // motion) just swap.
  useEffect(() => {
    const go = () => {
      canonicaliseAddress();
      const next = pageFrom();
      // Moving within the landing page (its #about section, say) isn't a page change.
      // From one article to another, the page stays (ArticlePage follows the
      // address) and opens at the top.
      if (next === document.documentElement.dataset.page) {
        if (next === "article" && !window.location.hash) jumpPageTo(0);
        return;
      }
      // Remember where the reader came from (the About page's back arrow).
      document.documentElement.dataset.prevPage = document.documentElement.dataset.page ?? "";
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const animated = !!document.startViewTransition && !reduce;
      // Hero to hero: the arriving hero's timeline waits for the change.
      const heroToHero = animated && isHero(next) && isHero(document.documentElement.dataset.page);
      const apply = () => {
        if (heroToHero) document.documentElement.dataset.handoff = "";
        else delete document.documentElement.dataset.handoff;
        flushSync(() => {
          setHandoff(heroToHero);
          setPage(next);
        });
        document.documentElement.dataset.page = next;
        jumpPageTo(0);
      };
      // The edge marks carry across in place only from the very top of the page,
      // where they sit exactly where the new hero's will. Scrolled at all — even a
      // little, marks still half on screen — carrying them would slide them in
      // from above, as the new page opens at the top. Then they enter from their
      // own sides instead, as the new hero starts (page-transition.css, Hero.css,
      // EdgeMotifs.css). Set before the old page is captured.
      const marksAtRest = window.scrollY <= 8;
      if (heroToHero && !marksAtRest) document.documentElement.dataset.marksEnter = "";
      else delete document.documentElement.dataset.marksEnter;
      if (!animated) apply();
      else document.startViewTransition(apply);
    };
    return onAddressChange(go);
  }, []);

  // Links to the site's own pages (the nav's logos, the footer, …) change page in
  // place rather than reloading. A link to a spot on the same page is left alone.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href);
      if (url.origin !== window.location.origin) return;
      if (!pageAt(url.pathname)) return;
      if (pageFrom(url) === pageFrom() && url.pathname === window.location.pathname) return;
      event.preventDefault();
      navigate(url.pathname + url.hash);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Going to another page from the menu: the menu folds away first, then the
  // page changes (the drawer's fold is ~0.4s, Nav.css).
  const menuOpenRef = useRef(menuOpen);
  menuOpenRef.current = menuOpen;
  const goTo = (target: Page) => {
    if (pageFrom() === target) return setMenuOpen(false);
    const wasOpen = menuOpenRef.current;
    setMenuOpen(false);
    if (wasOpen) window.setTimeout(() => navigate(PAGE_URL[target]), 420);
    else navigate(PAGE_URL[target]);
  };
  const openProduct = () => goTo("product");

  // The waitlist form, over whichever page is showing (WaitlistDialog.openWaitlist).
  const [waitlist, setWaitlist] = useState(false);
  useEffect(() => onWaitlistRequest(() => setWaitlist(true)), []);
  const closeWaitlist = useCallback(() => setWaitlist(false), []);


  return (
    <>
      {/* "Explore now" opens Flash's page. */}
      <AnnouncementBar ctaHref="/flash" onCtaClick={openProduct} />
      {page === "product" ? (
        <FlashProductPage recessed={menuOpen} handoff={handoff} />
      ) : page === "about" ? (
        <AboutPage />
      ) : page === "maintenance" ? (
        <MaintenancePage />
      ) : page === "article" ? (
        <ArticlePage />
      ) : page === "blog" ? (
        <BlogPage />
      ) : page === "news" ? (
        <NewsPage />
      ) : page === "team" ? (
        <TeamPage />
      ) : page === "contact" ? (
        <ContactPage />
      ) : page === "careers" ? (
        <CareersPage />
      ) : page === "terms" || page === "privacy" || page === "license" ? (
        <LegalPage key={page} doc={page} />
      ) : (
        <>
          {/* Fixed to the viewport, so the pages scroll past a single pair rather than
              each carrying its own copy. */}
          <EdgeMotifs recessed={menuOpen} toneRef={toneRef} alloyRef={alloyRef} />
          {/* Also fixed, and painted after the ornaments so it sits over them where the
              two overlap — the order frame 1722:3 puts them in. */}
          <AbstractLines />
          <Hero recessed={menuOpen} handoff={handoff} />
          <Capabilities />
          <About />
        </>
      )}
      <Footer />
      <WaitlistDialog open={waitlist} onClose={closeWaitlist} />
      <Nav open={menuOpen} onOpenChange={setMenuOpen} onProductSelect={openProduct} onPageSelect={goTo} page={page} intro={introOnLanding && page === "landing"} />
    </>
  );
}
