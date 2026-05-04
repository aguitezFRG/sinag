export interface HomepageChatResponse {
  content: string;
  isAdvising: boolean;
}

function scoreKeywords(input: string, keywords: string[]): number {
  const lower = input.toLowerCase();
  let score = 0;

  for (const keyword of keywords) {
    if (lower.includes(keyword.toLowerCase())) {
      score += 1;
    }
  }

  return Math.min(score, 1);
}

const FAQ_RESPONSES: Record<string, HomepageChatResponse> = {
  admissions: {
    content: `**Admissions & Enrollment**

SESAM offers graduate programs in Environmental Science, Environmental Diplomacy and Negotiations, and PM-TMEM.

For exact requirements, check the official SESAM website or contact the graduate office.`,
    isAdvising: false,
  },
  deadlines: {
    content: `**Deadlines**

Deadlines vary by program and academic year. Please confirm the current schedule with SESAM or the Graduate School.`,
    isAdvising: false,
  },
  programs: {
    content: `**SESAM Programs**

- M.S. in Environmental Science
- Ph.D. in Environmental Science
- Ph.D. in Environmental Diplomacy and Negotiations
- PM-TMEM`,
    isAdvising: false,
  },
  contact: {
    content: `**Contact SESAM**

Email: sesam@uplb.edu.ph
Phone: (049) 536-2509`,
    isAdvising: false,
  },
};

const ADVISING_RESPONSES: Record<string, HomepageChatResponse> = {
  topic: {
    content: `**Thesis Topic Ideas**

1. Review recent SESAM and JESAM work
2. Choose a feasible site and method
3. Make sure the topic fits your adviser expertise

For personalized help, log in to SINAG.`,
    isAdvising: true,
  },
  methodology: {
    content: `**Research Design Basics**

Pick the method that matches your question, define your sample, and state the analysis plan early.

For a tailored recommendation, log in to SINAG.`,
    isAdvising: true,
  },
  ethics: {
    content: `**Research Ethics**

If your study involves people, sensitive data, or protected sites, you may need ethics clearance.

Log in to SINAG for a more specific checklist.`,
    isAdvising: true,
  },
  defense: {
    content: `**Defense Preparation**

Review your proposal, know your methods, and prepare for committee questions.

Log in to SINAG for a more detailed prep plan.`,
    isAdvising: true,
  },
  literature: {
    content: `**Literature Review**

Search JESAM, Google Scholar, and SESAM guidance documents. Group papers by theme and identify the gap.

Log in to SINAG for a deeper literature strategy.`,
    isAdvising: true,
  },
};

export function getHomepageChatResponse(query: string): HomepageChatResponse {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return {
      content: `Hi! I'm SINAG, SESAM's AI advising assistant. Ask about programs, admissions, thesis planning, methodology, ethics, or defense prep.`,
      isAdvising: false,
    };
  }

  const faqScores = {
    admissions: scoreKeywords(normalized, ['admit', 'apply', 'application', 'enroll', 'requirements']),
    deadlines: scoreKeywords(normalized, ['deadline', 'when', 'schedule', 'timeline']),
    programs: scoreKeywords(normalized, ['program', 'degree', 'ms', 'phd', 'tmem']),
    contact: scoreKeywords(normalized, ['contact', 'email', 'phone', 'office']),
  };

  const advisingScores = {
    topic: scoreKeywords(normalized, ['topic', 'title', 'thesis idea', 'research question']),
    methodology: scoreKeywords(normalized, ['method', 'methodology', 'design', 'analysis', 'sampling']),
    ethics: scoreKeywords(normalized, ['ethics', 'reb', 'consent', 'privacy', 'approval']),
    defense: scoreKeywords(normalized, ['defense', 'proposal', 'committee', 'panel', 'exam']),
    literature: scoreKeywords(normalized, ['literature', 'review', 'paper', 'journal', 'citation']),
  };

  const bestFaq = Object.entries(faqScores).sort((a, b) => b[1] - a[1])[0];
  const bestAdvising = Object.entries(advisingScores).sort((a, b) => b[1] - a[1])[0];

  if (bestFaq && bestFaq[1] > (bestAdvising?.[1] ?? 0) && bestFaq[1] > 0) {
    return FAQ_RESPONSES[bestFaq[0]];
  }

  if (bestAdvising && bestAdvising[1] > 0) {
    return ADVISING_RESPONSES[bestAdvising[0]];
  }

  return {
    content: `I can help with admissions, program questions, deadlines, and general thesis tips. For personalized research guidance, log in to SINAG.`,
    isAdvising: true,
  };
}
