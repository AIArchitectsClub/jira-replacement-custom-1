import { useEffect, useRef, useState } from "react";
import { SCENARIOS } from "./generatorData.js";

const STEPS = [
  "Reading requirements",
  "Identifying capabilities and themes",
  "Grouping into epics",
  "Drafting user stories and acceptance criteria",
  "Estimating story points",
];

export default function Generator({ onAdd }) {
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [text, setText] = useState(SCENARIOS[0].requirement);
  const [phase, setPhase] = useState("idle"); // idle | running | done | added
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [picked, setPicked] = useState({});
  const timer = useRef(null);

  useEffect(() => () => clearInterval(timer.current), []);

  function chooseScenario(s) {
    setScenario(s);
    setText(s.requirement);
    setPhase("idle");
    setResult(null);
  }

  function generate() {
    // Demo only: pick the canned result whose sample text is currently loaded,
    // otherwise fall back to the first scenario. The text is not analysed.
    const match = SCENARIOS.find((s) => s.requirement === text) || scenario;
    setPhase("running");
    setStep(0);
    let i = 0;
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      i += 1;
      if (i >= STEPS.length) {
        clearInterval(timer.current);
        setResult(match);
        setPicked(Object.fromEntries(match.epics.flatMap((e) => e.stories.map((_, n) => [`${e.key}-${n}`, true]))));
        setPhase("done");
      } else setStep(i);
    }, 700);
  }

  const count = Object.values(picked).filter(Boolean).length;

  function add() {
    const epics = result.epics
      .map((e) => ({ ...e, stories: e.stories.filter((_, n) => picked[`${e.key}-${n}`]) }))
      .filter((e) => e.stories.length);
    onAdd(epics);
    setPhase("added");
  }

  return (
    <div className="gen">
      <div className="demo-note">
        <strong>Demo mode:</strong> the output below is pre-written. The text is not analysed yet.
        This page shows the intended workflow, where an AI service will turn real requirements into
        epics and stories that are created in Taiga.
      </div>

      <div className="gen-grid">
        <section className="panel">
          <h3>1. Paste requirements</h3>
          <div className="chips">
            {SCENARIOS.map((s) => (
              <button key={s.id} className={s.id === scenario.id ? "chip active" : "chip"} onClick={() => chooseScenario(s)}>
                {s.label}
              </button>
            ))}
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} spellCheck={false} />
          <button className="primary" onClick={generate} disabled={phase === "running" || !text.trim()}>
            {phase === "running" ? "Generating…" : "Generate epics and stories"}
          </button>
          {phase === "running" && (
            <ol className="steps">
              {STEPS.map((s, i) => (
                <li key={s} className={i < step ? "done" : i === step ? "active" : ""}>{s}</li>
              ))}
            </ol>
          )}
        </section>

        <section className="panel">
          <h3>2. Review and add to the board</h3>
          {!result && phase !== "running" && <p className="muted">Generated epics and stories will appear here.</p>}
          {phase === "running" && <p className="muted">Working…</p>}
          {result && (
            <>
              {result.epics.map((e) => (
                <div key={e.key} className="gen-epic" style={{ borderLeftColor: e.color }}>
                  <h4>{e.subject}</h4>
                  <p className="muted">{e.description}</p>
                  {e.stories.map((s, n) => (
                    <label key={n} className="gen-story">
                      <input
                        type="checkbox"
                        checked={!!picked[`${e.key}-${n}`]}
                        disabled={phase === "added"}
                        onChange={(ev) => setPicked({ ...picked, [`${e.key}-${n}`]: ev.target.checked })}
                      />
                      <div>
                        <strong>{s.subject}</strong> <span className="status-pill">{s.points} pts</span>
                        <div className="muted">{s.description}</div>
                        <ul className="criteria">{s.criteria.map((c) => <li key={c}>{c}</li>)}</ul>
                      </div>
                    </label>
                  ))}
                </div>
              ))}
              {phase === "done" && (
                <button className="primary" onClick={add} disabled={!count}>
                  Add {count} stor{count === 1 ? "y" : "ies"} to the board
                </button>
              )}
              {phase === "added" && (
                <p className="success">Added. See them in the <strong>Board</strong> (New column) and <strong>Epics</strong> tabs.</p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
