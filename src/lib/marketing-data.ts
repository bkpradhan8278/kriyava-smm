/**
 * Kriyava SMM marketing page content.
 *
 * GROUNDING: the panel carries 2,209 services across 259 provider categories,
 * fetched live from smm-api.kriyava.com. Those categories are provider-supplied
 * strings full of emoji and decorative unicode — useful in the order form,
 * useless as URLs. These pages are the platform-level layer above them, which
 * is also how people search: "buy instagram followers india", not the name of a
 * provider's category.
 *
 * HONESTY RULE — this category is full of copy that gets people banned.
 *
 * Nothing here says safe, undetectable, permanent, guaranteed, or organic about
 * paid engagement. It is not organic; every platform's terms prohibit buying
 * it; accounts do get actioned. Saying otherwise sells one order and loses the
 * customer, and it is the kind of claim a consumer regulator reads literally.
 *
 * What the pages do instead: say plainly what is being bought, what delivery
 * and refill actually mean, and where the real risk sits. A reseller who knows
 * what they are buying comes back; one who was told it was risk-free does not.
 *
 * No customer counts, no ratings, no testimonials.
 */

export const SITE = {
  url: "https://smm.kriyava.com",
  brand: "Kriyava SMM",
  parentUrl: "https://kriyava.com",
  contact: "hello@kriyava.com",
} as const;

export type ServicePage = {
  slug: string;
  navLabel: string;
  platform: string;
  intent: string;
  title: string;
  description: string;
  h1: string;
  lede: string;
  /** What is actually delivered. Concrete, not aspirational. */
  what: string[];
  /** The honest caveat for this specific service type. */
  caveat: string;
  faqs: Array<[string, string]>;
};

const SHARED_FAQS: Array<[string, string]> = [
  [
    "How does ordering work?",
    "Top up the wallet, pick a service, paste the link, set the quantity. The order goes to the provider and you watch the status in the panel. There is no monthly subscription — you spend what you load.",
  ],
  [
    "What does a refill guarantee actually cover?",
    "If the count drops within the service's stated refill window, you can request a refill and the provider tops it back up. It is not a promise that nothing will ever drop — it is a window in which drops get replaced. Read the window on the service before ordering; it varies a lot.",
  ],
  [
    "Can my account get banned?",
    "Buying engagement is against every major platform's terms of service. In practice, accounts are more often quietly filtered than banned, but the risk is real and no panel can remove it. Anyone telling you their service is undetectable is selling you something they cannot deliver.",
  ],
  [
    "Why do prices differ so much for the same thing?",
    "Source and retention. Cheap volume drops fast and is filtered aggressively; higher-priced services come from better sources and hold longer. The price is usually telling you the truth about the quality.",
  ],
];

export const SERVICE_PAGES: ServicePage[] = [
  {
    slug: "instagram-followers",
    navLabel: "Instagram followers",
    platform: "Instagram",
    intent: "buy instagram followers india",
    title: "Instagram followers — Kriyava SMM panel",
    description:
      "Instagram follower services at reseller pricing, including India-targeted options, with refill windows stated per service and wallet-based ordering.",
    h1: "Instagram followers, at panel pricing",
    lede:
      "Follower services vary more than any other category on the panel — by source, by retention, and by whether the accounts look like they came from anywhere near your audience.",
    what: [
      "India-targeted follower services alongside global",
      "Refill windows stated per service before you order",
      "Wallet-based ordering — no subscription",
      "Order status and history in the panel",
    ],
    caveat:
      "Followers do not bring engagement with them. A jump in follower count with flat likes and comments is visible to anyone reading the account, and Instagram's own reach algorithm reads the ratio too — a large audience that never interacts can suppress the reach of the posts you actually care about. This is worth knowing before you buy volume.",
    faqs: [
      [
        "Do bought followers engage with posts?",
        "No. Follower services deliver follows, not engagement. If engagement is what you need, that is a different service and buying followers will not produce it.",
      ],
      [
        "Will it hurt my reach?",
        "It can. Instagram weighs how much of your audience interacts with what you post, so adding audience that never does lowers that ratio. Whether that matters depends on what the account is for.",
      ],
      ...SHARED_FAQS,
    ],
  },
  {
    slug: "instagram-likes",
    navLabel: "Instagram likes",
    platform: "Instagram",
    intent: "buy instagram likes",
    title: "Instagram likes — Kriyava SMM panel",
    description:
      "Instagram like services with per-service refill windows, instant and drip options, ordered from a prepaid wallet.",
    h1: "Instagram likes",
    lede:
      "Likes are the fastest-delivering category on the panel and the one where timing matters most — a post gets its reach decision in the first hour.",
    what: [
      "Instant and gradual delivery options",
      "Reels, posts and story services",
      "Refill windows stated per service",
      "Bulk ordering across multiple posts",
    ],
    caveat:
      "Likes on a post with no comments and no saves read as bought to a human, whatever the platform does. If the point is social proof for people rather than for an algorithm, the mix matters more than the number.",
    faqs: SHARED_FAQS,
  },
  {
    slug: "instagram-views",
    navLabel: "Instagram views",
    platform: "Instagram",
    intent: "buy instagram reel views",
    title: "Instagram reel and story views — Kriyava SMM panel",
    description:
      "Reel views, story views and impression services for Instagram, with delivery and refill terms stated per service.",
    h1: "Instagram reel and story views",
    lede:
      "Views are the cheapest and least risky category here, because a view is a weaker signal than a follow or a like — which cuts both ways.",
    what: [
      "Reel and video view services",
      "Story view services",
      "Impressions, reach and saves as separate services",
      "High-volume options for launches",
    ],
    caveat:
      "Views alone move very little. They make a post look busier without changing whether anyone acted on it, and Instagram's ranking cares far more about saves, shares and watch-through than raw view count.",
    faqs: SHARED_FAQS,
  },
  {
    slug: "youtube-views",
    navLabel: "YouTube views",
    platform: "YouTube",
    intent: "buy youtube views india",
    title: "YouTube views — Kriyava SMM panel",
    description:
      "YouTube view services with retention options and stated refill windows, ordered from a prepaid wallet at reseller pricing.",
    h1: "YouTube views",
    lede:
      "YouTube is the strictest platform on this panel. It audits view sources continuously and removes what it does not accept, which is why retention and source matter far more here than price.",
    what: [
      "View services with different retention profiles",
      "Gradual delivery options",
      "Refill windows stated per service",
      "Live-stream viewer services listed separately",
    ],
    caveat:
      "YouTube regularly removes views it judges invalid, sometimes weeks later, and it does this to bought and organic traffic alike. Monetised channels carry real risk here — YouTube's monetisation policies treat artificial traffic as a violation, and the consequence is the channel's revenue, not just the video.",
    faqs: [
      [
        "Is this safe for a monetised channel?",
        "No, and we will not pretend otherwise. YouTube's monetisation policies treat artificial traffic as a violation. If the channel earns money, the downside is the earnings.",
      ],
      ...SHARED_FAQS,
    ],
  },
  {
    slug: "youtube-subscribers",
    navLabel: "YouTube subscribers",
    platform: "YouTube",
    intent: "buy youtube subscribers",
    title: "YouTube subscribers — Kriyava SMM panel",
    description:
      "YouTube subscriber services with per-service refill windows and gradual delivery, ordered from a prepaid wallet.",
    h1: "YouTube subscribers",
    lede:
      "Subscriber counts are the most visible vanity number on YouTube and the one the platform watches most closely.",
    what: [
      "Gradual delivery to avoid an obvious spike",
      "Refill windows stated per service",
      "Wallet-based ordering",
    ],
    caveat:
      "Subscribers who never watch lower the proportion of your subscriber base that shows up for a new video, which is a signal YouTube uses when deciding whether to recommend it. Buying subscribers can therefore make the next video reach fewer people, not more.",
    faqs: SHARED_FAQS,
  },
  {
    slug: "telegram-members",
    navLabel: "Telegram members",
    platform: "Telegram",
    intent: "buy telegram members india",
    title: "Telegram channel and group members — Kriyava SMM panel",
    description:
      "Telegram member services including country-targeted and premium options, plus post views, reactions and bot starts.",
    h1: "Telegram members, views and reactions",
    lede:
      "Telegram is the deepest category on this panel — members, post views, reactions and bot starts, with country targeting on most of them.",
    what: [
      "Channel and group member services",
      "Country-targeted and premium member options",
      "Post views — last post or across recent posts",
      "Reactions and bot-start services",
    ],
    caveat:
      "Telegram removes inactive and flagged accounts in periodic sweeps, so member counts here move more than on other platforms. The refill window on the specific service is what determines whether that is your problem or the provider's.",
    faqs: SHARED_FAQS,
  },
  {
    slug: "spotify-plays",
    navLabel: "Spotify plays",
    platform: "Spotify",
    intent: "buy spotify plays india",
    title: "Spotify plays, followers and playlist services — Kriyava SMM panel",
    description:
      "Country-targeted Spotify play, follower, save and playlist services, with slow-delivery options and stated refill terms.",
    h1: "Spotify plays and followers",
    lede:
      "The largest single category on the panel, and the one where country targeting matters most — royalty rates and playlist behaviour both vary by market.",
    what: [
      "Country-targeted track plays and playlist plays",
      "Slow-delivery services for a natural curve",
      "Followers and saves as separate services",
      "Combined packages — plays plus followers plus saves",
    ],
    caveat:
      "Spotify audits streams and withholds royalties on ones it judges artificial, and labels and distributors act on it too. Artificial streaming is grounds for a distributor to drop a release. This is the category where the consequence is contractual rather than just a lost count.",
    faqs: SHARED_FAQS,
  },
  {
    slug: "twitter-followers",
    navLabel: "X / Twitter",
    platform: "X (Twitter)",
    intent: "buy twitter followers india",
    title: "X (Twitter) followers, likes and engagement — Kriyava SMM panel",
    description:
      "Follower, like and comment services for X with country-targeted options, ordered from a prepaid wallet.",
    h1: "X (Twitter) followers and engagement",
    lede:
      "X moves fast and its counts move with it. Country-targeted services and organic-language comment packages are the two things worth paying more for here.",
    what: [
      "Country-targeted follower and like services",
      "Organic-language comment packages",
      "Retweet and view services",
      "Refill windows stated per service",
    ],
    caveat:
      "X periodically purges accounts in bulk, and bought followers are disproportionately what gets removed. Expect the count to move after a purge regardless of what any refill window says.",
    faqs: SHARED_FAQS,
  },
  {
    slug: "website-traffic",
    navLabel: "Website traffic",
    platform: "Web",
    intent: "buy website traffic india",
    title: "Website traffic services — Kriyava SMM panel",
    description:
      "Geo-targeted website traffic with referrer selection, including India, UK and US sources, and mobile traffic options.",
    h1: "Website traffic, geo-targeted",
    lede:
      "Traffic services deliver visits with a chosen country and referrer. What they do not deliver is anyone who wanted to be there.",
    what: [
      "Geo-targeted traffic — India, UK, US and more",
      "Choose the referrer the visit appears to come from",
      "Mobile-specific traffic options",
      "High-volume packages",
    ],
    caveat:
      "This will not help you rank. Google does not use third-party traffic as a ranking signal, and traffic that arrives and leaves immediately makes your analytics less useful, not more. It has legitimate uses — load testing, demonstrating a funnel, filling a dashboard for a demo — and improving search position is not one of them. If ranking is the goal, that is SEO work, not a traffic order.",
    faqs: [
      [
        "Will this improve my Google ranking?",
        "No. Google does not rank on third-party traffic volume, and bounce behaviour from purchased visits is if anything a negative signal in your own analytics. Anyone selling traffic as an SEO service is misrepresenting it.",
      ],
      ...SHARED_FAQS,
    ],
  },
];

export const ALL_MARKETING_PATHS = SERVICE_PAGES.map((p) => `/${p.slug}`);

export function serviceBySlug(slug: string) {
  return SERVICE_PAGES.find((p) => p.slug === slug);
}
