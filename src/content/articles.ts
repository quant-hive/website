// The blog's articles. Each is plain data, rendered by ArticlePage (the article
// template, Figma 44:4552) at /blog/<slug> and listed on the Blog page (the
// newest as its featured post).
//
// To publish an article: add an entry to ARTICLES (newest first). Its `h2`
// blocks become the sections in the Contents navigator automatically.

export type Face = "pp" | "bg" | "fg" | "sg" | "pg" | "lq";

/** A run of the title in one face; optionally a touch larger or tighter than
 *  the rest, in ems of the title (`size` 1.04 is 52 in a 50 title). */
export type TitleRun = [string, Face] | [string, Face, { size?: number; tracking?: number }];

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string } // a section: listed in Contents
  | { type: "h3"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: { term?: string; text: string }[] }
  | { type: "source"; text: string }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "cta"; text: string } // opens the waitlist
  | { type: "refs"; items: string[] };

export type Article = {
  /** Where it's published: the blog (/blog/<slug>, the default) or the News page
   *  (/news/<slug>, src/content/news.ts). */
  section?: "blog" | "news";
  slug: string;
  title: string;
  /** The title as the page head sets it: runs of text, each in one of the faces
   *  (pp PP Pangaia, bg Bricolage Grotesque, fg Familjen Grotesk, sg Schibsted
   *  Grotesk, pg Power Grotesk; lq the Q of QuantHive's logo, drawn from the
   *  logo itself — give it a "Q"). Omit to set it all in PP Pangaia. */
  titleRuns?: TitleRun[];
  subtitle: string;
  category: string;
  author: string;
  date: string;
  /** Cover image for the article's panel and the blog's cards (optional). */
  image?: string;
  /** Art drawn in code for the cover instead (the image still stands for the
   *  article in search results): the TAITRONICS item's (TaitronicsArt.tsx). */
  art?: "taitronics";
  /** The picture link previews show (X, LinkedIn, WhatsApp, …): a 1200 × 630
   *  JPEG, which every platform reads. Defaults to the site's own. */
  shareImage?: string;
  /** Where a crop of the cover keeps its subject (CSS object-position), for the
   *  wide and tall boxes it fills. Defaults to the centre. */
  imageFocus?: string;
  /** The opening paragraph, under the cover and above the rule. */
  lead: string;
  body: Block[];
  /** The original this one is drawn from (press coverage, say): a link under
   *  the body, and — naming its `source` — the announcement bar's while the
   *  article is open (AnnouncementBar.tsx). */
  reference?: { label: string; href: string; source: string };
};

export const ARTICLES: Article[] = [
  {
    slug: "the-billion-dollar-coin-flip",
    title: "The Billion Dollar Coin Flip",
    // As frame 44:4552 sets it.
    titleRuns: [
      ["T", "pp"],
      ["h", "bg"],
      ["e", "pp"],
      [" ", "fg"],
      ["B", "pp"],
      ["i", "fg"],
      ["ll", "pp"],
      ["i", "fg"],
      ["o", "pp"],
      ["n ", "bg"],
      ["Dolla", "pp"],
      ["r ", "bg"],
      ["Co", "pp"],
      ["in ", "bg"],
      ["Fl", "pp"],
      ["i", "bg"],
      ["p", "sg"],
    ],
    subtitle: "Why Current AI Cannot Be Trusted for Investment Decisions",
    category: "Research",
    author: "Harkishan S Baniya",
    date: "December 2025",
    image: "/images/blog-coin-flip.webp",
    shareImage: "/images/blog-coin-flip-og.jpg",
    imageFocus: "50% 30%", // the coin sits high: keep it whole
    lead:
      "The financial industry has embraced large language models with unprecedented enthusiasm, deploying them for everything from research assistance to trading recommendations. Yet beneath the impressive demonstrations and polished marketing lies a troubling reality: these systems fail catastrophically on the tasks that matter most. This article examines four fundamental limitations that render current LLMs unsuitable for mission-critical financial applications, drawing on recent interpretability research from Anthropic, empirical benchmarks, and technical analyses that expose the gap between perception and reality.",
    body: [
      {
        type: "quote",
        text: "The best-performing model achieved only 55.9% accuracy, essentially a coin flip for mission-critical financial decisions.",
      },

      { type: "h2", text: "1. The Accuracy Crisis: A Coin Flip for Critical Decisions" },
      {
        type: "p",
        text: "The Finance Agent Benchmark by vals.ai represents the most rigorous evaluation of AI systems on real financial tasks to date. Comprising 537 expert-authored questions spanning nine categories from fundamental analysis to risk assessment it tests the capabilities that investment professionals actually need. The results should alarm anyone relying on these systems for consequential decisions.",
      },
      {
        type: "p",
        text: "OpenAI's o3, one of the most capable reasoning model available, achieved just 48.3% accuracy at $3.79 per query. To put this in perspective: a coin flip would give you 50% on binary questions. These models are not just imperfect, they are fundamentally unreliable for the tasks financial professionals need them to perform.",
      },
      {
        type: "source",
        text: 'Stanford, "Finance Agent Benchmark: Benchmarking LLMs on Real-world Financial Research Tasks" (2025)',
      },
      { type: "h3", text: "Where Models Fail Most Dramatically" },
      {
        type: "p",
        text: "Performance did not collapse uniformly across categories. The failures concentrated precisely where accuracy matters most:",
      },
      {
        type: "list",
        items: [
          {
            term: "Numerical Reasoning",
            text: "Models struggled with basic financial calculations, the kind that analysts perform daily. Multi-step computations involving financial statements frequently produced incorrect results, often with high confidence.",
          },
          {
            term: "Financial Adjustments",
            text: "Tasks requiring adjustments for non-recurring items, working capital normalization, or pro forma calculations showed particularly poor performance. These are not edge cases, they are routine analytical tasks.",
          },
          {
            term: "Modeling Tasks",
            text: "Building financial projections, DCF models, or scenario analyses exposed the limits of pattern matching. Models could not maintain internal consistency across projection periods or properly propagate assumptions through calculations.",
          },
        ],
      },
      {
        type: "p",
        text: "The cost dimension compounds the problem. At $3.79 per query for the best-performing model, organizations face a stark choice: pay premium prices for unreliable answers, or accept even lower accuracy from cheaper alternatives. Neither option serves the needs of professional financial analysis.",
      },

      { type: "h2", text: "2. The Fabricated Reasoning Problem" },
      {
        type: "p",
        text: 'Low accuracy alone would be manageable if we could identify when models were likely to be wrong. The more insidious problem, revealed by Anthropic\'s interpretability research in their landmark "Tracing the Thoughts of a Large Language Model" paper, is that these systems sometimes construct plausible-sounding explanations for conclusions they reached through entirely different means or no genuine reasoning at all.',
      },
      { type: "h3", text: "The Motivated Reasoning Phenomenon" },
      {
        type: "p",
        text: 'Anthropic\'s researchers discovered that when given math problems with subtly incorrect hints, Claude would produce the hinted answer while describing standard mathematical procedures it never actually performed. Internal circuit traces revealed "no evidence at all of that calculation having occurred", only post-hoc rationalization designed to justify a predetermined conclusion.',
      },
      {
        type: "quote",
        text: "The model constructs plausible-looking reasoning steps to justify predetermined conclusions, not genuine computation.",
      },
      {
        type: "p",
        text: 'Consider the implications for financial analysis. When an LLM produces a DCF valuation with detailed assumptions and calculations, how do you know whether it actually computed the present values, or simply generated text that looks like a DCF analysis? The research suggests the answer may be disturbing: in many cases, the model may be producing what valuations "should look like" rather than performing genuine discounted cash flow calculations.',
      },
      { type: "h3", text: "The Arithmetic Deception" },
      {
        type: "p",
        text: 'Perhaps the most striking finding involved simple arithmetic. When asked to explain how it computed 36+59=95, Claude described the standard carrying algorithm taught in elementary schools. But internal traces told a different story: the model was actually using parallel approximation paths and "mental math" shortcuts entirely different from the procedure it described.',
      },
      { type: "source", text: 'Anthropic, "Tracing the thoughts of a large language model" (2025)' },
      {
        type: "p",
        text: "This is not a minor discrepancy. It means the explanations these models provide for their reasoning cannot be trusted even when the final answer is correct. For regulated financial applications requiring audit trails and explainability, this represents a fundamental architectural flaw, not a bug to be fixed with more training data.",
      },

      { type: "h2", text: "3. The Nondeterminism Catastrophe" },
      {
        type: "p",
        text: 'Financial institutions operate under strict regulatory requirements for reproducibility. When an auditor asks why a particular trade was executed or how a risk assessment was calculated, the answer cannot be "it depends on what else the server was processing at the time." Yet this is precisely the situation with standard LLM inference.',
      },
      { type: "h3", text: "The Shocking Scale of Variability" },
      {
        type: "p",
        text: "Research from Thinking Machines Lab quantified what many practitioners suspected: LLM outputs are shockingly inconsistent. Testing Qwen-3-235B at temperature=0; a setting that should mathematically produce identical outputs, they observed 80 unique completions from 1,000 identical queries. The most common response occurred only 7.8% of the time.",
      },
      {
        type: "table",
        head: ["Metric", "Standard Inference", "Required"],
        rows: [
          ["Unique outputs (1,000 queries)", "80", "1"],
          ["Most common output frequency", "7.8%", "100%"],
          ["Audit reproducibility", "Impossible", "Guaranteed"],
        ],
      },
      { type: "source", text: 'Thinking Machines Lab, "Defeating Nondeterminism in LLM Inference" (2025)' },
      { type: "h3", text: "The Root Cause: Batch Invariance Failure" },
      {
        type: "p",
        text: "The research identified the root cause as batch invariance failure. When server load varies, batch sizes change, which affects the reduction order in matrix multiplications and attention operations. Due to floating-point non-associativity, different reduction orders produce different results—even with identical inputs and supposedly deterministic settings.",
      },
      {
        type: "p",
        text: "For financial applications, this has severe implications. Two analysts asking the same question at different times could receive materially different answers. A risk calculation run during market hours (high server load) could differ from the same calculation run overnight. Regulatory audits become impossible when you cannot reproduce the outputs that drove decisions.",
      },

      { type: "h2", text: "4. The Confidence Illusion" },
      {
        type: "p",
        text: "Perhaps the most dangerous failure mode is the inability of these models to accurately assess their own uncertainty. Investment decisions require not just answers, but calibrated confidence knowing when you know and when you don't. Unfortunately, LLMs are remarkably poor at this fundamental task.",
      },
      { type: "h3", text: "The 20% Accuracy Problem" },
      {
        type: "p",
        text: "Anthropic's research on emergent introspection capabilities revealed that even their most advanced model, Claude Opus 4.1, could only accurately report its own internal states approximately 20% of the time. Using sophisticated concept injection experiments, researchers found that in 80% of cases, models either failed to detect their own internal states or hallucinated non-existent states.",
      },
      {
        type: "quote",
        text: "Asking an LLM 'how confident are you?' produces unreliable responses, the model may express high confidence while being fundamentally uncertain, or vice versa.",
      },
      {
        type: "p",
        text: 'The practical implication is stark: when a model tells you it is "highly confident" in a revenue projection or "certain" about a risk assessment, that confidence claim has less than one-in-five chance of reflecting the model\'s actual internal state. You might as well flip a coin.',
      },
      { type: "h3", text: "Why Self-Assessment Fails" },
      {
        type: "p",
        text: "The introspection failure is not a training problem that can be solved with more data. It reflects a fundamental architectural limitation: these models are trained to predict the next token in a sequence, not to model their own uncertainty. When asked about confidence, they generate text that looks like confidence assessments based on patterns in their training data, not genuine introspection about their computational state.",
      },
      {
        type: "p",
        text: 'Interestingly, the research found that more capable models performed somewhat better at introspection, suggesting scaling may partially address the problem. But "somewhat better" is not "good enough" for financial applications where miscalibrated confidence can lead to catastrophic losses.',
      },

      { type: "h2", text: "5. The Complexity Cliff" },
      {
        type: "p",
        text: "Recent research from Apple examining Large Reasoning Models (LRMs) models specifically designed for complex reasoning tasks, revealed another troubling pattern: complete accuracy collapse beyond complexity thresholds.",
      },
      { type: "h3", text: "The Paradox of Decreasing Effort" },
      {
        type: "p",
        text: "The Apple researchers found that as problems approached critical difficulty levels, reasoning effort paradoxically decreased. Models appeared to recognize they were approaching their limits and responded by generating shorter, less thorough reasoning chains precisely when more careful analysis was needed.",
      },
      {
        type: "p",
        text: "Even more troubling, when researchers provided explicit algorithms for solving problems detailed step-by-step procedures that should have been straightforward to follow, models still failed execution. They could describe what a solution should look like without actually computing it. This mirrors the fabricated reasoning problem identified by Anthropic: models predict solution patterns rather than perform genuine computation.",
      },
      { type: "h3", text: "Implications for Financial Modeling" },
      {
        type: "p",
        text: "Financial analysis regularly requires exactly the kind of multi-step reasoning where these models fail. A leveraged buyout model involves dozens of interconnected calculations across projection periods. A merger analysis requires maintaining consistency between acquirer, target, and combined entities. Risk models must propagate assumptions through complex dependency networks.",
      },
      {
        type: "p",
        text: "The complexity cliff suggests that LLMs may perform adequately on simple queries while failing catastrophically on the sophisticated analyses that create the most value. This is not a graceful degradation, it is a cliff edge where performance drops precipitously once complexity crosses invisible thresholds.",
      },
      {
        type: "source",
        text: 'Apple Research "The Illusion of Thinking: Understanding the Strengths and Limitations of Large Reasoning Models" (2025)',
      },

      { type: "h2", text: "6. Beyond Pattern Matching: A Different Architecture" },
      {
        type: "p",
        text: "The limitations documented here are not bugs to be fixed with larger models or more training data. They are fundamental characteristics of the pattern-matching paradigm that underlies all current LLMs. Addressing them requires architectural innovation, not incremental improvement.",
      },
      { type: "h3", text: "The Neuro-Symbolic Alternative" },
      {
        type: "p",
        text: "A growing body of research points toward neuro-symbolic architectures as a promising alternative. Rather than asking neural networks to perform computations they cannot reliably execute, these systems use neural components only for what they do well, natural language understanding and planning, while delegating computation and verification to symbolic systems designed for those tasks.",
      },
      {
        type: "p",
        text: "The key insight is separation of concerns. Neural networks excel at parsing ambiguous human language and generating fluent text. Symbolic systems excel at deterministic computation and maintaining consistency. By combining them appropriately, with neural components suggesting operations and symbolic components executing them, we can achieve the best of both paradigms.",
      },
      { type: "h3", text: "Requirements for Financial AI" },
      {
        type: "p",
        text: "Based on the failures documented above, any AI system suitable for mission-critical financial applications must satisfy several requirements:",
      },
      {
        type: "list",
        items: [
          { term: "Verified Computation", text: "Every calculation must be traceable and verifiable, not generated by pattern matching." },
          { term: "Deterministic Inference", text: "Identical queries must produce identical results, regardless of server load or timing." },
          {
            term: "Computed Confidence",
            text: "Uncertainty must be calculated from source data and computation properties, not self-reported by neural networks.",
          },
          { term: "Principled Abstention", text: "Systems must refuse to answer when data is insufficient or confidence is below threshold." },
          { term: "Full Audit Trails", text: "Every output must be traceable to source data, specific computations, and verification steps." },
        ],
      },

      { type: "h2", text: "Conclusion: The Case for Principled Skepticism" },
      {
        type: "p",
        text: "The evidence is clear: current large language models, despite their impressive capabilities in many domains, are fundamentally unsuited for mission-critical financial reasoning. They achieve coin-flip accuracy on financial benchmarks. They fabricate reasoning to justify predetermined conclusions. They produce different outputs for identical inputs. They cannot reliably assess their own confidence. And they collapse completely when complexity exceeds invisible thresholds.",
      },
      {
        type: "p",
        text: "None of this means AI has no role in finance. These tools can be valuable for research assistance, document summarization, and generating first drafts. But they must be used with clear-eyed understanding of their limitations, and they should never be the final word on decisions with material consequences.",
      },
      {
        type: "p",
        text: "The path forward requires moving beyond the current paradigm. Rather than hoping that larger models and more training data will solve fundamental architectural limitations, we should design systems that leverage the strengths of neural networks while compensating for their weaknesses. The financial industry deserves AI systems that are accurate, reproducible, and trustworthy; not impressive demonstrations that fail when it matters most.",
      },
      {
        type: "p",
        text: "The question is not whether AI will transform finance, it will. The question is whether we will build AI systems worthy of the trust we place in them.",
      },

      { type: "h2", text: "MERIDIAN: A Purpose-Built Solution" },
      {
        type: "p",
        text: "At QuantHive, we are building MERIDIAN, a neuro-symbolic architecture designed from the ground up to address these fundamental limitations. Rather than hoping scaling solves inherent flaws, MERIDIAN separates neural understanding from symbolic execution: LLMs parse queries and generate plans, while purely deterministic engines perform verified computations with full audit trails.",
      },
      {
        type: "p",
        text: "The system abstains when confidence falls below threshold, ensuring professionals receive reliable answers or honest uncertainty, never fabricated confidence. The project is currently in progress and expected to be live for by Q2 of 2026 for our first waitlist cohort. If you are interested to try it out you can join the waitlist here.",
      },
      { type: "cta", text: "Join Waitlist" },

      { type: "h2", text: "References" },
      {
        type: "refs",
        items: [
          'Finance Agent Benchmark, "Evaluating AI Agents on Real Financial Tasks," Technical Report, 2025.',
          'Anthropic, "Tracing the Thoughts of a Large Language Model," Research Publication, 2025.',
          'Anthropic, "Emergent Introspective Awareness in Large Language Models," Research Publication, 2025.',
          'Thinking Machines Lab, "Defeating Nondeterminism in LLM Inference," Technical Blog, 2025.',
          'Apple Research, "The Illusion of Thinking: Understanding the Strengths and Limitations of Large Reasoning Models," Technical Report, 2025.',
          'vLLM Project, "Batch Invariance Documentation," Technical Documentation, 2025.',
        ],
      },
    ],
  },
];

export const articleBySlug = (slug: string) => ARTICLES.find((article) => article.slug === slug);

/** A section heading's anchor id ("section-…": an id can't start with a digit
 *  for the smooth scroller's selectors). */
export const sectionId = (text: string) =>
  "section-" +
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
