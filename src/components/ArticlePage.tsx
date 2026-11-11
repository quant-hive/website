import { articleSeo } from "../content/seo";
import { applySeo } from "../lib/seo";
import { useEffect, useState } from "react";
import { articleBySlug, sectionId, type Article, type Block, type Face, type TitleRun } from "../content/articles";
import { newsArticleBySlug } from "../content/news";
import { navigate } from "../lib/router";
import { scrollPageTo } from "../lib/smoothScroll";
import { PageHead } from "./AboutPage";
import TaitronicsArt from "./TaitronicsArt";
import { openWaitlist } from "./WaitlistDialog";
import "./AboutPage.css";
import "./ArticlePage.css";

// An article (the blog's template, Figma 44:4552), at /blog/<slug> — or, for a
// news item, /news/<slug> (src/content/news.ts): on the About
// page's column, the article's title as the page head (single letters in other
// faces), its subtitle, author and date, the cover panel, the lead paragraph and
// a rule, then the body. On wider screens a Contents list sits to the right,
// built from the article's sections; it follows the reader down the page, marks
// the section in view, and takes them to any section on a click. An article
// drawn from elsewhere (press coverage) closes on a link to the original.

const FACE_CLASS: Record<Face, string> = {
  pp: "about-page__pp",
  bg: "about-page__bg",
  pg: "about-page__pg",
  fg: "article-page__fg",
  sg: "article-page__sg",
  lq: "article-page__lq",
};

type Section = NonNullable<Article["section"]>;

/** Where the address points: /blog/<slug> or /news/<slug>. */
const placeFromPath = (): { section: Section; slug: string } => {
  const [, section, slug = ""] = window.location.pathname.replace(/\/+$/, "").match(/^\/(blog|news)\/?(.*)$/) ?? [];
  return { section: section === "news" ? "news" : "blog", slug: decodeURIComponent(slug) };
};

/** The fixed bar's height plus a little air: where a section lands when jumped
 *  to (the announcement strip, the bar's 72px, and a gap). */
const headerOffset = () => {
  const strip = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--announcement-h")) || 0;
  return strip + 72 + 36;
};

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return <p className="article-page__p">{block.text}</p>;
    case "h2":
      return (
        <h2 className="article-page__h2" id={sectionId(block.text)}>
          {block.text}
        </h2>
      );
    case "h3":
      return <h3 className="article-page__h3">{block.text}</h3>;
    case "quote":
      return (
        <blockquote className="article-page__quote">
          <p>{block.text}</p>
        </blockquote>
      );
    case "list":
      return (
        <ul className="article-page__list">
          {block.items.map((item, index) => (
            <li key={index}>
              {item.term && <strong>{item.term}: </strong>}
              {item.text}
            </li>
          ))}
        </ul>
      );
    case "source":
      return <p className="article-page__source">Source: {block.text}</p>;
    case "table":
      return (
        <div className="article-page__table-wrap">
          <table className="article-page__table">
            <thead>
              <tr>
                {block.head.map((cell) => (
                  <th key={cell} scope="col">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, index) => (
                <tr key={index}>
                  {row.map((cell, column) =>
                    column === 0 ? (
                      <th key={column} scope="row">
                        {cell}
                      </th>
                    ) : (
                      <td key={column}>{cell}</td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "cta":
      return (
        <p className="article-page__cta-row">
          <button type="button" className="article-page__cta" onClick={openWaitlist} aria-haspopup="dialog">
            {block.text}
            <svg viewBox="0 0 16 16" aria-hidden>
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </button>
        </p>
      );
    case "refs":
      return (
        <ol className="article-page__refs">
          {block.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ol>
      );
  }
}

/** The Contents list: the article's sections, the one in view marked. */
function Contents({ sections }: { sections: string[] }) {
  const [active, setActive] = useState(sections[0] ? sectionId(sections[0]) : "");

  useEffect(() => {
    // The section in view is the last whose heading has passed a line a third of
    // the way down the screen.
    const ids = sections.map(sectionId);
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.33;
      let current = ids[0] ?? "";
      for (const id of ids) {
        const heading = document.getElementById(id);
        if (heading && heading.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [sections]);

  const go = (id: string) => {
    const heading = document.getElementById(id);
    if (!heading) return;
    scrollPageTo(heading.getBoundingClientRect().top + window.scrollY - headerOffset());
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav className="article-page__contents" aria-label="Contents">
      <p className="article-page__contents-title">Contents</p>
      <ol>
        {sections.map((section) => {
          const id = sectionId(section);
          return (
            <li key={id}>
              {/* A button, not an #anchor: the smooth scroller would take an anchor
                  over and land the heading under the bar. */}
              <button type="button" aria-current={active === id ? "location" : undefined} onClick={() => go(id)}>
                {section}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function ArticleView({ article }: { article: Article }) {
  const sections = article.body.filter((block): block is Extract<Block, { type: "h2" }> => block.type === "h2").map((block) => block.text);
  const runs: TitleRun[] = article.titleRuns ?? [[article.title, "pp"]];

  // Opened at a section's address (/blog/<slug>#section), go to it.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const timer = window.setTimeout(() => {
      const heading = document.getElementById(id);
      if (heading) window.scrollTo(0, heading.getBoundingClientRect().top + window.scrollY - headerOffset());
    }, 120);
    return () => window.clearTimeout(timer);
  }, [article.slug]);

  return (
    <div className="article-page__layout">
      <article className="about-page__column article-page__article">
        <PageHead id="article-title">
          {runs.map(([text, face, tweak], index) => (
            <span
              key={index}
              className={FACE_CLASS[face]}
              style={tweak && { fontSize: tweak.size && `${tweak.size}em`, letterSpacing: tweak.tracking && `${tweak.tracking}em` }}
            >
              {text}
            </span>
          ))}
        </PageHead>

        <p className="article-page__subtitle">{article.subtitle}</p>
        <p className="article-page__byline">
          <span>{article.author}</span>
          <span className="article-page__byline-rule" aria-hidden />
          <time>{article.date}</time>
        </p>

        {/* No cover yet: the placeholder — the lattice, faint, round the motif. */}
        <div className="article-page__cover">
          {article.art === "taitronics" ? (
            <TaitronicsArt />
          ) : article.image ? (
            <img src={article.image} alt="" style={{ objectPosition: article.imageFocus }} />
          ) : (
            <span className="article-page__cover-art" aria-hidden />
          )}
        </div>

        <p className="article-page__lead">{article.lead}</p>
        <hr className="article-page__rule" />

        <div className="article-page__body">
          {article.body.map((block, index) => (
            <BlockView key={index} block={block} />
          ))}
        </div>

        {article.reference && (
          <p className="article-page__reference">
            <a href={article.reference.href} target="_blank" rel="noopener noreferrer">
              {article.reference.label}
              <svg viewBox="0 0 12 12" aria-hidden>
                <path d="M3 9 9 3M4 3h5v5" />
              </svg>
            </a>
          </p>
        )}

        <span className="article-page__end" aria-hidden />
      </article>

      {sections.length > 0 && (
        <aside className="article-page__aside">
          <Contents sections={sections} />
        </aside>
      )}
    </div>
  );
}

export default function ArticlePage() {
  const [place, setPlace] = useState(placeFromPath);

  // Another article opened from this one (the page itself doesn't change).
  useEffect(() => {
    const update = () => setPlace(placeFromPath());
    window.addEventListener("popstate", update);
    window.addEventListener("quanthive:navigate", update);
    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener("quanthive:navigate", update);
    };
  }, []);

  const article = place.section === "news" ? newsArticleBySlug(place.slug) : articleBySlug(place.slug);
  const listing = place.section === "news" ? { href: "/news", label: "See all news" } : { href: "/blog", label: "See all articles" };

  useEffect(() => {
    if (article) applySeo(articleSeo(article));
  }, [article]);

  return (
    <main className="about-page article-page" aria-labelledby="article-title">
      {article ? (
        <ArticleView article={article} key={article.slug} />
      ) : (
        <div className="about-page__column article-page__missing">
          <PageHead id="article-title">
            <span className="about-page__pp">Not found</span>
          </PageHead>
          <p className="article-page__subtitle">This article isn&apos;t here — it may have moved.</p>
          <p>
            <a href={listing.href} onClick={(event) => (event.preventDefault(), navigate(listing.href))}>
              {listing.label}
            </a>
          </p>
        </div>
      )}
    </main>
  );
}

/** A link to an article, for the Blog and News pages. */
export const articleHref = (article: Article) => `/${article.section ?? "blog"}/${article.slug}`;
