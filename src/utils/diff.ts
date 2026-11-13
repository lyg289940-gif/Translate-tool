export interface DiffToken {
  type: 'equal' | 'added' | 'removed';
  text: string;
}

/**
 * Tokenizes English/mixed text into words, whitespace, and punctuation
 * so word-level LCS diffs preserve formatting cleanly.
 */
function tokenize(input: string): string[] {
  return input.match(/(\s+|[A-Za-z0-9''-]+|[\u4e00-\u9fff]|[^\sA-Za-z0-9''-\u4e00-\u9fff])/g) ?? [];
}

/**
 * Computes a clean token-level diff using Longest Common Subsequence (LCS)
 * and merges adjacent tokens of the same operation type for crisp rendering.
 */
export function computeWordDiff(original: string, polished: string): DiffToken[] {
  const a = tokenize(original.trim());
  const b = tokenize(polished.trim());

  if (a.length === 0) {
    return polished.trim() ? [{ type: 'added', text: polished.trim() }] : [];
  }
  if (b.length === 0) {
    return original.trim() ? [{ type: 'removed', text: original.trim() }] : [];
  }

  // Guard against overly huge inputs causing O(n*m) slowdown
  if (a.length * b.length > 180000) {
    return [
      { type: 'removed', text: original.trim() },
      { type: 'equal', text: '\n' },
      { type: 'added', text: polished.trim() },
    ];
  }

  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (a[i] === b[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const raw: DiffToken[] = [];
  let i = 0;
  let j = 0;

  while (i < m && j < n) {
    if (a[i] === b[j]) {
      raw.push({ type: 'equal', text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      raw.push({ type: 'removed', text: a[i] });
      i++;
    } else {
      raw.push({ type: 'added', text: b[j] });
      j++;
    }
  }

  while (i < m) {
    raw.push({ type: 'removed', text: a[i] });
    i++;
  }
  while (j < n) {
    raw.push({ type: 'added', text: b[j] });
    j++;
  }

  // Merge consecutive same-type tokens
  const merged: DiffToken[] = [];
  for (const token of raw) {
    const last = merged[merged.length - 1];
    if (last && last.type === token.type) {
      last.text += token.text;
    } else {
      merged.push({ ...token });
    }
  }

  return merged;
}

/**
 * Computes diff summary statistics (kept, added words, removed words).
 */
export function summarizeDiff(tokens: DiffToken[]): { addedCount: number; removedCount: number } {
  let addedCount = 0;
  let removedCount = 0;

  for (const token of tokens) {
    const words = token.text.trim().split(/\s+/).filter(Boolean).length;
    if (token.type === 'added') addedCount += words;
    if (token.type === 'removed') removedCount += words;
  }

  return { addedCount, removedCount };
}

/**
 * Detects whether a text is predominantly Chinese, English, or Mixed.
 */
export function detectLanguageComposition(text: string): 'chinese' | 'mixed' | 'english' {
  const cjkMatches = text.match(/[\u4e00-\u9fff]/g) ?? [];
  const latinMatches = text.match(/[A-Za-z]/g) ?? [];
  const total = cjkMatches.length + latinMatches.length;

  if (total === 0) return 'chinese';
  const cjkRatio = cjkMatches.length / total;

  if (cjkRatio >= 0.72) return 'chinese';
  if (cjkRatio <= 0.12) return 'english';
  return 'mixed';
}
