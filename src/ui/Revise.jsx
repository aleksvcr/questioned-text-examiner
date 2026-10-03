import { useMemo, useState } from "react";
import { revise, applyEdits } from "../engine/revise.js";

export default function Revise({ report, text, onRewrite, previous }) {
  const plan = useMemo(() => revise(text, report), [text, report]);
  const [chosen, setChosen] = useState(() => new Set(plan.edits.map((e) => e.id)));
  const [copied, setCopied] = useState(false);

  const preview = useMemo(() => applyEdits(text, plan.edits, chosen), [text, plan, chosen]);
  const toggle = (id) =>
    setChosen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const groups = useMemo(() => {
    const m = new Map();
    for (const e of plan.edits) {
      if (!m.has(e.kind)) m.set(e.kind, []);
      m.get(e.kind).push(e);
    }
    return [...m.entries()];
  }, [plan]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(preview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const delta = previous != null ? previous - report.percent : null;

  return (
    <section data-anim className="mt-6 border border-[#CFC6B2] bg-[#F7F3EA]" style={{ animation: "riseIn 520ms ease-out both" }}>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#CFC6B2] px-5 py-3">
        <div>
          <p className="font-['Fragment_Mono'] text-[12px] uppercase tracking-[0.18em] text-[#615A4A]">Revision bench</p>
          <h3 className="mt-1 font-['Hedvig_Letters_Serif'] text-[27px] leading-[1.05]">How to make this read like you.</h3>
        </div>
        {delta != null && delta !== 0 && (
          <p className="font-['Fragment_Mono'] text-[12px] uppercase tracking-[0.12em]" style={{ color: delta > 0 ? "#0F5A50" : "#8A2413" }}>
            {delta > 0 ? "↓" : "↑"} {Math.abs(delta)} points from the last pass ({previous}% → {report.percent}%)
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* ---- judgment calls ---- */}
        <div className="border-b border-[#CFC6B2] lg:border-b-0 lg:border-r">
          <div className="border-b border-[#CFC6B2] bg-[#EDE7DA]/70 px-5 py-2">
            <p className="font-['Fragment_Mono'] text-[12px] uppercase tracking-[0.14em] text-[#0F5A50]">
              Only you can do these · highest leverage
            </p>
          </div>
          {plan.global.length === 0 ? (
            <p className="px-5 py-5 text-[15px] leading-[1.6] text-[#615A4A]">
              Nothing structural to flag. This document already varies its rhythm, names its actors and carries its own
              specifics.
            </p>
          ) : (
            <ol className="divide-y divide-[#CFC6B2]/70">
              {plan.global.map((g, i) => (
                <li key={g.label} className="flex gap-3 px-5 py-3.5">
                  <span className="mt-0.5 font-['Fragment_Mono'] text-[12px] text-[#0F5A50]">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-['Hedvig_Letters_Serif'] text-[19px] leading-[1.2]">{g.label}</p>
                    <p className="mt-1 max-w-[62ch] text-[14.5px] leading-[1.55] text-[#3B372F]">{g.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* ---- mechanical edits ---- */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#CFC6B2] bg-[#EDE7DA]/70 px-5 py-2">
            <p className="font-['Fragment_Mono'] text-[12px] uppercase tracking-[0.14em] text-[#4A25AE]">
              The app can do these · {chosen.size} of {plan.mechanical} selected
            </p>
            {plan.mechanical > 0 && (
              <button
                type="button"
                onClick={() => setChosen(chosen.size === plan.mechanical ? new Set() : new Set(plan.edits.map((e) => e.id)))}
                className="font-['Fragment_Mono'] text-[12px] uppercase tracking-[0.1em] text-[#4A25AE] underline decoration-dotted"
              >
                {chosen.size === plan.mechanical ? "none" : "all"}
              </button>
            )}
          </div>

          {plan.mechanical === 0 ? (
            <p className="px-5 py-5 text-[15px] leading-[1.6] text-[#615A4A]">
              No mechanical edits to make: no filler openers, no connective habit, no stacked hedges, no bureaucratic
              vocabulary. Whatever this document needs, a find-and-replace cannot give it.
            </p>
          ) : (
            <>
              <div className="max-h-[340px] overflow-y-auto">
                {groups.map(([kind, items]) => (
                  <div key={kind}>
                    <p
                      className="border-y border-[#CFC6B2] px-5 py-1 font-['Fragment_Mono'] text-[12px] uppercase tracking-[0.12em]"
                      style={{ color: plan.kindMeta[kind]?.tone || "#615A4A" }}
                    >
                      {plan.kindMeta[kind]?.label || kind} · {items.length}
                    </p>
                    {items.map((e) => (
                      <label
                        key={e.id}
                        className="flex cursor-pointer items-start gap-3 px-5 py-2 transition-colors hover:bg-[#5B33C7]/[0.05]"
                      >
                        <input
                          type="checkbox"
                          checked={chosen.has(e.id)}
                          onChange={() => toggle(e.id)}
                          className="mt-1 h-[14px] w-[14px] shrink-0 accent-[#5B33C7]"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block font-['Fragment_Mono'] text-[12.5px] leading-[1.5]">
                            <span className="text-[#8A2413] line-through decoration-[#8A2413]/50">{e.from || "(nothing)"}</span>
                            {e.to && <span className="text-[#0F5A50]"> → {e.to}</span>}
                          </span>
                          <span className="mt-0.5 block text-[13.5px] leading-[1.45] text-[#615A4A]">{e.why}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 border-t border-[#CFC6B2] px-5 py-3">
                <button
                  type="button"
                  disabled={chosen.size === 0}
                  onClick={() => onRewrite(preview)}
                  className="bg-[#5B33C7] px-4 py-2 font-['Fragment_Mono'] text-[12px] uppercase tracking-[0.12em] text-[#F7F3EA] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Apply {chosen.size} and re-score
                </button>
                <button
                  type="button"
                  onClick={copy}
                  className="border border-[#191B18] px-4 py-2 font-['Fragment_Mono'] text-[12px] uppercase tracking-[0.12em] text-[#191B18] transition-colors hover:bg-[#191B18] hover:text-[#EDE7DA]"
                >
                  {copied ? "Copied ✓" : "Copy revised text"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ---- sentences worth rewriting by hand ---- */}
      {plan.sentences.length > 0 && (
        <div className="border-t border-[#CFC6B2]">
          <p className="border-b border-[#CFC6B2] bg-[#EDE7DA]/70 px-5 py-2 font-['Fragment_Mono'] text-[12px] uppercase tracking-[0.14em] text-[#615A4A]">
            Worst offenders · {Math.min(6, plan.sentences.length)} of {plan.sentences.length} flagged sentences
          </p>
          <ol className="divide-y divide-[#CFC6B2]/70">
            {plan.sentences.slice(0, 6).map((s) => (
              <li key={s.idx} className="px-5 py-3">
                <p className="flex items-baseline gap-2">
                  <span className="font-['Fragment_Mono'] text-[12px] text-[#615A4A]">#{s.i + 1}</span>
                  <span className="text-[15px] leading-[1.5]">{s.text.length > 220 ? s.text.slice(0, 220) + "…" : s.text}</span>
                </p>
                <ul className="mt-1.5 space-y-1">
                  {s.notes.map((n, k) => (
                    <li key={k} className="flex flex-wrap items-baseline gap-x-2 text-[13.5px] leading-[1.5]">
                      <span
                        className="font-['Fragment_Mono'] text-[12px] uppercase tracking-[0.08em]"
                        style={{ color: plan.kindMeta[n.kind]?.tone || "#615A4A" }}
                      >
                        {plan.kindMeta[n.kind]?.label || n.kind}
                      </span>
                      {n.from && <span className="font-['Fragment_Mono'] text-[12.5px] text-[#8A2413]">"{n.from}"</span>}
                      <span className="text-[#3B372F]">{n.why}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="border-t border-[#C0341C]/35 bg-[#C0341C]/[0.05] px-5 py-4">
        <p className="font-['Fragment_Mono'] text-[12px] uppercase tracking-[0.14em] text-[#8A2413]">Read this before you trust it</p>
        <p className="mt-1.5 max-w-[95ch] text-[14.5px] leading-[1.6] text-[#7E1F0F]">
          The mechanical edits move the score a few points. They are worth making because they make the writing better, not
          because they launder anything. The left column is what actually changes a document: your facts, your rhythm, your
          voice. No local tool can promise you anything about what a proprietary classifier will say, and a detector is not the
          reason to write well. If the text is going somewhere that forbids generated writing, the honest move is to write it
          yourself and use this to check your own habits.
        </p>
      </div>
    </section>
  );
}
