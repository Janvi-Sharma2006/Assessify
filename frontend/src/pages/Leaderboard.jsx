import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Leaderboard() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const role = localStorage.getItem("role");

  useEffect(() => {
    const endpoint = role === "ADMIN" ? "/api/drives/all" : "/api/drives/live";
    api.get(endpoint).then(res => {
      setExams(res.data);
      if (res.data.length > 0) {
        const mostRecent = [...res.data].sort((a, b) => b.id - a.id)[0];
        loadLeaderboard(mostRecent.id);
      }
    }).catch(console.error);
  }, []);

  const loadLeaderboard = (examId) => {
    setSelectedExam(examId);
    setLoading(true);
    api.get(`/api/results/leaderboard/${examId}`)
      .then(res => setLeaders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const medals = ["🥇", "🥈", "🥉"];
  const userId = localStorage.getItem("userId");
  const selectedExamTitle = exams.find(e => String(e.id) === String(selectedExam))?.title;

  return (
    <div className="page">
      <h1 className="page-title">🏆 Leaderboard</h1>
      <p className="page-sub">Top scorers for each exam</p>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="form-group" style={{ marginBottom: exams.length ? 16 : 0 }}>
          <label className="form-label">Select Exam</label>
          <select
            className="form-select"
            value={selectedExam}
            onChange={e => loadLeaderboard(e.target.value)}
          >
            <option value="">-- Select an exam --</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </div>

        {exams.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {exams.map(e => (
              <button
                key={e.id}
                onClick={() => loadLeaderboard(e.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: String(e.id) === String(selectedExam) ? "1px solid var(--purple)" : "1px solid var(--border-2)",
                  background: String(e.id) === String(selectedExam) ? "var(--purple-pale)" : "var(--surface-2)",
                  color: String(e.id) === String(selectedExam) ? "var(--purple)" : "var(--text-3)",
                }}
              >
                {e.title}
              </button>
            ))}
          </div>
        )}
      </div>



      {!loading && leaders.length > 0 && (
        <>
          {/* TOP 3 PODIUM */}
          {leaders.length >= 3 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "1rem",
              marginBottom: "2rem",
              alignItems: "flex-end"
            }}>
              {/* 2nd place */}
              <div className="card" style={{ textAlign: "center", paddingTop: "1.5rem" }}>
                <div style={{ fontSize: "2.5rem" }}>🥈</div>
                <div style={{ fontWeight: 700, marginTop: "0.5rem" }}>{leaders[1]?.studentName}</div>
                <div style={{ color: "var(--blue-light)", fontWeight: 800, fontSize: "1.3rem" }}>
                  {leaders[1]?.score}/{leaders[1]?.totalQuestions}
                </div>
                <div style={{ color: "var(--gray)", fontSize: "0.8rem" }}>2nd Place</div>
              </div>

              {/* 1st place — taller */}
              <div className="card" style={{
                textAlign: "center",
                paddingTop: "2rem",
                border: "1px solid gold",
                background: "rgba(255,215,0,0.05)"
              }}>
                <div style={{ fontSize: "3rem" }}>🥇</div>
                <div style={{ fontWeight: 700, marginTop: "0.5rem", fontSize: "1.05rem" }}>{leaders[0]?.studentName}</div>
                <div style={{ color: "gold", fontWeight: 800, fontSize: "1.5rem" }}>
                  {leaders[0]?.score}/{leaders[0]?.totalQuestions}
                </div>
                <div style={{ color: "var(--gray)", fontSize: "0.8rem" }}>1st Place</div>
              </div>

              {/* 3rd place */}
              <div className="card" style={{ textAlign: "center", paddingTop: "1.5rem" }}>
                <div style={{ fontSize: "2.5rem" }}>🥉</div>
                <div style={{ fontWeight: 700, marginTop: "0.5rem" }}>{leaders[2]?.studentName}</div>
                <div style={{ color: "var(--blue-light)", fontWeight: 800, fontSize: "1.3rem" }}>
                  {leaders[2]?.score}/{leaders[2]?.totalQuestions}
                </div>
                <div style={{ color: "var(--gray)", fontSize: "0.8rem" }}>3rd Place</div>
              </div>
            </div>
          )}

          {/* FULL RANKINGS TABLE */}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Score</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((l, i) => {
                  const pct = Math.round((l.score / l.totalQuestions) * 100);
                  const isMe = String(l.studentId) === String(userId);
                  return (
                    <tr key={i} style={isMe ? { background: "rgba(37,99,235,0.08)" } : {}}>
                      <td style={{ fontWeight: 700 }}>
                        {medals[i] || `#${l.rank}`}
                      </td>
                      <td style={{ fontWeight: isMe ? 700 : 400, color: isMe ? "var(--blue-light)" : "var(--text-3)" }}>
                        {l.studentName} {isMe && <span style={{ fontSize: "0.75rem" }}>(you)</span>}
                      </td>
                      <td style={{ color: "var(--text)", fontWeight: 600 }}>
                        {l.score}/{l.totalQuestions}
                      </td>
                      <td>
                        <span className={`result-verdict ${pct >= 50 ? "cleared" : "not-cleared"}`} style={{ fontSize: "0.85rem" }}>
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div style={{ marginTop: "2rem" }}>
        <button className="btn btn-outline" onClick={() => navigate(role === "ADMIN" ? "/admin" : "/student")}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Leaderboard;