import { useEffect, useRef, useState } from "react";
import { articleBySlug } from "../content/articles";
import { newsArticleBySlug } from "../content/news";
import { onAddressChange } from "../lib/router";
import "./AnnouncementBar.css";

interface AnnouncementBarProps {
  onClose?: () => void;
  ctaHref?: string;
  onCtaClick?: () => void;
}

/** An article drawn from elsewhere (press coverage) puts a link to its
 *  original in the bar while it's open. */
type Notice = { href: string; source: string };

/** The notice for the address, if it's such an article's. */
const noticeAt = (): Notice | null => {
  const match = window.location.pathname.replace(/\/+$/, "").match(/^\/(blog|news)\/([^/]+)$/);
  if (!match) return null;
  const slug = decodeURIComponent(match[2]!);
  const reference = (match[1] === "news" ? newsArticleBySlug(slug) : articleBySlug(slug))?.reference;
  return reference ? { href: reference.href, source: reference.source } : null;
};

/** What the bar says: Flash's announcement, or an article's notice. Closing it
 *  closes that one only — an article's notice still comes in (sliding down,
 *  even after Flash's was closed), and Flash's still returns once the article
 *  is left, unless it was closed itself. Between the two the bar turns colour
 *  (black, the article page's blue) and its words cross-fade. */
const FLASH = "flash";
const SLIDE_MS = 320;
const FADE_MS = 200;

export default function AnnouncementBar({ onClose, ctaHref = "#", onCtaClick }: AnnouncementBarProps) {
  const [notice, setNotice] = useState<Notice | null>(() => (typeof window === "undefined" ? null : noticeAt()));
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(() => new Set());
  const key = notice?.href ?? FLASH;
  const wanted = !dismissed.has(key);

  // In the page at all, and down (open) or up (closed, sliding away or in).
  const [mounted, setMounted] = useState(wanted);
  const [open, setOpen] = useState(wanted);
  // The words showing, which trail `notice` by a fade.
  const [shown, setShown] = useState(notice);
  const [fading, setFading] = useState(false);
  const barRef = useRef<HTMLElement>(null);

  useEffect(
    () =>
      onAddressChange(() => {
        const next = noticeAt();
        setNotice((current) => (current?.href === next?.href ? current : next));
      }),
    [],
  );

  // Coming and going: mount it up out of sight, then let it slide down; slide
  // it up, then take it out.
  useEffect(() => {
    if (wanted && !mounted) {
      setShown(notice);
      setMounted(true);
    } else if (wanted && !open) {
      let second = 0;
      const first = requestAnimationFrame(() => (second = requestAnimationFrame(() => setOpen(true))));
      return () => {
        cancelAnimationFrame(first);
        cancelAnimationFrame(second);
      };
    } else if (!wanted && open) {
      setOpen(false);
    } else if (!wanted && mounted) {
      const timer = window.setTimeout(() => {
        setMounted(false);
        onClose?.();
      }, SLIDE_MS);
      return () => window.clearTimeout(timer);
    }
  }, [wanted, mounted, open, notice, onClose]);

  // Changing what it says while it's down: fade the old words out, the new in.
  useEffect(() => {
    if (shown?.href === notice?.href) return;
    if (!open) {
      setShown(notice);
      return;
    }
    setFading(true);
    const timer = window.setTimeout(() => {
      setShown(notice);
      setFading(false);
    }, FADE_MS);
    return () => window.clearTimeout(timer);
  }, [notice, shown, open]);

  // The nav sits under it (--announcement-h): its height while down, else none,
  // so the nav slides with it.
  useEffect(() => {
    const el = barRef.current;
    if (!open || !el) {
      document.documentElement.style.setProperty("--announcement-h", "0px");
      return;
    }
    const measure = () => document.documentElement.style.setProperty("--announcement-h", `${el.offsetHeight}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.documentElement.style.setProperty("--announcement-h", "0px");
    };
  }, [open, mounted]);

  const handleDismiss = () => setDismissed((current) => new Set(current).add(key));

  if (!mounted) return null;

  return (
    <aside
      ref={barRef}
      className={`announcement-bar${notice ? " announcement-bar--notice" : ""}${open ? "" : " announcement-bar--closing"}`}
      role="banner"
      aria-label="Announcement"
    >
      <div className={`announcement-bar__content${fading ? " announcement-bar__content--fading" : ""}`} aria-live="polite">
        {shown ? (
          <a href={shown.href} className="announcement-bar__cta" target="_blank" rel="noopener noreferrer">
            <span className="announcement-bar__cta-desktop">Read the original article on {shown.source}</span>
            <span className="announcement-bar__cta-mobile">Read on {shown.source}</span>{" "}
            <span className="announcement-bar__arrow" aria-hidden="true">
              →
            </span>
          </a>
        ) : (
          <>
            <span className="announcement-bar__text">
              <strong className="announcement-bar__strong">Introducing Flash</strong>
              <span className="announcement-bar__desc-desktop"> — The fastest path to actionable investment intelligence.</span>
              <span className="announcement-bar__desc-mobile"> — Fast investment intelligence.</span>
            </span>
            <a
              href={ctaHref}
              className="announcement-bar__cta"
              onClick={(e) => {
                if (onCtaClick) {
                  e.preventDefault();
                  onCtaClick();
                }
              }}
            >
              <span className="announcement-bar__cta-desktop">Explore now</span>
              <span className="announcement-bar__cta-mobile">Explore</span>{" "}
              <span className="announcement-bar__arrow" aria-hidden="true">
                →
              </span>
            </a>
          </>
        )}
      </div>

      <button type="button" className="announcement-bar__close" onClick={handleDismiss} aria-label="Close announcement">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M2 2L11 11M2 11L11 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </aside>
  );
}
