// What search engines and link previews see of each page: its title (the tab's
// too), a description, and the structured data (schema.org JSON-LD) that says
// what the page is. Used in the browser (src/lib/seo.ts, as the page changes)
// and by the build (scripts/seo.ts), which writes each page's head into its own
// HTML file so crawlers read it without running the app.
//
// The descriptions say what QuantHive actually does, in the words people
// search with; nothing here appears on the pages themselves.

import { ARTICLES, type Article } from "./articles";
import { NEWS_ARTICLES } from "./news";
import { POSITIONS } from "./careers";

export const SITE = "https://quanthive.in";
export const SITE_NAME = "QuantHive";
export const OG_IMAGE = `${SITE}/images/og-quanthive.jpg`;
export const LOGO = `${SITE}/images/quanthive-logo.png`;

export type PageSeo = {
  path: string;
  title: string;
  description: string;
  /** Search engines shouldn't list it (e.g. the under-maintenance page). */
  noindex?: boolean;
  /** Extra structured data for this page, beside the organisation's. */
  jsonLd?: object[];
  /** For link previews: "website" or "article". */
  type?: "website" | "article";
  /** For link previews: the picture (an absolute URL); the site's own if unset. */
  image?: string;
  /** How often it changes and its weight, for the sitemap. */
  changefreq?: "weekly" | "monthly" | "yearly";
  priority?: number;
};

const ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "3rd floor, D Block, IITM Research Park, Taramani",
  addressLocality: "Chennai",
  addressRegion: "Tamil Nadu",
  postalCode: "600113",
  addressCountry: "IN",
};

/** Who QuantHive is: on every page. */
export const ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE}/#organization`,
  name: "QuantHive",
  legalName: "QuantHive Research Technologies Pvt Ltd",
  url: SITE,
  logo: LOGO,
  description:
    "QuantHive is a deep-tech company from IIT Madras Research Park building AI-powered financial analytics and quantitative finance tools for investment research.",
  email: "contact@quanthive.in",
  address: ADDRESS,
  foundingLocation: "IIT Madras Research Park, Chennai, India",
  knowsAbout: [
    "Quantitative finance",
    "Financial analytics",
    "Investment research",
    "Artificial intelligence in finance",
    "Explainable AI",
    "Stock market analysis",
    "Algorithmic trading",
    "Backtesting",
    "Risk profiling",
    "Portfolio optimization",
  ],
  founder: [
    {
      "@type": "Person",
      name: "Harkishan Singh Baniya",
      jobTitle: "Co-Founder & CEO",
      sameAs: ["https://www.linkedin.com/in/harkishan/"],
    },
    {
      "@type": "Person",
      name: "Neelesh S Upadhye",
      jobTitle: "Co-Founder & Advisor",
      sameAs: ["https://www.linkedin.com/in/neelesh-upadhye-3b031956/"],
    },
  ],
  sameAs: ["https://www.linkedin.com/company/quanthive/"],
};

/** The site itself: on every page. */
export const WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE}/#website`,
  name: SITE_NAME,
  url: SITE,
  publisher: { "@id": `${SITE}/#organization` },
  inLanguage: "en",
};

const FLASH_APP = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Flash",
  url: `${SITE}/flash`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  description:
    "Flash is an AI research analyst for investors and traders: research companies, screen stocks and run backtests from one research desk, built on explainable AI and quantitative finance.",
  publisher: { "@id": `${SITE}/#organization` },
};

const DATE_POSTED = "2026-10-16";

/** Each open role, as a job posting (search engines' job listings). */
const JOB_POSTINGS = POSITIONS.map((position) => ({
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title: position.role,
  description: `<p>${position.summary}</p><p>${position.requirement}. ${position.mode}. Duration: ${position.term.replace(/\s*\(\s*/g, " (").replace(/\s*\)/g, ")")}.</p>`,
  datePosted: DATE_POSTED,
  employmentType: position.employment,
  hiringOrganization: { "@type": "Organization", name: "QuantHive", sameAs: SITE, logo: LOGO },
  jobLocation: { "@type": "Place", address: ADDRESS },
  // "Remote / On Site": open to remote applicants in India too.
  jobLocationType: "TELECOMMUTE",
  applicantLocationRequirements: { "@type": "Country", name: "India" },
  directApply: true,
  url: `${SITE}/careers`,
}));

const breadcrumbs = (trail: [name: string, path: string][]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map(([name, path], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name,
    item: `${SITE}${path}`,
  })),
});

/** The site's pages, by path. */
export const PAGES: PageSeo[] = [
  {
    path: "/",
    title: "QuantHive | Financial Analytics Made Easy",
    description:
      "QuantHive builds AI-powered financial analytics and quantitative finance tools for investment research, stock market analysis and trading. A deep-tech company from IIT Madras Research Park.",
    changefreq: "weekly",
    priority: 1,
  },
  {
    path: "/flash",
    title: "Flash | QuantHive",
    description:
      "Flash is QuantHive's AI research analyst for investors and traders: research companies, screen stocks and run backtests in one desk, built on explainable AI and quantitative finance.",
    jsonLd: [FLASH_APP, breadcrumbs([["QuantHive", "/"], ["Flash", "/flash"]])],
    changefreq: "weekly",
    priority: 0.9,
  },
  {
    path: "/about",
    title: "About | QuantHive",
    description:
      "QuantHive Research Technologies, incubated at IIT Madras, builds explainable AI and quantitative models for financial research, risk profiling and investment intelligence.",
    jsonLd: [breadcrumbs([["QuantHive", "/"], ["About", "/about"]])],
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/team",
    title: "Team | QuantHive",
    description:
      "Meet the founding team behind QuantHive: engineers and quantitative finance researchers from IIT Madras, including a former quant desk head at Dolat Capital.",
    jsonLd: [breadcrumbs([["QuantHive", "/"], ["Team", "/team"]])],
    changefreq: "monthly",
    priority: 0.7,
  },
  {
    path: "/careers",
    title: "Careers | QuantHive",
    description:
      "Careers at QuantHive: internships and roles in software engineering, quantitative finance research, backend development and design at IITM Research Park, Chennai, or remote.",
    jsonLd: [...JOB_POSTINGS, breadcrumbs([["QuantHive", "/"], ["Careers", "/careers"]])],
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    path: "/contact",
    title: "Contact | QuantHive",
    description:
      "Contact QuantHive about access to Flash, partnerships and pricing for AI-powered financial analytics. Based at IITM Research Park, Chennai.",
    jsonLd: [breadcrumbs([["QuantHive", "/"], ["Contact", "/contact"]])],
    changefreq: "yearly",
    priority: 0.6,
  },
  {
    path: "/blog",
    title: "Blog | QuantHive",
    description:
      "Research notes from QuantHive on AI in finance, quantitative finance, markets and investment research, and news on the products we build.",
    jsonLd: [breadcrumbs([["QuantHive", "/"], ["Blog", "/blog"]])],
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    path: "/news",
    title: "News | QuantHive",
    description:
      "The latest from QuantHive: milestones, collaborations, events and product launches in AI, quantitative finance and financial technology.",
    jsonLd: [breadcrumbs([["QuantHive", "/"], ["News", "/news"]])],
    changefreq: "weekly",
    priority: 0.7,
  },
  {
    path: "/terms",
    title: "Terms & Conditions | QuantHive",
    description: "The terms that govern use of QuantHive's website, products, APIs and services.",
    changefreq: "yearly",
    priority: 0.3,
  },
  {
    path: "/privacy",
    title: "Privacy Policy | QuantHive",
    description: "How QuantHive collects, uses and protects your information across its website, products and APIs.",
    changefreq: "yearly",
    priority: 0.3,
  },
  {
    path: "/license",
    title: "License | QuantHive",
    description: "The terms for using QuantHive's software, APIs, documentation and media assets.",
    changefreq: "yearly",
    priority: 0.3,
  },
];

/** "December 2025" → "2025-12-01", for structured data. */
function isoDate(date: string) {
  // "December 2025" (the 1st) or "23 October 2026".
  const parsed = new Date(/^\d/.test(date) ? date : `1 ${date}`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString().slice(0, 10);
}

/** About 155 characters for a search result: the subtitle, then the lead
 *  until the room runs out, cut at a word. */
function articleDescription(article: Article) {
  const text = `${article.subtitle.replace(/\.?$/, ".")} ${article.lead}`;
  if (text.length <= 158) return text;
  return `${text.slice(0, 155).replace(/\s+\S*$/, "")}…`;
}

/** An article's page: a blog post, or a news item's (press coverage, its
 *  publisher the author). */
export function articleSeo(article: Article): PageSeo {
  const news = article.section === "news";
  const path = `/${news ? "news" : "blog"}/${article.slug}`;
  const published = isoDate(article.date);
  const description = articleDescription(article);
  return {
    path,
    title: `${article.title} | QuantHive`,
    description,
    type: "article",
    image: article.shareImage ? `${SITE}${article.shareImage}` : undefined,
    changefreq: "monthly",
    priority: 0.7,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": news ? "NewsArticle" : "BlogPosting",
        headline: article.title,
        description,
        articleSection: article.category,
        author: { "@type": news ? "Organization" : "Person", name: article.author },
        publisher: { "@id": `${SITE}/#organization` },
        ...(published ? { datePublished: published } : {}),
        ...(article.reference ? { isBasedOn: article.reference.href } : {}),
        mainEntityOfPage: `${SITE}${path}`,
        image: article.shareImage ? `${SITE}${article.shareImage}` : article.image ? `${SITE}${article.image}` : OG_IMAGE,
      },
      breadcrumbs([["QuantHive", "/"], news ? ["News", "/news"] : ["Blog", "/blog"], [article.title, path]]),
    ],
  };
}

/** Every page with an address of its own: for the build and the sitemap. */
export const ALL_PAGES: PageSeo[] = [...PAGES, ...ARTICLES.map(articleSeo), ...NEWS_ARTICLES.map(articleSeo)];

/** The under-maintenance page: not for listing. */
export const MAINTENANCE_SEO: PageSeo = {
  path: "/maintenance",
  title: "Under maintenance | QuantHive",
  description: "This page of QuantHive's website is being built.",
  noindex: true,
};
