function tokenize(text) {
  const base = String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9_./-]+/)
    .filter((t) => t.length >= 2);

  const extra = [];
  for (const tok of base) {
    if (/[._/-]/.test(tok)) {
      for (const piece of tok.split(/[._/-]+/)) {
        if (piece.length >= 2) extra.push(piece);
      }
    }
  }
  return base.concat(extra);
}

function buildBM25(chunks, { k1 = 1.5, b = 0.75 } = {}) {
  const N = chunks.length;
  const df = new Map();
  const tfs = new Array(N);
  const lengths = new Array(N);

  for (let i = 0; i < N; i++) {
    const toks = tokenize(`${chunks[i].filePath || ''}\n${chunks[i].text || ''}`);
    lengths[i] = toks.length;
    const tf = new Map();
    for (const t of toks) tf.set(t, (tf.get(t) || 0) + 1);
    tfs[i] = tf;
    for (const t of tf.keys()) df.set(t, (df.get(t) || 0) + 1);
  }

  const avgdl = lengths.reduce((a, b) => a + b, 0) / Math.max(1, N);
  const idf = new Map();
  for (const [term, dfi] of df.entries()) {
    idf.set(term, Math.log(1 + (N - dfi + 0.5) / (dfi + 0.5)));
  }

  function score(queryTokens, docIdx) {
    const tf = tfs[docIdx];
    const dl = lengths[docIdx];
    let s = 0;
    for (const q of queryTokens) {
      const f = tf.get(q);
      if (!f) continue;
      const idfq = idf.get(q) || 0;
      const denom = f + k1 * (1 - b + (b * dl) / avgdl);
      s += idfq * ((f * (k1 + 1)) / denom);
    }
    return s;
  }

  function search(query, topK = 30) {
    const qToks = tokenize(query);
    if (!qToks.length) return [];
    const candidates = new Set();
    for (const q of qToks) {
      for (let i = 0; i < N; i++) if (tfs[i].has(q)) candidates.add(i);
    }
    const scored = [];
    for (const i of candidates) {
      const s = score(qToks, i);
      if (s > 0) scored.push({ idx: i, score: s });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  return { search, stats: { N, avgdl, vocab: idf.size } };
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-12);
}

async function vectorSearch(query, chunks, embedFn, topK = 30) {
  const qVec = await embedFn(query);
  const scored = chunks.map((c, idx) => ({ idx, score: cosine(qVec, c.embedding || []) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

function rrfFuse(rankings, { k = 60, weights = null } = {}) {
  const fused = new Map();
  rankings.forEach((ranking, sysIdx) => {
    const w = weights ? weights[sysIdx] : 1;
    ranking.forEach((hit, rank) => {
      const contrib = w * (1 / (k + rank + 1));
      const cur = fused.get(hit.idx) || { idx: hit.idx, score: 0, components: {} };
      cur.score += contrib;
      cur.components[sysIdx] = { rank, raw: hit.score };
      fused.set(hit.idx, cur);
    });
  });
  return [...fused.values()].sort((a, b) => b.score - a.score);
}

function classifyQueryShape(query) {
  const q = String(query || '');
  const checks = {
    backticked: /`[^`]+`/.test(q),
    pathish: /[A-Za-z0-9_]+\/[A-Za-z0-9_./-]+/.test(q),
    fileExt: /\b[A-Za-z0-9_-]+\.(md|js|py|json|yml|yaml|ts)\b/.test(q),
    underscore: /[A-Za-z0-9]+_[A-Za-z0-9_]+/.test(q),
    camelCase: /[a-z]+[A-Z][A-Za-z0-9]*/.test(q),
    allCapsish: /\b[A-Z]{2,}[A-Z0-9_/-]*\b/.test(q),
    punctIdent: /[./-]/.test(q),
  };
  const hasIdentifier = Object.values(checks).some(Boolean);
  const proseWords = (q.match(/[A-Za-z]{4,}/g) || []).length;

  if (checks.fileExt && checks.punctIdent) return { shape: 'identifier', weights: [1.5, 1], proseWords, checks };
  if (hasIdentifier && proseWords >= 3) return { shape: 'mixed', weights: [1.25, 1.25], proseWords, checks };
  if (hasIdentifier) return { shape: 'identifier', weights: [1.5, 1], proseWords, checks };
  return { shape: 'prose', weights: [1, 1.5], proseWords, checks };
}

function applyBoosts(fused, chunks, { query, now = Date.now() } = {}) {
  const exactTerms = [
    ...((query.match(/"([^"]+)"/g) || []).map((s) => s.slice(1, -1).toLowerCase())),
    ...((query.match(/[A-Za-z][\w./-]{3,}/g) || []).filter((t) => /[_./-]|[A-Z]/.test(t)).map((t) => t.toLowerCase())),
  ];

  for (const hit of fused) {
    const c = chunks[hit.idx];
    if (c.mtimeMs) {
      const ageDays = (now - c.mtimeMs) / 86400_000;
      const recency = Math.pow(0.5, ageDays / 30);
      hit.score *= 1 + 0.25 * recency;
    }

    if (exactTerms.length) {
      const haystack = `${c.filePath || ''}\n${c.text || ''}`.toLowerCase();
      const hits = new Set(exactTerms.filter((t) => haystack.includes(t))).size;
      if (hits) hit.score *= Math.min(1 + 0.15 * hits, 1.6);
    }
  }

  fused.sort((a, b) => b.score - a.score);
  return fused;
}

async function hybridSearch({ query, chunks, embedFn, bm25, topK = 10, candidateK = 30, weights = null, applyRecency = true }) {
  const route = classifyQueryShape(query);
  const chosenWeights = weights || route.weights;
  const [bmHits, vecHits] = await Promise.all([
    Promise.resolve(bm25.search(query, candidateK)),
    vectorSearch(query, chunks, embedFn, candidateK),
  ]);

  let fused = rrfFuse([bmHits, vecHits], { weights: chosenWeights });
  if (applyRecency) fused = applyBoosts(fused, chunks, { query });

  return fused.slice(0, topK).map((hit) => ({
    chunk: chunks[hit.idx],
    score: hit.score,
    debug: hit.components,
    route,
    weights: chosenWeights,
  }));
}

module.exports = { tokenize, buildBM25, cosine, vectorSearch, rrfFuse, applyBoosts, classifyQueryShape, hybridSearch };
