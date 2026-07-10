// ─────────────────────────────────────────────────────────────────────────────
// Open roles. `salary` is deliberately NOT rendered on the public listing —
// it is revealed only once a candidate proceeds to apply (see the Apply flow).
// ─────────────────────────────────────────────────────────────────────────────

/** The generative stack we actually shoot on. Kept in one place so a model
 *  upgrade is a one-line change across every job description. */
export const AI_MODELS = ['Kling 3.0', 'Seedance 2.5', 'Nano Banana 2', 'GPT-Image 2'] as const;

export type QuestionKind = 'number' | 'boolean' | 'text';

export interface ScreeningQuestion {
  id: string;
  label: string;
  kind: QuestionKind;
  required?: boolean;
  suffix?: string;      // e.g. "years"
  placeholder?: string;
}

export interface Role {
  id: string;
  title: string;
  subtitle?: string;
  dept: string;
  type: string;              // Contract · Full Time
  location: string;
  onsite: string;
  experience: string;
  // NOTE: budget lives in lib/careers-salary.ts (server-only) and is served by
  // /api/careers/brief, so it never ships in this client-imported bundle.
  lede: string;
  description: string;
  responsibilities?: string[];
  qualifications: string[];
  bonus?: string[];
  tools: boolean;            // show the AI_MODELS chip row
  questions: ScreeningQuestion[];
  datePosted: string;        // ISO
  validThrough: string;      // ISO
}

const COMMUTE: ScreeningQuestion = {
  id: 'commute', kind: 'boolean', required: true,
  label: 'Are you comfortable commuting to Noida Sector 4 (on-site)?',
};
const yrs = (id: string, label: string): ScreeningQuestion =>
  ({ id, kind: 'number', required: true, suffix: 'years', label, placeholder: '0' });

export const SQB_ROLES: Role[] = [
  {
    id: 'ai-video-editor',
    title: 'AI Video Editor',
    subtitle: 'AI Filmmaking',
    dept: 'Post-Production',
    type: 'Contract',
    location: 'Noida Sector 4, Delhi NCR',
    onsite: 'On-site (mandatory)',
    experience: '2+ yrs with Generative AI',
    lede: 'Cut raw footage — and raw generation — into films that hold.',
    description:
      "An on-site, contract role for an AI Video Editor (AI Filmmaking). You'll edit and assemble raw footage into finished films: colour grading, motion graphics, and the visual elements that carry a story. You'll work directly with the creative team to hold every project to S'QB standards.",
    qualifications: [
      'Proficiency in video production and video editing tools and software',
      'Experience generating AI video while holding visual consistency and story mood',
      'Knowledge of motion graphics and graphic design for engaging visual elements',
      'Strong attention to detail, and the instinct to conceptualise creative storytelling',
      'Familiarity with AI-driven video tools (our current stack is below)',
      'Able to work on-site with a collaborative team in a fast-paced environment',
      'Excellent time management and communication skills',
    ],
    tools: true,
    questions: [
      COMMUTE,
      yrs('genai', 'How many years of experience do you have with Generative AI?'),
      yrs('editing', 'How many years of experience do you have with video editing?'),
      yrs('photoshop', 'How many years of experience do you have with Adobe Photoshop?'),
    ],
    datePosted: '2026-07-01',
    validThrough: '2026-10-31',
  },
  {
    id: 'ai-visual-artist',
    title: 'AI Visual Artist',
    subtitle: 'AI Video Creator',
    dept: 'AI Filmmaking',
    type: 'Contract',
    location: 'Noida Sector 4, Delhi NCR',
    onsite: 'On-site (mandatory)',
    experience: '2+ yrs with Generative AI',
    lede: 'Generate worlds that look shot, not rendered.',
    description:
      'An on-site, contract role for an AI Video Creator. You will generate AI video that holds visual consistency and story mood across a whole film — art-directing prompts, references and passes until the frame is indistinguishable from a shot one, then finishing it with motion graphics and design.',
    qualifications: [
      'Experience generating AI video, holding visual consistency and story mood',
      'Knowledge of motion graphics and graphic design for engaging visual elements',
      'Strong attention to detail and the ability to conceptualise creative storytelling',
      'Familiarity with AI-driven video and image models (our current stack is below)',
      'Proficiency in video production and video editing tools and software',
      'Able to work on-site with a collaborative team in a fast-paced environment',
      'Excellent time management and communication skills',
    ],
    tools: true,
    questions: [
      COMMUTE,
      yrs('genai', 'How many years of experience do you have with Generative AI?'),
      yrs('editing', 'How many years of experience do you have with video editing?'),
      yrs('photoshop', 'How many years of experience do you have with Adobe Photoshop?'),
    ],
    datePosted: '2026-07-01',
    validThrough: '2026-10-31',
  },
  {
    id: 'ai-creative-director',
    title: 'AI Creative Director',
    dept: 'Creative',
    type: 'Contract',
    location: 'Noida Sector 4, Delhi NCR',
    onsite: 'On-site (mandatory)',
    experience: '4+ yrs filmmaking · 2+ yrs Generative AI',
    lede: 'Own the vision. Direct the machine.',
    description:
      "A contractual, on-site role for an AI Creative Director. You'll own creative direction across projects — using storytelling and strategy to craft campaigns and content. Day to day: developing creative strategy, collaborating with branding teams, leading art direction, and integrating AI-driven content design into deliverables. You'll guide design and production teams so every deliverable lands the company's vision.",
    qualifications: [
      'Proficiency in creative direction and filmmaking, to craft compelling and innovative AI films',
      'Expertise in generative AI image and video models (our current stack is below)',
      'Experience fostering collaboration and guiding multidisciplinary teams to project goals',
      'Excellent communication, leadership and problem-solving abilities',
      'Familiarity with current creative and digital-marketing trends that resonate with modern audiences is a plus',
    ],
    tools: true,
    questions: [
      { id: 'onsite', kind: 'boolean', required: true, label: 'Are you comfortable working in an on-site setting?' },
      yrs('genai', 'How many years of experience do you have with Generative AI?'),
      yrs('filmmaking', 'How many years of experience do you have with filmmaking?'),
      yrs('editing', 'How many years of experience do you have with video editing?'),
    ],
    datePosted: '2026-07-01',
    validThrough: '2026-10-31',
  },
  {
    id: 'hr-executive',
    title: 'HR Executive',
    dept: 'People & Operations',
    type: 'Full Time',
    location: 'Noida, Delhi NCR',
    onsite: 'In office · WFH flexibility',
    experience: '2–4 yrs HR or recruitment',
    lede: 'Build the crew behind the camera.',
    description:
      "We're looking for an HR Executive who can help us build and manage a fast-growing creative team. This is not a traditional HR desk role. You'll actively handle hiring, onboarding, contracts, people operations, coordination, and day-to-day team management inside a high-speed production environment. You should be comfortable working with creators, editors, AI artists, filmmakers and internet-native teams.",
    responsibilities: [
      'Source candidates through LinkedIn, Indeed, Naukri, Internshala, referrals and creative communities',
      'Conduct initial screening and coordination calls',
      'Schedule and manage interviews with internal teams',
      'Handle offer letters, contracts, onboarding and documentation',
      'Manage attendance, leaves, payroll coordination and HR records',
      'Coordinate with founders on hiring priorities and team planning',
      'Maintain employee databases and hiring trackers',
      'Support team culture, engagement and smooth internal communication',
    ],
    qualifications: [
      '2 to 4 years of HR or recruitment experience',
      'Strong communication skills in English and Hindi',
      'Comfortable hiring in creative and startup environments',
      'Organised, proactive and execution-focused',
      'Able to manage multiple hiring pipelines at once',
      'Familiar with recruitment platforms and hiring workflows',
    ],
    bonus: [
      'Experience hiring editors, designers, content creators or production talent',
      'Interest in AI tools, media, filmmaking or internet culture',
      'Experience in startups, agencies or fast-paced teams',
    ],
    tools: false,
    questions: [
      { id: 'onsite', kind: 'boolean', required: true, label: 'Are you comfortable working on-site in Noida?' },
      yrs('hr', 'How many years of HR or recruitment experience do you have?'),
      { id: 'languages', kind: 'boolean', required: true, label: 'Are you fluent in both English and Hindi?' },
      { id: 'creative', kind: 'text', required: false, placeholder: 'Editors, designers, AI artists…', label: 'Which creative or production roles have you hired for?' },
    ],
    datePosted: '2026-07-01',
    validThrough: '2026-10-31',
  },
];

export const roleById = (id: string) => SQB_ROLES.find((r) => r.id === id) || null;
