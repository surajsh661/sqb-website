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
    category: 'AI FILM SERIES / TESTIMONIAL CINEMA',
    genres: ['ai', 'ad', 'docu', 'film'],
    year: '2025–26', runtime: '22 EPS · 5–7 MIN',
    type: 'vm', videoId: '1190975373',
    client: 'Muthoot Finance × RedFM', talent: 'Real Customers (AI-rendered)',
    lede:
      "A nine-month, twenty-two-episode docu-AI series that turned real Muthoot customers into cinema — running in lockstep with RedFM's radio version of the same campaign.",
    body:
      'Sunheri Soch Season 4 — Garv Ka Parv — reimagined real customer testimonials as premium Generative AI cinema. Hindi-language stories spanning Punjab, Rajasthan, Madhya Pradesh, Assam, Haryana, Gujarat — every one of them visualised, art-directed and rendered to feel indistinguishable from a documentary shoot. Real customers became natural on-screen performers, holding the frame the way a trained actor would. Two episodes a month, for nine months.',
    brief:
      "Build a year-long visual companion to RedFM's radio testimonial campaign — at scale, with cinema-grade fidelity, without flying a unit to every state in India.",
    solution:
      "A generative AI pipeline that preserves the real customer's face and voice while staging them inside fully art-directed worlds. Every episode researched and storyboarded by hand — Muthoot signage on real branch facades, employee uniforms accurate to regional roles, regional dress and home interiors true to each customer's state and culture. Screenplay visualisation by Suraj; AI creation by S'QB Labs. RedFM aired the audio side; we owned the visual.",
    timeline: '9 months · 2 episodes/month · 22 episodes total',
    release: 'YouTube + RedFM linear · 2025–26',
    impact:
      "10× cost-efficiency · series became Muthoot's flagship brand-content franchise",
    playlistId: 'PL-83MV-eeqpZXps__nlTe0laevU0Nj9qX',
    episodes: [
      { id: 'XSceeEJSF3w', label: 'EP 01 · RANU NATH · GUWAHATI' },
      { id: 'FhtxH-tMpP0', label: 'EP 02 · DHIRAJ · RAJKOT' },
      { id: 'rcYoJbVsosg', label: 'EP 03 · DHIRAJ · CHAI TO SUCCESS' },
      { id: '92U8J7IZ9FY', label: 'EP 04 · SEEMA GUPTA · KANNADA' },
      { id: 'lbmuRuXiqlw', label: 'EP 05 · SANJAY SAHANI · ALWAR' },
      { id: '-A5WDQNfI8I', label: 'EP 06 · ALWAR · FATHER & SON' },
      { id: 'ie1fIS7aDmM', label: 'EP 07 · KUKURAM · PATIALA' },
      { id: '1zYZRqxmZDg', label: 'EP 08 · KUKURAM · TESTIMONIAL' },
      { id: 'ngxuB9rZlX4', label: 'EP 09 · NEW VOICES · WELCOME' },
      { id: 'GsiKCs7K6FE', label: 'EP 10 · JASLEEN · KURALI' },
      { id: 'Jf1q3Ik_TBc', label: 'EP 11 · SUNITA · INDORE' },
      { id: 'v6vhsnhyMu4', label: 'EP 12 · SEEMA GUPTA · DELHI' },
      { id: 'KkNOBT-SqjY', label: 'EP 13 · BHAIRON · MAKRANA' },
      { id: 'npXaOqlbRjA', label: 'EP 14 · AKRAM & MUSTAKEEN · UPLETA' },
      { id: 'CKejfnEorYg', label: 'EP 15 · SHIOJI · HOJAI' },
      { id: 'K2Hu2tJCZZ8', label: 'EP 16 · NARINDER · KURALI' },
      { id: 'mc5uAonjeyI', label: 'EP 17 · ANITA · REWARI' },
      { id: 'D1s0jAE1OWY', label: 'EP 18 · VIRENDRA · DELHI NCR' },
      { id: 'AWPJTUsoLjw', label: 'EP 19 · SURAJ RAM · KOLKATA' },
      { id: 'OAoPmWc7DO0', label: 'EP 20 · MANGAL DEV · PRAYAGRAJ' },
      { id: '67zmgmINDuA', label: 'EP 21 · DEEPIKA · HARYANA' },
      { id: 'QayXYJp50EA', label: 'ANTHEM · GARV KA PARV' },
    ],
    credits: [
      { role: 'CLIENT', name: 'MUTHOOT FINANCE' },
      { role: 'RADIO PARTNER', name: 'REDFM' },
      { role: 'SCREENPLAY VIS.', name: 'SURAJ' },
      { role: 'AI CREATION', name: "S'QB LABS" },
      { role: 'LANGUAGE', name: 'HINDI' },
      { role: 'TALENT', name: 'REAL CUSTOMERS' },
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
    category: 'TALK SHOW / SPORTS', year: '2022', runtime: '5 × 10:00',
    genres: ['show', 'docu'],
    type: 'vm', videoId: '1082489881',
    client: 'Sunstone × LSG', talent: 'LSG Backroom',
    lede: 'A remote-infrastructure talk show that continued the Sunstone × Lucknow Super Giants collaboration — hosts in Delhi, guests inside the LSG camp.',
    body: "Suraj show-ran the series end to end, coordinating teams across Delhi and Mumbai to pull off a fully remote shoot — hosts in Delhi interviewing the people who actually build an IPL side: managers, physiotherapists and the backroom staff who get the Lucknow Super Giants ready for IPL 2022. He also led the edit alongside two more editors and handled the VFX and motion. Five episodes, ten minutes each, aired on Sunstone's YouTube alongside the TVC launch.",
    timeline: '—', release: 'Sunstone YouTube — 2022',
    impact: 'A five-episode series timed to the Sunstone × LSG TVC launch',
    credits: [
      { role: 'SHOWRUNNER', name: 'SURAJ SHARMA' },
      { role: 'EDITOR', name: 'SURAJ SHARMA' },
      { role: 'VFX & MOTION', name: 'SURAJ SHARMA' },
    ],
  },
  {
    id: 'sunstone-lsg',
    title: 'SUNSTONE × LSG',
    category: 'TVC / SPORTS-EDU', year: '2022', runtime: '0:45',
    genres: ['ad', 'docu'],
    type: 'vm', videoId: '935827293',
    client: 'Sunstone × Lucknow Super Giants', talent: 'LSG Players',
    lede: 'A co-branded TVC for edtech brand Sunstone, made with IPL franchise Lucknow Super Giants — the lecture hall and the locker room in one frame.',
    body: "Sunstone reinvents the campus experience for India's college students. We partnered them with the newly-launched Lucknow Super Giants and built the spot around that crossover energy — the discipline of a pro dressing room meeting the ambition of a campus — cut for maximum recall across the IPL window.",
    timeline: '—', release: 'IPL 2022',
    impact: 'Drove a wave of brand awareness for Sunstone through the IPL season',
    credits: [
      { role: 'EDITOR', name: 'SURAJ SHARMA' },
      { role: 'CLIENT', name: 'SUNSTONE × LSG' },
    ],
  },
  {
    id: 'pw-dvc',
    title: 'PHYSICSWALLAH',
    category: 'DVC / TECH-EDU', year: '2023', runtime: '0:38',
    genres: ['ad'],
    type: 'vm', videoId: '1083481304',
    client: 'PhysicsWallah × Knowledge Planet', talent: 'Ensemble',
    lede: "A co-branded DVC for India's biggest edtech, PhysicsWallah, with UAE edtech startup Knowledge Planet — produced under S'QB Pictures.",
    body: "PhysicsWallah built its name making world-class learning affordable for millions. We carried that promise across borders in a co-branded film with UAE-based Knowledge Planet — grounded performances, practical light, and the single emotional truth every student recognises.",
    timeline: '—', release: 'Digital + Broadcast — 2023',
    impact: 'A cross-border edtech collaboration delivered as one seamless film',
    credits: [
      { role: 'DIRECTOR', name: 'YOGENDER KOHLI' },
      { role: 'DOP', name: 'GAURAV TANDON' },
      { role: 'EXEC PRODUCER', name: 'HEMANT KUMAR' },
      { role: 'PRODUCER', name: 'SHUBHAM SHAH' },
    ],
  },
  {
    id: 'kabeera-tseries',
    title: 'KABEERA KE DOHE',
    category: 'MUSIC VIDEO / T-SERIES', year: '2022', runtime: '3:42',
    genres: ['music'],
    type: 'vm', videoId: '1083477570',
    client: 'T-Series', talent: 'Featured Artists',
    lede: "A special Teachers' Day music film for T-Series — a poem, sung as Kabir ke Dohe, about the quiet importance of a teacher.",
    body: "Made for T-Series to mark Teachers' Day, the film follows students who only realise what their teacher truly means to them through a beautiful poem the teacher sings — Kabir ke Dohe. Devotional poetry treated like a cinema text, shot with a small unit and practical light.",
    timeline: '—', release: 'T-Series — 2022',
    impact: "A Teachers' Day release for one of the world's largest music labels",
    credits: [
      { role: 'DIRECTOR', name: 'SURAJ SHARMA' },
      { role: 'PRODUCER', name: 'DHRUV BHARADWAJ' },
      { role: 'CLIENT', name: 'T-SERIES' },
    ],
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
    id: 'revolution-edu-scam',
    title: 'REVOLUTION — THE EDUCATION SCAM',
    category: 'WEB SERIES / DRAMA', year: '2023', runtime: '7 EP · ~4H 30M',
    genres: ['show', 'docu', 'film'],
    type: 'vm', videoId: '964882350',
    client: "S'QB Originals", talent: 'Hiten Tejwani · Rakesh Bedi · Hemant Pandey · Mimoh Chakraborty · Bijendra Kala',
    lede: 'A long-form drama web series — a vigilante out to bust the country\'s edtech scams while keeping his identity hidden. Shot in Mumbai; what you see here is the making-of.',
    body: "Seven episodes of 35–40 minutes each (≈4h 30m total). A character-led thriller following a masked vigilante who exposes the education-industry scams bleeding India's students dry — without ever revealing who he is. Featuring Hiten Tejwani, Rakesh Bedi, Hemant Pandey, Mimoh Chakraborty and Bijendra Kala. Currently in distribution, premiering on a leading OTT platform soon.",
    timeline: '7 episodes', release: 'OTT — coming soon', impact: 'In distribution — premiering on a leading OTT platform',
    credits: [
      { role: 'DIRECTORS', name: 'SURAJ SHARMA · SALAR SHEIKH' },
      { role: 'WRITERS', name: 'SURAJ SHARMA · SHUBHAM SHAH' },
      { role: 'DOP', name: 'RUBIN ELLIES' },
      { role: 'EDITOR', name: 'TANISHQ BHAWNANI' },
      { role: 'ASST. CINEMATOGRAPHER', name: 'ANIRUDH DESHPANDE' },
      { role: 'PRODUCER', name: 'PRATEEK SHIVALIK' },
    ],
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
  'naturaltein-bumrah',
  'muthoot-sunheri-soch',
  'pw-dvc',
  'revolution-edu-scam',
  'sparks-off-pitch',
  'kabeera-tseries',
  'sunstone-lsg',
];

// HERO films — explicit curated list (edit HERO_FEATURED_IDS above to change).
// Drive videos are always excluded — they don't autoplay reliably in the carousel.
// Falls back to all Vimeo/YouTube non-vertical films if the curated list is empty.
export const SQB_HERO_FILMS: Film[] = (() => {
  const byId = new Map(SQB_FILMS.map((f) => [f.id, f] as const));
  const picked = HERO_FEATURED_IDS
    .map((id) => byId.get(id))
    .filter((f): f is Film => !!f && f.type !== 'gd');
  if (picked.length > 0) return picked;
  return SQB_FILMS.filter(
    (f) => !(f.genres || []).includes('vertical') && f.type !== 'gd',
  );
})();

// Verticals exposed for home-page section
export const SQB_VERTICALS: Vertical[] = [
  ...SQB_FILMS
    .filter((f) => (f.genres || []).includes('vertical'))
    .map((f) => ({
      id: f.id, title: f.title, tag: f.category,
      type: f.type, videoId: f.videoId, genres: f.genres,
    })),
  // Additional AI-show verticals hosted on Google Drive.
  { id: 'hit-the-jackpot', title: 'WIN THE LOTTERY', tag: 'AI SHOW', type: 'gd', videoId: '1CbpkJ9C_4kZnIgTyUQEOs-bU09n1-PL5', genres: ['vertical'] },
  { id: 'unexpected-pregnancy', title: 'UNEXPECTED PREGNANCY', tag: 'AI SHOW', type: 'gd', videoId: '1GXAXdIp3VpyEPlr-4qZJWgwaSyAWFVqS', genres: ['vertical'] },
];

export const SQB_AI_LAB: AILabData = {
  // Headline copy (eyebrow / title / blurb) now lives in lib/copy.ts → COPY.aiLab
  animated: [
    { id: 'a1', title: 'ANIM REEL 01', type: 'gd', videoId: '1vgRjfCsBqKjL65-AS1QRR0PPlPxarXR_' },
    { id: 'a2', title: 'ANIM REEL 02', type: 'gd', videoId: '14G6XsrS2aj9nQrugnFb593xMwdWmCh_F' },
  ],
  realistic: [
    { id: 'r1', title: 'REAL REEL 01', type: 'gd', videoId: '1F-iqYy4IoBWw9tZSn3krZqEXf-vYxsKJ' },
    { id: 'r2', title: 'REAL REEL 02', type: 'gd', videoId: '1nNoeWOrdM8dksmsggRx1nwU_rY7O245J' },
    { id: 'r3', title: 'REAL REEL 03', type: 'gd', videoId: '1N_Ia4SnPfNbhOd4n1RAvhJeW8fXXaN-a' },
    { id: 'r4', title: 'UNEXPECTED PREGNANCY', type: 'gd', videoId: '1GXAXdIp3VpyEPlr-4qZJWgwaSyAWFVqS', vertical: true },
    { id: 'r5', title: 'WIN THE LOTTERY', type: 'gd', videoId: '1CbpkJ9C_4kZnIgTyUQEOs-bU09n1-PL5', vertical: true },
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

// `size` is an optical-balance scale (applied as a CSS transform on the img)
// to compensate for source PNGs that bake in different amounts of internal
// padding. Most can stay at 1.00; logos whose visible art occupies less of
// their canvas get bumped up so they read at the same on-screen size as the
// tightly-cropped ones.
//
// keepDetails: true → render the original art (desaturated) instead of
// flattening to a silhouette. Use for illustrative/detailed marks.
export const SQB_LOGOS: ClientLogo[] = [
  { name: 'Muthoot Finance',    src: '/clients/muthoot.png',   size: 1.00, keepDetails: true },
  { name: 'RedFM',              src: '/clients/redfm.png',     size: 1.10 },
  { name: 'Haldiram’s',         src: '/clients/haldiram.png',  size: 1.00 },
  { name: 'Subway',             src: '/clients/subway.png',    size: 1.10 },
  { name: 'T-Series',           src: '/clients/tseries.png',   size: 1.25 },
  { name: 'PhysicsWallah',      src: '/clients/pw.png',        size: 1.54 },
  { name: 'Sunstone',           src: '/clients/sunstone.png',  size: 0.98 },
  { name: 'GeeksforGeeks',      src: '/clients/gfg.png',       size: 1.77 },
  { name: 'Unacademy',          src: '/clients/unacademy.png', size: 1.76 },
  { name: 'Vahaflix',           src: '/clients/vahaflix.png',  size: 1.05 },
  { name: 'Dashtoon',           src: '/clients/dashtoon.png',  size: 1.10, keepDetails: true },
  { name: 'Indiefolio',         src: '/clients/indiefolio.png',size: 1.10 },
  { name: 'Industree',          src: '/clients/industree.png', size: 1.10, keepDetails: true },
  { name: 'LAPCA',              src: '/clients/lapca.png',     size: 1.33 },
  { name: 'ViralO',             src: '/clients/viralo.png',    size: 0.99, tone: 'mono' },
  { name: 'Appx',               src: '/clients/appx.png',      size: 1.20 },
  { name: 'Ayush',              src: '/clients/ayush.png',     size: 1.21 },
  { name: 'CAC',                src: '/clients/cac.png',       size: 1.08 },
  { name: 'DCC',                src: '/clients/dcc.png',       size: 0.96 },
  { name: 'SpeakIn',            src: '/clients/speakin.png',   size: 1.06 },
  { name: 'S&F',                src: '/clients/snf.png',       size: 1.20, tone: 'invert' },
  { name: 'TEDx',               src: '/clients/tedx.png',      size: 1.10 },
];
