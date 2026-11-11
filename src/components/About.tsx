import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import Seeker, { type SeekerHandle } from "./Seeker";
import BrandLogo from "./BrandLogo";
import GlassMenu from "./GlassMenu";
import Showcase from "./Showcase";
import VideoDownload from "./VideoDownload";
import VideoPromptGlass, { type VideoControl } from "./VideoPromptGlass";
import "./About.css";

// The third section (frames 4040:3614, 2:28): the heading top-left, then a ruled
// grid of square cells. A video panel (10×7; 7×5 on tablets, 8×13 on phones), the
// framed QuantHive wordmark beside it, a Blog tile (3×2) and a
// 3×1 call to action sit on it, so every edge lands on a grid line.
//
// Set VIDEO_SRC (and optionally VIDEO_POSTER) to fill the panel; until then it is
// an empty dark frame.
const VIDEO_SRC: string | undefined = undefined;
const VIDEO_POSTER: string | undefined = undefined;

type Face = "initial" | "sans4" | "sans3" | "sans2" | "sans" | "mark";

/** A run of the heading set in one face; `soft` is the frame's lighter -0.48px
 *  tracking, `open` and `large` as in the section above (Capabilities.css). */
function F({ f, soft, open, large, children }: { f: Face; soft?: boolean; open?: boolean; large?: boolean; children: string }) {
  return (
    <span
      className={`cap-face cap-face--${f}`}
      data-track={soft ? "soft" : open ? "open" : undefined}
      data-large={large || undefined}
    >
      {children}
    </span>
  );
}

export default function About() {
  // Same reveal rule as the card section above: in on the way down, back out only
  // when the reader scrolls back up past it, never when moving on below.
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  // The wordmark draws itself on the first time the section comes in, and stays
  // drawn after that (About.css).
  const [drawn, setDrawn] = useState(false);
  // The video panel's dial and the shot drive each other: playback moves the
  // needle, and dragging or stepping the needle scrubs the shot.
  const videoRef = useRef<VideoControl>(null);
  const seekerRef = useRef<SeekerHandle>(null);
  // The shot full screen, live, on a 9:16 stage (Showcase). Full screen is asked
  // for in the click itself — browsers only grant it to a gesture.
  const [showcase, setShowcase] = useState(false);
  const openShowcase = () => {
    setShowcase(true);
    void document.documentElement.requestFullscreen?.().catch(() => {});
  };
  // Compare: Claude answering alongside Flash. On a phone it plays full screen,
  // the two windows stacked, and ends when full screen does.
  const [compare, setCompare] = useState(false);
  const [phoneCompare, setPhoneCompare] = useState(false);
  const toggleCompare = () => {
    if (window.matchMedia("(max-width: 640px)").matches) {
      setCompare(true);
      setPhoneCompare(true);
      openShowcase();
    } else {
      setCompare((on) => !on);
    }
  };
  const closeShowcase = useCallback(() => {
    setShowcase(false);
    setPhoneCompare((wasPhone) => {
      if (wasPhone) setCompare(false);
      return false;
    });
  }, []);
  // The seek bar is off until asked for (the menu's dial key).
  const [seekerOn, setSeekerOn] = useState(false);
  // A download being rendered, shown round the menu key while the menu is shut.
  const [rendering, setRendering] = useState<number | null>(null);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setRevealed(true);
          setDrawn(true);
        }
        else if (entry.boundingClientRect.top > 0) setRevealed(false);
      },
      { threshold: 0.18 },
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="about"
      data-revealed={revealed || undefined}
      data-drawn={drawn || undefined}
      aria-labelledby="about-title"
    >
      <header className="about__header">
        {/* Runs follow the frame's spans letter for letter. */}
        <h2 id="about-title">
          {/* Set as the section above's heading is: Host Grotesk and Bricolage,
              a Ghost capital, the odd Schibsted or Power Grotesk letter. */}
          <span className="about__title-line">
            <F f="initial">R</F>
            <F f="sans4">e</F>
            <F f="sans3">d</F>
            <F f="sans4">e</F>
            <F f="mark">f</F>
            <F f="sans">ining </F>
            <F f="sans3">The </F>
            <F f="sans4">F</F>
            <F f="sans">uture </F>
            <F f="sans3">O</F>
            <F f="mark">f </F>
            <F f="sans4">I</F>
            <F f="sans">nvestment </F>
            <F f="sans3">A</F>
            <F f="sans">n</F>
            <F f="sans4">a</F>
            <F f="sans">l</F>
            <F f="sans4" open>y</F>
            <F f="sans3" large>t</F>
            <F f="sans">i</F>
            <F f="sans3">c</F>
            <F f="sans4">s</F>
            <F f="sans3">,</F>
          </span>{" "}
          <span className="about__title-line about__title-line--light">
            who we are <span className="about__amp">&amp;</span> what we’re solving
          </span>
        </h2>
      </header>

      <div className="about__field">
        <div className="about__grid">
          <div className="about__video">
            {VIDEO_SRC && (
              <video src={VIDEO_SRC} poster={VIDEO_POSTER} controls playsInline preload="metadata" />
            )}
            {/* The shot (frames 4048:3660 → 123:238): a question typed into
                Flash and its answer streaming in, on a loop. */}
            <VideoPromptGlass
              controlRef={videoRef}
              seekerShown={seekerOn}
              compare={compare && !phoneCompare}
              onProgress={(progress) => seekerRef.current?.show(progress)}
            />
            {/* One "⋯" key opening into a column of liquid-glass keys. */}
            <GlassMenu busy={rendering}>
              {/* The whole shot as a .mov, rendered when asked for. */}
              <VideoDownload onProgress={setRendering} />
              {/* The shot live, full screen — for showing the demo on a big screen. */}
              <button
                type="button"
                className="video-tool video-fullscreen"
                onClick={openShowcase}
                aria-label="Play the demo full screen"
                title="Full screen"
              >
                <svg viewBox="0 0 16 16" aria-hidden>
                  <path d="M2.5 6V2.5H6M13.5 6V2.5H10M2.5 10v3.5H6M13.5 10v3.5H10" />
                </svg>
              </button>
              {/* Shows or hides the seek bar along the panel's foot. */}
              <button
                type="button"
                className="video-tool video-seeker-toggle"
                onClick={() => setSeekerOn((on) => !on)}
                aria-pressed={seekerOn}
                aria-label={seekerOn ? "Hide the seek bar" : "Show the seek bar"}
                title={seekerOn ? "Hide seek bar" : "Show seek bar"}
              >
                <svg viewBox="0 0 16 16" aria-hidden>
                  <path d="M2 13v-2M4.4 13v-3.5M6.8 13v-2M11.6 13v-2M14 13v-3.5" />
                  <path d="M9.2 13V3" strokeWidth="1.8" />
                  <path d="M8.2 3h2" strokeWidth="1.8" />
                </svg>
              </button>
              {/* Compare: Claude answers the same question alongside. */}
              <button
                type="button"
                className="video-tool video-compare-toggle"
                onClick={toggleCompare}
                aria-pressed={compare}
                aria-label={compare ? "Stop comparing with Claude" : "Compare with Claude"}
                title={compare ? "Stop comparing" : "Compare with Claude"}
              >
                <svg viewBox="0 0 16 16" aria-hidden>
                  <rect x="1.75" y="3" width="5.5" height="10" rx="1.2" />
                  <rect x="8.75" y="3" width="5.5" height="10" rx="1.2" />
                </svg>
              </button>
            </GlassMenu>
            {/* Its seek bar. */}
            <Seeker
              label="Video position"
              hidden={!seekerOn}
              controlRef={seekerRef}
              onSeek={(progress) => videoRef.current?.seek(progress)}
              onScrubStart={() => videoRef.current?.scrub(true)}
              onScrubEnd={() => videoRef.current?.scrub(false)}
            />
          </div>

          {/* The wordmark in a selection frame (frame 2:28): a hairline box on the
              grid lines, square handles at its corners and top and bottom middles. */}
          <div className="about__brand" role="img" aria-label="QuantHive">
            <span className="about__brand-frame" aria-hidden>
              {["tl", "tc", "tr", "bl", "bc", "br"].map((at) => (
                <i key={at} className={`about__brand-handle about__brand-handle--${at}`} />
              ))}
            </span>
            <BrandLogo className="about__brand-logo" />
          </div>

          {/* The blog, 3×2: its name and an arrow; opens /blog (App.tsx takes the
              link and changes page in place). */}
          <a className="about__blog" href="/blog">
            <span className="about__blog-label">Blog</span>
            <span className="about__blog-key" aria-hidden>
              <svg viewBox="0 0 16 16">
                <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
              </svg>
            </span>
          </a>

          <a className="about__cta" href="/contact">
            <span className="about__cta-label">Get in touch</span>
            <span className="about__cta-key" aria-hidden>
              <svg viewBox="0 0 16 16">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </span>
          </a>
        </div>
      </div>
      {showcase && createPortal(<Showcase onClose={closeShowcase} compare={compare} />, document.body)}
    </section>
  );
}
