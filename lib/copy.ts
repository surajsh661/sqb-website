/* =============================================================================
 *  ✏️   S'QB  WEBSITE  COPY   —   EDIT  YOUR  WORDS  HERE
 * =============================================================================
 *
 *  Hi Shubham 👋  This one file holds the website's main words (headlines,
 *  paragraphs, founder bios, the contact + footer text). Change the words here
 *  and the website updates after it rebuilds.
 *
 *  ── HOW TO EDIT (only 3 rules) ──────────────────────────────────────────────
 *
 *   1.  Only change the text INSIDE the back-ticks:  `like this`
 *       Don't touch the words before the colon (intro:, heading:, etc.),
 *       the back-ticks themselves, the commas, or any { } [ ] symbols.
 *
 *   2.  Wrap a word in *stars* to give it the gold / italic ACCENT look:
 *          `THE *ENGINE*`        shows ENGINE in the accent style
 *          `LET'S MAKE *SOMETHING*.`
 *
 *   3.  Press Enter inside the back-ticks to start a NEW LINE on the page.
 *
 *  Apostrophes and quotes are fine to type normally inside back-ticks.
 *
 *  ── WHERE OTHER WORDS LIVE ──────────────────────────────────────────────────
 *   • Film / project details, testimonials, client names, creators  → lib/data.ts
 *   • Phone numbers, emails and social links (they double as clickable links)
 *     are kept in code so they always point to the right place — ask the
 *     developer to change those.
 * =========================================================================== */

export const COPY = {
  // ── Opening animation (the big text that flashes on every page load) ──────
  intro: {
    eyebrow: `S'QB PICTURES`,
    // The dot at the end of "TODAY." is added automatically.
    headline: `TELL YOUR *STORY*\nTODAY`,
  },

  // ── Section 02 · "What we believe" (manifesto) ────────────────────────────
  manifesto: {
    eyebrowNumber: `02`,
    eyebrowLabel: `WHAT WE BELIEVE`,
    // NOTE: the big animated headline ("We love filmmaking first and AI
    // second…") has moving icons baked in, so it lives in
    // components/ManifestoHeadline.tsx — ask the developer to change that line.
    paragraph: `S'QB Pictures is a Delhi · Mumbai studio building India's most ambitious AI-enabled films, ads and shows for the country's biggest brands. Story, performance and craft come first — generative pipelines come along to make the impossible shot possible and the impossible deadline real.`,
  },

  // ── Section 03 · Clients ──────────────────────────────────────────────────
  clients: {
    heading: `TRUSTED BY *GLOBAL BRANDS*`,
  },

  // ── Section 04 · By the numbers (the 3 big stats) ─────────────────────────
  // The big numbers themselves (100, 10000, 2–10×) are set in code; you can
  // edit the LABELS under each number here.
  stats: {
    eyebrowNumber: `04`,
    eyebrowLabel: `BY THE NUMBERS · GLOBAL REACH`,
    clientsLabel: `CLIENTS // INDIAN + GLOBAL`,
    filmsLabel: `FILMS DELIVERED`,
    roasLabel: `RETURN ON AD SPEND`,
  },

  // ── Section 07 · "The Engine" (founders) ──────────────────────────────────
  engine: {
    eyebrowNumber: `07`,
    eyebrowLabel: `THE PEOPLE`,
    heading: `THE *ENGINE*`,
    subline: `FOUNDERS · FILMMAKERS FIRST · AI OPERATORS SECOND`,
    surajBio: `Founder & Director at S'QB Pictures. TEDx speaker. Delhi University history grad — a storyteller by training before he ever picked up a camera. Suraj directs Muthoot Finance's 22-episode Sunheri Soch with RedFM, the Bumrah × Naturaltein TVC, the PhysicsWallah and Sunstone × LSG campaigns, and a Kabeera music film for T-Series. His coming-of-age drama Cocoon hit 8.3 on IMDb for Hungama Originals. Before S'QB he ran creative at Pocket FM US, AppX (YC S21), Sunstone and Jellysmack — building brand IPs like Soch Talks and the Sunstone YouTube channel from scratch. Currently directing Revolution — Padhai ki Ladai, the studio's long-form docu-drama on India's education industrial complex.`,
    shubhamBio: `Founder & Producer at S'QB Pictures. Screenwriter, copywriter, and the operator who turns scripts into shoots into final cuts. Shubham's writing has powered TVCs for Bumrah × Naturaltein and Aparshakti × GeeksforGeeks; his unit crewed the 9-month Sunheri Soch sprint with RedFM and the Sunstone × Lucknow Super Giants IPL campaign. Before S'QB he ran content at ScoresNow, wrote for Envi Production for four years, and consulted for Schbang on the Reliance Jio IPL 2025 brand integration. Co-wrote Revolution — Padhai ki Ladai with Suraj. The studio ships because Shubham makes sure nothing falls. Loves a tight crew over a big one, a brief with stakes over a brief without.`,
    footnote: `Two founders. A tight core of operators, writers, editors and AI supervisors who can hold a camera at 6am and a render queue at midnight.`,
  },

  // ── Contact section (appears at the bottom of every page) ──────────────────
  contact: {
    eyebrowLabel: `REACH OUT`,
    heading: `LET'S MAKE *SOMETHING*.`,
    blurb: `Pitch us a brief, a brand, a budget — or just a feeling. We'll come back in 24 hours with a treatment or a "this isn't us".`,
    pullQuote: `We only work with people who are *as hyped as we are*.`,
    studiosValue: `DELHI · MUMBAI`,
    forValue: `ADS · DVCs · MUSIC VIDEOS · AI FILMS · VERTICALS`,
    form: {
      nameLabel: `NAME`,
      namePlaceholder: `Your name`,
      emailLabel: `EMAIL`,
      emailPlaceholder: `you@brand.com`,
      orgLabel: `BRAND / ORG`,
      orgPlaceholder: `Brand or organization`,
      briefLabel: `BRIEF`,
      briefPlaceholder: `Tell us about the film, the moment, the deadline.`,
      sending: `SENDING…`,
      sent: `SENT — WE'LL BE IN TOUCH ↗`,
      tryAgain: `TRY AGAIN`,
      submit: `SEND BRIEF →`,
      footIdle: `We read every brief. Replies within 24 hours.`,
      footSent: `Brief received. Reply within 24 hours.`,
      footError: `Could not send right now — email surajsharma@sqbpictures.com directly.`,
    },
  },

  // ── Footer (the bottom strip on every page) ───────────────────────────────
  footer: {
    // The gold dash "—" after TODAY is added automatically.
    cta: `TELL YOUR *STORY*\nTODAY`,
    studioHeading: `STUDIO`,
    studioLines: `S'QB PICTURES\nDELHI · MUMBAI`,
    foundersHeading: `FOUNDERS`,
    contactHeading: `CONTACT`,
    followHeading: `FOLLOW`,
    copyright: `© 2026 NIYASHI MOTION PICTURES PVT LTD · S'QB PICTURES · ALL FRAMES RESERVED.`,
    cube: `S'CUBE · 4·S OF SURAJ SHARMA + SHUBHAM SHAH`,
  },
};
