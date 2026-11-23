import { useEffect, useMemo, useState } from "react";
import Generator from "./Generator.jsx";

const TABS = ["Board", "Epics", "Issues", "Team", "Requirements"];

function useData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setData)
      .catch(setError);
  }, []);
  return { data, error };
}

const initials = (name) =>
  (name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

function Avatar({ name }) {
  if (!name) return <span className="avatar empty" title="Unassigned">?</span>;
  return <span className="avatar" title={name}>{initials(name)}</span>;
}

function taskProgress(story) {
  const done = story.tasks.filter((t) => t.status === "Closed").length;
  return { done, total: story.tasks.length };
}

function StoryCard({ story, epicsById }) {
  const epic = epicsById[story.epic_id];
  const { done, total } = taskProgress(story);
  const [open, setOpen] = useState(false);
  return (
    <article className="card" onClick={() => setOpen(!open)}>
      {epic && (
        <span className="epic-tag" style={{ background: epic.color }}>{epic.subject}</span>
      )}
      <h4><span className="ref">#{story.ref}</span> {story.subject} {story.isNew && <span className="new-badge">NEW</span>}</h4>
      <div className="card-meta">
        <span>{total ? `${done}/${total} tasks` : "no tasks"}</span>
        <span className="pts">{story.total_points ? `${story.total_points} pts` : "unestimated"}</span>
        <Avatar name={story.assignee} />
      </div>
      {total > 0 && (
        <div className="bar"><div style={{ width: `${(done / total) * 100}%` }} /></div>
      )}
      {open && (
        <div className="detail">
          <p>{story.description}</p>
          {story.criteria && (
            <ul className="criteria">{story.criteria.map((c) => <li key={c}>{c}</li>)}</ul>
          )}
          <ul>
            {story.tasks.map((t) => (
              <li key={t.ref}>
                <span className={`dot ${t.status === "Closed" ? "ok" : ""}`} />
                {t.subject} <em>({t.status}{t.assignee ? `, ${t.assignee}` : ""})</em>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

function Board({ data, epicsById }) {
  return (
    <div className="board">
      {data.columns.map((col) => {
        const items = data.stories.filter((s) => s.status === col);
        return (
          <section key={col} className="column">
            <header>{col} <span className="count">{items.length}</span></header>
            {items.map((s) => <StoryCard key={s.id} story={s} epicsById={epicsById} />)}
          </section>
        );
      })}
    </div>
  );
}

function Epics({ data }) {
  const byId = Object.fromEntries(data.stories.map((s) => [s.id, s]));
  return (
    <div className="epics">
      {data.epics.map((e) => {
        const stories = e.story_ids.map((id) => byId[id]).filter(Boolean);
        const done = stories.filter((s) => s.status === "Done").length;
        const points = stories.reduce((a, s) => a + (s.total_points || 0), 0);
        return (
          <section key={e.id} className="epic" style={{ borderTopColor: e.color }}>
            <h3>{e.subject}</h3>
            <p className="muted">{e.description}</p>
            <div className="bar big"><div style={{ width: `${(done / (stories.length || 1)) * 100}%`, background: e.color }} /></div>
            <p className="muted">{done} of {stories.length} stories done &middot; {points} points</p>
            <ul className="story-list">
              {stories.map((s) => (
                <li key={s.id}>
                  <span className="status-pill">{s.status}</span>
                  <span>{s.subject}</span>
                  <Avatar name={s.assignee} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function Issues({ data }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>#</th><th>Subject</th><th>Type</th><th>Severity</th><th>Priority</th><th>Status</th><th>Assignee</th></tr>
        </thead>
        <tbody>
          {data.issues.map((i) => (
            <tr key={i.ref}>
              <td>{i.ref}</td>
              <td><strong>{i.subject}</strong><div className="muted">{i.description}</div></td>
              <td>{i.type}</td>
              <td><span className={`sev sev-${i.severity.toLowerCase()}`}>{i.severity}</span></td>
              <td>{i.priority}</td>
              <td>{i.status}</td>
              <td><Avatar name={i.assignee} /> {i.assignee}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Team({ data }) {
  return (
    <div className="team">
      {data.team.map((m) => (
        <div key={m.name} className="member">
          <Avatar name={m.name} />
          <div><strong>{m.name}</strong><div className="muted">{m.role}</div></div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const { data, error } = useData();
  const [tab, setTab] = useState("Board");
  const [added, setAdded] = useState({ epics: [], stories: [] });

  const merged = useMemo(
    () => (data ? { ...data, epics: [...data.epics, ...added.epics], stories: [...data.stories, ...added.stories] } : null),
    [data, added]
  );
  const epicsById = useMemo(
    () => (merged ? Object.fromEntries(merged.epics.map((e) => [e.id, e])) : {}),
    [merged]
  );

  // Converts the generator's canned epics into board items (client-side only).
  function addGenerated(genEpics) {
    setAdded((prev) => {
      let id = 1000 + prev.stories.length + prev.epics.length;
      let ref = 100 + prev.stories.length + prev.epics.length;
      const epics = [], stories = [];
      for (const ge of genEpics) {
        const epic = { id: ++id, ref: ++ref, subject: ge.subject, color: ge.color, description: ge.description, story_ids: [] };
        for (const gs of ge.stories) {
          const st = { id: ++id, ref: ++ref, subject: gs.subject, description: gs.description, criteria: gs.criteria,
            status: "New", assignee: null, epic_id: epic.id, points: {}, total_points: gs.points, tasks: [], isNew: true };
          epic.story_ids.push(st.id);
          stories.push(st);
        }
        epics.push(epic);
      }
      return { epics: [...prev.epics, ...epics], stories: [...prev.stories, ...stories] };
    });
  }

  if (error) return <p className="status">Could not load demo data: {error.message}</p>;
  if (!data) return <p className="status">Loading…</p>;

  return (
    <>
      <div className="banner">
        Demo with sample data.{" "}
        {added.stories.length > 0 ? (
          <>{added.stories.length} generated stories added in this browser only.{" "}
            <button className="link" onClick={() => setAdded({ epics: [], stories: [] })}>Reset demo</button></>
        ) : "Try the Requirements tab to see epics and stories generated from pasted requirements."}
      </div>
      <header className="top">
        <div>
          <h1>{data.project.name}</h1>
          <p className="muted">Banking customer sourcing and onboarding</p>
        </div>
        <nav>
          {TABS.map((t) => (
            <button key={t} className={t === tab ? "active" : ""} onClick={() => setTab(t)}>{t}</button>
          ))}
        </nav>
      </header>
      <main>
        {tab === "Board" && <Board data={merged} epicsById={epicsById} />}
        {tab === "Epics" && <Epics data={merged} />}
        {tab === "Issues" && <Issues data={data} />}
        {tab === "Team" && <Team data={data} />}
        {tab === "Requirements" && <Generator onAdd={addGenerated} />}
      </main>
    </>
  );
}
