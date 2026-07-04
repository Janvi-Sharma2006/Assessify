import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AchievementsPage() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const studentId = localStorage.getItem("userId");
  const name = localStorage.getItem("name");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === "ADMIN") { setLoading(false); return; }
    api.get(`/api/results/student/${studentId}`)
      .then(res => setResults(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  const attempts = results.length;
  const bestPct = results.length > 0
    ? Math.max(...results.map(r => r.percentage || 0))
    : 0;
  const passCount = results.filter(r => (r.percentage || 0) >= 50).length;
  const perfectCount = results.filter(r => r.score === r.totalQuestions).length;

  const badges = [
    { icon: "🎯", title: "First Steps", desc: "Complete your first exam", earned: attempts >= 1 },
    { icon: "🔥", title: "On a Roll", desc: "Complete 5 exams", earned: attempts >= 5 },
    { icon: "🏅", title: "Consistent Performer", desc: "Pass 3 exams", earned: passCount >= 3 },
    { icon: "🌟", title: "High Scorer", desc: "Score 90% or above in any exam", earned: bestPct >= 90 },
    { icon: "💯", title: "Perfectionist", desc: "Get a perfect score in an exam", earned: perfectCount >= 1 },
    { icon: "🏆", title: "Exam Veteran", desc: "Complete 10 exams", earned: attempts >= 10 },
  ];

  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <div className="page" style={{ maxWidth: 800 }}>
      <h1 className="page-title">🏆 Achievements &amp; Badges</h1>
      <p className="page-sub">
        {role === "ADMIN" ? "Badges are available for students" : `${name}, you've unlocked ${earnedCount} of ${badges.length} badges`}
      </p>

      {role === "ADMIN" ? (
        <div className="empty-state">
         <div className="empty-state-icon">🏆</div>
         <div className="empty-state-title">No badges for admins</div>
          <p>Achievements and badges apply to student accounts</p>
        </div>
      ) : (
        <>
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">Badges Earned</div>
              <div className="stat-value blue">{earnedCount}/{badges.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Exams Passed</div>
              <div className="stat-value green">{passCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Best Score</div>
              <div className="stat-value">{bestPct}%</div>
            </div>
          </div>

          <div className="card-grid" style={{ marginTop: "1.5rem" }}>
            {badges.map((badge, i) => (
              <div
                className="card"
                key={i}
                style={{
                  textAlign: "center",
                  opacity: badge.earned ? 1 : 0.45,
                  filter: badge.earned ? "none" : "grayscale(1)",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{badge.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: "0.3rem" }}>{badge.title}</div>
                <div style={{ color: "var(--gray)", fontSize: "0.82rem" }}>{badge.desc}</div>
                <div style={{ marginTop: "0.8rem" }}>
                  <span className="exam-badge">{badge.earned ? "✅ Unlocked" : "🔒 Locked"}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <button className="btn btn-outline" style={{ marginTop: "2rem" }} onClick={() => navigate("/profile")}>
        ← Back to Profile
      </button>
    </div>
  );
}

export default AchievementsPage;