import { useEffect, useRef, useState, type CSSProperties } from "react";
import "./FlashPartners.css";

// Flash's second section (frame 11:3765): a band of logos along the top of a
// light page, running right to left without end. Logos are greyed out until the
// pointer is over one, which brings back its colour.
//
// Google, Citi, AWS, Intel and Anthropic are vector (the marks' SVGs from
// Wikimedia Commons; Intel's recoloured to its classic #0068B5, as in the frame).
// No faithful SVG turned up for the rest — the NVIDIA Inception lockup, nasscom's
// current mark, the two seals and Exception Raised — so those are the frame's own
// images, cropped to their artwork. `w` and `h` give each logo's proportions.
//
// They are drawn at a matched visual weight rather than at the frame's sizes:
// each gets the same area on the band (AREA, in frame px on the 80px band), so a
// long wordmark comes out shorter and a compact mark taller, and no logo shouts
// over the others. Heights are capped so square marks don't tower.
const AREA = 2600;
const MAX_H = 38;
/** A logo's drawn size, in frame px, from its proportions. */
const sized = (w: number, h: number) => {
  const aspect = w / h;
  const height = Math.min(MAX_H, Math.sqrt(AREA / aspect));
  return { w: +(height * aspect).toFixed(2), h: +height.toFixed(2) };
};
// Exception Raised is its mark (27.73 × 30.02) beside its name in Bebas Neue (35
// on the frame): about 7.4 times as wide as tall overall.
const EXCEPTION_SCALE = sized(7.4, 1).h / 30.02;

const LOGOS = [
  { src: "logo-nvidia.png", alt: "NVIDIA Inception Program", w: 84.03, h: 29.22 },
  { src: "logo-citi.svg", alt: "Citi", w: 48.25, h: 31.36 },
  { src: "logo-google.svg", alt: "Google", w: 94.38, h: 31.92 },
  { src: "logo-aws.svg", alt: "AWS", w: 42.92, h: 25.7 },
  { src: "logo-nasscom.png", alt: "nasscom", w: 204, h: 28.69 },
  { src: "logo-anthropic.svg", alt: "Anthropic", w: 249.26, h: 27.99 },
  { src: "logo-seal-a.png", alt: "IIT Madras", w: 45, h: 45 },
  { src: "logo-seal-b.png", alt: "IITM Incubation Cell", w: 41.89, h: 41.89 },
  { src: "logo-intel.svg", alt: "Intel", w: 75, h: 29.57 },
  // ElevenLabs' grants badge, from ElevenLabs' own CDN (as their embed gives it).
  { src: "https://eleven-public-cdn.elevenlabs.io/payloadcms/pwsc4vchsqt-ElevenLabsGrants.webp", alt: "ElevenLabs Grants", w: 1496, h: 132 },
] as const;

function Logos({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="flash-partners__list" aria-hidden={hidden || undefined}>
      {LOGOS.map((logo) => {
        const size = sized(logo.w, logo.h);
        return (
        <li key={logo.src} style={{ "--w": size.w, "--h": size.h } as CSSProperties}>
          <img src={logo.src.startsWith("https://") ? logo.src : `/images/figma-product/${logo.src}`} alt={hidden ? "" : logo.alt} loading="lazy" draggable={false} />
        </li>
        );
      })}
      {/* Exception Raised: its mark and its name in Bebas Neue, as the frame sets it. */}
      <li
        className="flash-partners__exception"
        style={{ "--w": 27.73 * EXCEPTION_SCALE, "--h": 30.02 * EXCEPTION_SCALE, "--k": EXCEPTION_SCALE } as CSSProperties}
      >
        <img src="/images/figma-product/logo-exception-raised.png" alt="" loading="lazy" draggable={false} />
        <span>{hidden ? "" : "Exception Raised"}</span>
      </li>
    </ul>
  );
}

// Speed of the scroll, in frame px per second (scaled with the band).
const SPEED = 46;

export default function FlashPartners() {
  // Enough copies end to end that the band is always full, however wide the
  // screen; the track slides exactly one copy's width and starts over, so the
  // seam never shows and the run never ends.
  const bandRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(2);
  const [shift, setShift] = useState(0);
  const [unit, setUnit] = useState(1);

  useEffect(() => {
    const band = bandRef.current;
    if (!band) return;
    const measure = () => {
      const first = band.querySelector<HTMLElement>(".flash-partners__list");
      if (!first) return;
      const width = first.getBoundingClientRect().width;
      if (!width) return;
      setShift(width);
      setCopies(Math.ceil(band.clientWidth / width) + 1);
      setUnit(band.clientHeight / 80);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(band);
    const first = band.querySelector(".flash-partners__list");
    if (first) observer.observe(first);
    // Logos load lazily and set their own widths; measure again once they're in.
    band.querySelectorAll("img").forEach((img) => img.addEventListener("load", measure, { once: true }));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="flash-partners" aria-label="Backed and supported by">
      <div className="flash-partners__band" ref={bandRef}>
        <div
          className="flash-partners__track"
          data-ready={shift > 0 || undefined}
          style={{ "--shift": `${shift}px`, "--dur": `${shift / (SPEED * unit)}s` } as CSSProperties}
        >
          {Array.from({ length: copies }, (_, index) => (
            <Logos key={index} hidden={index > 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
