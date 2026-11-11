import { useRef } from "react";
import { NEWS, type NewsItem } from "../content/news";
import { useEvenLines } from "../lib/useEvenLines";
import { PageEnd, PageHead } from "./AboutPage";
import { articleHref } from "./ArticlePage";
import TaitronicsArt from "./TaitronicsArt";
import "./AboutPage.css";
import "./NewsPage.css";

// The News page (frame 96:1039), on the About page's column, as the Blog page
// is: its head; the featured item — a card ruled in blue with marked corners,
// its label, title, summary, place and date on the left and the event's marks
// on a pale panel on the right; two notes split by a hairline (as on Careers);
// then every item three across, between hairlines; the small grey motif to close.
//
// The items come from src/content/news.ts (newest first); the first is featured.
// An item with an article opens it from anywhere on its card: the title is the
// link (for keyboards and screen readers), stretched over the whole card.

const FEATURED = NEWS[0];

/** A card's title, as a link once its item has a page. */
function Title({ item, text }: { item: NewsItem; text: string }) {
  return item.article ? (
    <a className="news-page__link" href={articleHref(item.article)}>
      {text}
    </a>
  ) : (
    text
  );
}

export default function NewsPage() {
  const notesRef = useRef<HTMLDivElement>(null);
  useEvenLines(notesRef, { inkCentred: false });

  return (
    <main className="about-page news-page" aria-labelledby="news-page-title">
      <article className="about-page__column">
        <PageHead id="news-page-title">
          <span className="about-page__pp">Ne</span>
          <span className="about-page__bg">w</span>
          <span className="about-page__pp">s</span>
        </PageHead>

        {FEATURED?.featured && (
          <article className="news-page__featured">
            <div className="news-page__featured-text">
              <p className="news-page__label">{FEATURED.featured.label}</p>
              <h2 className="news-page__featured-title">
                <Title item={FEATURED} text={FEATURED.featured.title} />
              </h2>
              <p className="news-page__summary">{FEATURED.featured.summary}</p>
              <p className="news-page__featured-meta">
                <span>{FEATURED.where}</span>
                <span>{FEATURED.featured.when}</span>
              </p>
            </div>
            <div className="news-page__panel" role="img" aria-label="AIoT Taiwan and TAITRONICS, as covered by Mexico Business News, over Taipei at night">
              <TaitronicsArt />
            </div>
          </article>
        )}

        <div className="news-page__notes" ref={notesRef}>
          <p>
            Discover the latest updates from QuantHive, including our milestones, collaborations, and innovations in
            AI, quantitative finance, and financial technology.
          </p>
          <span className="news-page__divider" aria-hidden />
          <p>
            Explore QuantHive’s latest product innovations, designed to simplify financial research and deliver
            smarter, data-driven investment insights.
          </p>
        </div>

        <ul className="news-page__list">
          {NEWS.map((item) => (
            <li key={item.title} className={`news-page__item${item.soon ? " news-page__item--soon" : ""}`}>
              <span className="news-page__thumb" aria-hidden>
                {item.art === "taitronics" ? (
                  <TaitronicsArt />
                ) : (
                  item.image && <img src={item.image} alt="" style={{ objectPosition: item.imageFocus }} />
                )}
              </span>
              <h2 className="news-page__title">
                <Title item={item} text={item.title} />
              </h2>
              <p className="news-page__meta">
                <span>{item.where}</span>
                <span>{item.when}</span>
              </p>
            </li>
          ))}
        </ul>

        <PageEnd />
      </article>
    </main>
  );
}
