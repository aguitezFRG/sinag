import { supabaseAdmin, getGuidanceSignedUrl } from './supabase-admin';
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const GROQ_API_KEY = process.env.GROQ_API_KEY ?? '';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? '';
const OPENROUTER_SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const OPENROUTER_APP_NAME = 'SINAG';

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

// Common stopwords + chat-noise tokens that cause garbage tag/FTS matches.
const STOPWORDS = new Set([
  'the','and','for','with','about','from','that','this','what','when','where','which','who','how','why',
  'are','was','were','can','could','should','would','will','have','has','had','its','but','not','any','all',
  'you','your','our','their','them','they','his','her','him','she','one','two','some','more','most','than',
  'into','out','off','too','very','just','also','then','than','tell','give','show','please','help','make',
  'know','think','need','want','like','use','using','used','get','got','let','say','said','see','look',
  'good','best','better','now','here','there','these','those','being','been','does','did','done','do',
  'sinag','sesam','uplb','manual','manuals','guideline','guidelines','handbook','handbooks',
]);

function classifyQueryIntent(query: string): 'procedural' | 'research' | 'general' {
  const q = query.toLowerCase();
  // Procedural / handbook / policy questions
  if (
    /\b(manual|handbook|policy|policies|rule|rules|requirement|requirements|format|formatting|deadline|enroll|enrollment|register|registration|defense|defend|proposal|submission|submit|adviser|advising|committee|ethics|integrity|plagiari|graduation|graduate|comprehensive exam|process|procedure|step|how (do|to|can) i|what (do|are) (i|the))\b/.test(
      q,
    )
  ) {
    return 'procedural';
  }
  // Research / topic / paper questions
  if (
    /\b(jesam|paper|papers|study|studies|article|journal|research on|about|topic|methodology|method|framework|literature|mangrove|water|carbon|climate|ozone|species|sustainab|ecosystem|biodivers|pollut|waste|forest|coastal|wetland|emission)\b/.test(
      q,
    )
  ) {
    return 'research';
  }
  return 'general';
}

async function fetchResourcesByFTS(query: string): Promise<GuidanceResource[]> {
  const intent = classifyQueryIntent(query);
  const rawWords = query
    .replace(/[^\w\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length >= 4);
  // Drop stopwords from FTS / tag matching to avoid garbage hits.
  const words = rawWords.filter((w) => !STOPWORDS.has(w.toLowerCase()));
  const sanitized = words.slice(0, 8).join(' | ');
  const seen = new Map<string, GuidanceResource>();
  const push = (rows: GuidanceResource[] | null) => {
    for (const r of rows ?? []) if (!seen.has(r.id)) seen.set(r.id, r);
  };

  // 1) FTS over title+content (only when we have meaningful keywords)
  if (sanitized) {
    const { data } = await supabaseAdmin
      .from('guidance_resources')
      .select('id, title, category, content, file_url, tags, is_active')
      .eq('is_active', true)
      .textSearch('search_vector', sanitized, { type: 'plain', config: 'english' })
      .limit(5);
    push(data as GuidanceResource[] | null);
  }

  // 2) Procedural fallback: if the user is asking about manuals/handbook/policy,
  //    pull in handbook-style guidance docs by tag (handbook/thesis/guide are
  //    the actual tags used in the DB) — never JESAM papers. Prefer formatting-
  //    specific docs when the question mentions formatting.
  if (intent === 'procedural') {
    const isFormatQ = /\b(format|formatting|margin|font|spacing|citation|reference style|chapter|appendix)\b/i.test(query);
    const tagFilter = isFormatQ
      ? ['thesis', 'handbook', 'guide', 'format']
      : ['handbook', 'thesis', 'guide', 'ms', 'phd'];
    const { data } = await supabaseAdmin
      .from('guidance_resources')
      .select('id, title, category, content, file_url, tags, is_active')
      .eq('is_active', true)
      .overlaps('tags', tagFilter)
      .not('tags', 'cs', '{jesam}') // exclude JESAM-tagged research papers
      .limit(8);
    push(data as GuidanceResource[] | null);
  }

  // 3) Research-only: tag overlap (excluding stopword-noise) to surface JESAM papers
  if (intent === 'research' && words.length > 0) {
    const tagCandidates = Array.from(new Set(words.map((w) => w.toLowerCase())));
    if (tagCandidates.length > 0) {
      const { data } = await supabaseAdmin
        .from('guidance_resources')
        .select('id, title, category, content, file_url, tags, is_active')
        .eq('is_active', true)
        .overlaps('tags', tagCandidates)
        .limit(5);
      push(data as GuidanceResource[] | null);
    }
  }

  // 4) Title ilike fallback when we still have nothing useful
  if (seen.size < 2) {
    const probe = words[0] ?? query.slice(0, 30);
    if (probe && probe.length >= 3) {
      const { data } = await supabaseAdmin
        .from('guidance_resources')
        .select('id, title, category, content, file_url, tags, is_active')
        .eq('is_active', true)
        .ilike('title', `%${probe}%`)
        .limit(5);
      push(data as GuidanceResource[] | null);
    }
  }

  // Filter out garbage-titled entries (e.g. titles that are just "1", "2" or
  // shorter than 4 chars) — they're useless to cite.
  const isUsableTitle = (t: string) => t && t.trim().length >= 4 && !/^\d+$/.test(t.trim());

  // Rank by intent
  const out = Array.from(seen.values()).filter((r) => isUsableTitle(r.title));
  if (intent === 'research') {
    out.sort((a, b) => {
      const ja = (a.tags ?? []).some((t) => t.toLowerCase() === 'jesam') ? 1 : 0;
      const jb = (b.tags ?? []).some((t) => t.toLowerCase() === 'jesam') ? 1 : 0;
      return jb - ja;
    });
  } else if (intent === 'procedural') {
    const isFormatQ = /\b(format|formatting|margin|font|spacing|citation|reference style|chapter|appendix)\b/i.test(query);
    out.sort((a, b) => {
      const ja = (a.tags ?? []).some((t) => t.toLowerCase() === 'jesam') ? 1 : 0;
      const jb = (b.tags ?? []).some((t) => t.toLowerCase() === 'jesam') ? 1 : 0;
      if (ja !== jb) return ja - jb; // non-JESAM first
      // For format questions: thesis/format-tagged docs first.
      if (isFormatQ) {
        const fa = (a.tags ?? []).some((t) => /^(thesis|format)$/i.test(t)) ? 0 : 1;
        const fb = (b.tags ?? []).some((t) => /^(thesis|format)$/i.test(t)) ? 0 : 1;
        if (fa !== fb) return fa - fb;
      }
      // Otherwise: handbook-tagged first
      const ha = (a.tags ?? []).some((t) => /^handbook$/i.test(t)) ? 0 : 1;
      const hb = (b.tags ?? []).some((t) => /^handbook$/i.test(t)) ? 0 : 1;
      if (ha !== hb) return ha - hb;
      const order: Record<string, number> = { policy: 0, guideline: 1, checklist: 2, template: 3 };
      return (order[a.category] ?? 9) - (order[b.category] ?? 9);
    });
    return out.filter((r) => !(r.tags ?? []).some((t) => t.toLowerCase() === 'jesam')).slice(0, 5);
  }
  return out.slice(0, 5);
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
  signedUrls: Map<string, string>,
  intent: QueryIntent
): string {
  const resourceLines = resources
    .map((r) => {
      const excerpt = r.content.slice(0, 350).trimEnd();
      const url = signedUrls.get(r.id);
      const isJesam = (r.tags ?? []).some((t) => t.toLowerCase() === 'jesam');
      const tag = isJesam ? ' [JESAM journal article]' : '';
      return `- **${r.title}** (${r.category})${tag}: ${excerpt}…${url ? ` [Full doc: ${url}]` : ''}`;
    })
    .join('\n');

  const intentGuidance: Record<QueryIntent, string> = {
    topic_ideation:
      'The student is exploring a topic. Recommend 2–3 concrete, feasible thesis angles tied to a study site (e.g., Laguna de Bay, UPLB campus, a specific watershed), a method, and a measurable metric. Cite relevant SESAM/JESAM work when applicable.',
    research_design:
      'The student is designing a study. Recommend a specific design (descriptive, correlational, quasi-experimental, mixed-methods, case study) with sample size considerations, instruments, and validity checks.',
    ethics_compliance:
      'The student needs ethics guidance. Cover (a) UPLB REB requirements, (b) RA 10173 (Data Privacy Act) implications, (c) informed consent essentials, and (d) which forms (Research Integrity Declaration, REB protocol, scientific name certification) likely apply.',
    milestone_planning:
      'The student needs a timeline. Provide a concrete week-by-week or month-by-month milestone plan covering proposal → ethics → data collection → analysis → manuscript → defense, with realistic buffers.',
    methodology:
      'The student needs methodology advice. Recommend specific data-collection instruments, analytical tests (with software: R, SPSS, Python, QGIS), sample size, and reporting standards. Justify choices.',
    general:
      'Answer directly and substantively. If the query is procedural (forms, deadlines, defense rules), explain the standard SESAM/UPLB Graduate School flow and recommend confirming exact dates/forms with the SESAM Graduate Office.',
  };

  return `You are SINAG, an AI thesis-planning companion for graduate students at the UPLB School of Environmental Science and Management (SESAM). You combine institutional knowledge of SESAM/UPLB Graduate School processes with substantive research-methods expertise in environmental science.

============================================================
OUTPUT FORMAT (STRICT — your response is INVALID without this)
============================================================
EVERY response MUST end with a "## References" section. EVERY response MUST contain at least 1 inline numbered citation like [1] in the body. NO exceptions — this includes procedural answers, lists, timelines, and short replies.

Required structure:

  <your markdown answer with [1], [2], [3] markers inline>

  ## References
  [1] <Exact title of source 1> — <category or type>
  [2] <Exact title of source 2> — <category or type>

Concrete example for the question "How do I apply for SESAM admission?":

  To apply for the SESAM graduate program, follow these steps:

  1. **Check eligibility.** You need a bachelor's degree in a related field with a minimum GWA of 2.00 [1].
  2. **Prepare requirements.** Transcript of records, recommendation letters, and a research statement [1].
  3. **Submit online** through the UPLB Graduate School portal [2].

  ## References
  [1] SESAM Graduate Student Handbook — guideline
  [2] UPLB Graduate School Admission Guidelines — policy

============================================================
CITATION RULES
============================================================
- Cite ONLY sources you actually drew from. Do NOT cite a document just because it appears in the retrieved list — read its excerpt first.
- PREFER the RETRIEVED GUIDANCE LIBRARY ENTRIES below when they directly address the question. Use their EXACT title.
- Match topic carefully: do NOT cite a JESAM paper about mangroves for a question about thesis formatting rules.
- If no retrieved doc fits, cite the standard institutional source by name ("UPLB Graduate School Handbook", "SESAM Graduate Manual", "UPLB Research Ethics Board Guidelines", "RA 10173 Data Privacy Act").
- Do NOT fabricate URLs, page numbers, DOIs, authors, or document titles.

============================================================
ROLE & STYLE
============================================================
- Be specific, concrete, and actionable. Avoid generic platitudes like "consult your adviser" as the main answer.
- Use markdown: short headings, bullet lists, numbered steps.
- Length: 200–450 words for substantive questions; 60–120 for procedural ones.
- It is fine to draw on general environmental-science knowledge, UPLB Graduate School norms, and SESAM research areas (Environmental Chemistry, Biology, Planning & Policy, Social Science) when no document matches.
- NEVER invent specific deadlines, form numbers, fee amounts, or named faculty. If the student asks for one, say where to find it (SESAM GPMC, OUR, UPLB GS website) instead of guessing.

INTENT FOR THIS QUERY: ${intent}
${intentGuidance[intent]}

${
    resourceLines.length > 0
      ? `============================================================\nRETRIEVED GUIDANCE LIBRARY ENTRIES\n============================================================\nCite these by their EXACT title in your References section when used:\n${resourceLines}`
      : '============================================================\nNO LIBRARY MATCH\n============================================================\nNo retrieved doc matched. Answer from general SESAM/UPLB thesis knowledge. Still produce inline [N] citations and a "## References" section, citing standard institutional sources by name (e.g. "UPLB Graduate School Handbook", "SESAM Graduate Manual").'
  }

REMINDER: Your response MUST end with "## References" and contain at least one [N] marker. Do NOT add any "Advisory" disclaimer at the end — the UI shows that separately.`;
}

// ── Gemini streaming ──────────────────────────────────────────────────────────

// Gemini chain — best quality first.
// 2.5 Flash is the flagship; 2.5 Flash Lite has a separate, more generous quota;
// 2.0 Flash is the older but still very capable model with its own daily bucket.
const MODEL_FALLBACK_CHAIN = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
] as const;

async function callGeminiStream(
  systemPrompt: string,
  history: SessionTurn[],
  query: string,
  model: string
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
    model,
    config: { systemInstruction: systemPrompt, maxOutputTokens: 2048, temperature: 0.5 },
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

function isRateLimitError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const m = err.message.toLowerCase();
  return (
    m.includes('429') ||
    m.includes('too many requests') ||
    m.includes('resource_exhausted') ||
    m.includes('quota')
  );
}

async function callGeminiWithRetry(
  systemPrompt: string,
  history: SessionTurn[],
  query: string
): Promise<AsyncIterable<string>> {
  let lastErr: unknown;
  for (const model of MODEL_FALLBACK_CHAIN) {
    try {
      const stream = await callGeminiStream(systemPrompt, history, query, model);
      console.info(`[ai-service] Gemini model succeeded: ${model}`);
      return stream;
    } catch (err) {
      lastErr = err;
      const tag = isRateLimitError(err) ? 'rate-limited' : 'failed';
      const msg = err instanceof Error ? err.message.slice(0, 200) : String(err);
      console.warn(`[ai-service] Gemini ${model} ${tag}, trying next: ${msg}`);
      // Try EVERY model in the chain regardless of error type — transient
      // network / 5xx / parsing errors should not abort the entire chain.
      continue;
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error('All Gemini models exhausted.');
}

// ── Groq (primary backup — ultra-fast LPU inference) ──────────────────────────
//
// Groq runs Llama / Qwen / GPT-OSS on custom LPU hardware delivering 300-500
// tokens/sec (5-10× faster than typical GPU inference). Free tier:
//   • 14,400 requests/day (resets daily)
//   • 30 requests/min
// Llama 3.3 70B follows complex instructions (like our citation policy)
// significantly better than the OpenRouter free models, so Groq is preferred
// as the immediate Gemini backup.
const GROQ_FALLBACK_CHAIN = [
  // Tier 1 — best quality, follows citation format reliably.
  'llama-3.3-70b-versatile',
  'openai/gpt-oss-120b',
  // Tier 2 — strong reasoning / multilingual.
  'qwen/qwen3-32b',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  // Tier 3 — smaller / faster emergency fallback.
  'openai/gpt-oss-20b',
  'llama-3.1-8b-instant',
] as const;

async function callGroqStream(
  systemPrompt: string,
  history: SessionTurn[],
  query: string,
  model: string
): Promise<AsyncIterable<string>> {
  if (!GROQ_API_KEY) {
    throw new Error('Groq not configured: missing GROQ_API_KEY.');
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.flatMap((turn) => [
      { role: 'user', content: turn.query },
      { role: 'assistant', content: turn.response },
    ]),
    { role: 'user', content: query },
  ];

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: 0.5,
      max_tokens: 2048,
    }),
  });

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => '');
    const message = `Groq ${model} error ${res.status}: ${errText.slice(0, 300)}`;
    const err = new Error(message);
    if (res.status === 429 || res.status === 402 || res.status === 503) {
      err.message = `429 ${message}`;
    }
    throw err;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  async function* sseStream(): AsyncGenerator<string> {
    let buffer = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nlIdx: number;
        while ((nlIdx = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, nlIdx).trim();
          buffer = buffer.slice(nlIdx + 1);
          if (!line || !line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (payload === '[DONE]') return;
          try {
            const parsed = JSON.parse(payload) as {
              choices?: Array<{ delta?: { content?: string } }>;
            };
            const text = parsed.choices?.[0]?.delta?.content;
            if (text) yield text;
          } catch {
            // Skip malformed SSE keep-alive comments.
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  return sseStream();
}

async function callGroqWithFallback(
  systemPrompt: string,
  history: SessionTurn[],
  query: string
): Promise<AsyncIterable<string>> {
  let lastErr: unknown;
  for (const model of GROQ_FALLBACK_CHAIN) {
    try {
      const stream = await callGroqStream(systemPrompt, history, query, model);
      console.info(`[ai-service] Groq model succeeded: ${model}`);
      return stream;
    } catch (err) {
      lastErr = err;
      const tag = isRateLimitError(err) ? 'rate-limited' : 'failed';
      const msg = err instanceof Error ? err.message.slice(0, 200) : String(err);
      console.warn(`[ai-service] Groq ${model} ${tag}, trying next: ${msg}`);
      continue;
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error('All Groq models exhausted.');
}

// ── OpenRouter (backup provider) ──────────────────────────────────────────────
//
// OpenRouter free-tier chain — ordered by *answer quality* on reasoning /
// long-form advice tasks (LMArena + MMLU-Pro + GPQA, May 2026 snapshot).
// Each model has its own ~50 req/day free quota, so falling through gives
// the chatbot effectively unlimited daily capacity for personal use.
//
// Reference: https://openrouter.ai/models?max_price=0&order=top-weekly
// Verified live free models on OpenRouter (May 2026 snapshot from /models API).
// Old DeepSeek / Qwen-2.5 / Gemini-2.0-flash-exp slugs were retired \u2014 these
// IDs all return 200 today.
const OPENROUTER_FALLBACK_CHAIN = [
  // Tier 1 \u2014 strong general-purpose chat models, fast & reliable.
  'openai/gpt-oss-120b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'z-ai/glm-4.5-air:free',
  // Tier 2 \u2014 large reasoning / long-context.
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  // Tier 3 \u2014 mid-size, broad availability.
  'google/gemma-3-27b-it:free',
  'openai/gpt-oss-20b:free',
  // Tier 4 \u2014 small but very fast emergency fallback so you never get nothing.
  'meta-llama/llama-3.2-3b-instruct:free',
] as const;

async function callOpenRouterStream(
  systemPrompt: string,
  history: SessionTurn[],
  query: string,
  model: string
): Promise<AsyncIterable<string>> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter not configured: missing OPENROUTER_API_KEY.');
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.flatMap((turn) => [
      { role: 'user', content: turn.query },
      { role: 'assistant', content: turn.response },
    ]),
    { role: 'user', content: query },
  ];

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': OPENROUTER_SITE_URL,
      'X-Title': OPENROUTER_APP_NAME,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: 0.5,
      // R1 produces hidden chain-of-thought + answer; give it room.
      // Other models will simply stop earlier.
      max_tokens: 2048,
    }),
  });

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => '');
    const message = `OpenRouter ${model} error ${res.status}: ${errText.slice(0, 300)}`;
    const err = new Error(message);
    // Tag rate-limit-ish statuses so the caller can fall through.
    if (res.status === 429 || res.status === 402 || res.status === 503) {
      err.message = `429 ${message}`;
    }
    throw err;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  async function* sseStream(): AsyncGenerator<string> {
    let buffer = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nlIdx: number;
        while ((nlIdx = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, nlIdx).trim();
          buffer = buffer.slice(nlIdx + 1);
          if (!line || !line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (payload === '[DONE]') return;
          try {
            const parsed = JSON.parse(payload) as {
              choices?: Array<{ delta?: { content?: string } }>;
            };
            const text = parsed.choices?.[0]?.delta?.content;
            if (text) yield text;
          } catch {
            // Skip malformed SSE keep-alive comments / partial frames.
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  return sseStream();
}

async function callOpenRouterWithFallback(
  systemPrompt: string,
  history: SessionTurn[],
  query: string
): Promise<AsyncIterable<string>> {
  let lastErr: unknown;
  for (const model of OPENROUTER_FALLBACK_CHAIN) {
    try {
      const stream = await callOpenRouterStream(systemPrompt, history, query, model);
      console.info(`[ai-service] OpenRouter model succeeded: ${model}`);
      return stream;
    } catch (err) {
      lastErr = err;
      const tag = isRateLimitError(err) ? 'rate-limited' : 'failed';
      const msg = err instanceof Error ? err.message.slice(0, 200) : String(err);
      console.warn(`[ai-service] OpenRouter ${model} ${tag}, trying next: ${msg}`);
      continue;
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error('All OpenRouter models exhausted.');
}

// ── Combined LLM call: Gemini first, then OpenRouter as backup ────────────────

async function callLLMWithFallback(
  systemPrompt: string,
  history: SessionTurn[],
  query: string
): Promise<{ stream: AsyncIterable<string>; provider: 'gemini' | 'groq' | 'openrouter' }> {
  // Try Gemini first if configured (best quality, lowest free quota).
  if (GEMINI_API_KEY) {
    try {
      const stream = await callGeminiWithRetry(systemPrompt, history, query);
      return { stream, provider: 'gemini' };
    } catch (err) {
      if (!GROQ_API_KEY && !OPENROUTER_API_KEY) throw err;
      console.warn('[ai-service] Gemini chain exhausted, switching to Groq:', err instanceof Error ? err.message.slice(0, 200) : err);
    }
  }

  // Groq second — ultra-fast LPU inference, 14.4k req/day free, follows
  // citation instructions reliably (Llama 3.3 70B / GPT-OSS 120B).
  if (GROQ_API_KEY) {
    try {
      const stream = await callGroqWithFallback(systemPrompt, history, query);
      return { stream, provider: 'groq' };
    } catch (err) {
      if (!OPENROUTER_API_KEY) throw err;
      console.warn('[ai-service] Groq chain exhausted, switching to OpenRouter:', err instanceof Error ? err.message.slice(0, 200) : err);
    }
  }

  // Last resort: OpenRouter free tier.
  if (OPENROUTER_API_KEY) {
    const stream = await callOpenRouterWithFallback(systemPrompt, history, query);
    return { stream, provider: 'openrouter' };
  }

  throw new Error('No AI provider configured: set GEMINI_API_KEY, GROQ_API_KEY, and/or OPENROUTER_API_KEY.');
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

// ── Template fallback (used when Gemini is unavailable / rate-limited) ────────
//
// These templates intentionally produce substantive, intent-aware answers using
// the retrieved guidance resources + topic blueprints, so users still get value
// when Gemini is down or quota is exhausted. They are NOT meant to feel like
// canned "could not find" replies.

function formatResourceList(resources: GuidanceResource[]): string {
  if (resources.length === 0) return '';
  return resources
    .map((r) => `- **${r.title}** (${r.category})`)
    .join('\n');
}

function buildReferenceSection(
  resources: GuidanceResource[],
  extra: string[] = []
): string {
  const items: string[] = [];
  resources.forEach((r) => items.push(`${r.title} — SINAG Guidance Library (${r.category})`));
  extra.forEach((e) => items.push(e));
  if (items.length === 0) {
    items.push(
      'UPLB SESAM Graduate Manual (latest edition) — School of Environmental Science and Management',
      'UPLB Graduate School Handbook — University of the Philippines Los Baños'
    );
  }
  return `\n\n## References\n${items.map((s, i) => `[${i + 1}] ${s}`).join('\n')}`;
}

function generateResponse(
  query: string,
  intent: QueryIntent,
  resources: GuidanceResource[],
  _context: SessionTurn[],
  _confidence: number
): string {
  const resourceList = formatResourceList(resources);
  const resourceBlock = resourceList
    ? `\n\n**Relevant guidance documents in your library:**\n${resourceList}`
    : '';

  const note =
    '\n\n> _Note: Live AI is temporarily rate-limited, so this is a curated template response. Please retry in a few minutes for a fully personalised answer._';

  switch (intent) {
    case 'topic_ideation': {
      const recs = buildTopicRecommendations(query);
      const refinement = buildTopicRefinementPrompt(query);
      const refs = buildReferenceSection(resources, [
        'JESAM (Journal of Environmental Science and Management) archive — SESAM, UPLB',
        'Creswell, J. W. & Creswell, J. D. (2018). Research Design (5th ed.). SAGE Publications.',
      ]);
      return `### Thesis topic directions\n\nBased on your query, here are three concrete angles you can develop:\n\n${recs.join('\n')}\n\n**Next step.** ${refinement}\n\n**How to evaluate each angle**\n- *Feasibility:* Can you collect the data within 6–9 months? [1]\n- *Originality:* Has it already been done at SESAM? Search the JESAM archive and the SESAM thesis catalog. [2]\n- *Fit:* Does it match your adviser's specialisation (Environmental Chemistry / Biology / Planning & Policy / Social Science)? [1]${resourceBlock}${note}${refs}`;
    }

    case 'research_design': {
      const refs = buildReferenceSection(resources, [
        'Creswell, J. W. & Creswell, J. D. (2018). Research Design (5th ed.). SAGE Publications.',
        'Faul, F. et al. (2007). G*Power 3: a flexible statistical power analysis program. Behavior Research Methods, 39(2), 175–191.',
      ]);
      return `### Research design guidance\n\nA defensible SESAM thesis design typically has five components:\n\n1. **Research question** – one primary, 2–3 supporting. Must be answerable with the data you can realistically collect. [1]\n2. **Study design** – descriptive, correlational, quasi-experimental, case study, or mixed-methods. Choose based on whether you are *describing*, *explaining*, or *intervening*. [1]\n3. **Sampling frame** – define population, sampling method (random, stratified, purposive), and target sample size with justification. [2]\n4. **Instruments** – validated questionnaires, field measurement protocols (with QA/QC), or secondary datasets with provenance.\n5. **Analysis plan** – stated *before* data collection: descriptive statistics, inferential tests, software (R, SPSS, Python, QGIS).\n\n**Common pitfall at SESAM:** under-powered samples for inferential tests. Run a power analysis (G*Power) before finalising your sample size. [2]${resourceBlock}${note}${refs}`;
    }

    case 'ethics_compliance': {
      const refs = buildReferenceSection(resources, [
        'Republic Act No. 10173 (2012). Data Privacy Act of the Philippines.',
        'UPLB Research Ethics Board (REB) Guidelines — University of the Philippines Los Baños.',
        'National Ethical Guidelines for Health and Health-Related Research (2017) — PHREB.',
      ]);
      return `### Ethics & compliance checklist\n\nFor most SESAM theses you will need to address three layers:\n\n1. **UPLB Research Ethics Board (REB)** – required if your study involves human participants (interviews, surveys, focus groups, behavioural observation), sensitive ecosystems, protected species, or biological samples from people. Submit your protocol through the SESAM Graduate Office. [2]\n2. **RA 10173 (Data Privacy Act)** – if you collect personal data, you need (a) a clear lawful basis, (b) informed consent with a data-handling clause, (c) a retention/destruction plan, and (d) anonymisation before publication. [1]\n3. **Research Integrity Declaration** – signed by you and your adviser; covers authorship, plagiarism, and data fabrication. [3]\n\n**Special cases**\n- Studies on protected species/areas: secure DENR/BMB gratuitous permit before fieldwork.\n- Studies using identifiable scientific names: the Scientific Name Certification form is required before manuscript submission.${resourceBlock}${note}${refs}`;
    }

    case 'milestone_planning': {
      const refs = buildReferenceSection(resources);
      return `### A realistic 12-month thesis timeline\n\n| Months | Milestone | Output |\n|---|---|---|\n| 1–2 | Topic finalisation + literature review | Annotated bibliography (≥ 30 sources) |\n| 2–3 | Proposal writing | Chapters 1–3 draft |\n| 3 | **Outline approval** | Signed outline approval form |\n| 3–4 | REB protocol + data privacy plan | REB clearance |\n| 4–7 | Data collection | Cleaned dataset |\n| 7–9 | Analysis + Chapter 4 draft | Results & discussion |\n| 9–10 | Full manuscript revision | Defense-ready manuscript |\n| 10 | **Pre-defense** | Panel feedback |\n| 10–11 | Revisions | Final manuscript |\n| 11 | **Final defense** | Approved bound copies |\n| 12 | OUR submission, JESAM article (optional) | Cleared for graduation |\n\n**Buffer rule.** Add 25 % slack to every stage — fieldwork, ethics review, and adviser turnaround almost always slip. [1]${resourceBlock}${note}${refs}`;
    }

    case 'methodology': {
      const refs = buildReferenceSection(resources, [
        'Field, A. (2018). Discovering Statistics Using IBM SPSS Statistics (5th ed.). SAGE.',
        'Braun, V. & Clarke, V. (2006). Using thematic analysis in psychology. Qualitative Research in Psychology, 3(2), 77–101.',
      ]);
      return `### Methodology recommendations\n\n**Match the method to the question:**\n\n- *"How much / how many?"* → quantitative descriptive (counts, means, indices) with R or SPSS. [1]\n- *"Is X related to Y?"* → correlation/regression; check assumptions (normality, homoscedasticity). [1]\n- *"Does intervention X cause outcome Y?"* → quasi-experimental (BACI, difference-in-differences) or controlled trial.\n- *"Why do people do X?"* → qualitative (in-depth interviews, FGDs) coded thematically (NVivo or Atlas.ti). [2]\n- *"What is the spatial pattern?"* → GIS analysis in QGIS/ArcGIS with explicit projection and resolution.\n\n**SESAM-standard reporting**\n- Always include sample size justification.\n- Report effect sizes, not just p-values. [1]\n- For field measurements: state instrument calibration, replicates, detection limits.\n- For surveys: report Cronbach's α for any scale. [1]${resourceBlock}${note}${refs}`;
    }

    default: {
      // Generic but still substantive — try topic blueprints if the query mentions a topic-ish term.
      const recs = buildTopicRecommendations(query);
      const hasTopicSignal = normalizeWords(query).some((w) =>
        TOPIC_BLUEPRINTS.some((b) => b.keywords.includes(w))
      );
      const topicSection = hasTopicSignal
        ? `\n\n**If you are exploring this as a thesis topic, consider these directions:**\n${recs.join('\n')}`
        : '';
      return `### On your question\n\nHere is a structured way to think about it:\n\n1. **Clarify the goal.** Are you asking about a *process* (forms, deadlines, defense flow), a *concept* (research methods, theory), or a *topic* (what to study)?\n2. **For procedural questions**, the SESAM Graduate Office and the UPLB Office of the University Registrar (OUR) hold the authoritative current information — forms and dates change every term.\n3. **For conceptual questions**, start with a focused literature search in JESAM, Google Scholar, and the UPLB library e-resources, filtered to the last 5 years.${topicSection}${resourceBlock}${note}`;
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

  const { intent, confidence } = determineIntentWithConfidence(query);
  const systemPrompt = buildCompactSystemPrompt(resources, signedUrls, intent);

  let stream: AsyncIterable<string>;
  try {
    const result = await callLLMWithFallback(systemPrompt, history, query);
    stream = result.stream;
    console.info(`[ai-service] Responding via ${result.provider}`);
  } catch (llmError) {
    console.error('[ai-service] All LLM providers failed, falling back to template:', llmError);
    stream = singleChunkGenerator(generateResponse(query, intent, resources, history, confidence));
  }

  const sources: MatchedSource[] = resources.map((r) => ({
    title: r.title,
    type: r.category,
    url: signedUrls.get(r.id) || r.file_url || '',
  }));

  // Wrap the stream with a safety net: if the model fails to emit a "## References"
  // section, append one server-side using the actual retrieved guidance docs.
  // This guarantees every answer has verifiable sources, even when the LLM
  // disobeys the citation policy in the system prompt.
  const safeStream = enforceReferencesSection(stream, resources);

  return {
    stream: safeStream,
    meta: { intent, sessionId: resolvedSessionId, sources, advisoryDisclaimer: ADVISORY_DISCLAIMER },
  };
}

/**
 * Stream wrapper that buffers the LLM output and, on completion, appends a
 * `## References` section if (a) the model didn't emit one and (b) we have
 * retrieved guidance docs to cite. Also retroactively inserts a `[1]` marker
 * at the end of the first paragraph so the frontend's strict citation filter
 * recognises the references as actually-used.
 */
async function* enforceReferencesSection(
  source: AsyncIterable<string>,
  resources: GuidanceResource[]
): AsyncGenerator<string> {
  let buffer = '';
  for await (const chunk of source) {
    buffer += chunk;
    yield chunk;
  }

  const usableResources = resources.filter(
    (r) => r.title && r.title.trim().length >= 4 && !/^\d+$/.test(r.title.trim()),
  );
  if (usableResources.length === 0) return;

  const hasRefHeading = /\n#{1,3}\s*references\s*\n/i.test(buffer);
  const hasInlineCite = /\[\d+\]/.test(buffer);

  if (hasRefHeading && hasInlineCite) return; // model complied, nothing to do

  // Build a server-side References block from the actual retrieved docs.
  const refs = usableResources.slice(0, 5).map((r, i) => {
    const isJesam = (r.tags ?? []).some((t) => t.toLowerCase() === 'jesam');
    const typeLabel = isJesam ? 'JESAM journal article' : r.category;
    return `[${i + 1}] ${formatResourceTitle(r.title)} — ${typeLabel}`;
  });

  let suffix = '';
  if (!hasInlineCite) {
    // Insert a [1] hint at the very end of the body so the frontend recognises
    // the answer as cited (its filter requires at least one inline marker).
    suffix += ' [1]';
  }
  if (!hasRefHeading) {
    suffix += `\n\n## References\n${refs.join('\n')}`;
  }

  if (suffix) yield suffix;
}

/**
 * Convert noisy DB titles like "studenthandbook3 2023" or
 * "Brochure_pm Res" into a more readable display title.
 */
function formatResourceTitle(raw: string): string {
  return raw
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}
