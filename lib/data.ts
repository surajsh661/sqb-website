import type {
  Film, AILabData, Vertical, TeamData, Testimonial,
  BTS, GenreOption, ClientLogo, Creator, Cocoon,
} from './types';

// type: "vm" Vimeo · "gd" Google Drive · "yt" YouTube · "ig" Instagram
// genres: ['ad','film','show','ai','vfx','3d','music','vertical','docu','podcast']
export const SQB_FILMS: Film[] = [
  {
    id: 'muthoot-sunheri-soch',
    title: 'MUTHOOT — SUNHERI SOCH',
    category: 'AI FILM / TESTIMONIAL CINEMA',
    genres: ['ai', 'ad', 'docu'],
    year: '2026', runtime: '1:30',
    type: 'vm', videoId: '1190975373',
    client: 'Muthoot Finance', talent: 'Real Customers (AI-rendered)',
    lede: 'Real customer testimonials reimagined as cinematic shorts through premium generative AI.',
    body: 'Sunheri Soch S4 reimagined real customer testimonials as high-quality cinematic storytelling through premium Generative AI production. Real customers transformed into natural on-screen performers — authentic performances with cinematic depth at a fraction of traditional production costs.',
    brief: 'Take a year of real customer stories and turn them into cinema, at scale, without losing authenticity.',
    solution: 'Built a generative AI pipeline that preserves real-customer faces and voices while staging them inside fully art-directed cinematic worlds.',
    timeline: '8 weeks · pre-production to delivery',
    release: 'National TV, YouTube, OTT — March 2026',
    impact: '10X cost-efficiency · 4.6X engagement uplift',
    credits: [
      { role: 'DIRECTOR', name: "S'QB" }, { role: 'AI SUPERVISOR', name: "S'QB LABS" },
      { role: 'WRITER', name: "S'QB ROOM" }, { role: 'POST', name: "S'QB LABS" },
      { role: 'CLIENT', name: 'MUTHOOT FINANCE' }, { role: 'TALENT', name: 'REAL CUSTOMERS' },
    ],
  },
  {
    id: 'naturaltein-bumrah',
    title: 'BUMRAH × NATURALTEIN',
    category: 'TVC / DVC', year: '2025', runtime: '1:02',
    genres: ['ad', 'film'],
    type: 'vm', videoId: '954302482',
    client: 'Naturaltein', talent: 'Jasprit Bumrah',
    lede: 'A high-velocity brand film that turned a protein launch into a national conversation.',
    body: 'Filmmaking first. We built a visual language as relentless as the bowler himself — slow-burn close-ups, sound design that hits like a yorker, every frame composed on set.',
    brief: 'Launch Naturaltein with credibility — own the gym-supplement category against incumbents 10× our budget.',
    solution: 'Cast the most disciplined fast bowler on earth and shot a film about discipline.',
    timeline: '5 weeks · script to air', release: 'National TV + Digital — IPL 2025',
    impact: '5.2X ROAS · 38% top-of-mind recall',
    credits: [
      { role: 'DIRECTOR', name: "S'QB" }, { role: 'PRODUCER', name: "S'QB" },
      { role: 'DOP', name: "S'QB COLLECTIVE" }, { role: 'CLIENT', name: 'NATURALTEIN' },
      { role: 'TALENT', name: 'J. BUMRAH' }, { role: 'POST', name: "S'QB LABS" },
    ],
  },
  {
    id: 'sparks-off-pitch',
    title: 'SPARKS OFF THE PITCH',
    category: 'SPORTS / DOCU-CINEMA', year: '2025', runtime: '1:18',
    genres: ['show', 'docu'],
    type: 'vm', videoId: '1082489881',
    client: 'Sports', talent: 'Athletes',
    lede: 'Off-pitch footage cut with cinematic intent.',
    body: 'Embedded with the team, captured the unposed. Fast, raw, watchable.',
    timeline: '3 weeks', release: 'Digital — 2025',
    impact: 'Sustained share-of-voice through the season',
    credits: [{ role: 'DIRECTOR', name: "S'QB" }, { role: 'DOP', name: "S'QB COLLECTIVE" }],
  },
  {
    id: 'sunstone-lsg',
    title: 'SUNSTONE × LSG',
    category: 'TVC / SPORTS-EDU', year: '2025', runtime: '0:45',
    genres: ['ad', 'docu'],
    type: 'vm', videoId: '935827293',
    client: 'Sunstone × LSG', talent: 'LSG Players',
    lede: 'Education meets the IPL — a TVC that puts the locker room and the lecture hall in the same frame.',
    body: "We embedded with LSG, captured the unposed, and married it with Sunstone's promise.",
    timeline: '3 weeks', release: 'IPL Broadcast 2025',
    impact: '3.4X ROAS',
    credits: [{ role: 'DIRECTOR', name: "S'QB" }, { role: 'DOP', name: "S'QB COLLECTIVE" }],
  },
  {
    id: 'pw-dvc',
    title: 'PHYSICSWALLAH',
    category: 'DVC / TECH-EDU', year: '2025', runtime: '0:38',
    genres: ['ad'],
    type: 'vm', videoId: '1083481304',
    client: 'PhysicsWallah', talent: 'Ensemble',
    lede: "Pulled at the heartstrings of every student who's ever doubted themselves at 2am.",
    body: 'Tight DVC built around a single emotional truth. Practical lighting, grounded performances.',
    timeline: '4 weeks', release: 'Digital + Broadcast — 2025',
    impact: '4.1X ROAS · 12M+ organic views',
    credits: [{ role: 'DIRECTOR', name: "S'QB" }, { role: 'WRITER', name: "S'QB ROOM" }],
  },
  {
    id: 'kabeera-tseries',
    title: 'KABEERA KE DOHE',
    category: 'MUSIC VIDEO / T-SERIES', year: '2025', runtime: '3:42',
    genres: ['music'],
    type: 'vm', videoId: '1083477570',
    client: 'T-Series', talent: 'Featured Artists',
    lede: 'A music video that treats devotional poetry like a cinema text.',
    body: 'Shot across heritage locations with a small unit. Practical light, real sets.',
    timeline: '6 weeks', release: 'T-Series — 2025',
    impact: '8M+ views',
    credits: [{ role: 'DIRECTOR', name: "S'QB" }, { role: 'CLIENT', name: 'T-SERIES' }],
  },
  {
    id: 'behne-do-cocoon',
    title: 'BEHNE DO — COCOON',
    category: 'MUSIC VIDEO', year: '2021', runtime: '3:24',
    genres: ['music'],
    type: 'vm', videoId: '1083476755',
    client: 'Cocoon', talent: 'Featured Artists',
    lede: 'An indie music video shot with a small unit and a big idea.',
    body: 'Loose, instinctive shooting. Cuts driven by emotion.',
    timeline: '4 weeks', release: 'YouTube — 2021',
    impact: 'Indie staple',
    credits: [{ role: 'DIRECTOR', name: "S'QB" }],
  },
  {
    id: 'vertical-dhokebaaz', title: 'DHOKEBAAZ DILRUBA',
    category: 'VERTICAL DRAMA', year: '2025', runtime: '2 EPS',
    genres: ['vertical', 'show'], aspect: '9:16',
    type: 'vm', videoId: '1127751934',
    client: "S'QB Originals", talent: 'Ensemble',
    lede: 'Phone-shaped drama that respects the medium.',
    body: 'Serialised hooks every 90 seconds. 9:16.',
    timeline: '4 weeks', release: 'Vertical — 2025', impact: '3× retention',
    credits: [{ role: 'DIRECTOR', name: "S'QB" }, { role: 'FORMAT', name: '9:16' }],
  },
  {
    id: 'vertical-computer-genius', title: 'COMPUTER GENIUS',
    category: 'VERTICAL DRAMA', year: '2025', runtime: '3 EPS',
    genres: ['vertical', 'show'], aspect: '9:16',
    type: 'vm', videoId: '1080608698',
    client: "S'QB Originals", talent: 'Ensemble',
    lede: 'Tech comedy built natively for vertical.',
    body: 'Tight 90-second beats, hook–payoff–button.',
    timeline: '3 weeks', release: 'Vertical — 2025', impact: 'Top-3 trending',
    credits: [{ role: 'DIRECTOR', name: "S'QB" }, { role: 'FORMAT', name: '9:16' }],
  },
  {
    id: 'vertical-antim-yudh', title: 'ANTIM YUDH',
    category: 'AI VERTICAL ACTION', year: '2026', runtime: 'Pilot',
    genres: ['vertical'], aspect: '9:16',
    type: 'gd', videoId: '1Rlu8IlJdnLYbQdj4Rh0lnrfI7uddA2qd',
    client: "S'QB Originals", talent: 'AI Ensemble',
    lede: 'AI-generated vertical action drama with full VFX scale shots.',
    body: 'Generative pipeline for action, set extensions, and VFX — directed, not prompted.',
    timeline: '6 weeks', release: 'Vertical — 2026', impact: 'Spec piece',
    credits: [{ role: 'DIRECTOR', name: "S'QB" }, { role: 'AI SUPERVISOR', name: "S'QB LABS" }],
  },
  {
    id: 'vertical-operation-thunder', title: 'OPERATION THUNDER — TRAILER',
    category: 'VERTICAL SHOW', year: '2026', runtime: 'Trailer',
    genres: ['vertical', 'show'], aspect: '9:16',
    type: 'vm', videoId: '1127747874',
    client: "S'QB Originals", talent: 'Ensemble',
    lede: 'Vertical action-trailer designed to hit in three seconds.',
    body: 'Ninety-second cut, edited to land hooks at every 12-second beat.',
    timeline: '2 weeks', release: 'Vertical — 2026', impact: 'Vertical preview drop',
    credits: [{ role: 'DIRECTOR', name: "S'QB" }, { role: 'FORMAT', name: '9:16' }],
  },
  {
    id: 'vertical-woh-aa-gayi', title: 'WOH AA GAYI — HORROR',
    category: 'AI VERTICAL HORROR', year: '2026', runtime: 'Pilot',
    genres: ['vertical', 'ai', 'show'], aspect: '9:16',
    type: 'vm', videoId: '1127752962',
    client: "S'QB Originals", talent: 'AI Ensemble',
    lede: 'AI-built vertical horror — atmosphere over jump-scare.',
    body: 'Practical sound design fused with synthetic visuals.',
    timeline: '5 weeks', release: 'Vertical — 2026', impact: 'Genre opener',
    credits: [{ role: 'DIRECTOR', name: "S'QB" }, { role: 'AI SUPERVISOR', name: "S'QB LABS" }],
  },
  {
    id: 'gfg-aparshakti-2',
    title: 'APARSHAKTI × GFG — 02',
    category: 'TVC', year: '2025', runtime: '0:40',
    genres: ['ad', 'film'],
    type: 'yt', videoId: 'tqP_qiuoYtE',
    client: 'GeeksforGeeks', talent: 'Aparshakti Khurana',
    lede: 'Second beat in the Aparshakti × GFG campaign — same comic timing, sharper twist.',
    body: 'We extended the campaign world with a second TVC. Same character voice, fresh blocking.',
    timeline: '2 weeks', release: 'TV + Digital — 2025', impact: 'Campaign extension',
    credits: [{ role: 'DIRECTOR', name: "S'QB" }, { role: 'TALENT', name: 'A. KHURANA' }, { role: 'CLIENT', name: 'GEEKSFORGEEKS' }],
  },
  {
    id: 'gfg-aparshakti-3',
    title: 'APARSHAKTI × GFG — 03',
    category: 'TVC', year: '2025', runtime: '0:35',
    genres: ['ad', 'film'],
    type: 'yt', videoId: 'VQuJFhmQOrQ',
    client: 'GeeksforGeeks', talent: 'Aparshakti Khurana',
    lede: 'Third TVC in the GFG x Aparshakti world.',
    body: 'Tight 35-second cutdown for high-frequency placement.',
    timeline: '2 weeks', release: 'TV + Digital — 2025', impact: 'Series 3rd film',
    credits: [{ role: 'DIRECTOR', name: "S'QB" }, { role: 'TALENT', name: 'A. KHURANA' }, { role: 'CLIENT', name: 'GEEKSFORGEEKS' }],
  },
  {
    id: 'cvox-b2b',
    title: 'C.VOX — B2B EXPLAINER',
    category: 'EXPLAINER / B2B', year: '2025', runtime: '1:30',
    genres: ['ad', 'film'],
    type: 'gd', videoId: '1WchSsUa3aSmwAO4AYcRBZIUyKNT9t0M9',
    client: 'C.Vox', talent: 'Brand Talent',
    lede: "A B2B explainer that doesn't feel like a B2B explainer.",
    body: "We built a clear narrative arc for C.Vox's enterprise audience.",
    timeline: '3 weeks', release: 'B2B Sales — 2025', impact: 'Lead-gen film',
    credits: [{ role: 'DIRECTOR', name: "S'QB" }, { role: 'CLIENT', name: 'C.VOX' }],
  },
  {
    id: 'cvox-promo',
    title: 'C.VOX — PROMO',
    category: 'PROMO', year: '2025', runtime: '0:30',
    genres: ['ad'],
    type: 'gd', videoId: '1BY9jSqS76X9EcU1Qe9Zq1jlwG8MyD0Yk',
    client: 'C.Vox', talent: 'Ensemble',
    lede: 'A high-energy launch promo for C.Vox.',
    body: '30-second cut for paid social and pre-roll.',
    timeline: '2 weeks', release: 'Digital — 2025', impact: 'Launch promo',
    credits: [{ role: 'DIRECTOR', name: "S'QB" }, { role: 'CLIENT', name: 'C.VOX' }],
  },
  {
    id: 'aironet-holidays',
    title: 'AIRONET HOLIDAYS',
    category: 'AD / TRAVEL', year: '2025', runtime: '0:45',
    genres: ['ad'],
    type: 'yt', videoId: 'qsBo7AMl-uo',
    client: 'Aironet Holidays', talent: 'Ensemble',
    lede: "Travel advertising that doesn't lean on drone shots and stock vistas.",
    body: 'Performance-led, character-first travel ad.',
    timeline: '3 weeks', release: 'Digital + OOH — 2025', impact: 'Brand launch',
    credits: [{ role: 'DIRECTOR', name: "S'QB" }, { role: 'CLIENT', name: 'AIRONET HOLIDAYS' }],
  },
  {
    id: 'cocoon-webseries',
    title: 'COCOON — WEB SERIES',
    category: 'WEB SERIES / SHOW', year: '2022', runtime: '10 EPS',
    genres: ['show', 'film'],
    type: 'vm', videoId: '735189733',
    client: 'Hungama', talent: 'Ensemble Cast',
    lede: 'Our long-form drama show on Hungama — 8.3 IMDb.',
    body: 'Cocoon is a ten-episode coming-of-age drama we wrote, directed, shot, and graded end-to-end. It became one of our defining IPs.',
    timeline: '12 months', release: 'Hungama — 2022', impact: '8.3 IMDb · Long-form IP',
    credits: [{ role: 'DIRECTOR', name: "S'QB" }, { role: 'SHOWRUNNER', name: "S'QB" }, { role: 'CLIENT', name: 'HUNGAMA' }],
  },
  {
    id: 'revolution-edu-scam',
    title: 'REVOLUTION — THE EDUCATION SCAM',
    category: 'DOCU-SERIES / IN MAKING', year: '2026', runtime: 'Season 1',
    genres: ['show', 'docu', 'film'],
    type: 'vm', videoId: '964882350',
    client: "S'QB Originals", talent: 'Real Stories',
    lede: "A docu-drama series we're directing right now — about the education industrial complex.",
    body: 'Investigative, character-led, cinematic. Season 1 in active production.',
    timeline: '12 months', release: 'OTT — 2026', impact: 'Tentpole IP',
    credits: [{ role: 'DIRECTOR', name: "S'QB" }, { role: 'ORIGINAL', name: "S'QB" }],
  },
  {
    id: 'papa-kahani-sunao',
    title: 'PAPA KAHANI SUNAO',
    category: 'SHORT FILM', year: '2024', runtime: '12:00',
    genres: ['film'],
    type: 'yt', videoId: 'cuL888d7nuw',
    client: "S'QB Originals", talent: 'Ensemble',
    lede: 'A 12-minute short film — quiet, observational, performance-led.',
    body: 'Independent short. Shot on a small unit. Festival-ready cut.',
    timeline: '6 weeks', release: 'YouTube — 2024', impact: 'Festival short',
    credits: [{ role: 'DIRECTOR', name: "S'QB" }],
  },
  {
    id: 'padh-hi-lenge-hum',
    title: 'PADH HI LENGE HUM',
    category: 'MUSIC VIDEO', year: '2023', runtime: '3:10',
    genres: ['music'],
    type: 'vm', videoId: '735189733',
    client: 'Independent', talent: 'Featured Artists',
    lede: 'A student-life music video built around a single emotional truth.',
    body: 'Practical lighting, location shoot, instinctive cuts.',
    timeline: '4 weeks', release: 'Vimeo — 2023', impact: 'Indie music',
    credits: [{ role: 'DIRECTOR', name: "S'QB" }],
  },
  {
    id: 'banke-tera',
    title: 'BANKE TERA',
    category: 'MUSIC VIDEO', year: '2023', runtime: '3:32',
    genres: ['music'],
    type: 'yt', videoId: 'sxhzbRs9OII',
    client: 'Independent', talent: 'Featured Artists',
    lede: 'A romance music video — mood-first, performance-driven.',
    body: 'Single-location shoot. Cuts obey the song, not the metronome.',
    timeline: '4 weeks', release: 'YouTube — 2023', impact: 'Music video',
    credits: [{ role: 'DIRECTOR', name: "S'QB" }],
  },
  {
    id: 'cvox',
    title: 'C.VOX',
    category: 'BRAND FILM', year: '2025', runtime: '1:00',
    genres: ['ad', 'film'],
    type: 'gd', videoId: '1Z2IL1rpXu1UKxPuiSCPs9eTaRuBnnA89',
    client: 'C.Vox', talent: 'Ensemble',
    lede: 'A taut brand film for C.Vox — cinematic identity for an emerging voice tech brand.',
    body: 'Crisp narrative, restrained palette, performance-driven blocking.',
    timeline: '4 weeks', release: 'Digital — 2025',
    impact: 'Brand launch film',
    credits: [{ role: 'DIRECTOR', name: "S'QB" }, { role: 'CLIENT', name: 'C.VOX' }],
  },
  {
    id: 'ai-realistic-flagship',
    title: 'REALISTIC AI — FLAGSHIP REEL',
    category: 'AI FILM REEL', year: '2026', runtime: '1:00',
    genres: ['ai', 'film'],
    type: 'gd', videoId: '1nNoeWOrdM8dksmsggRx1nwU_rY7O245J',
    client: "S'QB Labs", talent: 'Generative ensemble',
    lede: 'Generative cinema indistinguishable from a shot film.',
    body: 'Real-reference performances staged inside fully art-directed worlds. Built end-to-end inside our AI pipeline.',
    timeline: '6 weeks', release: 'OTT-grade reel — 2026',
    impact: 'Flagship AI reel',
    credits: [
      { role: 'AI SUPERVISOR', name: "S'QB LABS" },
      { role: 'DIRECTOR', name: "S'QB" },
    ],
  },
];

// Explicit curated list of films featured in the homepage hero carousel.
// Order = display order. Edit this to change what shows on the homepage.
const HERO_FEATURED_IDS: string[] = [
  'muthoot-sunheri-soch',
  'naturaltein-bumrah',
  'pw-dvc',
  'revolution-edu-scam',
  'kabeera-tseries',
  'sunstone-lsg',
  'ai-realistic-flagship',
];

// HERO films — explicit curated list (edit HERO_FEATURED_IDS above to change).
// Falls back to all non-vertical films if the curated list is empty.
export const SQB_HERO_FILMS: Film[] = (() => {
  const byId = new Map(SQB_FILMS.map((f) => [f.id, f] as const));
  const picked = HERO_FEATURED_IDS
    .map((id) => byId.get(id))
    .filter((f): f is Film => !!f);
  if (picked.length > 0) return picked;
  return SQB_FILMS.filter((f) => !(f.genres || []).includes('vertical'));
})();

// Verticals exposed for home-page section
export const SQB_VERTICALS: Vertical[] = SQB_FILMS
  .filter((f) => (f.genres || []).includes('vertical'))
  .map((f) => ({
    id: f.id, title: f.title, tag: f.category,
    type: f.type, videoId: f.videoId, genres: f.genres,
  }));

export const SQB_AI_LAB: AILabData = {
  headline: {
    eyebrow: "S'QB AI LABS",
    title: 'AI CINEMA · BUILT TO RUN ON BIG SCREENS',
    blurb:
      'We build AI shows, films, and animation series for OTT platforms, theatrical, and broadcast — alongside original YouTube IPs like Sunheri Soch S4: docu-films directed and generated entirely with our AI pipeline. Story first. Generative second. Always cinema-grade.',
  },
  animated: [
    { id: 'a1', title: 'ANIM REEL 01', type: 'gd', videoId: '1vgRjfCsBqKjL65-AS1QRR0PPlPxarXR_' },
    { id: 'a2', title: 'ANIM REEL 02', type: 'gd', videoId: '14G6XsrS2aj9nQrugnFb593xMwdWmCh_F' },
  ],
  realistic: [
    { id: 'r1', title: 'REAL REEL 01', type: 'gd', videoId: '1F-iqYy4IoBWw9tZSn3krZqEXf-vYxsKJ' },
    { id: 'r2', title: 'REAL REEL 02', type: 'gd', videoId: '1nNoeWOrdM8dksmsggRx1nwU_rY7O245J' },
    { id: 'r3', title: 'REAL REEL 03', type: 'gd', videoId: '1N_Ia4SnPfNbhOd4n1RAvhJeW8fXXaN-a' },
    { id: 'r4', title: 'REAL REEL 04', type: 'gd', videoId: '1GXAXdIp3VpyEPlr-4qZJWgwaSyAWFVqS' },
  ],
  vfx: [
    { id: 'x1', title: 'VFX REEL 01', type: 'gd', videoId: '1y-faRtLuVRYEuE0OjZWLLZgb3I4prLMf' },
    { id: 'x2', title: 'VFX REEL 02', type: 'gd', videoId: '1Q28L3vUWK-nP1L-T6e33hmgB2Wzjka40' },
  ],
};

export const SQB_TEAM: TeamData = {
  founders: [
    { id: 'f1', name: 'SURAJ', role: 'FOUNDER · DIRECTOR' },
    { id: 'f2', name: 'SHUBHAM SHAH', role: 'FOUNDER · PRODUCER' },
  ],
  team: [
    { id: 't1', name: 'DOP' }, { id: 't2', name: 'WRITER' },
    { id: 't3', name: 'EDITOR' }, { id: 't4', name: 'AI LEAD' },
    { id: 't5', name: 'SOUND' }, { id: 't6', name: 'GRADE' },
    { id: 't7', name: 'PRODUCER' }, { id: 't8', name: 'DESIGN' },
  ],
};

export const SQB_TESTIMONIALS: Testimonial[] = [
  { quote: "S'QB delivered a film that ran like cinema and performed like a TVC. Spend paid back inside the first month.", name: 'MARKETING LEAD', org: 'MUTHOOT FINANCE' },
  { quote: 'They treat AI like a director, not a gimmick.', name: 'BRAND HEAD', org: 'NATURALTEIN' },
  { quote: 'Tight unit, sharp instincts. More frames in a day than most outfits get in a week.', name: 'CMO', org: 'GEEKSFORGEEKS' },
  { quote: "Filmmakers first. That's rare in the AI era.", name: 'CONTENT HEAD', org: 'LSG / IPL' },
  { quote: 'From script to grade in three weeks, and the spot still feels patient.', name: 'FOUNDER', org: 'PHYSICSWALLAH' },
];

export const SQB_BTS: BTS[] = [
  { id: 'bts1', title: 'ON SET — REEL 01', tag: 'INSTAGRAM', type: 'ig', videoId: 'DHtGIOEBM4G' },
  { id: 'bts2', title: 'ON SET — REEL 02', tag: 'INSTAGRAM', type: 'ig', videoId: 'DNfhizFBUxe' },
  { id: 'bts3', title: 'GRADE / LAB ROOM',  tag: 'POST',     type: 'gd', videoId: '1_Et2LSZGJYA_OhkNrtWZJj5dY8KMezPo' },
  { id: 'bts4', title: 'ON SET — REEL 03', tag: 'INSTAGRAM', type: 'ig', videoId: 'DNsAKNCBYqz' },
  { id: 'bts5', title: 'ON SET — REEL 04', tag: 'INSTAGRAM', type: 'ig', videoId: 'DENoynNBlTo' },
  { id: 'bts6', title: 'ON SET — REEL 05', tag: 'INSTAGRAM', type: 'ig', videoId: 'DITn-A0BtS2' },
];

export const SQB_GENRES: GenreOption[] = [
  { key: 'all',      label: 'All' },
  { key: 'ad',       label: 'Ads / TVC' },
  { key: 'film',     label: 'Films' },
  { key: 'show',     label: 'Shows' },
  { key: 'ai',       label: 'AI Films' },
  { key: 'music',    label: 'Music Videos' },
  { key: 'docu',     label: 'Documentary' },
  { key: 'vfx',      label: 'VFX / 3D' },
];

export const SQB_FEATURED_DEFAULT: string[] = [
  'muthoot-sunheri-soch', 'naturaltein-bumrah', 'pw-dvc',
  'kabeera-tseries', 'sunstone-lsg', 'vertical-antim-yudh',
];

export const SQB_COCOON: Cocoon = {
  title: 'COCOON',
  tagline: 'A WEB SERIES WE WROTE, SHOT & GRADED END-TO-END',
  rating: '8.3',
  ratingSource: 'IMDb',
  imdb: 'https://www.imdb.com/title/tt15335782/',
  watch: 'https://www.hungama.com/tv-show/cocoon/78799046/',
  platform: 'HUNGAMA',
  blurb:
    'Our ten-episode coming-of-age drama. One of our defining IPs — written, directed, shot and graded entirely in-house. Streaming on Hungama.',
  music: [
    { id: 'behne-do',      title: 'BEHNE DO',          role: 'MUSIC VIDEO', type: 'vm', videoId: '1083476755' },
    { id: 'padh-hi-lenge', title: 'PADH HI LENGE HUM', role: 'MUSIC VIDEO', type: 'vm', videoId: '735189733'  },
  ],
};

export const SQB_CREATORS: Creator[] = [
  {
    id: 'harkirat', name: 'HARKIRAT SINGH', subs: '608K',
    blurb: "Tech & systems creator. Long-form cinematic explainers we shot, cut, and graded — including the viral 'I Resigned Microsoft' film.",
    videos: ['wioAFuHzcao', 'zKd_kxcxGbo', 'aCaTUryjWrw', 'blaGGsFpxN4', 'ldAV_bixqaw', 'ZXCpGpxFYJI'],
  },
  {
    id: 'science-fun', name: 'SCIENCE & FUN', subs: '9.48M',
    blurb: "One of India's largest education channels. Sit-down format reimagined with cinematic blocking.",
    videos: ['uaRSLSXJ1Ro', 'qzeBKBrWqlk', 'jtg8vBKDoS0'],
  },
  {
    id: 'appx', name: 'APPX', subs: '17K',
    blurb: 'Ad-supported edtech IP. Sharp DVCs and platform-native shorts.',
    videos: ['8VfEqw9dgfQ', 'dci6Astl5ts', 'DpOfAnZ8t1s', 'Rw2OasqcXh8', 'WEz_JP2XDvc'],
  },
  {
    id: 'sunstone-yt', name: 'SUNSTONE', subs: '69K',
    blurb: "S'QB-built IP — channel, format, story spine, the whole engine from scratch.",
    videos: ['8LncvPjq_6c', 'gZDn828tk6M', '-oKf9dw7T-A', 'y23PX1MooUM', 'wbGzXIrFHTY'],
    flagship: true,
  },
];

export const SQB_LOGOS: ClientLogo[] = [
  { name: 'Haldiram’s',    src: '/clients/haldiram.png',  size: 1.05 },
  { name: 'Subway',             src: '/clients/subway.png',    size: 0.95 },
  { name: 'T-Series',           src: '/clients/tseries.png',   size: 0.95 },
  { name: 'PhysicsWallah',      src: '/clients/pw.png',        size: 1.05 },
  { name: 'Sunstone',           src: '/clients/sunstone.png',  size: 1.00 },
  { name: 'GeeksforGeeks',      src: '/clients/gfg.png',       size: 1.05 },
  { name: 'Unacademy',          src: '/clients/unacademy.png', size: 1.00 },
  { name: 'Vahaflix',           src: '/clients/vahaflix.png',  size: 0.95 },
  { name: 'WTF Gyms',           src: '/clients/wtf.png',       size: 0.90 },
  { name: 'Appx',               src: '/clients/appx.png',      size: 0.90 },
  { name: 'Ayush',              src: '/clients/ayush.png',     size: 0.85 },
  { name: 'CAC',                src: '/clients/cac.png',       size: 0.85 },
  { name: 'DCC',                src: '/clients/dcc.png',       size: 0.85 },
  { name: 'SpeakIn',            src: '/clients/speakin.png',   size: 0.90 },
  { name: 'S&F',                src: '/clients/snf.png',       size: 0.85 },
  { name: 'TEDx',               src: '/clients/tedx.png',      size: 0.95 },
];
