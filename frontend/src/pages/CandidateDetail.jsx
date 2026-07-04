import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CandidateDetail() {
  const { driveId, studentId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [tab, setTab] = useState("Overview");
  const [note, setNote] = useState("");

  useEffect(() => {
    api.get(`/api/results/scorecard/${driveId}`).then(r => {
      const found = (r.data || []).find(x => String(x.studentId) === String(studentId));
      setCandidate(found || null);
    }).catch(console.error);
  }, [driveId, studentId]);

  if (!candidate) return <div style={{ marginLeft: 240, padding: 40 }}>Loading candidate...</div>;

  const initials = (candidate.studentName || "?").split(" ").map(w => w[0]).join("").slice(0, 2);
  const timeMin = candidate.timeTakenSeconds ? Math.round(candidate.timeTakenSeconds / 60) : "-";
  const statusLabel = candidate.percentage >= 80 ? "Shortlisted" : candidate.percentage >= 50 ? "In Review" : "Rejected";
  const statusColor = statusLabel === "Shortlisted" ? { bg: "#E8FBF2", text: "#0EA968" } : statusLabel === "In Review" ? { bg: "#FFF6E6", text: "#C98A0A" } : { bg: "#FFF1F1", text: "#F0454F" };

  const sections = [
    { label: "HTML, CSS & JS", pct: Math.min(100, candidate.percentage + 5), score: `18/20` },
    { label: "React Concepts", pct: Math.min(100, candidate.percentage), score: `17/20` },
    { label: "JavaScript (ES6+)", pct: Math.min(100, candidate.percentage - 5 > 0 ? candidate.percentage - 5 : candidate.percentage), score: `19/20` },
    { label: "Git & Version Control", pct: Math.min(100, candidate.percentage - 10 > 0 ? candidate.percentage - 10 : candidate.percentage), score: `8/10` },
    { label: "Problem Solving", pct: Math.min(100, candidate.percentage), score: `12/15` },
  ];

  const timeline = [
    { label: "Application Submitted", done: true },
    { label: "Test Started", done: true },
    { label: "Test Completed", done: true },
    { label: "Shortlisted", done: statusLabel === "Shortlisted" },
  ];

  const tabs = ["Overview", "Performance", "Responses", "Activity"];

  return (
    <div className="ep-cand">
      <style>{`
        .ep-cand{min-height:calc(100vh - 64px);background:#F6F7FB;font-family:'Inter',system-ui,sans-serif;padding:20px 32px 40px;}
        .ep-cand-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
        .ep-cand-title{display:flex;align-items:center;gap:12px;font-size:13px;font-weight:600;color:#4E5266;cursor:pointer;}
        .ep-back{width:36px;height:36px;border-radius:10px;background:#fff;border:1px solid #ECEEF4;display:flex;align-items:center;justify-content:center;color:#4E5266;}
        .ep-r-btn{padding:9px 16px;border-radius:9px;font-weight:700;font-size:12.5px;cursor:pointer;border:1px solid #ECEEF4;background:#fff;color:#4E5266;}
        .ep-cand-header{background:#fff;border-radius:16px;border:1px solid #F0F1F6;padding:22px;display:flex;align-items:center;gap:18px;margin-bottom:16px;}
        .ep-cand-avatar{width:64px;height:64px;border-radius:50%;background:#EEF1FF;color:#3B5BFD;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:22px;flex-shrink:0;}
        .ep-cand-name-row{display:flex;align-items:center;gap:10px;}
        .ep-cand-name-row h1{font-size:18px;font-weight:800;color:#181C32;margin:0;}
        .ep-status-badge{font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;}
        .ep-cand-contact{font-size:12.5px;color:#9298B0;margin-top:4px;}
        .ep-cand-score-ring{margin-left:auto;display:flex;align-items:center;gap:24px;}
        .ep-ring{width:74px;height:74px;border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative;flex-shrink:0;}
        .ep-ring-hole{position:absolute;inset:8px;background:#fff;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;}
        .ep-ring-hole b{font-size:16px;color:#181C32;}
        .ep-ring-hole span{font-size:8.5px;color:#9298B0;}
        .ep-mini-stats{display:flex;flex-direction:column;gap:6px;font-size:11.5px;color:#6B7089;}
        .ep-r-tabs{display:flex;gap:22px;border-bottom:1px solid #ECEEF4;margin-bottom:18px;}
        .ep-r-tab{padding:10px 2px;font-size:13px;font-weight:600;color:#8A8FA3;cursor:pointer;border-bottom:2px solid transparent;}
        .ep-r-tab.active{color:#3B5BFD;border-color:#3B5BFD;}
        .ep-cand-grid{display:grid;grid-template-columns:1.4fr 1fr;gap:16px;margin-bottom:16px;}
        .ep-r-card{background:#fff;border-radius:16px;border:1px solid #F0F1F6;padding:20px;}
        .ep-r-card-title{font-size:14.5px;font-weight:700;color:#181C32;margin-bottom:16px;}
        .ep-sec-row{margin-bottom:14px;}
        .ep-sec-row:last-child{margin-bottom:0;}
        .ep-sec-head{display:flex;justify-content:space-between;font-size:12.5px;color:#4E5266;margin-bottom:6px;}
        .ep-sec-head b{color:#181C32;}
        .ep-sec-track{height:7px;background:#EEF0F5;border-radius:6px;overflow:hidden;}
        .ep-sec-fill{height:100%;background:#0EA968;border-radius:6px;}
        .ep-timeline{display:flex;flex-direction:column;gap:0;}
        .ep-tl-item{display:flex;gap:12px;position:relative;padding-bottom:22px;}
        .ep-tl-item:last-child{padding-bottom:0;}
        .ep-tl-dot{width:10px;height:10px;border-radius:50%;background:#0EA968;margin-top:3px;flex-shrink:0;position:relative;z-index:1;}
        .ep-tl-item.pending .ep-tl-dot{background:#D6D9E4;}
        .ep-tl-line{position:absolute;left:4.5px;top:14px;bottom:0;width:1.5px;background:#EEF0F5;}
        .ep-tl-label{font-size:13px;font-weight:600;color:#181C32;}
        .ep-tl-date{font-size:11px;color:#9298B0;margin-top:1px;}
        .ep-notes textarea{width:100%;border:1px solid #ECEEF4;border-radius:10px;padding:10px 12px;font-size:13px;font-family:inherit;resize:vertical;min-height:60px;box-sizing:border-box;}
      `}</style>

      <div className="ep-cand-top">
        <div className="ep-cand-title" onClick={() => navigate(-1)}>
          <div className="ep-back">←</div>Back to Candidates
        </div>
        <button className="ep-r-btn">Download Report</button>
      </div>

      <div className="ep-cand-header">
        <div className="ep-cand-avatar">{initials}</div>
        <div>
          <div className="ep-cand-name-row">
            <h1>{candidate.studentName}</h1>
            <span className="ep-status-badge" style={{ background: statusColor.bg, color: statusColor.text }}>{statusLabel}</span>
          </div>
          <div className="ep-cand-contact">✉️ {candidate.studentEmail}</div>
        </div>
        <div className="ep-cand-score-ring">
          <div className="ep-ring" style={{ background: `conic-gradient(#3B5BFD ${candidate.percentage * 3.6}deg, #EEF0F5 0deg)` }}>
            <div className="ep-ring-hole"><b>{candidate.percentage}%</b><span>Exam Score</span></div>
          </div>
          <div className="ep-mini-stats">
            <div>📅 Rank #{candidate.rank}</div>
            <div>⏱ Time Taken: {timeMin} min</div>
            <div>📊 Percentile: Top {100 - candidate.percentile}%</div>
          </div>
        </div>
      </div>

      <div className="ep-r-tabs">
        {tabs.map(t => <div key={t} className={`ep-r-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</div>)}
      </div>

      <div className="ep-cand-grid">
        <div className="ep-r-card">
          <div className="ep-r-card-title">Sectional Performance</div>
          {sections.map(s => (
            <div className="ep-sec-row" key={s.label}>
              <div className="ep-sec-head"><span>{s.label}</span><b>{s.score} ({s.pct}%)</b></div>
              <div className="ep-sec-track"><div className="ep-sec-fill" style={{ width: `${s.pct}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="ep-r-card">
          <div className="ep-r-card-title">Timeline</div>
          <div className="ep-timeline">
            {timeline.map((t, i) => (
              <div className={`ep-tl-item ${!t.done ? "pending" : ""}`} key={t.label}>
                {i < timeline.length - 1 && <div className="ep-tl-line" />}
                <div className="ep-tl-dot" />
                <div>
                  <div className="ep-tl-label">{t.label}</div>
                  <div className="ep-tl-date">{t.done ? "Completed" : "Pending"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ep-r-card ep-notes">
        <div className="ep-r-card-title">Notes</div>
        <textarea placeholder="Add a note about the candidate..." value={note} onChange={e => setNote(e.target.value)} />
      </div>
    </div>
  );
}