import { useEffect, useRef } from "react";
import { scrollPageTo } from "../lib/smoothScroll";
import "./Footer.css";

// Every link opens something: the site's own pages (App.tsx changes page in
// place), or — for pages not built yet — the "under maintenance" note.
const FOOTER_COLUMNS: { title: string; links: [string, string][] }[] = [
  {
    title: "Platform",
    links: [
      ["Overview", "/flash"],
      ["Agents", "/flash"],
      ["Intelligence", "/#about"],
      ["Projects", "/projects"],
      ["Watchtower", "/watchtower"],
      ["Data", "/data"],
    ],
  },
  {
    title: "Company",
    links: [
      ["Customers", "/customers"],
      ["Security", "/security"],
      ["About", "/about"],
      ["Team", "/team"],
      ["Careers", "/careers"],
      ["Newsroom", "/news"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Blog", "/blog"],
      ["Reports", "/reports"],
      ["Press Kit", "/press"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["License", "/license"],
      ["Privacy Policy", "/privacy"],
      ["Terms & Conditions", "/terms"],
    ],
  },
];

const SOCIAL_LINKS = [
  {
    label: "X",
    href: "https://x.com",
    icon: (
      <path d="M13.2 2.5h2.3l-5 5.7 5.9 7.8h-4.6L8.2 11.3 4.1 16H1.8l5.4-6.1L1.5 2.5h4.7l3.2 4.3 3.8-4.3Zm-.8 12.1h1.3L5.6 3.8H4.2l8.2 10.8Z" />
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/quanthive/home/",
    icon: (
      <path d="M4.6 6.8H2V16h2.6V6.8ZM3.3 2.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM16 10.6c0-2.5-.5-4-3.3-4-1.3 0-2.2.7-2.6 1.4V6.8H7.6V16h2.6v-4.6c0-1.2.2-2.4 1.7-2.4s1.5 1.4 1.5 2.5V16H16v-5.4Z" />
    ),
  },
] as const;

const linkProps = (href: string) =>
  href.startsWith("https://") ? { target: "_blank", rel: "noreferrer" } : {};

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.location.hash === "#site-footer") {
      window.requestAnimationFrame(() => footerRef.current?.scrollIntoView());
    }
  }, []);

  const scrollToTop = () => scrollPageTo(0);

  return (
    <footer id="site-footer" className="site-footer" ref={footerRef}>
      <div className="site-footer__panel">
        <div className="site-footer__body">
          <div className="site-footer__row site-footer__row--brand">
            <div className="site-footer__cell">
              <a className="site-footer__logo" href="/" aria-label="QuantHive home" />
              <p className="site-footer__tagline">
                QuantHive builds Flash, an AI research analyst for investors. Ask in plain
                language and get sourced answers from filings, calls and market data in
                minutes, not days.
              </p>
            </div>
            <div className="site-footer__cell site-footer__cell--end">
              <button
                type="button"
                className="site-footer__top"
                onClick={scrollToTop}
                aria-label="Back to top"
              >
                <svg viewBox="0 0 16 16" aria-hidden>
                  <path d="M4 9.5 8 5.5l4 4M4 13l4-4 4 4" />
                </svg>
              </button>
            </div>
          </div>

          <div className="site-footer__row site-footer__row--links">
            <div className="site-footer__cell">
              <section className="site-footer__column">
                <h2>Contact</h2>
                <ul>
                  <li>
                    <a href="mailto:mail@quanthive.in">mail@quanthive.in</a>
                  </li>
                  <li>
                    <a href="/contact">Contact sales</a>
                  </li>
                </ul>
              </section>
            </div>
            <nav className="site-footer__cell site-footer__columns" aria-label="Footer navigation">
              {FOOTER_COLUMNS.map((column) => (
                <section className="site-footer__column" key={column.title}>
                  <h2>{column.title}</h2>
                  <ul>
                    {column.links.map(([label, href]) => (
                      <li key={label}>
                        <a href={href} {...linkProps(href)}>
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </nav>
          </div>

          <div className="site-footer__row site-footer__row--legal">
            <div className="site-footer__cell">
              <p className="site-footer__copyright">
                © {new Date().getFullYear()} QuantHive. All rights reserved.
              </p>
            </div>
            <div className="site-footer__cell site-footer__cell--end">
              <ul className="site-footer__social">
                {SOCIAL_LINKS.map(({ label, href, icon }) => (
                  <li key={label}>
                    <a href={href} aria-label={label} {...linkProps(href)}>
                      <svg viewBox="0 0 18 18" aria-hidden>
                        {icon}
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
