import { useEffect, useMemo, useRef, useState } from "react";
import { searchCompanies, type Company } from "../lib/companySearch";
import { isGlassTheme } from "../lib/theme";
import "./WatchlistPage.css";

// Real brand logo with a graceful fallback: renders the company's verified logo
// URL when one exists, and drops to the coloured monogram SVG tile otherwise (or
// if the image fails to load). Mounted fresh per company (button key includes the
// ticker), so the failed state always starts clean.
function CompanyLogo({ company }: { company: Company }) {
  const [failed, setFailed] = useState(false);

  if (!company.logo || failed) {
    return (
      <svg className="wl-row__logo" viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="6" fill={company.color} />
        <text
          x="16"
          y="21"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="'QH UI', Arial, sans-serif"
          fontSize="13"
          fontWeight="600"
        >
          {company.mark}
        </text>
      </svg>
    );
  }
  return (
    <img
      className="wl-row__logo"
      src={company.logo}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

const EyeIcon = () => (
  <svg viewBox="0 0 12 12" aria-hidden>
    <path
      d="M0.9 6C2.4 3.6 4.1 2.5 6 2.5S9.6 3.6 11.1 6C9.6 8.4 7.9 9.5 6 9.5S2.4 8.4 0.9 6Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.65"
    />
    <circle cx="6" cy="6" r="1.5" fill="currentColor" />
  </svg>
);

const BinIcon = () => (
  <svg viewBox="0 0 12 12" aria-hidden fill="none" stroke="currentColor" strokeWidth="0.65">
    <path d="M2.2 3.4h7.6" strokeLinecap="round" />
    <path d="M4.6 3.4V2.5a0.7 0.7 0 0 1 0.7-0.7h1.4a0.7 0.7 0 0 1 0.7 0.7v0.9" />
    <path d="M3.3 3.4l0.45 5.9a1 1 0 0 0 1 0.92h2.5a1 1 0 0 0 1-0.92l0.45-5.9" />
    <path d="M5.2 5.5v2.6M6.8 5.5v2.6" strokeLinecap="round" />
  </svg>
);

function FilterChip({ count }: { count: number }) {
  return (
    <button type="button" className="wl-filter">
      <span className="wl-filter__label">Filter</span>
      <span className="wl-filter__badge">{count}</span>
      <svg width="6" height="4" viewBox="0 0 6 4" aria-hidden>
        <path d="M0.5 0.5 3 3 5.5 0.5" fill="none" stroke="currentColor" strokeWidth="0.7" />
      </svg>
    </button>
  );
}

// Placeholder bars shown ONLY while nothing is followed — they are loading-state
// scaffolding, not slots, so the first real company clears all of them.
// Followed rows are appended, never prepended, so no existing row moves when one
// arrives; and the card is min-height bound (300px against ~176px of content at
// its fullest), so it never changes height either. The entrance animation is the
// only thing on screen that moves.
const SKELETON_ROWS = 5;

export default function WatchlistPage() {
  const [query, setQuery] = useState("");
  // Debounce the raw input so the (fuzzy) search only runs after the user pauses.
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 140);
    return () => clearTimeout(t);
  }, [query]);

  // Subtle cursor-reactive tilt + translate on the Followed Companies card.
  // Glass themes only — see isGlassTheme.
  const cardRef = useRef<HTMLDivElement>(null);
  const tiltRaf = useRef(0);
  const onCardMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el || !isGlassTheme()) return;
    const r = el.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1; // -1..1
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1; // -1..1
    if (!tiltRaf.current) {
      tiltRaf.current = requestAnimationFrame(() => {
        tiltRaf.current = 0;
        el.style.transform =
          `perspective(700px) rotateX(${(-ny * 2.6).toFixed(2)}deg) ` +
          `rotateY(${(nx * 2.6).toFixed(2)}deg) ` +
          `translate3d(${(nx * 3).toFixed(2)}px, ${(ny * 3 - 2).toFixed(2)}px, 0)`;
      });
    }
  };
  const resetCardTilt = () => {
    if (tiltRaf.current) {
      cancelAnimationFrame(tiltRaf.current);
      tiltRaf.current = 0;
    }
    if (cardRef.current) cardRef.current.style.transform = "";
  };

  const results = useMemo(() => searchCompanies(debounced), [debounced]);

  // Companies picked from the search results, in the order they were followed.
  const [followed, setFollowed] = useState<Company[]>([]);
  // Clicking a company that is ALREADY followed would otherwise do nothing at
  // all (it reads as a dead click), so its existing row pulses instead.
  const [bumped, setBumped] = useState("");
  const bumpTimer = useRef(0);
  useEffect(() => () => clearTimeout(bumpTimer.current), []);
  // Rows that have been deleted and are mid-collapse — still mounted, still in
  // `followed`, on their way out. Declared here because `follow` reads it too.
  const [leaving, setLeaving] = useState<string[]>([]);

  const follow = (c: Company) => {
    // Mid-delete: let the collapse finish rather than bumping a row that is on
    // its way out (the bump would override the collapse animation).
    if (leaving.includes(c.ticker)) return;
    if (followed.some((f) => f.ticker === c.ticker)) {
      clearTimeout(bumpTimer.current);
      // Drop the class for one frame first, so a repeat click on the SAME ticker
      // restarts the animation instead of being a no-op re-render.
      setBumped("");
      requestAnimationFrame(() => setBumped(c.ticker));
      bumpTimer.current = window.setTimeout(() => setBumped(""), 800);
      return;
    }
    setFollowed((prev) => [...prev, c]);
  };

  // The View/Delete pair opens on CLICK, and merges back into the card 0.4s after the
  // cursor leaves the row. The grace period is not decoration: the buttons sit
  // outside the card, so the cursor has to cross a gap to reach them, and it also
  // covers clipping an edge on the way over.
  const HIDE_DELAY_MS = 400;
  const [revealed, setRevealed] = useState("");
  const hideTimer = useRef(0);
  useEffect(() => () => clearTimeout(hideTimer.current), []);

  // The merge sequence: the card's right edge lights up as the pair travels back in,
  // peaks where they touch it, and the light blob then breaks off that hot spot and
  // drifts into the card. ONE class drives all of it — CSS owns the phase timing (see
  // wl-edge-glow / wl-merge-spark), because sequencing three animations off separate
  // JS timers is exactly what made the old version stutter. This only has to outlast
  // the longest of them.
  const MERGE_MS = 980;
  const [merging, setMerging] = useState("");
  // Where on the card's edge they land, in px from its top. Derived from the fixed row
  // geometry rather than measured: 18px of card padding, then 20px rows on a 10px gap
  // (.wl-followed__card / .wl-follow in this file's CSS).
  const [mergeY, setMergeY] = useState(0);
  const mergeTimer = useRef(0);
  useEffect(() => () => clearTimeout(mergeTimer.current), []);

  const flashMerge = (ticker: string) => {
    const i = followed.findIndex((f) => f.ticker === ticker);
    if (i < 0) return;
    clearTimeout(mergeTimer.current);
    setMergeY(28 + i * 30);
    // Dropped for one frame so closing the same row twice replays the animation
    // instead of being a no-op re-render.
    setMerging("");
    requestAnimationFrame(() => setMerging(ticker));
    mergeTimer.current = window.setTimeout(() => setMerging(""), MERGE_MS);
  };

  const showActions = (ticker: string) => {
    clearTimeout(hideTimer.current);
    clearTimeout(mergeTimer.current);
    setMerging("");
    setRevealed(ticker);
  };
  // `flash` is off for the one close that isn't a merge: deleting the row, where the
  // card the light would splash against is collapsing out from under it.
  const hideNow = (flash = true) => {
    clearTimeout(hideTimer.current);
    if (flash && revealed) flashMerge(revealed);
    setRevealed("");
  };
  const scheduleHide = () => {
    clearTimeout(hideTimer.current);
    // Captured now, not read at fire time: this is the row that was open when the
    // cursor left, and any click in the meantime cancels the timer anyway.
    const closing = revealed;
    hideTimer.current = window.setTimeout(() => {
      setRevealed("");
      if (closing) flashMerge(closing);
    }, HIDE_DELAY_MS);
  };
  // Coming back to the open row cancels its pending close. Arriving at a DIFFERENT row
  // starts the same delayed close rather than an instant one — leaving the buttons is
  // almost always a move back across the card, so the cursor lands on a neighbouring
  // row within a frame or two, and closing on that made the delay look like it wasn't
  // there at all.
  const onRowEnter = (ticker: string) => {
    if (revealed === ticker) clearTimeout(hideTimer.current);
    else if (revealed) scheduleHide();
  };

  // The placeholders clear the moment the first company lands — they fade out
  // under the arriving row rather than blinking off, so they stay mounted for the
  // length of that fade. Emptying the list brings them back.
  const anyFollowed = followed.length > 0;
  const [skeletons, setSkeletons] = useState(true);
  useEffect(() => {
    if (!anyFollowed) {
      setSkeletons(true);
      return;
    }
    const t = setTimeout(() => setSkeletons(false), 220);
    return () => clearTimeout(t);
  }, [anyFollowed]);

  // Deleting keeps the row mounted for the length of its collapse animation, so
  // the rows below slide up rather than jumping. `leaving` is a list, not a single
  // ticker, so two deletes inside that window can't clear each other's state.
  const unfollow = (ticker: string) => {
    if (leaving.includes(ticker)) return;
    setLeaving((prev) => [...prev, ticker]);
    hideNow(false);
    // Fire-and-forget: a late timer only ever calls setState on an unmounted
    // component, which React treats as a no-op.
    setTimeout(() => {
      setFollowed((prev) => prev.filter((f) => f.ticker !== ticker));
      setLeaving((prev) => prev.filter((t) => t !== ticker));
    }, 240);
  };

  return (
    <section className="wpage">
      <div className="wpage__tabs">
        <button type="button" className="wpage__tab wpage__tab--active">
          Chat
        </button>
        <button type="button" className="wpage__tab">
          History
        </button>
      </div>

      <div className="wpage__body">
        {/* Search Companies */}
        <section className="wl-search">
          <header className="wl-head">
            <h3 className="wl-heading">Search Companies</h3>
            <FilterChip count={2} />
          </header>

          <div className="wl-searchbox">
            <svg
              className="wl-searchbox__icon"
              width="8"
              height="8"
              viewBox="0 0 8 8"
              aria-hidden
            >
              <circle cx="3.4" cy="3.4" r="2.6" fill="none" stroke="currentColor" strokeWidth="0.9" />
              <line x1="5.3" y1="5.3" x2="7.2" y2="7.2" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
            </svg>
            <input
              className="wl-searchbox__input"
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className="wl-searchbox__clear"
                onClick={() => setQuery("")}
              >
                Clear
              </button>
            )}
          </div>

          <div className="wl-results">
            {results.map((c, i) => (
              <button
                type="button"
                className="wl-row"
                key={`${c.ticker}-${i}`}
                onClick={() => follow(c)}
              >
                <CompanyLogo company={c} />
                <span className="wl-row__name">{c.name}</span>
                <span className="wl-row__ticker">{c.ticker}</span>
              </button>
            ))}
            {results.length === 0 && (
              <p className="wl-results__empty">No companies found</p>
            )}
          </div>
        </section>

        {/* Followed Companies */}
        <section className="wl-followed">
          <header className="wl-head">
            <h3 className="wl-heading">Followed Companies</h3>
            <FilterChip count={4} />
          </header>
          <p className="wl-count">10 Companies</p>

          <div
            className="wl-followed__card"
            ref={cardRef}
            data-merging={merging ? "on" : undefined}
            /* --merge-y positions the hot spot on the edge glow. Always present, so
               React never has to remove a style property and can't disturb the
               transform the tilt handler writes imperatively. */
            style={{ "--merge-y": `${mergeY}px` } as React.CSSProperties}
            onMouseMove={onCardMove}
            onMouseLeave={resetCardTilt}
          >
            {/* Keyed by ticker: appending leaves every mounted row untouched, so
                the entrance animation runs on the new row and only the new row. */}
            {followed.map((c) => (
              <div
                className={
                  "wl-follow" +
                  (bumped === c.ticker ? " wl-follow--bump" : "") +
                  (revealed === c.ticker ? " wl-follow--acts" : "") +
                  (merging === c.ticker ? " wl-follow--merged" : "") +
                  (leaving.includes(c.ticker) ? " wl-follow--out" : "")
                }
                key={c.ticker}
                onClick={() => showActions(c.ticker)}
                onMouseEnter={() => onRowEnter(c.ticker)}
                onMouseLeave={scheduleHide}
              >
                <CompanyLogo company={c} />
                <span className="wl-row__name wl-follow__name">{c.name}</span>
                <span className="wl-row__ticker wl-follow__ticker">{c.ticker}</span>
                {/* Parked INSIDE the card at rest and slid out past its right edge
                    on reveal, so they de-merge out of the card the way the chat
                    copy/share pair does. Kept in the DOM and kept focusable rather
                    than mounted on reveal: the CSS also reveals on :focus-within, so
                    these stay reachable by keyboard without a hover. */}
                {/* The absorption flare — see .wl-follow__spark. Rendered per row
                    because it has to line up with THIS row's centre. */}
                <span className="wl-follow__spark" />
                <span className="wl-follow__acts">
                  <button
                    type="button"
                    className="wl-act"
                    title={`View ${c.name}`}
                    aria-label={`View ${c.name}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* The glass is its own element, not the button: it is what the
                        WebGL layer tracks and merges, what grows in as the button
                        separates, and what the hover wobble deforms — all without
                        touching the icon beside it. */}
                    <span className="wl-act__glass" />
                    <EyeIcon />
                  </button>
                  <button
                    type="button"
                    className="wl-act wl-act--del"
                    title={`Remove ${c.name}`}
                    aria-label={`Remove ${c.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      unfollow(c.ticker);
                    }}
                  >
                    <span className="wl-act__glass" />
                    <BinIcon />
                  </button>
                </span>
              </div>
            ))}
            {skeletons &&
              Array.from({ length: SKELETON_ROWS }, (_, i) => (
                <div
                  className={`wl-skel${anyFollowed ? " wl-skel--out" : ""}`}
                  key={`skel-${i}`}
                >
                  <span className="wl-skel__thumb" />
                  <span className="wl-skel__bar" />
                </div>
              ))}
          </div>
        </section>
      </div>
    </section>
  );
}
