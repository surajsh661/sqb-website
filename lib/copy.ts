/* =============================================================================
 *  ✏️   S'QB  WEBSITE  COPY   —   EDIT  YOUR  WORDS  HERE
 * =============================================================================
 *
 *  Hi Shubham 👋  This one file holds ALL of the website's words across every
 *  page — the Home page, the VIDEO (Work) page, the AI LAB page and the SOCIAL
 *  page, plus the top menu, the ticket menu, the contact form and the footer.
 *  Change the words here and the website updates after it rebuilds.
 *
 *  The sections below are grouped by where they appear, top to bottom. Use the
 *  comment headers (── like this ──) to find the part of the site you want.
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
    paragraph: `S'QB Pictures is where storytelling meets the future of filmmaking. From Delhi and Mumbai to locations across the globe, we create films, commercials, and original content for the world's most ambitious brands. With a seasoned crew, world-class production expertise, and AI-powered creative workflows, we deliver work that is bigger, faster, and louder. But technology is never the story. Story comes first. Performance comes first. Craft comes first.`,
  },

  // ── Section 03 · Clients ──────────────────────────────────────────────────
  clients: {
    heading: `TRUSTED BY *GLOBAL BRANDS*`,
  },

  // ── Section 04 · By the numbers (the 3 big stats) ─────────────────────────
  // The big numbers themselves (100, 10000, 2–10×) are set in code; you can
  // edit the LABELS under each number here.
  stats: {
    eyebrowNumber: `03`,
    eyebrowLabel: `BY THE NUMBERS · GLOBAL REACH`,
    clientsLabel: `CLIENTS // INDIAN + GLOBAL`,
    filmsLabel: `FILMS DELIVERED`,
    roasLabel: `RETURN ON AD SPEND`,
  },

  // ── Section 07 · "The Engine" (founders) ──────────────────────────────────
  engine: {
    eyebrowNumber: `04`,
    eyebrowLabel: `THE PEOPLE`,
    heading: `THE *ENGINE*`,
    subline: `FOUNDERS · FILMMAKERS FIRST · AI OPERATORS SECOND`,
    surajBio: `Suraj Sharma is the Founder and Director of S'QB Pictures. He spearheads the studio's most ambitious films, commercials, and original content. A director, writer, and editor, he combines storytelling, visual craft, and technical expertise to shape every project from the ground up.`,
    shubhamBio: `Shubham Shah is the Founder and Producer at S'QB Pictures. He turns ideas into finished films, overseeing every step from script and shoot to final delivery. A writer and producer, he leads the production floor, keeps projects on schedule, and ensures nothing gets lost between the brief and the final cut. He believes in small, talented teams, strong execution, and work that truly matters.`,
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
    studioHeading: `OFFICE`,
    studioLines: `S'QB PICTURES\nAWFIS, MAJESTIC OMNIA, BLOCK A\nSECTOR 4, NOIDA\nUTTAR PRADESH 201301`,
    foundersHeading: `FOUNDERS`,
    contactHeading: `CONTACT`,
    followHeading: `FOLLOW`,
    copyright: `© 2026 S'QB PICTURES · ALL FRAMES RESERVED.`,
    cube: ``,
  },

  // ── Top navigation bar (the links at the very top of every page) ───────────
  nav: {
    home: `HOME`,
    video: `VIDEO`,
    aiLab: `AI LAB`,
    social: `SOCIAL`,
    reachOut: `REACH OUT`,
  },

  // ── The "ticket" pop-out menu (opens when you click MENU) ──────────────────
  menu: {
    stubLine: `S'QB · ADMIT ONE`,
    stubBig: `REEL ROOM`,
    screenLabel: `SCREEN`,
    screenValue: `STUDIO 01`,
    showLabel: `SHOW`,
    showValue: `2026 / DAILY`,
    seatLabel: `SEAT`,
    seatValue: `YOU + IDEA`,
    // The numbered list of menu links. Edit the words on the right of each line.
    itemAll: `VIDEO`,
    itemAd: `ADS / TVC`,
    itemFilm: `FILMS & SHOWS`,
    itemAi: `AI FILMS`,
    itemMusic: `MUSIC VIDEOS`,
    itemVertical: `VERTICAL`,
    itemContact: `CONTACT`,
    emailLabel: `EMAIL`,
    whatsappLabel: `WHATSAPP`,
    copyright: `© NIYASHI MOTION PICTURES · ★★★★★`,
  },

  // ── Home page · "Behind the scenes" strip ─────────────────────────────────
  bts: {
    eyebrowNumber: `05`,
    eyebrowLabel: `BEHIND THE SCENES`,
    heading: `FROM THE *FLOOR*.`,
    blurb: `Rigs, blocks, grade rooms, AI lab nights. The work behind the work.`,
  },

  // ── Home page · Testimonials ("The receipts") ─────────────────────────────
  testimonials: {
    eyebrowNumber: `04`,
    eyebrowLabel: `WORDS FROM PAST CLIENTS`,
    heading: `THE *RECEIPTS*.`,
  },

  // ── Home page · Vertical works strip ──────────────────────────────────────
  verticalsHome: {
    heading: `VERTICAL *CINEMA*`,
    blurb: `Full-blown web shows, built for the phone in your hand. We own every frame — script, cast, shoot, edit, grade, sound, VFX. And when it's AI, we go from a blank page to finished animation without ever leaving the studio.`,
  },

  // ── "Trusted by global brands" block (shown on Video / AI Lab / Social) ────
  trustedBlock: {
    heading: `TRUSTED BY *GLOBAL BRANDS*`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  VIDEO PAGE  (the "/work" page — the menu calls it VIDEO)
  // ═══════════════════════════════════════════════════════════════════════════
  work: {
    visionEyebrow: ``,
    visionTitle: `THE CONTENT *STUDIO*`,
    visionBlurb: `Whether you're starting with a vague idea or a fully fleshed-out concept, S'QB can bring your vision to life. We deliver high-fidelity, high-volume video content across every format imaginable — from cinematic AI films to camera-shot TVCs, vertical micro-dramas to long-form documentary.`,
    // The arrow → after the button is added automatically.
    visionCta: `START PROJECT`,

    capTitle: `OUR *PRODUCTION* CAPABILITIES`,
    // The 6 capability cards. Each has a name and a one-line description.
    // (The little icons are set in code — just edit the words.)
    capabilities: [
      { name: `Ad Films & TVCs`, desc: `Full cinematic script-to-screen production.` },
      { name: `CGI / VFX & 3D`, desc: `Complex visual effects and motion graphics.` },
      { name: `AI Film Production`, desc: `Rapid content generation and versioning.` },
      { name: `Short-Form Digital`, desc: `Platform-native content for viral reach.` },
      { name: `Launch & Explainers`, desc: `Clear, engaging product value demonstration.` },
      { name: `Documentary & Long-Form`, desc: `Building brand affinity through narrative.` },
    ],

    // The big "150 → 500+" number is set in code; edit the words around it.
    scaleTitle: `MINUTES / *MONTH*`,
    scaleSub: `The scale and speed required to win the attention economy.`,
    scaleFine: `Short-form digital, animated explainers, launch videos, high-fidelity commercial spots — delivered every month for India's biggest brands.`,

    filmsTitle: `OUR *FILMS*`,
    filmsSub: `A LIBRARY OF 1000+ PROJECTS`,
    filmsBlurb: `A sample of our best work across advertising, AI, music videos, vertical, and digital shorts.`,
    // The arrow → after the button is added automatically.
    viewMore: `VIEW MORE`,

    // Cocoon web-series block. The series title, rating, links, tagline and
    // music come from lib/data.ts (SQB_COCOON). These are the labels around them.
    cocoonEyebrow: `FLAGSHIP IP · WEB SERIES`,
    cocoonWatchPrefix: `WATCH ON`, // becomes "WATCH ON HUNGAMA PLAY ↗"
    cocoonImdb: `IMDb PAGE ↗`,
    cocoonRatingSuffix: `RATING`, // becomes "IMDb RATING"
    cocoonMusicLabel: `MUSIC FROM THE SHOW`,

    vcEyebrow: `9:16 · BUILT FOR PHONES`,
    vcTitle: `VERTICAL *CINEMA*`,
    vcBlurb: `We make vertical web shows end to end. For an AI show we go from script and storyboard all the way to the final AI animation; for live-action we own ideation, writing, casting and the shoot, then deliver the finished cut with BGM, colour grade and any VFX the OTT needs. Built for OTT platforms and global brands — and delivered straight to the vertical platforms they live on.`,
    vcTallyLabel: `VERTICAL FILMS`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  AI LAB PAGE
  // ═══════════════════════════════════════════════════════════════════════════
  aiLab: {
    heroEyebrow: `S'QB AI LABS`,
    heroTitle: `AI BUILT TO *SCALE*`,
    // Capability tags shown under the AI Lab headline.
    heroTags: [`AI Creatives`, `AI Influencers`, `AI Films`, `2D Animation`, `3D Animation`, `VFX`, `AI IP Creation`],
    heroBlurb: `We build AI shows, films, and animation series for OTT platforms, theatrical, and broadcast — alongside original YouTube IPs like Sunheri Soch S4: docu-films directed and generated entirely with our AI pipeline. Story first. Generative second. Always cinema-grade.`,

    // The 3 hover panels at the top of the page (short descriptions).
    paneAnim: `Stylised AI animation built like illustration in motion — character, frame and pacing carry the story.`,
    paneReal: `Generative cinema indistinguishable from a shot film — real-reference performances, art-directed worlds.`,
    paneVfx: `Action, scale shots, effects. The impossible day on set turned into the inevitable shot in the cut.`,

    // The 3 reel sections lower down (a title + a longer blurb each).
    animTitle: `Animated AI`,
    animBlurb: `Stylised AI animation — illustration in motion. Character, frame, and pacing carry the story.`,
    realTitle: `Realistic AI`,
    realBlurb: `Generative cinema indistinguishable from a shot film. Real-reference performances staged inside art-directed worlds — including OTT-grade docu-films like Sunheri Soch S4.`,
    vfxTitle: `VFX & Action`,
    vfxBlurb: `Action and scale shots, effects, set extensions. The impossible day on set turned into the inevitable shot in the cut.`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  SOCIAL PAGE
  // ═══════════════════════════════════════════════════════════════════════════
  social: {
    heroEyebrow: `FROM IDEAS TO VIRALITY`,
    heroTitle: `CAAS · CONTENT AS A *SERVICE*`,
    heroBlurb: `Original IPs and creator engines we built from scratch — the channels, formats and films behind some of India's biggest YouTube creators.`,
    // The 3 big stats under the headline (value + label each).
    stats: [
      { value: `10M+`, label: `Subscribers Reached` },
      { value: `2M+`, label: `Monthly Views` },
      { value: `4+`, label: `Original IPs Built` },
    ],
    // Labels on each creator block.
    creatorFlagshipEyebrow: `IP WE BUILT FROM SCRATCH`,
    creatorPartnerEyebrow: `CHANNEL PARTNER`,
    subsLabel: `SUBSCRIBERS · YOUTUBE`,
    watchYt: `WATCH ON YT ↗`,
  },

  // ── Shared bits used in a few places ──────────────────────────────────────
  common: {
    // Hint shown under a video when it opens full-screen.
    vmodalHint: `CLICK OUTSIDE OR ESC TO CLOSE`,
  },
};
