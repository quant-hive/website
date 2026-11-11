import type { CSSProperties } from "react";
import { PageEnd, PageHead, PageInvite } from "./AboutPage";
import EngravedPortrait from "./EngravedPortrait";
import "./AboutPage.css";
import "./TeamPage.css";

// The Team page (frame 24:4168): the About page's head and copy, then the team in
// square boxes three to a row, as in the frame — each portrait engraved and cut into a grid (EngravedPortrait), with
// the person's name and role under it; a rule, a line inviting the reader to the
// Careers page beside a key to it, and the closing rules with the motif.
//
// To add a photo: put it in src/assets/images/team/ and set `photo` to
// "/images/team/<file>". Any ordinary photo works; a head-and-shoulders crop is
// best. Without one, the box shows the treatment on a placeholder shape.
// The team's own photos, cropped square to head and shoulders (800 × 800).
// `note`: a line under the role; several, and they take turns in a loop.
// `strength`: a lighter engraving (0–1) for a photo that reads less clearly.
const TEAM: { name: string; role: string; note?: string | string[]; photo?: string; strength?: number }[] = [
  { name: "Harkishan S Baniya", role: "CEO & Co-Founder", photo: "/images/team/harkishan.jpg", strength: 0.7 },
  { name: "Neelesh Upadhaye", role: "Co-Founder", note: ["Ex Quant Head, Dolat Capital", "Professor, IIT Madras"], photo: "/images/team/neelesh.jpg", strength: 0.7 },
  { name: "Chirag S J", role: "Founding Member, SDE", photo: "/images/team/chirag.jpg" },
  { name: "Mahati", role: "Founding Member, Founder's Office Associate", photo: "/images/team/mahati.jpg" },
];

/** The line under a role; given two, they take turns, each sliding up and out
 *  as the other rises into its place (TeamPage.css). */
function Note({ lines }: { lines: string[] }) {
  if (lines.length === 1) return <p className="team-page__role team-page__note">{lines[0]}</p>;
  return (
    <p className="team-page__role team-page__note team-page__note--cycle">
      <span className="team-page__sr">{lines.join("; ")}</span>
      {lines.map((line, i) => (
        <span key={line} aria-hidden style={{ "--i": i } as CSSProperties}>
          {line}
        </span>
      ))}
    </p>
  );
}

export default function TeamPage() {
  return (
    <main className="about-page" aria-labelledby="team-page-title">
      <article className="about-page__column">
        <PageHead id="team-page-title">
          <span className="about-page__pp">Tea</span>
          <span className="about-page__bg">m</span>
        </PageHead>

        <div className="about-page__copy">
          <p>
            A founding team from IIT Madras, combining deep engineering with quantitative finance to build
            research tools that scale.
          </p>
        </div>

        <ul className="team-page__grid">
          {TEAM.map((person, index) => (
            <li className="team-page__person" key={index}>
              <EngravedPortrait src={person.photo} seed={index + 3} strength={person.strength} alt={person.photo ? `Portrait of ${person.name}` : ""} />
              <p className="team-page__name">{person.name}</p>
              <p className="team-page__role">{person.role}</p>
              {person.note && <Note lines={([] as string[]).concat(person.note)} />}
            </li>
          ))}
        </ul>

        <hr className="about-page__rule team-page__rule" />

        <PageInvite label="Careers" href="/careers">
          Looking to be part of the team? Check out the open roles at QuantHive and find one that suits you.
        </PageInvite>

        <PageEnd />
      </article>
    </main>
  );
}
