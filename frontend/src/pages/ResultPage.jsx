import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const studentId = localStorage.getItem("userId");

  const [allResults, setAllResults] = useState(null);
  const [loading, setLoading] = useState(!state?.result);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (state?.result) return; // already have a single result to show
    if (!studentId) { setLoading(false); return; }

    api.get(`/api/results/student/${studentId}`)
      .then(r => setAllResults(r.data))
      .catch(err => { console.error(err); setError("Could not load results."); })
      .finally(() => setLoading(false));
  }, [state, studentId]);

  // ---------- Case 1: just-submitted single result (existing detailed view) ----------
  if (state?.result) {
    const { score, total, percentage, percentile, status, tabViolations, timeTakenSeconds } = state.result;
    const questions = state.questions || [];
    const answers = state.answers || {};
    const cleared = status === "CLEARED";
    const mins = timeTakenSeconds ? Math.floor(timeTakenSeconds / 60) : 0;
    const secs = timeTakenSeconds ? timeTakenSeconds % 60 : 0;
    const r = 52;
    const circ = 2 * Math.PI * r;
    const dash = circ - (percentage / 100) * circ;
    const optLabel = { A: "optionA", B: "optionB", C: "optionC", D: "optionD" };

    return (
      <div className="result-page">
        <div className="result-hero">
          <div className="result-ring-wrap">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r={r} fill="none" stroke="var(--border-2)" strokeWidth="10" />
              <circle cx="70" cy="70" r={r} fill="none"
                stroke={cleared ? "var(--green)" : "var(--red)"}
                strokeWidth="10" strokeDasharray={circ} strokeDashoffset={dash}
                strokeLinecap="round" transform="rotate(-90 70 70)" />
              <text x="70" y="65" textAnchor="middle" fontSize="22" fontWeight="500" fill="var(--text)">{percentage}%</text>
              <text x="70" y="82" textAnchor="middle" fontSize="11" fill="var(--text-4)">score</text>
            </svg>
          </div>
          <div className={`result-verdict ${cleared ? "cleared" : "not-cleared"}`}>
            {cleared ? "✅ Assessment cleared!" : "❌ Not cleared"}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-4)", marginTop: 4 }}>{state.driveTitle}</div>
        </div>

        <div className="result-stats-row">
          <div className="result-stat">
            <div className="result-stat-val">{score}/{total}</div>
            <div className="result-stat-lbl">Correct answers</div>
          </div>
          <div className="result-stat">
            <div className="result-stat-val">{percentile}%ile</div>
            <div className="result-stat-lbl">Percentile rank</div>
          </div>
          <div className="result-stat">
            <div className="result-stat-val">{mins}m {secs}s</div>
            <div className="result-stat-lbl">Time taken</div>
          </div>
        </div>

        {tabViolations > 0 && (
          <div style={{ background: "var(--red-bg)", border: "1px solid #fca5a5", borderRadius: "var(--radius)", padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "var(--red-text)" }}>
            ⚠️ {tabViolations} tab violation{tabViolations > 1 ? "s" : ""} recorded.
          </div>
        )}

        {questions.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 className="section-title" style={{ marginBottom: 14 }}>Answer Review</h2>
            {questions.map((q, i) => {
              const selected = answers[q.id] || "";
              const isCorrect = selected && selected === q.correctAnswer;
              return (
                <div className={`response-item ${selected ? (isCorrect ? "correct" : "wrong") : ""}`} key={q.id}>
                  <div className="response-q">Q{i + 1}. {q.questionText}</div>
                  <div className="response-opts">
                    {["A", "B", "C", "D"].map(key => {
                      const isSelected = selected === key;
                      const isActualCorrect = q.correctAnswer === key;
                      let cls = "response-opt";
                      if (isSelected && isActualCorrect) cls += " picked-correct";
                      else if (isSelected && !isActualCorrect) cls += " picked-wrong";
                      else if (isActualCorrect) cls += " actual-correct";
                      return (
                        <div className={cls} key={key}>
                          {key}. {q[optLabel[key]]}
                          {isSelected && !isActualCorrect ? " (your answer)" : ""}
                          {isActualCorrect ? " (correct answer)" : ""}
                        </div>
                      );
                    })}
                    {!selected && <div style={{ fontSize: 11.5, color: "var(--text-4)", marginTop: 4 }}>Not answered</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
          <button className="btn" onClick={() => navigate(role === "STUDENT" ? "/student" : "/admin")}>← Dashboard</button>
          <button className="btn btn-primary" onClick={() => navigate(role === "STUDENT" ? "/student" : "/admin")}>View all assessments</button>
        </div>
      </div>
    );
  }

  // ---------- Case 2: navigated directly (no state) — fetch and list all results ----------
  if (loading) {
    return <div className="page"><div className="empty-state"><div className="empty-state-title">Loading results…</div></div></div>;
  }

  if (error) {
    return <div className="page"><div className="empty-state"><div className="empty-state-icon">⚠️</div><div className="empty-state-title">{error}</div></div></div>;
  }

  if (!allResults || allResults.length === 0) {
    return <div className="page"><div className="empty-state"><div className="empty-state-icon">❓</div><div className="empty-state-title">No result data.</div></div></div>;
  }

  return (
    <div className="page">
      <h2 className="section-title" style={{ marginBottom: 16 }}>Your Results</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {allResults.map((res, i) => {
          const cleared = res.status === "CLEARED";
          return (
            <div key={i} className="response-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{res.driveTitle}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-4)", marginTop: 2 }}>
                  {res.score}/{res.totalQuestions} correct · {res.percentage}% · {res.percentile}%ile
                  {res.tabViolations > 0 ? ` · ⚠️ ${res.tabViolations} tab violation${res.tabViolations > 1 ? "s" : ""}` : ""}
                </div>
              </div>
              <div className={`result-verdict ${cleared ? "cleared" : "not-cleared"}`} style={{ margin: 0 }}>
                {cleared ? "✅ Cleared" : "❌ Not cleared"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}