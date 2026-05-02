import { supabaseAdmin, getGuidanceSignedUrl } from './supabase-admin';
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';

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

// Kept for backward-compat; processQuery no longer returns this shape.
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

export interface QueryMeta {
  intent: QueryIntent;
  sessionId: string;
  sources: MatchedSource[];
  advisoryDisclaimer: string;
}

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

type GuidanceResource = {
  id: string;
  title: string;
  category: string;
  content: string;
  file_url: string | null;
  tags: string[] | null;
  is_active: boolean;
};

type TopicBlueprint = {
  keywords: string[];
  label: string;
  sampleSites: string[];
  methods: string[];
  metrics: string[];
};

const TOPIC_BLUEPRINTS: TopicBlueprint[] = [
  {
    keywords: ['water', 'river', 'lake', 'groundwater', 'watershed', 'pollution'],
    label: 'Water Quality and Watershed Resilience',
    sampleSites: ['Laguna de Bay sub-basins', 'urban tributaries', 'agricultural watersheds'],
    methods: ['spatiotemporal sampling', 'land-use correlation', 'multivariate trend analysis'],
    metrics: ['BOD/COD', 'nutrient load', 'coliform', 'turbidity'],
  },
  {
    keywords: ['climate', 'adaptation', 'disaster', 'risk', 'resilience', 'hazard'],
    label: 'Climate Adaptation and Risk Governance',
    sampleSites: ['flood-prone barangays', 'upland farming communities', 'coastal municipalities'],
    methods: ['vulnerability indexing', 'household surveys', 'policy gap mapping'],
    metrics: ['adaptive capacity score', 'exposure index', 'recovery time'],
  },
  {
    keywords: ['mangrove', 'coastal', 'marine', 'reef', 'shoreline', 'fisheries'],
    label: 'Coastal Ecosystems and Blue Carbon',
    sampleSites: ['mangrove belts', 'seagrass meadows', 'municipal coastal zones'],
    methods: ['remote sensing', 'biodiversity transects', 'participatory mapping'],
    metrics: ['species richness', 'carbon stock', 'shoreline change'],
  },
  {
    keywords: ['waste', 'plastic', 'solid waste', 'circular', 'recycling'],
    label: 'Waste Systems and Circularity',
    sampleSites: ['campus facilities', 'public markets', 'barangay MRFs'],
    methods: ['waste audits', 'behavioral segmentation', 'policy implementation analysis'],
    metrics: ['diversion rate', 'contamination rate', 'collection efficiency'],
  },
  {
    keywords: ['biodiversity', 'forest', 'habitat', 'species', 'restoration'],
    label: 'Biodiversity Conservation and Habitat Restoration',
    sampleSites: ['forest fragments', 'restoration corridors', 'protected area buffer zones'],
    methods: ['species inventory', 'habitat suitability modeling', 'longitudinal monitoring'],
    metrics: ['abundance index', 'habitat quality score', 'restoration survival rate'],
  },
  {
    keywords: ['energy', 'renewable', 'solar', 'efficiency', 'adoption'],
    label: 'Energy Transition and Adoption Behavior',
    sampleSites: ['rural cooperatives', 'off-grid communities', 'institutional buildings'],
    methods: ['adoption modeling', 'cost-benefit analysis', 'stakeholder interviews'],
    metrics: ['adoption rate', 'payback period', 'emissions avoided'],
  },
];

// ── Resource retrieval ────────────────────────────────────────────────────────

async function fetchResourcesByFTS(query: string): Promise<GuidanceResource[]> {
  const sanitized = query
    .replace(/[^\w\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length >= 3)
    .slice(0, 8)
    .join(' | ');

  if (sanitized) {
    const { data } = await supabaseAdmin
      .from('guidance_resources')
      .select('id, title, category, content, file_url, tags, is_active')
      .eq('is_active', true)
      .textSearch('search_vector', sanitized, { type: 'plain', config: 'english' })
      .limit(3);
    if ((data ?? []).length > 0) return data as GuidanceResource[];
  }

  // Fallback: ilike on title when FTS returns nothing (e.g. before migration runs)
  const { data } = await supabaseAdmin
    .from('guidance_resources')
    .select('id, title, category, content, file_url, tags, is_active')
    .eq('is_active', true)
    .ilike('title', `%${query.slice(0, 50)}%`)
    .limit(3);
  return (data ?? []) as GuidanceResource[];
}

// ── Session history ───────────────────────────────────────────────────────────

async function fetchSessionHistory(sessionId: string): Promise<SessionTurn[]> {
  const { data } = await supabaseAdmin
    .from('ai_queries')
    .select('query, response, intent, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    (data ?? []) as Array<{ query: string; response: string; intent: string; created_at: string }>
  )
    .reverse()
    .map((row) => ({
      query: row.query,
      response: row.response,
      intent: row.intent as QueryIntent,
      timestamp: row.created_at,
    }));
}

// ── Prompt building ───────────────────────────────────────────────────────────

function buildCompactSystemPrompt(
  resources: GuidanceResource[],
  signedUrls: Map<string, string>
): string {
  const resourceLines = resources
    .map((r) => {
      const excerpt = r.content.slice(0, 250).trimEnd();
      const url = signedUrls.get(r.id);
      return `- **${r.title}** (${r.category}): ${excerpt}…${url ? ` [Full doc: ${url}]` : ''}`;
    })
    .join('\n');

  return `You are SINAG, a thesis planning companion for SESAM graduate students at UPLB.
You suggest directions and surface relevant resources — your adviser has final authority.
Be concise (150-300 words), collegial, markdown-formatted.
Never fabricate institutional rules, deadlines, or requirements.
Always end with: "Advisory: Confirm with your faculty adviser before acting on this guidance."

${resourceLines.length > 0 ? `Relevant guidance:\n${resourceLines}` : 'No specific guidance resources matched. Answer from general SESAM/UPLB thesis knowledge.'}`;
}

// ── Gemini streaming ──────────────────────────────────────────────────────────

async function callGeminiStream(
  systemPrompt: string,
  history: SessionTurn[],
  query: string
): Promise<AsyncIterable<string>> {
  if (!GEMINI_API_KEY) {
    throw new Error('AI provider not configured: missing GEMINI_API_KEY.');
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const historyContents = history.flatMap((turn) => [
    { role: 'user' as const, parts: [{ text: turn.query }] },
    { role: 'model' as const, parts: [{ text: turn.response }] },
  ]);

  const chat = ai.chats.create({
    model: 'gemini-2.0-flash',
    config: { systemInstruction: systemPrompt, maxOutputTokens: 800, temperature: 0.4 },
    history: historyContents,
  });

  const sdkStream = await chat.sendMessageStream({ message: query });

  async function* textStream(): AsyncGenerator<string> {
    for await (const chunk of sdkStream) {
      if (chunk.text) yield chunk.text;
    }
  }
  return textStream();
}

async function* singleChunkGenerator(text: string): AsyncGenerator<string> {
  yield text;
}

async function callGeminiWithRetry(
  systemPrompt: string,
  history: SessionTurn[],
  query: string,
  maxRetries = 3
): Promise<AsyncIterable<string>> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await callGeminiStream(systemPrompt, history, query);
    } catch (err) {
      const isRateLimit =
        err instanceof Error &&
        (err.message.includes('429') ||
          err.message.toLowerCase().includes('too many requests') ||
          err.message.toLowerCase().includes('resource_exhausted'));
      if (isRateLimit && attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Gemini request failed after retries.');
}

// ── Intent classification ─────────────────────────────────────────────────────

function determineIntentWithConfidence(query: string): { intent: QueryIntent; confidence: number } {
  const lower = query.toLowerCase();
  let bestIntent: QueryIntent = 'general';
  let maxScore = 0;
  let keywordCount = 0;

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [QueryIntent, string[]][]) {
    if (intent === 'general') continue;
    keywordCount = Math.max(keywordCount, keywords.length);
    const score = keywords.reduce((acc, kw) => acc + (lower.includes(kw) ? 1 : 0), 0);
    if (score > maxScore) {
      maxScore = score;
      bestIntent = intent;
    }
  }

  if (maxScore === 0 || keywordCount === 0) {
    return { intent: 'general', confidence: 0.35 };
  }

  return { intent: bestIntent, confidence: Math.min(1, maxScore / 3) };
}

// ── Topic helpers (unchanged) ─────────────────────────────────────────────────

function normalizeWords(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3);
}

function buildTopicRecommendations(query: string): string[] {
  const words = normalizeWords(query);
  const matched = TOPIC_BLUEPRINTS.map((b) => {
    const score = b.keywords.reduce((acc, kw) => {
      if (query.toLowerCase().includes(kw)) return acc + 2;
      return words.includes(kw) ? acc + 1 : acc;
    }, 0);
    return { blueprint: b, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.blueprint);

  const selected = matched.length > 0 ? matched : TOPIC_BLUEPRINTS.slice(0, 3);

  return selected.map((b, idx) => {
    const site = b.sampleSites[idx % b.sampleSites.length];
    const method = b.methods[idx % b.methods.length];
    const metric = b.metrics[idx % b.metrics.length];
    return `${idx + 1}. ${b.label}: Assess "${metric}" in ${site} using ${method}.`;
  });
}

function buildTopicRefinementPrompt(query: string): string {
  const words = normalizeWords(query);
  const seed = words.slice(0, 3).join(', ');
  if (!seed) {
    return 'Share 2-3 interests (for example: water quality, climate adaptation, mangroves), your preferred study site, and whether you prefer quantitative, qualitative, or mixed methods.';
  }
  return `To refine this further, confirm your preferred site and method for these interests: ${seed}.`;
}

export function buildClarificationQuestion(query: string, intent: QueryIntent): string {
  const normalized = normalizeWords(query).slice(0, 3).join(', ');
  const seed = normalized ? `I picked up: ${normalized}. ` : '';

  switch (intent) {
    case 'topic_ideation':
      return `${seed}To tailor topic recommendations, tell me your target domain, preferred study site, and method preference (quantitative, qualitative, or mixed).`;
    case 'research_design':
      return `${seed}To refine the design advice, share your research question, expected data type, and whether this is exploratory or hypothesis-testing.`;
    case 'ethics_compliance':
      return `${seed}To confirm the right ethics steps, tell me if you involve human participants, sensitive data, or protected species/ecosystems.`;
    case 'milestone_planning':
      return `${seed}To build a realistic timeline, share your target completion date, current thesis stage, and any fixed deadlines.`;
    case 'methodology':
      return `${seed}To recommend methods precisely, share your main objective, available dataset (if any), and analysis tools you can use.`;
    default:
      return `${seed}I need a bit more detail to answer accurately. Please share your goal, constraints, and expected output format.`;
  }
}

// ── Template fallback (used when Gemini is unavailable) ───────────────────────

function generateContextualHint(context: SessionTurn[]): string {
  if (context.length === 0) return '';
  const lastTurn = context[context.length - 1];
  return ` Following up on your earlier question about "${lastTurn.query}", `;
}

function generateResponse(
  query: string,
  intent: QueryIntent,
  resources: GuidanceResource[],
  context: SessionTurn[],
  _confidence: number
): string {
  const matchedTitles = resources.map((r) => r.title);
  const contextHint = generateContextualHint(context);

  switch (intent) {
    case 'topic_ideation': {
      const guide = resources.find((r) => r.title.includes('Format Guide'));
      const template = resources.find((r) => r.title.includes('Template'));
      const recommendations = buildTopicRecommendations(query);
      const refinement = buildTopicRefinementPrompt(query);
      return `Regarding topic ideation:${contextHint}a strong thesis topic should be specific, feasible, and aligned with SESAM research priorities.

Here are draft topic directions you can use immediately:
${recommendations.join('\n')}

${refinement}${
        guide ? ` Refer to the *${guide.title}* for scope expectations.` : ''
      }${
        template ? ` The *${template.title}* can help you structure your initial proposal.` : ''
      } Consider discussing your refined topic with your adviser for domain-specific alignment.

Advisory: Confirm with your faculty adviser before acting on this guidance.`.trim();
    }

    case 'research_design': {
      const guide = resources.find((r) => r.title.includes('Format Guide'));
      const template = resources.find((r) => r.title.includes('Template'));
      return `For research design:${contextHint}ensure your chosen framework aligns with your research questions and data availability.${
        guide ? ` The *${guide.title}* outlines acceptable frameworks.` : ''
      }${
        template ? ` Use the *${template.title}* to document your design rationale.` : ''
      } Validate your design with your adviser and, if needed, a methodologist.

Advisory: Confirm with your faculty adviser before acting on this guidance.`.trim();
    }

    case 'ethics_compliance': {
      const checklist = resources.find((r) => r.title.includes('Ethics'));
      return `For ethics compliance:${contextHint}all research involving human subjects or sensitive ecological data requires ethical clearance.${
        checklist ? ` Use the *${checklist.title}* to ensure all requirements are met before submission.` : ''
      } Note that SESAM requires institutional ethics approval prior to data collection. Your adviser must sign off on your ethics application.

Advisory: Confirm with your faculty adviser before acting on this guidance.`.trim();
    }

    case 'milestone_planning': {
      const guide = resources.find((r) => r.title.includes('Format Guide'));
      return `For milestone planning:${contextHint}break your thesis into clear stages: topic selection, proposal development, ethics approval, data collection, manuscript writing, and final defense.${
        guide ? ` The *${guide.title}* includes stage expectations and deliverables.` : ''
      } Work backwards from your target completion date and buffer time for revisions. Your adviser can help set realistic deadlines.

Advisory: Confirm with your faculty adviser before acting on this guidance.`.trim();
    }

    case 'methodology': {
      const checklist = resources.find((r) => r.title.includes('Literature Review'));
      const guide = resources.find((r) => r.title.includes('Format Guide'));
      return `For methodology:${contextHint}select methods that directly answer your research questions.${
        checklist ? ` The *${checklist.title}* may help you identify methodological gaps in existing literature.` : ''
      }${
        guide ? ` Refer to the *${guide.title}* for reporting standards.` : ''
      } Document your methods in sufficient detail for reproducibility. Always have your adviser or a statistician review your analytical plan.

Advisory: Confirm with your faculty adviser before acting on this guidance.`.trim();
    }

    default: {
      const guide = resources.find((r) => r.title.includes('Format Guide'));
      return `Thank you for your question.${contextHint}${
        resources.length > 0
          ? ` Based on the Guidance Library, I found the following relevant resources: ${matchedTitles.map((t) => `*${t}*`).join(', ')}.`
          : 'I could not find specific guidance documents matching your query. Please consult your faculty adviser for personalized support.'
      }${guide ? ` You may also find the *${guide.title}* useful as a general reference.` : ''}

Advisory: Confirm with your faculty adviser before acting on this guidance.`.trim();
    }
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function processQuery(
  query: string,
  sessionId?: string
): Promise<{ stream: AsyncIterable<string>; meta: QueryMeta }> {
  const resolvedSessionId = sessionId || `sess-${Date.now()}`;

  const [history, resources] = await Promise.all([
    fetchSessionHistory(resolvedSessionId),
    fetchResourcesByFTS(query),
  ]);

  const signedUrls = new Map<string, string>();
  await Promise.all(
    resources
      .filter((r) => r.file_url)
      .map(async (r) => {
        const url = await getGuidanceSignedUrl(r.file_url!);
        if (url) signedUrls.set(r.id, url);
      })
  );

  const systemPrompt = buildCompactSystemPrompt(resources, signedUrls);
  const { intent, confidence } = determineIntentWithConfidence(query);

  let stream: AsyncIterable<string>;
  try {
    stream = await callGeminiWithRetry(systemPrompt, history, query);
  } catch (llmError) {
    console.error('[ai-service] Gemini call failed, falling back to template:', llmError);
    stream = singleChunkGenerator(generateResponse(query, intent, resources, history, confidence));
  }

  const sources: MatchedSource[] = resources.map((r) => ({
    title: r.title,
    type: r.category,
    url: signedUrls.get(r.id) || r.file_url || '',
  }));

  return {
    stream,
    meta: { intent, sessionId: resolvedSessionId, sources, advisoryDisclaimer: ADVISORY_DISCLAIMER },
  };
}
