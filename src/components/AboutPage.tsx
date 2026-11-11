import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { navigate } from "../lib/router";
import EngravedPortrait from "./EngravedPortrait";
import "./AboutPage.css";

// The About page (frames 17:3946 and 18:4116, stacked, the frames' empty space
// taken out): a single 812px column — a back arrow out in the margin, "About" set
// a few letters to a face like the hero's headline, a small black motif at the
// column's right; the mission and vision; a rule; the leadership, each with an
// engraved portrait (as on the Team page), a line on their work and a LinkedIn
// link; a rule — and then Partners: its heading over a grid of compartments,
// three to a row, one logo each, in light grey.

const LEADERS = [
  {
    name: "Harkishan Singh Baniya",
    role: "Co-Founder & CEO",
    bio: "Has built open-source quantitative finance tools and consulted for high-frequency trading firms, and now leads QuantHive's strategy and product, shaping how its research reaches investors.",
    linkedin: "https://www.linkedin.com/in/harkishan/",
    photo: "/images/team/harkishan.jpg",
  },
  {
    name: "Dr. Neelesh S Upadhye",
    role: "Co-Founder & Advisor",
    bio: "Ex quant desk head at Dolat Capital, with research in mathematical modeling and computational finance, giving strategic guidance on algorithm development and validation.",
    linkedin: "https://www.linkedin.com/in/neelesh-upadhye-3b031956/",
    photo: "/images/team/neelesh.jpg",
  },
] as const;

const LOGO = "/images/figma-product";

/** Exception Raised's mark: a dark square, a tilted blue bar over two white ones. */
function ExceptionRaisedMark() {
  return (
    <svg viewBox="0 0 83 90" aria-hidden>
      <rect width="83" height="90" fill="#141414" />
      <rect x="6" y="15" width="65" height="12" rx="2.5" fill="#6bb6e0" transform="rotate(-11 38 21)" />
      <rect x="7" y="43" width="45" height="12" rx="2.5" fill="#ffffff" />
      <rect x="7" y="64" width="66" height="12" rx="2.5" fill="#ffffff" />
    </svg>
  );
}

/** IITM Incubation Cell's seal: a red ring round "IITM / Incubation / Cell",
 *  the I and C of the last two in red, set in the page's faces. */
function IncubationCellSeal() {
  return (
    <svg viewBox="0 0 126 126" aria-hidden>
      <circle cx="63" cy="63" r="61" fill="#ffffff" stroke="#e23b45" strokeWidth="2" />
      <g fontFamily="'QH Sans', 'QH UI', sans-serif" textAnchor="middle">
        <text x="63" y="48" fontSize="15" fill="#2b2b2b" letterSpacing="1">IITM</text>
        <text x="63" y="70" fontSize="13" fill="#6f6f6f" letterSpacing="0.6">
          <tspan fill="#c43a3a" fontSize="17">I</tspan>NCUBATION
        </text>
        <text x="63" y="92" fontSize="13" fill="#3b6fb6" letterSpacing="0.6">
          <tspan fill="#c43a3a" fontSize="17">C</tspan>ELL
        </text>
      </g>
    </svg>
  );
}

// Each partner's logo, drawn at a matched visual weight (--w as a share of its
// compartment's width).
// `o`: a little more opacity for a fine-lined seal, which fades out sooner.
const PARTNERS: { name: string; w: number; o?: number; logo: ReactNode }[] = [
  { name: "Citi", w: 0.26, logo: <img src={`${LOGO}/logo-citi.svg`} alt="" /> },
  { name: "Google", w: 0.456, logo: <img src={`${LOGO}/logo-google.svg`} alt="" /> },
  { name: "AWS", w: 0.24, logo: <img src={`${LOGO}/logo-aws.svg`} alt="" /> },
  { name: "Anthropic", w: 0.56, logo: <img src={`${LOGO}/logo-anthropic.svg`} alt="" /> },
  {
    name: "Exception Raised",
    w: 0.6,
    logo: (
      <span className="about-page__lockup about-page__lockup--er">
        <ExceptionRaisedMark />
        <span>Exception Raised</span>
      </span>
    ),
  },
  {
    name: "NVIDIA Inception Program",
    w: 0.5,
    logo: (
      <span className="about-page__lockup about-page__lockup--nv">
        <img src={`${LOGO}/logo-nvidia-wordmark.svg`} alt="" />
        <span>Inception Program</span>
      </span>
    ),
  },
  { name: "nasscom", w: 0.46, logo: <img src={`${LOGO}/logo-nasscom.svg`} alt="" /> },
  { name: "IIT Madras", w: 0.3, o: 0.55, logo: <img src={`${LOGO}/logo-iit-madras.svg`} alt="" /> },
  { name: "IITM Incubation Cell", w: 0.29, o: 0.55, logo: <IncubationCellSeal /> },
];
// Rows are filled out with empty compartments, so the grid's lines stay whole:
// on wider screens the heading takes the first of three columns; on phones it
// sits above two. Each layout shows only the blanks it needs (AboutPage.css).
const BLANKS_WIDE = (3 - ((PARTNERS.length + 1) % 3)) % 3;
const BLANKS_PHONE = PARTNERS.length % 2;
const BLANKS = Array.from({ length: Math.max(BLANKS_WIDE, BLANKS_PHONE) }, (_, i) =>
  [i < BLANKS_WIDE ? "wide" : "", i < BLANKS_PHONE ? "phone" : ""].filter(Boolean).join(" "),
);

/** Back to the page the reader was on before this one (App.tsx notes it as it
 *  changes page); opened directly, with nothing before it, to the landing page. */
function goBack() {
  if (document.documentElement.dataset.prevPage) window.history.back();
  else navigate("/");
}

/** The head these pages share (About, Team, Contact): the back arrow out in the
 *  margin, the title, and the small black motif at the column's right. */
export function PageHead({ id, children }: { id: string; children: ReactNode }) {
  return (
    <header className="about-page__head">
      <button type="button" className="about-page__back" onClick={goBack} aria-label="Back">
        <svg viewBox="0 0 35 35" aria-hidden>
          <path d="M29.1667 17.5H5.83333M16.0417 27.7083L5.83333 17.5L16.0417 7.29167" />
        </svg>
      </button>
      <h1 id={id} className="about-page__title">
        {children}
      </h1>
      <span className="about-page__motif" aria-hidden />
    </header>
  );
}

/** A line inviting the reader on (left) and a square black key to the page it
 *  means (right): "Careers ↗" over a dotted rule. Stacked on a phone. Closes
 *  the Team and About pages. */
export function PageInvite({ label, href, children }: { label: string; href: string; children: ReactNode }) {
  const open = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    navigate(href);
  };
  return (
    <section className="about-page__invite" aria-label={label}>
      <p className="about-page__invite-text">{children}</p>
      <a className="about-page__invite-key" href={href} onClick={open}>
        <span className="about-page__invite-label">
          {label}
          <svg viewBox="0 0 12 12" aria-hidden>
            <path d="M3 9 9 3M4 3h5v5" />
          </svg>
        </span>
      </a>
    </section>
  );
}

/** The close of a page: two rules with the small grey motif between them. */
export function PageEnd() {
  return (
    <div className="about-page__end" aria-hidden>
      <span />
      <span className="about-page__end-motif" />
      <span />
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="about-page" aria-labelledby="about-page-title">
      <article className="about-page__column">
        <PageHead id="about-page-title">
          <span className="about-page__pg">Ab</span>
          <span className="about-page__pp">o</span>
          <span className="about-page__bg">u</span>
          <span className="about-page__pg">t</span>
        </PageHead>

        <section className="about-page__copy" aria-labelledby="about-mission-title">
          <h2 id="about-mission-title" className="about-page__section-title">
            Our Mission &amp; Vision
          </h2>
          <p>
            At QuantHive, we&apos;re on a mission to democratize access to sophisticated investment strategies through
            explainable AI and mathematical modeling. We believe that financial intelligence should be accessible to
            everyone, not just institutional investors.
          </p>
          <p>
            Our vision is to create a world where individuals can make informed investment decisions based on
            transparent, data-driven insights, leveling the playing field in the financial markets.
          </p>
        </section>

        <hr className="about-page__rule" />

        <section className="about-page__leaders" aria-labelledby="about-leaders-title">
          <h2 id="about-leaders-title" className="about-page__section-title">
            Leadership Team
          </h2>
          <ul className="about-page__leader-list">
            {LEADERS.map((leader, index) => (
              <li key={leader.name} className="about-page__leader">
                <EngravedPortrait src={leader.photo} seed={index + 3} strength={0.7} alt={`Portrait of ${leader.name}`} />
                <div className="about-page__leader-text">
                  <p className="about-page__leader-name">{leader.name}</p>
                  <p className="about-page__leader-role">{leader.role}</p>
                  <p className="about-page__leader-bio">{leader.bio}</p>
                  <a className="about-page__linkedin" href={leader.linkedin} target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 16 16" aria-hidden>
                      <path d="M3.6 5.9h2.2V13H3.6zM4.7 2.6a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6zM7.2 5.9h2.1v1h.03c.3-.55 1-1.15 2.1-1.15 2.2 0 2.6 1.45 2.6 3.35V13h-2.2V9.5c0-.83-.02-1.9-1.16-1.9-1.16 0-1.34.9-1.34 1.84V13H7.2z" />
                    </svg>
                    LinkedIn
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <hr className="about-page__rule" />

        <section className="about-page__partners" aria-labelledby="about-partners-title">
          <h2 id="about-partners-title" className="about-page__partners-title">
            {/* One box, so the letters share a baseline instead of each being centred by its face's height. */}
            <span>
              <span className="about-page__pp">Pa</span>
              <span className="about-page__bg">r</span>
              <span className="about-page__pg">t</span>
              <span className="about-page__bg">n</span>
              <span className="about-page__pp">e</span>
              <span className="about-page__bg">r</span>
              <span className="about-page__pp">s</span>
            </span>
          </h2>
          <ul className="about-page__logos">
            {PARTNERS.map((partner) => (
              <li key={partner.name} className="about-page__logo" style={{ "--w": partner.w, "--o": partner.o } as CSSProperties} title={partner.name}>
                <span className="about-page__logo-art" role="img" aria-label={partner.name}>
                  {partner.logo}
                </span>
              </li>
            ))}
            {BLANKS.map((shows, index) => (
              <li key={`blank-${index}`} className="about-page__logo about-page__logo--empty" data-shows={shows} aria-hidden />
            ))}
          </ul>
        </section>

        <hr className="about-page__rule about-page__rule--close" />

        <PageInvite label="Contact" href="/contact">
          Looking to partner with us? Reach out with your details and we'll get back to you to explore how we can
          work together.
        </PageInvite>

        <PageEnd />
      </article>
    </main>
  );
}
