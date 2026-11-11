import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import "./Capabilities.css";

/* Figma "QuantHive Websites", node 4020:234 supplies the first three cards' artwork.
   The layout — heading left with its copy on the right, four cards edge to edge,
   title and copy top-left, the subject sitting straight on a quiet card ground —
   follows the reference rather than the Figma arrangement.

   Each subject is lifted out of its Figma panel so it can sit on the card without
   the panel's colour behind it:
     · cards one and three are reassembled from their own layers' exports, placed at
       the coordinates those layers have inside the 2400 x 1619 panel;
     · card two's photo globe is the render of its group (4020:535) alone — thirty-odd
       masked tiles that only Figma can composite faithfully.
   The fourth card has no Figma source, so its artwork is markup (CitedAnswerArt). */
const ART = "/images/figma-capabilities";

// One layer of a reassembled scene: [src, x, y, w, h] in panel pixels, plus an
// optional fill for the pill backgrounds, which are plain rounded rectangles.
type Layer = { src?: string; fill?: string; box: readonly [number, number, number, number]; className?: string };

type Scene = {
  // The region of the panel the scene shows, in panel pixels.
  view: readonly [number, number, number, number];
  layers: readonly Layer[];
};

// Card one — Group 1910 (the workflow) and Group 1911 (the answer), with the two
// connector dots between them. As in Figma, the view ends at the panel's foot (1619),
// which is the card's foot here, so the answer card is cut off there, with Rectangle
// 1185's soft white fade over its last lines.
const WORKFLOW: Scene = {
  view: [450, 237, 1500, 1382],
  layers: [
    { src: `${ART}/c1-panel.svg`, box: [775, 237, 850, 785] },
    { src: `${ART}/c1-row1bg.svg`, box: [825, 374, 750, 130] },
    { src: `${ART}/c1-row1iconbg.svg`, box: [1457, 389, 100, 100] },
    { src: `${ART}/c1-row1icon.svg`, box: [1479.75, 408.83, 54.5, 60.33] },
    { src: `${ART}/c1-row1num.svg`, box: [865.26, 428.51, 35.8, 29.97] },
    { src: `${ART}/c1-row1label.svg`, box: [951.2, 428.91, 211.64, 29.58] },
    { src: `${ART}/c1-row2.svg`, box: [825, 529, 750, 130] },
    { src: `${ART}/c1-row3.svg`, box: [825, 684, 750, 130] },
    { src: `${ART}/c1-row4.svg`, box: [825, 839, 750, 130] },
    // Dashed connector between the two dots (not in Figma, which shows the dots alone).
    { box: [1197, 1036, 5, 142], className: "scene__dash" },
    { src: `${ART}/c1-dot.svg`, box: [1187, 1009, 25, 25] },
    { src: `${ART}/c1-dot.svg`, box: [1187, 1180, 25, 25] },
    // Rectangle 1176: the translucent outer frame the answer card sits in.
    { src: `${ART}/c1-sum-outer.svg`, box: [450, 1193, 1500, 609] },
    { src: `${ART}/c1-sum-inner.svg`, box: [465, 1209, 1470, 597] },
    { src: `${ART}/c1-sum-icon.svg`, box: [511, 1254, 110, 110] },
    { src: `${ART}/c1-sum-text.svg`, box: [511.12, 1415.74, 1302.68, 163.47] },
    { src: `${ART}/c1-sum-fade.svg`, box: [466, 1441, 1470, 178] },
  ],
};

// Card three — the three arcs (4020:651–653), the Flash mark and the four source
// chips. The arcs run off the card's foot, which crops them as the panel did.
const MONITORING: Scene = {
  // Trimmed to the chips' own extent (136–2292) so the scene fills the card's width.
  view: [120, 640, 2180, 979],
  layers: [
    { src: `${ART}/c3-arc1.svg`, box: [56.89, 718.86, 2286.34, 2286.34] },
    { src: `${ART}/c3-arc2.svg`, box: [247.42, 939.87, 1905.28, 1905.28] },
    { src: `${ART}/c3-arc3.svg`, box: [437.95, 1160.88, 1524.23, 1524.23] },
    { src: `${ART}/c3-logo.svg`, box: [1097.17, 1336.17, 204.73, 176.64] },
    { fill: "rgba(63, 51, 0, 0.25)", box: [406.03, 697.02, 571.55, 154.94] },
    { src: `${ART}/c3-bloomberg.png`, box: [478.33, 734.89, 425.45, 86.38] },
    { fill: "rgba(14, 14, 14, 0.25)", box: [1418.03, 872.02, 559, 132.03] },
    { src: `${ART}/c3-quartr-word.png`, box: [1550.17, 910.93, 374.2, 54.63] },
    // The Quartr mark is the left end of a wider sprite (Figma crops it at 359.81%).
    { src: `${ART}/c3-quartr-icon.png`, box: [1470.37, 910.75, 54.81, 52.51], className: "scene__sprite" },
    { fill: "rgba(221, 207, 255, 0.35)", box: [136.03, 1240.91, 421.63, 117.66] },
    { src: `${ART}/c3-preqin.svg`, box: [211.2, 1273.59, 271.28, 55.56] },
    { fill: "rgba(210, 232, 255, 0.35)", box: [1804.03, 1175.02, 488, 132.29] },
    { src: `${ART}/c3-pitchbook.png`, box: [1845.19, 1180.89, 406.91, 120.17] },
  ],
};

type Card = {
  title: string;
  body: string;
  // The card's ground: a muted tone, its lighter key and its deeper foot.
  tone: readonly [string, string, string];
  art:
    | { kind: "scene"; scene: Scene; bleed?: "bottom" | "sides-bottom"; label: string }
    | { kind: "image"; src: string; ratio: number; label: string; loader?: Loader }
    | { kind: "cited" };
};

const CARDS: readonly Card[] = [
  {
    title: "Co-Analyst Workflow",
    body: "Automated multi-step workflows that pull market data, filings and transcripts into one sourced answer.",
    tone: ["#8d9fb2", "#6c7f93", "#4f6074"],
    art: {
      kind: "scene",
      scene: WORKFLOW,
      bleed: "bottom",
            label: "An automated multi-step workflow pulling market data, filings, transcripts and other primary sources into a written summary of Apple's latest quarter.",
    },
  },
  {
    title: "Fast Investment Research",
    body: "Days of research in minutes. Flash reads across markets, industries and primary sources for you.",
    tone: ["#95a091", "#76826f", "#59654f"],
    art: {
      kind: "image",
      // ?v=2: the render with its static loader painted out; the version stops a
      // cached copy of the old one (dots baked in) from showing under the live one.
      src: `${ART}/c2-globe.webp?v=2`,
      ratio: 1290 / 1067,
      // The search bar's loader, painted out of the render and run live instead.
      // Measured off the 1290 x 1067 image: eight 12px dots on a 34.2px ring.
      loader: { x: 1159.1 / 1290, y: 533.5 / 1067, ring: 68.4 / 1290, dot: 12 / 68.4 },
      label: "A globe of photographs — markets, industry, energy, trade — behind a search bar reading “Researching”.",
    },
  },
  {
    title: "Proactive Monitoring 24x7",
    body: "Flash keeps watch around the clock across Bloomberg, Quartr, PitchBook, Preqin and more.",
    tone: ["#c2b99f", "#a39b80", "#857d63"],
    art: {
      kind: "scene",
      scene: MONITORING,
      bleed: "sides-bottom",
      label: "The Flash mark at the centre of concentric arcs, with Bloomberg, Quartr, PitchBook and Preqin sources around it.",
    },
  },
  {
    title: "Cited, Verifiable Answers",
    body: "Every number links back to the filing, call or dataset it came from, so you can check the work in one click.",
    // Near-black, so the row ends on a dark card.
    tone: ["#3a3a3a", "#232323", "#141414"],
    art: { kind: "cited" },
  },
];

const pct = (value: number, of: number) => `${(value / of) * 100}%`;

// Where a live loader sits on an image, as shares of the image's width/height:
// centre (x, y), ring diameter (of the width), dot diameter (of the ring).
export type Loader = { x: number; y: number; ring: number; dot: number };

const LOADER_DOTS = 8;

/**
 * The search bar's spinner. The ring turns one dot-step per beat while a new dot
 * fades in each beat, so every new dot appears where the one before it just was;
 * the trail then fades out in the same order and the cycle repeats. Timings and
 * the step angle are set in Capabilities.css and must stay in step.
 */
export function LiveLoader({ loader }: { loader: Loader }) {
  return (
    <span
      className="loader"
      style={
        {
          left: `${loader.x * 100}%`,
          top: `${loader.y * 100}%`,
          width: `${loader.ring * 100}%`,
          "--dot": `${loader.dot * 100}%`,
          "--dot-share": loader.dot,
        } as CSSProperties
      }
      aria-hidden
    >
      <span className="loader__ring">
        {Array.from({ length: LOADER_DOTS }, (_, i) => (
          <span key={i} className="loader__dot" style={{ "--i": i } as CSSProperties} />
        ))}
      </span>
    </span>
  );
}

function SceneArt({ scene, label }: { scene: Scene; label: string }) {
  const [vx, vy, vw, vh] = scene.view;
  return (
    <div className="scene" role="img" aria-label={label}       style={{ "--ratio": vw / vh } as CSSProperties}>
      {scene.layers.map(({ src, fill, box: [x, y, w, h], className }, index) => {
        const style: CSSProperties = {
          left: pct(x - vx, vw),
          top: pct(y - vy, vh),
          width: pct(w, vw),
          height: pct(h, vh),
          background: fill,
        };
        return src ? (
          <span key={index} className={`scene__layer ${className ?? ""}`} style={style}>
            <img src={src} alt="" loading="lazy" decoding="async" />
          </span>
        ) : (
          <span key={index} className={`scene__layer ${className ?? "scene__pill"}`} style={style} />
        );
      })}
    </div>
  );
}

/** Card four's panel: an answer with inline citations and the sources they open. */
function CitedAnswerArt() {
  return (
    <div className="cited" role="img" aria-label="An answer about ICICI Bank's margin with numbered citations to its investor presentation and earnings call.">
      <div className="cited__panel">
        <p className="cited__question">What drove ICICI Bank&apos;s margin expansion?</p>
        <p className="cited__answer">
          Net interest margin rose to <mark>4.27%</mark>
          <sup>1</sup> as deposit costs eased and the loan book shifted toward
          higher-yield retail credit<sup>2</sup>.
        </p>
      </div>
      <ol className="cited__sources">
        <li>
          <b>1</b>
          <span>Q2 FY26 Investor Presentation</span>
          <i>p.14</i>
        </li>
        <li>
          <b>2</b>
          <span>Q2 FY26 Earnings Call</span>
          <i>18:42</i>
        </li>
      </ol>
    </div>
  );
}

type Face = "initial" | "sans4" | "sans3" | "mark" | "sans";

/** A run of the section title set in one face, with the frame's per-run tracking. */
function F({
  f,
  track,
  large,
  children,
}: {
  f: Face;
  track?: "open" | "tight";
  large?: boolean;
  children: string;
}) {
  return (
    <span className={`cap-face cap-face--${f}`} data-track={track} data-large={large || undefined}>
      {children}
    </span>
  );
}

export default function Capabilities() {
  const trackRef = useRef<HTMLDivElement>(null);
  // The heading and the cards come in when the section scrolls into view, and go
  // back out — in reverse order — only when the reader scrolls back UP to the hero,
  // i.e. when the section leaves through the bottom of the viewport. Leaving through
  // the top (on to the next section) keeps it revealed, so coming back down to it
  // from below neither replays nor reverses anything.
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) setRevealed(true);
        else if (entry.boundingClientRect.top > 0) setRevealed(false);
      },
      { threshold: 0.18 },
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  const [active, setActive] = useState(0);
  // False when every card already fits — the reference's desktop state — and the
  // dots and arrows would have nothing to do.
  const [scrollable, setScrollable] = useState(false);

  const scrollToCard = useCallback((index: number) => {
    const track = trackRef.current;
    const card = track?.children[index] as HTMLElement | undefined;
    if (!track || !card) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Scrolled so this card starts where the first one does (the track's gutter).
    const first = track.children[0] as HTMLElement;
    track.scrollTo({ left: card.offsetLeft - first.offsetLeft, behavior: reduce ? "auto" : "smooth" });
  }, []);

  // Cards snap to the leading edge, so the active one is whichever starts nearest it.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrollable(track.scrollWidth > track.clientWidth + 1);
      // Each card's distance from the leading edge, in layout terms only (no
      // style read): the first card marks where the edge is.
      const first = (track.children[0] as HTMLElement | undefined)?.offsetLeft ?? 0;
      let nearest = 0;
      let best = Infinity;
      Array.from(track.children).forEach((child, index) => {
        const distance = Math.abs((child as HTMLElement).offsetLeft - first - track.scrollLeft);
        if (distance < best) {
          best = distance;
          nearest = index;
        }
      });
      // At the end of the track the last cards can't reach the leading edge.
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) nearest = CARDS.length - 1;
      setActive(nearest);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(track);
    track.addEventListener("scroll", schedule, { passive: true }); // the observer's first call measures it
    return () => {
      resize.disconnect();
      track.removeEventListener("scroll", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  const go = (index: number) => scrollToCard(Math.max(0, Math.min(CARDS.length - 1, index)));

  return (
    <section
      ref={sectionRef}
      className="capabilities"
      data-revealed={revealed || undefined}
      aria-roledescription="carousel"
      aria-labelledby="capabilities-title"
    >
      <header className="capabilities__header">
        {/* Frame 4038:1558: the first line sets almost every letter in its own face,
            the second is Nata Sans Light. Runs below follow the frame's spans. */}
        <h2 id="capabilities-title">
          <span className="capabilities__title-line">
            <F f="initial">E</F>
            <F f="sans4">ve</F>
            <F f="sans3">r</F>
            <F f="sans4" track="open">y</F>
            <F f="sans3" track="open" large>t</F>
            <F f="mark">h</F>
            <F f="sans">i</F>
            <F f="sans3">n</F>
            <F f="sans">g </F>
            <F f="sans4">y</F>
            <F f="sans4" track="tight">o</F>
            <F f="mark">u</F>
            <F f="sans3">r r</F>
            <F f="sans">esearch</F>{" "}
            <F f="sans3">need</F>
            <F f="sans4">s</F>
            <F f="sans3">,</F>
          </span>{" "}
          <span className="capabilities__title-line capabilities__title-line--light">in one place</span>
        </h2>
        <p>
          Accelerate your investment research with intelligent tools that analyze financial
          data, connect market insights, and transform hours of complex analysis into
          actionable intelligence in moments.
        </p>
      </header>

      <div className="capabilities__track" ref={trackRef}>
        {CARDS.map((card, index) => (
          <article
            className="capabilities__card"
            key={card.title}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${CARDS.length}`}
            style={
              {
                "--tone-key": card.tone[0],
                "--tone": card.tone[1],
                "--tone-deep": card.tone[2],
              } as CSSProperties
            }
          >
            <h3 className="capabilities__title">{card.title}</h3>
            <p className="capabilities__body">{card.body}</p>
            {card.art.kind === "scene" ? (
              <div className="capabilities__art" data-bleed={card.art.bleed}>
                <SceneArt scene={card.art.scene} label={card.art.label} />
              </div>
            ) : card.art.kind === "image" ? (
              <div className="capabilities__art">
                <div className="capabilities__image" style={{ "--ratio": card.art.ratio } as CSSProperties}>
                  <img src={card.art.src} alt={card.art.label} loading="lazy" decoding="async" />
                  {card.art.loader && <LiveLoader loader={card.art.loader} />}
                </div>
              </div>
            ) : (
              <div className="capabilities__art">
                <CitedAnswerArt />
              </div>
            )}
          </article>
        ))}
      </div>

      {scrollable && (
        <div className="capabilities__controls">
          <div className="capabilities__dots" role="group" aria-label="Choose card">
            {CARDS.map((card, index) => (
              <button
                key={card.title}
                type="button"
                aria-label={`Show ${card.title}`}
                aria-current={index === active || undefined}
                onClick={() => go(index)}
              />
            ))}
          </div>
          <div className="capabilities__arrows">
            <button type="button" aria-label="Previous card" disabled={active === 0} onClick={() => go(active - 1)}>
              <svg viewBox="0 0 16 16" aria-hidden>
                <path d="M10 3.5 5.5 8l4.5 4.5" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next card"
              disabled={active === CARDS.length - 1}
              onClick={() => go(active + 1)}
            >
              <svg viewBox="0 0 16 16" aria-hidden>
                <path d="M6 3.5 10.5 8 6 12.5" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
