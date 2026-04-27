import { guidanceResources } from './dummy-data';

export type QueryIntent =
  | 'topic_ideation'
  | 'research_design'
  | 'ethics_compliance'
  | 'milestone_planning'
  | 'methodology'
  | 'general';

export interface MatchedSource {
  title: string;
  type: string;
  url: string;
}

export interface AIServiceResponse {
  response: string;
  sources: MatchedSource[];
  intent: QueryIntent;
  advisoryDisclaimer: string;
  sessionId: string;
}

export interface SessionTurn {
  query: string;
  response: string;
  intent: QueryIntent;
  timestamp: string;
}

const sessions = new Map<string, SessionTurn[]>();

const ADVISORY_DISCLAIMER =
  'This guidance is advisory only. Human validation by your adviser is the final authority.';

const INTENT_KEYWORDS: Record<QueryIntent, string[]> = {
  topic_ideation: [
    'topic',
    'idea',
    'title',
    'scope',
    'research question',
    'problem statement',
    'thesis title',
    'research area',
    'interest',
    'brainstorm',
  ],
  research_design: [
    'design',
    'framework',
    'approach',
    'conceptual',
    'theoretical framework',
    'qualitative',
    'quantitative',
    'mixed methods',
    'sampling',
    'sample size',
    'validity',
    'reliability',
    'hypothesis',
  ],
  ethics_compliance: [
    'ethics',
    'consent',
    'irb',
    'anonymization',
    'privacy',
    'ethical',
    'committee',
    'ethical clearance',
    'informed consent',
    'data privacy',
    'ra 10173',
  ],
  milestone_planning: [
    'timeline',
    'schedule',
    'deadline',
    'milestone',
    'gantt',
    'plan',
    'due date',
    'completion',
    'stage',
    'workflow',
    'calendar',
  ],
  methodology: [
    'method',
    'statistical',
    'analysis',
    'data collection',
    'survey',
    'interview',
    'spss',
    'r software',
    'python',
    'gis',
    'spatial',
    'regression',
    'descriptive',
    'pra',
    'participatory',
    'instrument',
    'questionnaire',
  ],
  general: [],
};

function determineIntent(query: string): QueryIntent {
  const lower = query.toLowerCase();
  let bestIntent: QueryIntent = 'general';
  let maxScore = 0;

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [
    QueryIntent,
    string[]
  ][]) {
    if (intent === 'general') continue;
    const score = keywords.reduce(
      (acc, kw) => acc + (lower.includes(kw) ? 1 : 0),
      0
    );
    if (score > maxScore) {
      maxScore = score;
      bestIntent = intent;
    }
  }

  return bestIntent;
}

function scoreResource(
  query: string,
  resource: (typeof guidanceResources)[0]
): number {
  const lower = query.toLowerCase();
  const words = lower.split(/\s+/).filter((w) => w.length > 2);
  let score = 0;

  words.forEach((w) => {
    if (resource.title.toLowerCase().includes(w)) score += 3;
    if (resource.content.toLowerCase().includes(w)) score += 2;
  });

  resource.tags.forEach((tag) => {
    if (lower.includes(tag.toLowerCase())) score += 4;
  });

  return score;
}

function findRelevantResources(query: string) {
  const scored = guidanceResources
    .filter((r) => r.isActive)
    .map((r) => ({ resource: r, score: scoreResource(query, r) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((s) => s.resource);
}

function generateContextualHint(context: SessionTurn[]): string {
  if (context.length === 0) return '';
  const lastTurn = context[context.length - 1];
  return ` Following up on your earlier question about "${lastTurn.query}", `;
}

function generateResponse(
  query: string,
  intent: QueryIntent,
  resources: (typeof guidanceResources)[0][],
  context: SessionTurn[]
): string {
  const matchedTitles = resources.map((r) => r.title);
  const contextHint = generateContextualHint(context);

  switch (intent) {
    case 'topic_ideation': {
      const guide = resources.find((r) => r.title.includes('Format Guide'));
      const template = resources.find((r) => r.title.includes('Template'));
      return `Regarding topic ideation:${contextHint}a strong thesis topic should be specific, feasible, and aligned with SESAM research priorities.${
        guide ? ` Refer to the *${guide.title}* for scope expectations.` : ''
      }${
        template
          ? ` The *${template.title}* can help you structure your initial proposal.`
          : ''
      } Consider discussing your refined topic with your adviser for domain-specific alignment.`.trim();
    }

    case 'research_design': {
      const guide = resources.find((r) => r.title.includes('Format Guide'));
      const template = resources.find((r) => r.title.includes('Template'));
      return `For research design:${contextHint}ensure your chosen framework aligns with your research questions and data availability.${
        guide
          ? ` The *${guide.title}* outlines acceptable frameworks.`
          : ''
      }${
        template
          ? ` Use the *${template.title}* to document your design rationale.`
          : ''
      } Validate your design with your adviser and, if needed, a methodologist.`.trim();
    }

    case 'ethics_compliance': {
      const checklist = resources.find((r) => r.title.includes('Ethics'));
      return `For ethics compliance:${contextHint}all research involving human subjects or sensitive ecological data requires ethical clearance.${
        checklist
          ? ` Use the *${checklist.title}* to ensure all requirements are met before submission.`
          : ''
      } Note that SESAM requires institutional ethics approval prior to data collection. Your adviser must sign off on your ethics application.`.trim();
    }

    case 'milestone_planning': {
      const guide = resources.find((r) => r.title.includes('Format Guide'));
      return `For milestone planning:${contextHint}break your thesis into clear stages: topic selection, proposal development, ethics approval, data collection, manuscript writing, and final defense.${
        guide
          ? ` The *${guide.title}* includes stage expectations and deliverables.`
          : ''
      } Work backwards from your target completion date and buffer time for revisions. Your adviser can help set realistic deadlines.`.trim();
    }

    case 'methodology': {
      const checklist = resources.find((r) =>
        r.title.includes('Literature Review')
      );
      const guide = resources.find((r) => r.title.includes('Format Guide'));
      return `For methodology:${contextHint}select methods that directly answer your research questions.${
        checklist
          ? ` The *${checklist.title}* may help you identify methodological gaps in existing literature.`
          : ''
      }${
        guide
          ? ` Refer to the *${guide.title}* for reporting standards.`
          : ''
      } Document your methods in sufficient detail for reproducibility. Always have your adviser or a statistician review your analytical plan.`.trim();
    }

    default: {
      const guide = resources.find((r) => r.title.includes('Format Guide'));
      return `Thank you for your question.${contextHint}${
        resources.length > 0
          ? ` Based on the Guidance Library, I found the following relevant resources: ${matchedTitles
              .map((t) => `*${t}*`)
              .join(', ')}.`
          : 'I could not find specific guidance documents matching your query. Please consult your faculty adviser for personalized support.'
      }${
        guide
          ? ` You may also find the *${guide.title}* useful as a general reference.`
          : ''
      }`.trim();
    }
  }
}

export function processQuery(
  query: string,
  sessionId?: string
): AIServiceResponse {
  const resolvedSessionId = sessionId || `sess-${Date.now()}`;
  const context = sessions.get(resolvedSessionId) ?? [];

  const intent = determineIntent(query);
  const resources = findRelevantResources(query);
  const responseText = generateResponse(query, intent, resources, context);

  const sources: MatchedSource[] = resources.map((r) => ({
    title: r.title,
    type: r.category,
    url: r.fileUrl || '',
  }));

  const newTurn: SessionTurn = {
    query,
    response: responseText,
    intent,
    timestamp: new Date().toISOString(),
  };
  sessions.set(resolvedSessionId, [...context, newTurn]);

  return {
    response: responseText,
    sources,
    intent,
    advisoryDisclaimer: ADVISORY_DISCLAIMER,
    sessionId: resolvedSessionId,
  };
}

export function getSessionContext(sessionId: string): SessionTurn[] {
  return sessions.get(sessionId) ?? [];
}
