import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { POSITIONS, type Position } from "../content/careers";
import { useEvenLines } from "../lib/useEvenLines";
import { PageHead } from "./AboutPage";
import "./AboutPage.css";
import "./CareersPage.css";

// The Careers page (frame 48:246), on the About page's column: the head, a line
// on joining, two short notes split by a hairline, a rule — then Open Positions,
// one ruled row per role (a tile, the role and its terms, "Apply Now"). "Apply
// Now" opens a black bar under its row — name, email, send — that applies for
// that role (POST /api/careers, mailed like the contact form). One bar at a time.


export default function CareersPage() {
  const [open, setOpen] = useState<string | null>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  useEvenLines(notesRef);

  return (
    <main className="about-page careers-page" aria-labelledby="careers-title">
      <article className="about-page__column">
        <PageHead id="careers-title">
          <span className="about-page__pp">Ca</span>
          <span className="about-page__bg">r</span>
          <span className="about-page__pp">ee</span>
          <span className="about-page__bg">r</span>
          <span className="about-page__pp">s</span>
        </PageHead>

        <div className="about-page__copy">
          <p>
            Join QuantHive in redefining financial analytics through artificial intelligence, mathematical precision,
            and innovative design. Together, we're making financial intelligence faster, smarter, and more accessible.
          </p>
        </div>

        <div className="careers-page__notes" ref={notesRef}>
          <p>
            At QuantHive, we're combining AI, quantitative finance, and engineering to simplify complex financial
            research and build smarter investment solutions.
          </p>
          <span className="careers-page__divider" aria-hidden />
          <p>
            Experience a collaborative, innovation-driven culture with expert mentorship, hands-on learning, and
            connections to IIT Madras and its Research Park ecosystem.
          </p>
        </div>

        <hr className="about-page__rule" />

        <section className="careers-page__positions" aria-labelledby="careers-open">
          <h2 id="careers-open" className="careers-page__heading">
            Open Positions
          </h2>
          <ul className="careers-page__list">
            {POSITIONS.map((position) => (
              <PositionRow
                key={position.role}
                position={position}
                open={open === position.role}
                onToggle={() => setOpen((current) => (current === position.role ? null : position.role))}
              />
            ))}
          </ul>
        </section>

        <div className="careers-page__end" aria-hidden>
          <span />
          <span className="careers-page__end-motif" />
          <span />
        </div>
      </article>
    </main>
  );
}

function PositionRow({ position, open, onToggle }: { position: Position; open: boolean; onToggle: () => void }) {
  const barId = useId();
  return (
    <li className="careers-page__item">
      <div className="careers-page__row">
        <span className="careers-page__tile" aria-hidden>
          <img src={position.art} alt="" width={288} height={167} loading="lazy" decoding="async" />
        </span>
        <h3 className="careers-page__role">{position.role}</h3>
        <button
          type="button"
          className="careers-page__apply"
          aria-expanded={open}
          aria-controls={barId}
          onClick={onToggle}
        >
          {open ? "Close" : "Apply Now"}
        </button>
        <p className="careers-page__meta careers-page__meta--1">
          <span>{position.requirement}</span>
          <span>{position.mode}</span>
        </p>
        <p className="careers-page__meta careers-page__meta--2">
          <span>{position.term}</span>
          <span>Duration</span>
        </p>
        <p className="careers-page__meta careers-page__meta--3">
          <span>{position.location}</span>
          <span>Location</span>
        </p>
      </div>
      <div id={barId} className="careers-page__drawer" data-open={open || undefined} inert={!open}>
        <div className="careers-page__drawer-inner">
          <ApplyBar role={position.role} open={open} />
        </div>
      </div>
    </li>
  );
}

type Status = { state: "idle" | "sending" | "sent" } | { state: "error"; message: string };

function ApplyBar({ role, open }: { role: string; open: boolean }) {
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const nameRef = useRef<HTMLInputElement>(null);

  // Opening the bar puts the reader in its first field.
  useEffect(() => {
    if (open && status.state !== "sent") nameRef.current?.focus({ preventScroll: true });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus({ state: "sending" });
    try {
      const response = await fetch("/api/careers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          role,
          name: form.get("name"),
          email: form.get("email"),
          website: form.get("website"),
        }),
      });
      const result = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!response.ok || !result?.ok) {
        setStatus({ state: "error", message: result?.error ?? "Something went wrong — please try again." });
      } else setStatus({ state: "sent" });
    } catch {
      setStatus({ state: "error", message: "Couldn't reach us — please check your connection." });
    }
  }

  if (status.state === "sent") {
    return (
      <div className="careers-page__bar careers-page__bar--sent" role="status">
        <img className="careers-page__person" src="/icons/careers-person.svg" alt="" />
        <p className="careers-page__thanks">Thank you — we've got your application for {role} and will be in touch.</p>
      </div>
    );
  }

  return (
    <form className="careers-page__bar" onSubmit={submit} noValidate>
      <img className="careers-page__person" src="/icons/careers-person.svg" alt="" />
      <label className="careers-page__field careers-page__field--name">
        <span className="careers-page__sr">Full name</span>
        <input ref={nameRef} name="name" type="text" placeholder="Full name" autoComplete="name" required maxLength={120} />
      </label>
      <label className="careers-page__field careers-page__field--email">
        <span className="careers-page__sr">Email</span>
        <input name="email" type="email" placeholder="Email" autoComplete="email" required maxLength={200} />
      </label>
      {/* A field people never see; bots fill it in. */}
      <input className="careers-page__trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden />
      <button type="submit" className="careers-page__send" disabled={status.state === "sending"}>
        {status.state === "sending" ? "Sending…" : "Apply Now"}
        <img src="/icons/careers-arrow-down-right.svg" alt="" />
      </button>
      {status.state === "error" && (
        <p className="careers-page__error" role="alert">
          {status.message}
        </p>
      )}
    </form>
  );
}
