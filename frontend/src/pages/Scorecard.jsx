import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Scorecard() {
  const { driveId } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const medals = ["🥇", "🥈", "🥉"];

  useEffect(() => {
    if (driveId === "all") { setLoading(false); return; }
    api.get(`/api/results/scorecard/${driveId}`)
      .then(r => { setResults(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [driveId]);

  function exportCSV() {
    const rows = [["Rank", "Name", "Email", "Score", "%", "Percentile", "Status", "Tab Violations"]];
    results.forEach(r => rows.push([r.rank, r.studentName, r.studentEmail, `${r.score}/${r.totalQuestions}`, `${r.percentage}%`, `${r.percentile}%ile`, r.status, r.tabViolations]));
    const a = document.createElement("a");
    a.href = "data:text/csv," + encodeURIComponent(rows.map(r => r.join(",")).join("\n"));
    a.download = `scorecard-${driveId}.csv`;
    a.click();
  }

  if (loading) return <div className="page"><div className="empty-state">Loading scorecard...</div></div>;

  return (
    <div className="page">
      <div className="page-top">
        <div>
          <div className="page-title">Drive scorecard</div>
          <div className="page-sub">{results.length} candidates · ranked by score</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => navigate("/admin")}>← Back</button>
          {results.length > 0 && <button className="btn btn-primary" onClick={exportCSV}>📥 Export CSV</button>}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {results.length === 0 ? (
          <div className="empty-state" style={{ padding: "40px 24px" }}>
            <div className="empty-state-icon">📊</div>
            <div className="empty-state-title">No submissions yet</div>
            <div style={{ fontSize: 13 }}>Candidates haven't attempted this drive yet</div>
          </div>
        ) : (
          <table className="scorecard-table">
            <thead>
              <tr>
                <th>Rank</th><th>Candidate</th><th>Score</th><th>Percentage</th>
                <th>Percentile</th><th>Time</th><th>Tab violations</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.studentId}>
                  <td>{medals[r.rank - 1] || `#${r.rank}`}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{r.studentName}</div>
                    <div style={{ fontSize: 11, color: "var(--text-4)" }}>{r.studentEmail}</div>
                  </td>
                  <td>{r.score}/{r.totalQuestions}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {r.percentage}%
                      <div style={{ flex: 1, height: 3, background: "var(--border-2)", borderRadius: 2, minWidth: 50 }}>
                        <div style={{ height: 3, borderRadius: 2, width: `${r.percentage}%`, background: r.percentage >= 70 ? "var(--green)" : r.percentage >= 50 ? "var(--amber)" : "var(--red)" }} />
                      </div>
                    </div>
                  </td>
                  <td>{r.percentile}%ile</td>
                  <td>{r.timeTakenSeconds ? `${Math.floor(r.timeTakenSeconds / 60)}m ${r.timeTakenSeconds % 60}s` : "—"}</td>
                  <td style={{ color: r.tabViolations > 0 ? "var(--red)" : "var(--text-4)" }}>
                    {r.tabViolations > 0 ? `⚠️ ${r.tabViolations}` : "—"}
                  </td>
                  <td><span className={`badge ${r.status === "CLEARED" ? "cleared" : "not-cleared"}`}>{r.status === "CLEARED" ? "✅ Cleared" : "❌ Not cleared"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}