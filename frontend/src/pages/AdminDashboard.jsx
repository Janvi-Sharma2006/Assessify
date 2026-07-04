import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "there";
  const firstName = name.split(" ")[0];
  const userId = localStorage.getItem("userId");

  const [drives, setDrives] = useState([]);
  const [driveStats, setDriveStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get(`/api/drives/my/${userId}`).then(async res => {
      const list = res.data || [];
      if (cancelled) return;
      setDrives(list);

      const entries = await Promise.all(list.map(async d => {
        try {
          const r = await api.get(`/api/results/scorecard/${d.id}`);
          const results = r.data || [];
          const passed = results.filter(x => x.status === "CLEARED").length;
          const failed = results.filter(x => x.status === "NOT_CLEARED").length;
          return [d.id, { passed, failed, total: results.length, results }];
        } catch {
          return [d.id, { passed: 0, failed: 0, total: 0, results: [] }];
        }
      }));
      if (!cancelled) {
        setDriveStats(Object.fromEntries(entries));
        setLoading(false);
      }
    }).catch(() => setLoading(false));
    return () => { cancelled = true; };
  }, [userId]);

  if (loading) {
    return <div className="ep-dash" style={{ padding: "100px 32px", textAlign: "center", color: "#9298B0" }}>Loading dashboard...</div>;
  }

  const liveCount = drives.filter(d => d.status === "LIVE").length;
  const draftCount = drives.filter(d => d.status === "DRAFT").length;
  const totalCandidates = Object.values(driveStats).reduce((s, d) => s + d.total, 0);
  const totalPassed = Object.values(driveStats).reduce((s, d) => s + d.passed, 0);
  const passRate = totalCandidates ? Math.round((totalPassed / totalCandidates) * 100) : 0;

  const stats = [
    { label: "Live Exams", value: liveCount, icon: "📝", color: "#3B5BFD", bg: "#EEF1FF" },
    { label: "Draft Exams", value: draftCount, icon: "📋", color: "#F5A524", bg: "#FFF6E6" },
    { label: "Total Candidates", value: totalCandidates, icon: "👥", color: "#0EA968", bg: "#E8FBF2" },
    { label: "Overall Pass Rate", value: `${passRate}%`, icon: "🎯", color: "#8B5CF6", bg: "#F3EEFF" },
  ];

  const statusMap = { LIVE: "Live", DRAFT: "Draft", CLOSED: "Archived" };
  const statusColor = { Live: { bg: "#E8FBF2", text: "#0EA968" }, Draft: { bg: "#FFF6E6", text: "#F5A524" }, Archived: { bg: "#F1F2F6", text: "#9298B0" } };

  const recentExams = [...drives].slice(0, 5);
  const chartDrives = drives.filter(d => (driveStats[d.id]?.total || 0) > 0).slice(0, 6);

  const allResults = drives.flatMap(d => (driveStats[d.id]?.results || []).map(r => ({ ...r, driveTitle: d.title, driveId: d.id })));
  const topCandidates = [...allResults].sort((a, b) => b.percentage - a.percentage).slice(0, 5);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="ep-dash">
      <style>{`
        .ep-dash {
          min-height: 100vh;
          background: #F8FAFC;
          font-family: 'Inter', system-ui, sans-serif;
          padding: 80px 32px 40px 32px;
          margin: 0;
          box-sizing: border-box;
        }

        .ep-dash-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .ep-dash-greet h1 {
          font-size: 22px;
          font-weight: 800;
          color: #181C32;
          margin: 0 0 2px;
        }

        .ep-dash-greet p {
          font-size: 13px;
          color: #8A8FA3;
          margin: 0;
        }

        .ep-dash-search {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 8px 16px;
          width: 240px;
          color: #94A3B8;
          font-size: 13px;
          transition: all 0.2s ease;
        }

        .ep-dash-search:hover {
          border-color: #3B5BFD;
          box-shadow: 0 0 0 3px rgba(59, 91, 253, 0.05);
        }

        .ep-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .ep-stat-card {
          background: #fff;
          border-radius: 12px;
          padding: 18px 20px;
          border: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: all 0.2s ease;
        }

        .ep-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .ep-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .ep-stat-content {
          flex: 1;
        }

        .ep-stat-value {
          font-size: 24px;
          font-weight: 800;
          color: #181C32;
          line-height: 1.2;
        }

        .ep-stat-label {
          font-size: 12.5px;
          color: #8A8FA3;
          margin-top: 1px;
        }

        .ep-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .ep-card {
          background: #fff;
          border-radius: 12px;
          padding: 20px 22px;
          border: 1px solid #E2E8F0;
        }

        .ep-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .ep-card-title {
          font-size: 15px;
          font-weight: 700;
          color: #181C32;
        }

        .ep-card-link {
          font-size: 12.5px;
          color: #3B5BFD;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .ep-card-link:hover {
          background: #EEF1FF;
        }

        .ep-exam-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 6px;
          border-bottom: 1px solid #F1F5F9;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .ep-exam-row:last-child {
          border-bottom: none;
        }

        .ep-exam-row:hover {
          background: #F8FAFC;
        }

        .ep-exam-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #EEF1FF;
          color: #3B5BFD;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 14px;
        }

        .ep-exam-info {
          flex: 1;
        }

        .ep-exam-name {
          font-size: 13.5px;
          font-weight: 700;
          color: #181C32;
        }

        .ep-exam-meta {
          font-size: 11.5px;
          color: #94A3B8;
          margin-top: 1px;
        }

        .ep-exam-status {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 12px;
          border-radius: 20px;
          flex-shrink: 0;
        }

        .ep-cand-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 6px;
          border-bottom: 1px solid #F1F5F9;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .ep-cand-row:last-child {
          border-bottom: none;
        }

        .ep-cand-row:hover {
          background: #F8FAFC;
        }

        .ep-cand-rank {
          font-size: 13px;
          font-weight: 700;
          color: #94A3B8;
          min-width: 24px;
        }

        .ep-cand-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #F3EEFF;
          color: #8B5CF6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 11px;
          flex-shrink: 0;
        }

        .ep-cand-name {
          font-size: 13px;
          font-weight: 700;
          color: #181C32;
        }

        .ep-cand-meta {
          font-size: 11px;
          color: #94A3B8;
        }

        .ep-cand-score {
          margin-left: auto;
          font-size: 13px;
          font-weight: 700;
          color: #0EA968;
          background: #E8FBF2;
          padding: 2px 10px;
          border-radius: 20px;
        }

        .ep-empty {
          color: #94A3B8;
          font-size: 13px;
          text-align: center;
          padding: 28px 0;
        }

        .ep-empty-icon {
          font-size: 28px;
          display: block;
          margin-bottom: 6px;
        }

        .ep-exam-stats-table {
          width: 100%;
          border-collapse: collapse;
        }

        .ep-exam-stats-table tr {
          border-bottom: 1px solid #F1F5F9;
          transition: background 0.2s;
        }

        .ep-exam-stats-table tr:last-child {
          border-bottom: none;
        }

        .ep-exam-stats-table tr:hover {
          background: #F8FAFC;
        }

        .ep-exam-stats-table td {
          padding: 10px 6px;
          font-size: 13px;
          color: #181C32;
        }

        .ep-exam-stats-table .exam-name {
          font-weight: 600;
          min-width: 100px;
        }

        .ep-exam-stats-table .exam-passed {
          color: #0EA968;
          font-weight: 700;
        }

        .ep-exam-stats-table .exam-failed {
          color: #F0454F;
          font-weight: 700;
        }

        .ep-exam-stats-table .exam-total {
          color: #94A3B8;
        }

        .ep-pass-bar {
          width: 100%;
          height: 6px;
          background: #F1F5F9;
          border-radius: 4px;
          overflow: hidden;
          min-width: 80px;
        }

        .ep-pass-bar-fill {
          height: 100%;
          transition: width 0.6s ease;
          background: #0EA968;
        }

        .ep-pass-bar-fill:first-child {
          border-radius: 4px 0 0 4px;
        }

        .ep-pass-bar-fill:last-child {
          border-radius: 0 4px 4px 0;
        }

        .ep-pass-bar-fill.failed {
          background: #F0454F;
        }

        @media (max-width: 1100px) {
          .ep-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          .ep-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .ep-dash {
            padding: 72px 16px 24px 16px;
          }
          .ep-stats {
            grid-template-columns: 1fr;
          }
          .ep-dash-top {
            flex-direction: column;
            align-items: stretch;
          }
          .ep-dash-search {
            width: 100%;
          }
          .ep-stat-value {
            font-size: 20px;
          }
          .ep-exam-stats-table td {
            font-size: 12px;
            padding: 8px 4px;
          }
          .ep-exam-stats-table .exam-name {
            min-width: 60px;
          }
        }
      `}</style>

      <div className="ep-dash-top">
        <div className="ep-dash-greet">
          <h1>{getGreeting()}, {firstName}! 👋</h1>
          <p>Here's what's happening with your hiring pipeline today.</p>
        </div>
        <div className="ep-dash-search">🔍 <span>Search anything...</span></div>
      </div>

      <div className="ep-stats">
        {stats.map(s => (
          <div className="ep-stat-card" key={s.label}>
            <div className="ep-stat-icon" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div className="ep-stat-content">
              <div className="ep-stat-value">{s.value}</div>
              <div className="ep-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="ep-grid">
        <div className="ep-card">
          <div className="ep-card-head">
            <span className="ep-card-title">Recent Exams</span>
            <span className="ep-card-link" onClick={() => navigate("/admin/drives")}>View all →</span>
          </div>
          {recentExams.length === 0 && (
            <div className="ep-empty">
              <span className="ep-empty-icon">📝</span>
              No exams created yet.
            </div>
          )}
          {recentExams.map(d => {
            const s = statusMap[d.status] || "Draft";
            return (
              <div className="ep-exam-row" key={d.id} onClick={() => navigate(`/admin/drives/${d.id}`)}>
                <div className="ep-exam-icon">📄</div>
                <div className="ep-exam-info">
                  <div className="ep-exam-name">{d.title}</div>
                  <div className="ep-exam-meta">{d.duration} min · {d.totalQuestions} Qs</div>
                </div>
                <span className="ep-exam-status" style={{ background: statusColor[s].bg, color: statusColor[s].text }}>
                  {s}
                </span>
              </div>
            );
          })}
        </div>

        <div className="ep-card">
          <div className="ep-card-head">
            <span className="ep-card-title">Top Candidates</span>
            <span className="ep-card-link" onClick={() => navigate("/leaderboard")}>View all →</span>
          </div>
          {topCandidates.length === 0 && (
            <div className="ep-empty">
              <span className="ep-empty-icon">🎯</span>
              No attempts yet.
            </div>
          )}
          {topCandidates.map((c, i) => {
            const ranks = ['🥇', '🥈', '🥉'];
            return (
              <div className="ep-cand-row" key={`${c.driveId}-${c.studentId}`} onClick={() => navigate(`/admin/candidate/${c.driveId}/${c.studentId}`)}>
                <span className="ep-cand-rank">{ranks[i] || `#${i+1}`}</span>
                <div className="ep-cand-avatar">
                  {(c.studentName || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="ep-cand-name">{c.studentName}</div>
                  <div className="ep-cand-meta">{c.driveTitle}</div>
                </div>
                <span className="ep-cand-score">{c.percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="ep-card" style={{ marginTop: 16 }}>
        <div className="ep-card-head">
          <span className="ep-card-title">Exam Performance</span>
        </div>
        {chartDrives.length === 0 ? (
          <div className="ep-empty">
            <span className="ep-empty-icon">📊</span>
            No candidates have attempted any exam yet.
          </div>
        ) : (
          <table className="ep-exam-stats-table">
            <tbody>
              {chartDrives.map(d => {
                const s = driveStats[d.id];
                const passPercent = s.total ? Math.round((s.passed / s.total) * 100) : 0;
                return (
                  <tr key={d.id} onClick={() => navigate(`/admin/drives/${d.id}`)} style={{ cursor: 'pointer' }}>
                    <td className="exam-name">{d.title}</td>
                    <td style={{ width: '35%' }}>
                      <div className="ep-pass-bar" style={{ display: 'flex' }}>
                        <div
                          className="ep-pass-bar-fill"
                          style={{ width: `${passPercent}%` }}
                        />
                        <div
                          className="ep-pass-bar-fill failed"
                          style={{ width: `${100 - passPercent}%` }}
                        />
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', minWidth: 120 }}>
                      <span className="exam-passed">{s.passed} passed</span>
                      <span style={{ color: '#94A3B8', margin: '0 4px' }}>·</span>
                      <span className="exam-failed">{s.failed} failed</span>
                    </td>
                    <td style={{ textAlign: 'right', color: '#94A3B8', fontSize: 12, minWidth: 50 }}>
                      {s.total} total
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}