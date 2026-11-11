import { useEffect, useRef, useState, type ReactNode } from "react";
import "./Nav.css";
import { NavIconBox } from "./NavPixelIcons";
import { openWaitlist } from "./WaitlistDialog";

// Original navbar items — preserved exactly from the original codebase
const ORIGINAL_ITEMS = [
  {
    label: "Product",
    blurb: "Research, screening and backtests in one desk.",
    inBar: true,
    hasDropdown: true,
  },
  {
    label: "About",
    blurb: "Who we are and how the models are built.",
    inBar: true,
    inBarSm: true,
  },
  {
    label: "Team",
    blurb: "The people behind the research.",
    inBar: true,
  },
  {
    label: "Contact",
    blurb: "Talk to us about access and pricing.",
    inBar: true,
  },
];

// The bar's and menu's labels for the site's plain pages.
const PLAIN_PAGES: Record<string, "about" | "team" | "contact" | "blog" | "careers" | "news" | undefined> = {
  About: "about",
  Team: "team",
  Contact: "contact",
  Blog: "blog",
  Careers: "careers",
  News: "news",
};

// The drawer's resources column (its own column on wider screens; on phones its
// links simply follow the others).
const RESOURCE_ITEMS = [
  {
    title: "Blog",
    blurb: "Research notes and product news.",
    // A page with lines of text.
    icon: (
      <LineIcon>
        <path d="M6 3h9l4 4v14H6Z" />
        <path d="M14.5 3v4.5H19" />
        <path d="M9 12h7M9 15.5h7M9 9h3" />
      </LineIcon>
    ),
  },
  {
    title: "Careers",
    blurb: "Open roles at IITM Research Park.",
    // A briefcase.
    icon: (
      <LineIcon>
        <rect x="3.5" y="7.5" width="17" height="12" rx="1.5" />
        <path d="M9 7.5V5.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        <path d="M3.5 12.5h17" />
      </LineIcon>
    ),
  },
  {
    title: "News",
    blurb: "Events, launches and milestones.",
    // A folded newspaper.
    icon: (
      <LineIcon>
        <path d="M5 4.5h12v15H6.5A1.5 1.5 0 0 1 5 18Z" />
        <path d="M17 8.5h2.5V18a1.5 1.5 0 0 1-3 0" />
        <path d="M8 8h6M8 11.5h6M8 15h4" />
      </LineIcon>
    ),
  },
];

/** On phones, each link's title ends in a small diagonal arrow (Nav.css). */
function MegaArrow() {
  return (
    <svg className="nav__mega-item-arrow" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M3 9 9 3M4 3h5v5" />
    </svg>
  );
}

const BAR_ITEMS = ORIGINAL_ITEMS.filter((it) => it.inBar);

// The drawer's icons: plain 1.5px line glyphs in one ink (Nav.css colours them).
function LineIcon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

// The drawer: the four places the bar links to, and a card for Flash.
const MENU_ITEMS = [
  {
    title: "Product",
    blurb: "Research, screening and backtests in one desk.",
    // Three stacked layers.
    icon: (
      <LineIcon>
        <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
        <path d="m3 12 9 4.5 9-4.5" />
        <path d="m3 16.5 9 4.5 9-4.5" />
      </LineIcon>
    ),
  },
  {
    title: "About",
    blurb: "Who we are and how the models are built.",
    // An "i" in a circle.
    icon: (
      <LineIcon>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" />
        <path d="M12 7.5v.01" />
      </LineIcon>
    ),
  },
  {
    title: "Team",
    blurb: "The people behind the research.",
    // Two people.
    icon: (
      <LineIcon>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
        <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" />
        <path d="M18.5 14.2a6.5 6.5 0 0 1 3 5.8" />
      </LineIcon>
    ),
  },
  {
    title: "Contact",
    blurb: "Talk to us about access and pricing.",
    // An envelope.
    icon: (
      <LineIcon>
        <rect x="3" y="5" width="18" height="14" rx="1.5" />
        <path d="m3.5 6 8.5 7 8.5-7" />
      </LineIcon>
    ),
  },
];

export default function Nav({
  open,
  onOpenChange,
  onProductSelect,
  onPageSelect,
  intro = false,
  page = "landing",
}: {
  /** Play the wordmark's entrance in step with the hero's lockup hand-over. */
  intro?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductSelect?: () => void;
  /** Opens the About page. */
  /** Opens one of the site's plain pages (About, Team, Contact). */
  onPageSelect?: (page: "about" | "team" | "contact" | "blog" | "careers" | "news") => void;
  /** The page showing, for the bar's tone over Flash's dark hero. */
  page?: string;
}) {
  const navRef = useRef<HTMLElement>(null);

  // The bar is see-through at the very top of the page and takes its white ground
  // as soon as the page has scrolled at all.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 4);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Dark while the bar is over Flash's dark hero (the drawer with it); light once
  // the page has scrolled on to the light sections under it.
  const [dark, setDark] = useState(false);
  useEffect(() => {
    if (page !== "product") {
      setDark(false);
      return;
    }
    const update = () => {
      const hero = document.querySelector(".hero--flash");
      const bar = navRef.current?.querySelector(".nav__bar");
      if (!hero || !bar) return setDark(page === "product");
      setDark(hero.getBoundingClientRect().bottom > bar.getBoundingClientRect().bottom);
    };
    update();
    const frame = requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [page]);

  // Escape key closes the dropdown
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      onOpenChange(false);
      navRef.current?.querySelector<HTMLButtonElement>(".nav__burger")?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return (
    <>
      {/* Dim backdrop scrim behind the dropdown */}
      <div
        className="nav-scrim"
        data-open={open || undefined}
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      <nav
        className="nav"
        data-open={open || undefined}
        data-scrolled={scrolled || undefined}
        data-intro={intro || undefined}
        data-tone={dark ? "dark" : undefined}
        ref={navRef}
      >
        {/* Full-width bar: wordmark left, links centred, CTA right */}
        <div className="nav__bar-anchor">
          <div className="nav__bar">
            <div className="nav__start">
              {/* The QuantHive wordmark. On the landing page it arrives as the hero's
                  lockup leaves (see .nav[data-intro] in Nav.css). */}
              <a className="nav__wordmark" href="/" aria-label="QuantHive home" />
              {/* On Flash's page the wordmark hands over to Flash's logo as the
                  hero's logo leaves (Nav.css). */}
              <a className="nav__flash" href="/flash" aria-label="Flash" tabIndex={-1}>
                <img src="/images/figma-product/flash-logo-white.svg" alt="" />
              </a>
            </div>

            <div className="nav__links">
              {BAR_ITEMS.map((it) => (
                <button
                  type="button"
                  className={`nav__link${it.hasDropdown ? " nav__link--dropdown" : ""}`}
                  data-sm={it.inBarSm || undefined}
                  data-active={it.hasDropdown && open ? "true" : undefined}
                  key={it.label}
                  onClick={() => {
                    if (it.hasDropdown) {
                      onOpenChange(!open);
                    } else {
                      onOpenChange(false);
                      const page = PLAIN_PAGES[it.label];
                      if (page) onPageSelect?.(page);
                    }
                  }}
                >
                  <span>{it.label}</span>
                  {it.hasDropdown && (
                    <svg
                      className="nav__chevron"
                      viewBox="0 0 10 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 1L5 5L9 1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div className="nav__end">
              {/* Phones only — the links live in the drawer there. */}
              <button
                type="button"
                className="nav__burger"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="nav-dropdown"
                onClick={() => onOpenChange(!open)}
              >
                <span className="nav__burger-lines" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              </button>
              <button type="button" className="nav__cta" aria-haspopup="dialog" onClick={openWaitlist}>
                Request demo
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown starts from TOP EDGE of viewport (top: 0), full width of viewport */}
        <div
          className="nav__dropdown"
          id="nav-dropdown"
          aria-hidden={!open}
          inert={!open}
        >
          <div className="nav__dropdown-clip" data-lenis-prevent>
            <div className="nav__dropdown-inner">
              {/* Spacer matching navbar height so content unrolls directly below it */}
              <div className="nav__dropdown-bar-spacer" />

              {/* Horizontal dotted rule below navbar elements */}
              <div className="nav__dropdown-bar-rule" />

              {/* Centered Dropdown Content with Diagonal Lines on Empty Flanks */}
              <div className="nav__dropdown-grid">
                <div className="nav__dropdown-header-row">
                  <div className="nav__dropdown-hatch nav__dropdown-hatch--left" aria-hidden="true" />
                  <div className="nav__dropdown-header-cell">
                    <span className="nav__dropdown-title">QuantHive</span>
                  </div>
                  <div className="nav__dropdown-header-cell">
                    <span className="nav__dropdown-title">Resources</span>
                  </div>
                  <div className="nav__dropdown-header-cell" />
                  <div className="nav__dropdown-hatch nav__dropdown-hatch--right" aria-hidden="true" />
                </div>

                <div className="nav__dropdown-body-row">
                  <div className="nav__dropdown-hatch nav__dropdown-hatch--left" aria-hidden="true" />

                  <div className="nav__dropdown-col">
                    {MENU_ITEMS.map((item) => (
                      <button
                        type="button"
                        className="nav__mega-item"
                        key={item.title}
                        tabIndex={open ? 0 : -1}
                        onClick={() => {
                          if (item.title === "Product") onProductSelect?.();
                          const page = PLAIN_PAGES[item.title];
                          if (page) onPageSelect?.(page);
                          onOpenChange(false);
                        }}
                      >
                        <NavIconBox>{item.icon}</NavIconBox>
                        <div className="nav__mega-item-text">
                          <span className="nav__mega-item-title">{item.title}</span>
                          <span className="nav__mega-item-blurb">{item.blurb}</span>
                        </div>
                        <MegaArrow />
                      </button>
                    ))}
                  </div>

                  <div className="nav__dropdown-col nav__dropdown-col--resources">
                    {RESOURCE_ITEMS.map((item) => (
                      <button
                        type="button"
                        className="nav__mega-item"
                        key={item.title}
                        tabIndex={open ? 0 : -1}
                        onClick={() => {
                          const page = PLAIN_PAGES[item.title];
                          if (page) onPageSelect?.(page);
                          onOpenChange(false);
                        }}
                      >
                        <NavIconBox>{item.icon}</NavIconBox>
                        <div className="nav__mega-item-text">
                          <span className="nav__mega-item-title">{item.title}</span>
                          <span className="nav__mega-item-blurb">{item.blurb}</span>
                        </div>
                        <MegaArrow />
                      </button>
                    ))}
                  </div>

                  {/* Flash: its logo on its own dark ground, opening its page. */}
                  <div className="nav__dropdown-col nav__dropdown-col--cards">
                    <a
                      href="/flash"
                      className="nav__promo-card nav__promo-card--flash"
                      tabIndex={open ? 0 : -1}
                      onClick={(e) => {
                        e.preventDefault();
                        onProductSelect?.();
                        onOpenChange(false);
                      }}
                    >
                      <div className="nav__flash-visual" aria-hidden="true">
                        <img src="/images/figma-product/flash-logo-white.svg" alt="" />
                      </div>
                      <div className="nav__promo-content">
                        <div className="nav__promo-title">
                          Flash
                          <span className="nav__promo-arrow" aria-hidden="true">
                            ↗
                          </span>
                        </div>
                        <div className="nav__promo-blurb">Financial analytics, at speed. Join the waitlist.</div>
                      </div>
                    </a>
                  </div>

                  <div className="nav__dropdown-hatch nav__dropdown-hatch--right" aria-hidden="true" />
                </div>
              </div>

              {/* Phones: the bar's "Request demo" lives here, at the drawer's foot. */}
              <button
                type="button"
                className="nav__drawer-cta"
                aria-haspopup="dialog"
                tabIndex={open ? 0 : -1}
                onClick={() => {
                  onOpenChange(false);
                  openWaitlist();
                }}
              >
                Request demo
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
