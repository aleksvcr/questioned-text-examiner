/* Revision bench.
   Two kinds of advice, kept strictly apart:
   - MECHANICAL: deterministic text edits the app can apply itself (delete a
     filler phrase, unstack a hedge, swap a bureaucratic verb).
   - JUDGMENT: things only the author can do, because they need facts, opinions
     and a voice the instrument does not have.
   Mechanical edits raise the human read a little. Judgment edits are what
   actually change a document. The UI says so plainly. */

import { LANGUAGES } from "./languages/index.js";
import { words } from "./analyze.js";

const cap = (s) => (s ? s[0].toLocaleUpperCase() + s.slice(1) : s);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ---------------- mechanical rule tables ---------------- */

// Openers that add nothing. Stripping them makes the sentence start on content.
const FILLER_OPENERS = {
  en: [
    /\b(?:it is|it's) (?:important|worth|essential|crucial|necessary|vital) to (?:note|mention|highlight|remember|point out|understand|recognise|recognize) that\s+/gi,
    /\b(?:it should be noted|it must be noted|it bears mentioning) that\s+/gi,
    /^in today's (?:rapidly )?(?:evolving|changing|complex|digital|modern) [a-z ]{2,30},\s*/gim,
    /^in (?:the )?(?:world|landscape|realm) of [a-z ]{2,30},\s*/gim,
    /\bwhen it comes to\s+/gi,
    /\bat the end of the day,\s*/gi,
    /\bin order to\b/gi,
  ],
  es: [
    /\bes (?:importante|fundamental|esencial|crucial) (?:destacar|señalar|mencionar|notar|recordar|tener en cuenta) que\s+/gi,
    /\bcabe (?:destacar|señalar|mencionar) que\s+/gi,
    /\bvale la pena (?:destacar|señalar|mencionar) que\s+/gi,
    /^en el mundo actual,\s*/gim,
    /^en la era digital,\s*/gim,
    /\ba la hora de\s+/gi,
    /\bcon el fin de\b/gi,
  ],
  pt: [
    /\bé (?:importante|fundamental|essencial|crucial) (?:destacar|notar|mencionar|ressaltar|lembrar) que\s+/gi,
    /\bvale (?:a pena )?(?:destacar|notar|mencionar|ressaltar) que\s+/gi,
    /^no mundo atual,\s*/gim,
    /^na era digital,\s*/gim,
    /\bcom o objetivo de\b/gi,
  ],
  fr: [
    /\bil (?:est|convient de) (?:important|essentiel|crucial|noter|souligner)[^,.]{0,24} (?:de )?(?:noter|souligner|mentionner|rappeler) que\s+/gi,
    /^dans le monde actuel,\s*/gim,
    /^à l['’]ère numérique,\s*/gim,
    /\bafin de\b/gi,
  ],
};

// Connectives a model reaches for at the head of nearly every paragraph.
const OPENER_CONNECTIVES = {
  en: ["furthermore", "moreover", "additionally", "in addition", "consequently", "subsequently", "nevertheless", "nonetheless", "first and foremost", "in conclusion", "to conclude", "in summary", "overall", "ultimately", "notably", "importantly", "therefore", "thus", "hence", "accordingly"],
  es: ["además", "asimismo", "adicionalmente", "en consecuencia", "por consiguiente", "no obstante", "en primer lugar", "en conclusión", "para concluir", "en resumen", "en definitiva", "en última instancia", "por lo tanto", "cabe mencionar", "por otra parte"],
  pt: ["além disso", "adicionalmente", "assim", "consequentemente", "por conseguinte", "no entanto", "contudo", "em primeiro lugar", "em conclusão", "para concluir", "em resumo", "em suma", "portanto", "vale mencionar", "por outro lado"],
  fr: ["de plus", "en outre", "par ailleurs", "par conséquent", "néanmoins", "toutefois", "cependant", "premièrement", "en conclusion", "pour conclure", "en résumé", "en somme", "ainsi", "donc", "notamment"],
};

// Stacked hedges: two softeners doing one softener's work.
const HEDGE_STACKS = {
  en: [[/\bmay potentially\b/gi, "may"], [/\bcould potentially\b/gi, "could"], [/\bmight possibly\b/gi, "might"], [/\bcan sometimes\b/gi, "can"], [/\bgenerally tends to\b/gi, "tends to"], [/\bit is possible that it (?:may|might)\b/gi, "it may"], [/\bquite possibly\b/gi, "possibly"], [/\bsomewhat relatively\b/gi, "somewhat"]],
  es: [[/\bpodría potencialmente\b/gi, "podría"], [/\bpuede posiblemente\b/gi, "puede"], [/\bgeneralmente suele\b/gi, "suele"], [/\bquizá posiblemente\b/gi, "quizá"]],
  pt: [[/\bpoderia potencialmente\b/gi, "poderia"], [/\bpode possivelmente\b/gi, "pode"], [/\bgeralmente costuma\b/gi, "costuma"]],
  fr: [[/\bpourrait potentiellement\b/gi, "pourrait"], [/\bpeut possiblement\b/gi, "peut"], [/\bgénéralement a tendance à\b/gi, "a tendance à"]],
};

// Bureaucratic vocabulary with a plainer equivalent that means the same thing.
const PLAIN_WORDS = {
  en: [["utilize", "use"], ["utilise", "use"], ["utilized", "used"], ["facilitate", "help"], ["a myriad of", "many"], ["myriad", "many"], ["a plethora of", "plenty of"], ["due to the fact that", "because"], ["prior to", "before"], ["subsequent to", "after"], ["in the event that", "if"], ["at this point in time", "now"], ["has the ability to", "can"], ["have the ability to", "can"], ["is able to", "can"], ["are able to", "can"], ["delve into", "dig into"], ["commence", "start"], ["terminate", "end"], ["endeavor", "try"], ["endeavour", "try"], ["ascertain", "find out"], ["numerous", "many"], ["approximately", "about"], ["demonstrate", "show"], ["obtain", "get"], ["sufficient", "enough"], ["individuals", "people"], ["purchase", "buy"], ["assist", "help"], ["initiate", "start"], ["leverage", "use"], ["seamless", "smooth"], ["robust", "solid"], ["pivotal role", "key role"], ["crucial role", "key role"], ["vital role", "key role"], ["a testament to", "proof of"]],
  es: [["utilizar", "usar"], ["utiliza", "usa"], ["utilizando", "usando"], ["con el fin de", "para"], ["debido al hecho de que", "porque"], ["previo a", "antes de"], ["en el caso de que", "si"], ["tiene la capacidad de", "puede"], ["un abanico de", "muchos"], ["una plétora de", "muchos"], ["una miríada de", "muchos"], ["profundizar en", "analizar"], ["aproximadamente", "unos"], ["numerosos", "muchos"], ["llevar a cabo", "hacer"], ["resulta fundamental", "es clave"], ["robusto", "sólido"], ["papel fundamental", "papel clave"], ["papel crucial", "papel clave"], ["un testimonio de", "prueba de"]],
  pt: [["utilizar", "usar"], ["utiliza", "usa"], ["com o objetivo de", "para"], ["devido ao fato de que", "porque"], ["previamente a", "antes de"], ["no caso de que", "se"], ["tem a capacidade de", "pode"], ["um leque de", "muitos"], ["uma plétora de", "muitos"], ["uma miríade de", "muitos"], ["aprofundar em", "analisar"], ["aproximadamente", "cerca de"], ["numerosos", "muitos"], ["efetuar", "fazer"], ["robusto", "sólido"], ["papel fundamental", "papel chave"], ["papel crucial", "papel chave"], ["um testemunho de", "prova de"]],
  fr: [["afin de", "pour"], ["en raison du fait que", "parce que"], ["préalablement à", "avant"], ["dans le cas où", "si"], ["a la capacité de", "peut"], ["une myriade de", "beaucoup de"], ["une pléthore de", "beaucoup de"], ["approximativement", "environ"], ["de nombreux", "beaucoup de"], ["effectuer", "faire"], ["robuste", "solide"], ["rôle crucial", "rôle clé"], ["rôle essentiel", "rôle clé"], ["un témoignage de", "la preuve de"]],
};

const KIND_META = {
  filler: { label: "Empty opener", tone: "#5B33C7" },
  connective: { label: "Connective habit", tone: "#5B33C7" },
  hedge: { label: "Stacked hedge", tone: "#735000" },
  plain: { label: "Bureaucratic word", tone: "#735000" },
  dash: { label: "Em dash", tone: "#735000" },
  triple: { label: "Rule of three", tone: "#5B33C7" },
  correlative: { label: "Not only / but also", tone: "#5B33C7" },
  passive: { label: "Passive voice", tone: "#0F5A50" },
  nominal: { label: "Buried verb", tone: "#0F5A50" },
};

/* ---------------- mechanical edit collection ---------------- */

/** Spans inside quotation marks: never edit words someone is quoted as saying. */
function quotedRanges(text) {
  const out = [];
  for (const m of text.matchAll(/["“][^"”\n]{0,400}["”]/g)) out.push([m.index, m.index + m[0].length]);
  return out;
}

function collect(text, code) {
  const lang = code in FILLER_OPENERS ? code : "en";
  const edits = [];
  const push = (m, replacement, kind, why) => {
    if (m.index == null) return;
    edits.push({
      id: `${kind}-${m.index}-${m[0].length}`,
      kind,
      start: m.index,
      end: m.index + m[0].length,
      from: m[0],
      to: replacement,
      why,
    });
  };

  for (const re of FILLER_OPENERS[lang]) {
    for (const m of text.matchAll(re)) {
      push(m, "", "filler", "Says nothing. The sentence starts stronger without it.");
    }
  }

  for (const w of OPENER_CONNECTIVES[lang]) {
    const re = new RegExp(`(^|\\n|(?<=[.!?]\\s))${esc(w)}(,\\s*|\\s+)`, "gi");
    for (const m of text.matchAll(re)) {
      edits.push({
        id: `connective-${m.index}-${m[0].length}`,
        kind: "connective",
        start: m.index + m[1].length,
        end: m.index + m[0].length,
        from: m[0].slice(m[1].length),
        to: "",
        why: "Sentences that open on a connective every time are the clearest machine tell there is. The logic usually survives without it.",
      });
    }
  }

  for (const [re, to] of HEDGE_STACKS[lang]) {
    for (const m of text.matchAll(re)) push(m, to, "hedge", "Two softeners doing one softener's job.");
  }

  // A comparative ("more crucial than ever") breaks if the adjective is swapped,
  // and anything inside quotation marks is someone's actual words.
  const COMPARATIVE = /\b(?:more|most|less|least|más|menos|mais|plus|moins)\s+$/i;
  const quoted = quotedRanges(text);
  for (const [from, to] of PLAIN_WORDS[lang]) {
    const re = new RegExp(`\\b${esc(from)}\\b`, "gi");
    for (const m of text.matchAll(re)) {
      if (COMPARATIVE.test(text.slice(Math.max(0, m.index - 12), m.index))) continue;
      if (quoted.some(([a, b]) => m.index >= a && m.index < b)) continue;
      const keepCase = /^[A-ZÁÉÍÓÚÑÀÂÊÔÃÕÇ]/.test(m[0]) ? cap(to) : to;
      push(m, keepCase, "plain", `"${from}" is a word people write when they are trying to sound official.`);
    }
  }

  for (const m of text.matchAll(/\s*[—–]\s*/g)) {
    push(m, ", ", "dash", "Almost nobody types an em dash. Generators emit them constantly.");
  }

  // sort, then drop overlaps so applying them cannot corrupt the text
  edits.sort((a, b) => a.start - b.start || b.end - a.end);
  const clean = [];
  let last = -1;
  for (const e of edits) {
    if (e.start >= last) { clean.push(e); last = e.end; }
  }
  return clean;
}

/** Apply the chosen mechanical edits, back to front, then tidy the seams. */
export function applyEdits(text, edits, chosen) {
  const use = edits.filter((e) => chosen.has(e.id)).sort((a, b) => b.start - a.start);
  let out = text;
  for (const e of use) {
    let before = out.slice(0, e.start);
    let after = out.slice(e.end);
    let mid = e.to;
    // A deletion at a sentence head means the next word must be capitalised.
    if (!mid && /(^|[.!?¿¡]["'”’)\]]?\s+|\n\s*)$/.test(before)) after = cap(after);
    out = before + mid + after;
  }
  return out
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/,\s*,/g, ",")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* ---------------- judgment notes ---------------- */

const NOMINAL = {
  en: /\b(?:the|a|an)\s+(\w{4,}(?:tion|ment|ance|ence|ity|ness|sis))\s+of\b/gi,
  es: /\b(?:la|el|una|un)\s+(\w{4,}(?:ción|miento|dad|encia|ancia))\s+de\b/gi,
  pt: /\b(?:a|o|uma|um)\s+(\w{4,}(?:ção|mento|dade|ência|ância))\s+de\b/gi,
  fr: /\b(?:la|le|une|un)\s+(\w{4,}(?:tion|ment|ité|ance|ence))\s+de\b/gi,
};

const CORRELATIVE = {
  en: /\bnot only\b[^.!?]{0,90}\bbut also\b/gi,
  es: /\bno s[oó]lo\b[^.!?]{0,90}\bsino tambi[eé]n\b/gi,
  pt: /\bn[ãa]o (?:apenas|s[oó])\b[^.!?]{0,90}\bmas tamb[eé]m\b/gi,
  fr: /\bnon seulement\b[^.!?]{0,90}\bmais (?:aussi|également)\b/gi,
};

/** Three parallel items joined by a final conjunction: the model's favourite cadence. */
const TRIPLE = {
  en: /\b[\w'’]+(?:\s+[\w'’]+){0,3},\s+[\w'’]+(?:\s+[\w'’]+){0,3},\s+and\s+[\w'’]+(?:\s+[\w'’]+){0,3}\b/gi,
  es: /\b[\w'’áéíóúñ]+(?:\s+[\w'’áéíóúñ]+){0,3},\s+[\w'’áéíóúñ]+(?:\s+[\w'’áéíóúñ]+){0,3},?\s+y\s+[\w'’áéíóúñ]+(?:\s+[\w'’áéíóúñ]+){0,3}\b/gi,
  pt: /\b[\w'’ãõáéíóúç]+(?:\s+[\w'’ãõáéíóúç]+){0,3},\s+[\w'’ãõáéíóúç]+(?:\s+[\w'’ãõáéíóúç]+){0,3},?\s+e\s+[\w'’ãõáéíóúç]+(?:\s+[\w'’ãõáéíóúç]+){0,3}\b/gi,
  fr: /\b[\w'’àâéèêôçù]+(?:\s+[\w'’àâéèêôçù]+){0,3},\s+[\w'’àâéèêôçù]+(?:\s+[\w'’àâéèêôçù]+){0,3},?\s+et\s+[\w'’àâéèêôçù]+(?:\s+[\w'’àâéèêôçù]+){0,3}\b/gi,
};

const SPECIFIC_RE = /\b\d[\d.,:/-]*\b|\b(?:19|20)\d{2}\b/g;

function judgments(text, report) {
  const code = report.language.code;
  const lang = code in NOMINAL ? code : "en";
  const out = [];
  const sig = (id) => report.signals.find((g) => g.id === id);
  const rows = report.rows;
  const n = rows.length || 1;

  // The single highest-leverage change: put real facts in.
  const specifics = (text.match(SPECIFIC_RE) || []).length;
  const per1kSpec = (specifics * 1000) / Math.max(1, report.stats.words);
  if (per1kSpec < 6) {
    out.push({
      priority: 1,
      label: "Put your own facts in",
      detail:
        `Only ${specifics} number${specifics === 1 ? "" : "s"} or date${specifics === 1 ? "" : "s"} in ${report.stats.words.toLocaleString()} words. ` +
        "Generic prose is what a generator produces because it has nothing specific to say. Name the date, the amount, the person, the street, the thing that actually happened. This moves the score more than every mechanical edit combined, and it makes the document worth reading.",
    });
  }

  const burst = sig("burstiness");
  if (burst && burst.dev > 0.8) {
    // Find the flattest run to point at.
    let bestStart = 0, bestLen = 0, curStart = 0, curLen = 0;
    for (let i = 1; i < rows.length; i++) {
      if (Math.abs(rows[i].n - rows[i - 1].n) <= 5) {
        if (!curLen) curStart = i - 1;
        curLen++;
        if (curLen > bestLen) { bestLen = curLen; bestStart = curStart; }
      } else curLen = 0;
    }
    out.push({
      priority: 2,
      label: "Break the rhythm",
      detail:
        bestLen >= 2
          ? `Sentences ${bestStart + 1}–${bestStart + bestLen + 1} all run within five words of each other. Cut one of them to under eight words, and let another run long. A three-word sentence is the fastest thing you can do here.`
          : "Every sentence is about the same length. Cut one to under eight words and let another sprawl.",
    });
  }

  const shortR = sig("shortRate");
  if (shortR && shortR.value < 0.08) {
    out.push({
      priority: 3,
      label: "Write something short",
      detail: `Not one sentence under eight words in the whole document. People write fragments when they are making a point. Add two or three.`,
    });
  }

  const fp = sig("firstPerson");
  if (fp && fp.value < 3 && report.stats.words > 200) {
    out.push({
      priority: 3,
      label: "Say who is speaking",
      detail: "No first person anywhere. If you have an opinion in here, own it: \"I told her\", \"we decided\", \"my read is\". Generated prose hides the author because it has no author.",
    });
  }

  const contr = sig("contraction");
  if (contr && !contr.held && contr.value < 1.5 && report.stats.words > 200) {
    out.push({
      priority: 4,
      label: "Loosen the register",
      detail: "Zero contractions. Unless this is a filing that needs to be formal, \"don't\", \"it's\" and \"we're\" are how people actually write.",
    });
  }

  const paraCv = sig("paraCv");
  if (paraCv && paraCv.dev > 1 && report.stats.paragraphs > 3) {
    out.push({
      priority: 4,
      label: "Vary the paragraphs",
      detail: `All ${report.stats.paragraphs} paragraphs come out about the same size. Let one be a single sentence. Let another run twice as long.`,
    });
  }

  const dm = sig("discourse");
  if (dm && dm.dev > 1) {
    out.push({
      priority: 2,
      label: "Cut the connective scaffolding",
      detail: `${dm.value.toFixed(0)} discourse markers per thousand words, against a human band topping out around ${(dm.center + dm.spread).toFixed(0)}. Most "however" and "furthermore" openers can just go: the reader follows anyway.`,
    });
  }

  const pas = sig("passive");
  if (pas && pas.dev > 1) {
    out.push({
      priority: 3,
      label: "Name who did it",
      detail: `${Math.round(pas.value * 100)}% of sentences are passive. "The statement was recorded" hides the actor. Who recorded it?`,
    });
  }

  if (report.topGrams.length) {
    out.push({
      priority: 4,
      label: "Stop repeating yourself",
      detail: `Phrases like "${report.topGrams[0][0]}" appear ${report.topGrams[0][1]} times. Say it once, properly.`,
    });
  }

  out.sort((a, b) => a.priority - b.priority);
  return out;
}

/* ---------------- per-sentence notes ---------------- */

function sentenceNotes(text, report, edits) {
  const code = report.language.code;
  const lang = code in NOMINAL ? code : "en";
  const rows = report.rows;

  const byOffset = rows
    .map((r, idx) => ({ ...r, idx, end: r.offset + r.text.length }))
    .sort((a, b) => a.offset - b.offset);

  const find = (pos) => {
    let lo = 0, hi = byOffset.length - 1, best = null;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const r = byOffset[mid];
      if (pos < r.offset) hi = mid - 1;
      else if (pos > r.end) lo = mid + 1;
      else { best = r; break; }
    }
    return best ?? byOffset[Math.max(0, Math.min(byOffset.length - 1, lo))] ?? null;
  };

  const map = new Map();
  const add = (row, note) => {
    if (!row) return;
    if (!map.has(row.idx)) map.set(row.idx, { ...row, notes: [] });
    map.get(row.idx).notes.push(note);
  };

  for (const e of edits) {
    add(find(e.start), { kind: e.kind, editId: e.id, from: e.from.trim(), to: e.to.trim(), why: e.why });
  }
  for (const m of text.matchAll(CORRELATIVE[lang])) {
    add(find(m.index), { kind: "correlative", from: m[0].slice(0, 60), why: "A construction models lean on. Split it into two statements, or drop the second half." });
  }
  for (const m of text.matchAll(TRIPLE[lang])) {
    add(find(m.index), { kind: "triple", from: m[0].slice(0, 70), why: "Three parallel items with a conjunction. One well-chosen item usually beats three tidy ones." });
  }
  for (const m of text.matchAll(NOMINAL[lang])) {
    add(find(m.index), { kind: "nominal", from: m[0], why: "A verb buried inside a noun. Use the verb." });
  }
  for (const r of rows) {
    if (r.passive && r.score > 0.55) {
      add(byOffset.find((x) => x.idx === r.i) ?? null, { kind: "passive", why: "Passive construction in a sentence already reading machine-flat. Name the actor." });
    }
  }

  return [...map.values()]
    .map((r) => ({ ...r, weight: r.notes.length + r.score }))
    .sort((a, b) => b.weight - a.weight);
}

/** Build the full revision plan for a document and its report. */
export function revise(text, report) {
  const edits = collect(text, report.language.code);
  return {
    edits,
    mechanical: edits.length,
    sentences: sentenceNotes(text, report, edits),
    global: judgments(text, report),
    kindMeta: KIND_META,
  };
}
