/**
 * Shared helpers for parsing and rendering the trailing "## References"
 * section produced by the SINAG AI service.
 *
 * Used by both the full AIChat and the MiniChatbot so they render references
 * identically (amber card, [N] markers, deduped + renumbered to only what was
 * actually cited inline).
 */

export interface MergedRef {
  text: string;
  url?: string;
}

export interface RefSource {
  title: string;
  type: string;
  url?: string;
}

/**
 * Convert literal escape sequences ("\\n", "\\t") that older template
 * fallbacks may have persisted into the DB into real whitespace so markdown
 * renders correctly.
 */
export function sanitizeLegacyEscapes(s: string): string {
  if (!s) return s;
  if (!/\\n|\\t|\\"/.test(s)) return s;
  return s.replace(/\\n/g, '\n').replace(/\\t/g, '  ').replace(/\\"/g, '"');
}

/**
 * Splits an assistant markdown response into the main body and a list of
 * reference strings, by detecting a trailing "## References" section.
 */
export function parseAssistantContent(content: string): {
  body: string;
  parsedRefs: string[];
} {
  const normalized = sanitizeLegacyEscapes(content);
  const refHeadingMatch = normalized.match(/\n#{1,3}\s*references\s*\n/i);
  if (!refHeadingMatch || refHeadingMatch.index === undefined) {
    return { body: normalized, parsedRefs: [] };
  }
  const body = normalized.slice(0, refHeadingMatch.index).trimEnd();
  const refSection = normalized.slice(refHeadingMatch.index + refHeadingMatch[0].length);
  const parsedRefs: string[] = [];
  const lines = refSection.split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    // Accept "[1] text", "1. text", or "- text"
    const m =
      line.match(/^\[\d+\]\s*(.+)$/) ||
      line.match(/^\d+\.\s*(.+)$/) ||
      line.match(/^[-*]\s*(.+)$/);
    if (m) parsedRefs.push(m[1].trim());
  }
  return { body, parsedRefs };
}

/** Pretty-print noisy DB titles (truncate very long ones). */
export function formatTitle(raw: string): string {
  if (!raw) return 'Untitled document';
  let t = raw.trim();
  if (t.length > 110) t = t.slice(0, 110).trimEnd() + '…';
  return t;
}

/**
 * Merge model-cited references with the retrieved guidance documents (server
 * `meta.sources`). Dedups by lowercased title prefix.
 */
export function mergeRefsWithSources(
  parsedRefs: string[],
  sources?: RefSource[]
): MergedRef[] {
  const out: MergedRef[] = parsedRefs.map((text) => {
    const m = text.match(/(https?:\/\/\S+)/);
    return { text, url: m?.[1] };
  });
  const seen = new Set(
    out.map((r) =>
      r.text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 60)
    )
  );
  for (const s of sources ?? []) {
    if (!s?.title) continue;
    const key = s.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .slice(0, 60);
    if (seen.has(key)) continue;
    seen.add(key);
    const typeLabel = s.type ? ` — ${s.type}` : '';
    out.push({ text: `${formatTitle(s.title)}${typeLabel}`, url: s.url });
  }
  return out;
}

/**
 * Post-process the markdown body so that:
 *  - "[synthesis]" markers are removed (they're noise to readers).
 *  - Only references actually cited via `[N]` in the body are kept.
 *  - Citations are renumbered sequentially based on first appearance, then
 *    rendered as small superscript chips.
 *
 * Returns the rewritten body and the filtered + renumbered references list.
 */
export function processCitations(
  body: string,
  allRefs: MergedRef[]
): { body: string; refs: MergedRef[] } {
  if (!body) return { body, refs: [] };

  let cleaned = body.replace(/\s*\[synthesis\]/gi, '');

  const usedOrder: number[] = [];
  const seen = new Set<number>();
  for (const m of cleaned.matchAll(/\[(\d+)\]/g)) {
    const n = Number(m[1]);
    if (!Number.isFinite(n) || n < 1 || n > allRefs.length) continue;
    if (!seen.has(n)) {
      seen.add(n);
      usedOrder.push(n);
    }
  }

  if (usedOrder.length === 0) {
    return { body: cleaned, refs: [] };
  }

  const oldToNew = new Map<number, number>();
  const refs: MergedRef[] = [];
  usedOrder.forEach((oldIdx, i) => {
    oldToNew.set(oldIdx, i + 1);
    refs.push(allRefs[oldIdx - 1]);
  });

  cleaned = cleaned.replace(/\[(\d+)\]/g, (_full, raw) => {
    const n = Number(raw);
    const mapped = oldToNew.get(n);
    if (!mapped) return '';
    return `<sup class="sinag-cite">${mapped}</sup>`;
  });

  return { body: cleaned, refs };
}
