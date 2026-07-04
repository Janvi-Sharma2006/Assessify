import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const DIFF_COLOR = { Easy: "easy", Medium: "medium", Hard: "hard" };

export default function StudentDashboard() {
  const [drives, setDrives] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linkInput, setLinkInput] = useState("");
  const [linkError, setLinkError] = useState("");
  const [tab, setTab] = useState("all"); // all | open | completed
  const [search, setSearch] = useState("");
  const studentId = localStorage.getItem("userId");
  const name = localStorage.getItem("name") || "Candidate";
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get("/api/drives/live").then(r => setDrives(r.data)).catch(console.error),
      api.get(`/api/results/student/${studentId}`).then(r => setResults(r.data)).catch(console.error),
    ]).finally(() => setLoading(false));
  }, []);

  const attemptedIds = new Set(results.map(r => r.driveId));
  const clearedCount = results.filter(r => r.status === "CLEARED").length;
  const avgScore = results.length
    ? Math.round(results.reduce((s, r) => s + (r.percentage || 0), 0) / results.length)
    : 0;
  const openCount = drives.filter(d => !attemptedIds.has(d.id)).length;

  const filteredDrives = useMemo(() => {
    let list = [...drives];

    if (tab === "open") list = list.filter(d => !attemptedIds.has(d.id));
    if (tab === "completed") list = list.filter(d => attemptedIds.has(d.id));

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        d => d.title?.toLowerCase().includes(q) || d.category?.toLowerCase().includes(q)
      );
    }

    // unattempted first, then by title
    list.sort((a, b) => {
      const aDone = attemptedIds.has(a.id) ? 1 : 0;
      const bDone = attemptedIds.has(b.id) ? 1 : 0;
      if (aDone !== bDone) return aDone - bDone;
      return (a.title || "").localeCompare(b.title || "");
    });

    return list;
  }, [drives, tab, search, results]);

  function openByLink(e) {
    e.preventDefault();
    setLinkError("");
    const raw = linkInput.trim();
    if (!raw) return;

    let slug = raw;
    if (raw.includes("/invite/")) {
      slug = raw.split("/invite/")[1];
    }
    slug = slug.replace(/\/$/, "").trim();

    if (!slug) {
      setLinkError("That doesn't look like a valid invite link.");
      return;
    }
    navigate(`/invite/${slug}`);
  }

  return (
    <div className="page">
      <div className="page-top">
        <div>
         <div className="page-title" style={{ fontSize: '2rem' }}>
           Welcome, {name.split(" ")[0]}
         </div>
        </div>
      </div>

      {/* Stat overview row */}
      <div className="icon-stats-grid">
        <div className="icon-stat-card">
          <div className="icon-stat-icon purple">📋</div>
          <div>
            <div className="icon-stat-val">{drives.length}</div>
            <div className="icon-stat-row">
              <span className="icon-stat-lbl">Total assessments</span>
            </div>
          </div>
        </div>
        <div className="icon-stat-card">
          <div className="icon-stat-icon blue">🟢</div>
          <div>
            <div className="icon-stat-val">{openCount}</div>
            <div className="icon-stat-row">
              <span className="icon-stat-lbl">Open to attempt</span>
            </div>
          </div>
        </div>
        <div className="icon-stat-card">
          <div className="icon-stat-icon green">✅</div>
          <div>
            <div className="icon-stat-val">{clearedCount}/{results.length}</div>
            <div className="icon-stat-row">
              <span className="icon-stat-lbl">Cleared</span>
            </div>
          </div>
        </div>
        <div className="icon-stat-card">
          <div className="icon-stat-icon amber">📊</div>
          <div>
            <div className="icon-stat-val">{avgScore}%</div>
            <div className="icon-stat-row">
              <span className="icon-stat-lbl">Average score</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Have an invite link?</div>
        <form onSubmit={openByLink} style={{ display: "flex", gap: 8 }}>
          <input
            className="form-input"
            placeholder="Paste your invite link or code here"
            value={linkInput}
            onChange={e => setLinkInput(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" type="submit">Open →</button>
        </form>
        {linkError && <div className="error-msg" style={{ marginTop: 8 }}>{linkError}</div>}
      </div>

      {/* Filter tabs + search */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div className="exams-tab-bar" style={{ marginBottom: 0 }}>
          <div className={`exams-tab ${tab === "all" ? "active" : ""}`} onClick={() => setTab("all")}>All</div>
          <div className={`exams-tab ${tab === "open" ? "active" : ""}`} onClick={() => setTab("open")}>Open</div>
          <div className={`exams-tab ${tab === "completed" ? "active" : ""}`} onClick={() => setTab("completed")}>Completed</div>
        </div>
        <input
          className="form-input"
          placeholder="🔍 Search assessments..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 240 }}
        />
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <div className="empty-state-title">Loading your assessments…</div>
        </div>
      ) : filteredDrives.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-title">
            {search || tab !== "all" ? "No matching assessments" : "No assessments available yet"}
          </div>
          <div style={{ fontSize: 13 }}>
            {search || tab !== "all" ? "Try a different filter or search term" : "Check back soon or open your invite link"}
          </div>
        </div>
      ) : (
        <div className="exam-cards-grid">
          {filteredDrives.map(drive => {
            const done = attemptedIds.has(drive.id);
            const result = results.find(r => r.driveId === drive.id);
            return (
              <div className="exam-card" key={drive.id}
                onClick={() => !done && navigate(`/exam/${drive.id}`)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div className="exam-card-title">{drive.title}</div>
                  {drive.difficulty && <span className={`badge ${DIFF_COLOR[drive.difficulty] || "medium"}`}>{drive.difficulty}</span>}
                </div>
                {drive.category && <div style={{ fontSize: 12, color: "var(--text-4)", marginBottom: 8 }}>{drive.category}</div>}
                <div className="exam-card-meta">
                  <span className="exam-card-meta-item">⏱ {drive.duration} min</span>
                  <span className="exam-card-meta-item">🎯 {drive.totalMarks} marks</span>
                </div>

                {done && (
                  <div className="section-bar-row" style={{ marginTop: 12 }}>
                    <div className="section-bar-track">
                      <div
                        className="section-bar-fill"
                        style={{
                          width: `${result?.percentage || 0}%`,
                          background: result?.status === "CLEARED" ? "var(--green)" : "var(--red)"
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="exam-card-footer">
                  {done ? (
                    <span className={`badge ${result?.status === "CLEARED" ? "cleared" : "not-cleared"}`}>
                      {result?.status === "CLEARED" ? "✅ Cleared" : "❌ Not cleared"} · {result?.percentage}%
                    </span>
                  ) : <span className="badge live">Open</span>}
                  <button className="btn btn-sm btn-primary" disabled={done}
                    onClick={e => { e.stopPropagation(); !done && navigate(`/exam/${drive.id}`); }}>
                    {done ? "Attempted" : "Start →"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}