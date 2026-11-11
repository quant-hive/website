import type { Article } from "./articles";

// QuantHive's news: events, launches and announcements. Each is plain data,
// listed on the News page (/news, NewsPage.tsx): the first is also its featured
// card, and every item appears in the grid below. An item with an `article`
// opens it, at /news/<slug> (ArticlePage.tsx, the blog's article template).
//
// To add news: put an entry at the top of NEWS (newest first).

export type NewsItem = {
  /** The grid card's title. */
  title: string;
  where: string;
  /** The grid card's date, short (e.g. "12 Dec 2026"). */
  when: string;
  /** When this item is the featured card: its label, title, summary and date,
   *  as that card sets them (the title may differ from the grid card's). */
  featured?: { label: string; title: string; summary: string; when: string };
  /** The grid card's picture (a placeholder until it has one), and where its
   *  crop keeps its subject (CSS object-position) — or, for an item with art of
   *  its own, that art, as its featured card shows it (NewsPage.tsx). */
  image?: string;
  imageFocus?: string;
  art?: "taitronics";
  /** A place held for news still to come ("Stay tuned"): a shade quieter. */
  soon?: boolean;
  /** The page the item's cards open. */
  article?: Article;
};

// Taipei at night, Taipei 101 to the right of centre: the photo in the
// TAITRONICS item's art (TaitronicsArt.tsx) — its featured card, its grid card,
// its article's cover — and its picture in search results.
export const TAIPEI = "/images/news-taipei.webp";

// Mexico Business News' report from the Big Bang Startup Pavilion, the part on
// QuantHive, in our own words (the full report is linked under it).
const TAITRONICS_2026: Article = {
  section: "news",
  slug: "taitronics-2026-mexico-business-news",
  title: "QuantHive At Taitronics 2026",
  // As frame 185:2 sets it: its "A" 3.5 tighter, the Power Grotesk "t"s after it
  // at 52 in the 50 title — but the Q is the logo's.
  titleRuns: [
    ["Q", "lq"],
    ["u", "bg"],
    ["a", "pp"],
    ["n", "bg"],
    ["t", "pg"],
    ["H", "pp"],
    ["iv", "bg"],
    ["e", "pp"],
    [" ", "fg"],
    ["A", "pp", { tracking: -0.07 }],
    ["t", "pg", { size: 1.04 }],
    [" ", "bg"],
    ["Ta", "pp"],
    ["i", "bg"],
    ["t", "pg", { size: 1.04 }],
    ["r", "bg"],
    ["o", "pp"],
    ["nic", "bg"],
    ["s", "pp"],
    [" ", "bg"],
    ["2026", "pp"],
  ],
  subtitle: "Why enterprise AI isn't trusted yet, and how we solve it",
  category: "Press",
  author: "Mexico Business News",
  date: "23 October 2026",
  image: TAIPEI,
  art: "taitronics", // its cover: the same art as its cards
  lead:
    "At TAITRONICS 2026 in Taipei, Mexico Business News met founders at the Big Bang Startup Pavilion whose products take on everyday operational bottlenecks: alert fatigue, data-privacy risk, strict procurement rules. QuantHive was among them, demonstrating Flash, its enterprise analytics system for regulated industries.",
  body: [
    { type: "h2", text: "Enterprise AI that stays behind the firewall" },
    {
      type: "p",
      text: "Generative AI has spread quickly through business, but leadership teams remain wary of two things: confidential data leaking out, and models inventing numbers in the reports they rely on. Flash answers the first by running entirely on-premises, on dedicated edge hardware such as NVIDIA GB10 modules, so a company's proprietary financial and operational metrics never leave its own infrastructure.",
    },
    {
      type: "p",
      text: "For Harkishan Singh Baniya, QuantHive's Co-Founder and CEO, enterprise data privacy is “non-negotiable” — the starting point of the design rather than a feature added later.",
    },
    { type: "h2", text: "Language models as parsers, not calculators" },
    {
      type: "p",
      text: "Flash answers the second by keeping language models away from the arithmetic. A model is used only to understand the question: it turns a plain-language prompt into a domain-specific language (DSL). A deterministic compiler then runs that program against the company's own CRM, ERP and SQL databases.",
    },
    {
      type: "p",
      text: "Because the compiler follows fixed logic, the same question always produces the same calculation, and every figure can be checked — in seconds rather than days.",
    },
    { type: "h2", text: "Built for regulated work" },
    {
      type: "p",
      text: "The architecture was first developed for M&A due diligence and private-equity analysis, where an unverifiable number is a liability. It is now aimed at other heavily regulated corporate settings, including auditing, corporate governance and financial services.",
    },
    { type: "h2", text: "Why Taiwan" },
    {
      type: "p",
      text: "QuantHive sees Taiwan as a strategic base for East Asia: a place from which to run operations and reach the region's major financial and manufacturing markets, among them Japan, Hong Kong, Singapore and Malaysia.",
    },
  ],
  reference: {
    label: "Read the full report on Mexico Business News",
    source: "Mexico Business News",
    href: "https://mexicobusiness.news/tech/news/taitronics-2026-startups-target-real-world-operational-friction",
  },
};

export const NEWS: NewsItem[] = [
  {
    title: "QuantHive At Taitronics 2026", // as its article's
    where: "Taipei, Taiwan",
    when: "20/10 - 22/10",
    featured: {
      label: "Event Announcement",
      title: "We’re Exhibiting at TAITRONICS & AIoT Taiwan, 2026",
      summary: "Showcasing our innovations at TAITRONICS & AIoT Taiwan in Taipei, Taiwan.",
      when: "20 Oct - 22 Oct",
    },
    art: "taitronics",
    article: TAITRONICS_2026,
  },
  // Places held for news still to come (`soon`): replace each with the real
  // item, and drop `soon`, once there's something to say.
  {
    title: "Our next announcement is on its way",
    where: "Chennai, India",
    when: "Stay tuned",
    soon: true,
  },
  {
    title: "QuantHive product launch",
    where: "Chennai, India",
    when: "Stay tuned",
    soon: true,
  },
];

/** Every news item's page, for the router and the build. */
export const NEWS_ARTICLES: Article[] = NEWS.flatMap((item) => (item.article ? [item.article] : []));

export const newsArticleBySlug = (slug: string) => NEWS_ARTICLES.find((article) => article.slug === slug);
