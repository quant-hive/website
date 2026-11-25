import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { POSITIONS, type Position } from "../content/careers";
import { useEvenLines } from "../lib/useEvenLines";
import { PageHead } from "./AboutPage";
import "./AboutPage.css";
import "./CareersPage.css";

// The Careers page (frame 48:246), on the About page's column: the head, a line
// on joining, two short notes split by a hairline, a rule — then Open Positions,
// one ruled row per role (a tile, the role and its terms, "Apply Now"). "Apply
// Now" opens a black bar under its row that applies for that role, in two steps:
// name and email, then Next; a CV (required) and a phone number (optional), then
// Submit. All of it goes as one upload (POST /api/careers: mailed with the CV,
// the CV filed in Drive and the applicant in the sheet). One bar at a time.


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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** As api/careers.ts takes them: under Vercel's request limit. */
const CV_MAX_BYTES = 4 * 1024 * 1024;
const CV_ACCEPT = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/** What's wrong with a picked CV, if anything (the server checks again). */
function cvProblem(file: File | null | undefined) {
  if (!file) return "Please attach your CV.";
  if (!/\.(pdf|docx?)$/i.test(file.name)) return "Please attach your CV as a PDF or Word file.";
  if (file.size > CV_MAX_BYTES) return "Your CV is over 4 MB — please attach a smaller file.";
  return null;
}

function ApplyBar({ role, open }: { role: string; open: boolean }) {
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [step, setStep] = useState<1 | 2>(1);
  const [cvName, setCvName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const cvRef = useRef<HTMLInputElement>(null);

  // Opening the bar puts the reader in its first field.
  useEffect(() => {
    if (open && status.state !== "sent") (step === 1 ? nameRef : cvRef).current?.focus({ preventScroll: true });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const fail = (message: string) => setStatus({ state: "error", message });

  // Step 1 to 2: the name and email must do first.
  function next() {
    const form = new FormData(formRef.current!);
    if (!String(form.get("name") ?? "").trim()) return fail("Please add your name.");
    if (!EMAIL_RE.test(String(form.get("email") ?? "").trim())) return fail("Please add a valid email.");
    setStatus({ state: "idle" });
    setStep(2);
    requestAnimationFrame(() => cvRef.current?.focus({ preventScroll: true }));
  }

  function back() {
    setStatus({ state: "idle" });
    setStep(1);
    requestAnimationFrame(() => nameRef.current?.focus({ preventScroll: true }));
  }

  function pickCv() {
    const file = cvRef.current?.files?.[0];
    setCvName(file?.name ?? "");
    const problem = file ? cvProblem(file) : null;
    if (problem) fail(problem);
    else if (status.state === "error") setStatus({ state: "idle" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 1) return next(); // Enter in a step-1 field means Next
    const form = new FormData(event.currentTarget);
    const problem = cvProblem(cvRef.current?.files?.[0]);
    if (problem) return fail(problem);
    form.set("role", role);
    setStatus({ state: "sending" });
    try {
      const response = await fetch("/api/careers", { method: "POST", body: form });
      const result = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!response.ok || !result?.ok) fail(result?.error ?? "Something went wrong — please try again.");
      else setStatus({ state: "sent" });
    } catch {
      fail("Couldn't reach us — please check your connection.");
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

  const sending = status.state === "sending";
  return (
    <form
      ref={formRef}
      className="careers-page__bar"
      data-step={step}
      onSubmit={submit}
      // Typing again clears a complaint (the CV's is settled by picking a file).
      onChange={(event) => {
        const field = event.target;
        if (status.state === "error" && !(field instanceof HTMLInputElement && field.name === "cv")) setStatus({ state: "idle" });
      }}
      noValidate
      aria-label={`Apply for ${role}, step ${step} of 2`}
    >
      <img className="careers-page__person" src="/icons/careers-person.svg" alt="" />

      {/* Step 1: who. Hidden, not removed, at step 2: its values go with the rest. */}
      <div className="careers-page__step" hidden={step !== 1}>
        <label className="careers-page__field careers-page__field--name">
          <span className="careers-page__sr">Full name</span>
          <input ref={nameRef} name="name" type="text" placeholder="Full name" autoComplete="name" required maxLength={120} />
        </label>
        <label className="careers-page__field careers-page__field--email">
          <span className="careers-page__sr">Email</span>
          <input name="email" type="email" placeholder="Email" autoComplete="email" required maxLength={200} />
        </label>
        <div className="careers-page__actions">
          <button type="button" className="careers-page__send" onClick={next}>
            Next
            <img src="/icons/careers-arrow-down-right.svg" alt="" />
          </button>
        </div>
      </div>

      {/* Step 2: the CV, a phone number if they like, and Submit. */}
      <div className="careers-page__step" hidden={step !== 2}>
        <label className="careers-page__field careers-page__field--cv" data-filled={cvName ? "" : undefined}>
          <span className="careers-page__sr">CV (PDF or Word, up to 4 MB)</span>
          <input ref={cvRef} className="careers-page__file" name="cv" type="file" accept={CV_ACCEPT} required onChange={pickCv} />
          <span className="careers-page__file-face" aria-hidden>
            <svg viewBox="0 0 16 16">
              <path d="M10.5 4.5 5.6 9.4a1.4 1.4 0 0 0 2 2l5.1-5.1a2.8 2.8 0 0 0-4-4L3.6 7.4a4.2 4.2 0 0 0 6 6l4.1-4.1" />
            </svg>
            <span className="careers-page__file-name">{cvName || "Attach CV (PDF / Word)"}</span>
          </span>
        </label>
        <label className="careers-page__field careers-page__field--phone">
          <span className="careers-page__sr">Phone number (optional)</span>
          <input name="phone" type="tel" placeholder="Phone (optional)" autoComplete="tel" inputMode="tel" maxLength={30} />
        </label>
        <div className="careers-page__actions">
          <button type="button" className="careers-page__back" onClick={back} disabled={sending}>
            Back
          </button>
          <button type="submit" className="careers-page__send" disabled={sending}>
            {sending ? "Sending…" : "Submit"}
            <img src="/icons/careers-arrow-down-right.svg" alt="" />
          </button>
        </div>
      </div>

      {/* A field people never see; bots fill it in. */}
      <input className="careers-page__trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden />
      {status.state === "error" && (
        <p className="careers-page__error" role="alert">
          {status.message}
        </p>
      )}
    </form>
  );
}
