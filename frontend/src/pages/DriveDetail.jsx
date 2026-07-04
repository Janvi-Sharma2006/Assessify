import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function DriveDetail() {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const [drive, setDrive] = useState(null);
  const [results, setResults] = useState([]);
  const [tab, setTab] = useState("Overview");
  const [settingsForm, setSettingsForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchData(); }, [driveId]);

  async function fetchData() {
    try {
      const dRes = await api.get(`/api/drives/${driveId}`);
      setDrive(dRes.data);
      setSettingsForm({
        title: dRes.data.title || "",
        position: dRes.data.position || "",
        category: dRes.data.category || "Java",
        difficulty: dRes.data.difficulty || "Medium",
        duration: dRes.data.duration || 45,
        totalQuestions: dRes.data.totalQuestions || 30,
        deadline: dRes.data.deadline || "",
      });
      const rRes = await api.get(`/api/results/scorecard/${driveId}`);
      setResults(rRes.data || []);
    } catch (e) { console.error(e); }
  }

  async function saveSettings(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await api.put(`/api/drives/${driveId}`, {
        ...settingsForm,
        createdById: drive.createdBy?.id,
      });
      setDrive(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      alert(e.response?.data?.error || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(newStatus) {
    try {
      const res = await api.put(`/api/drives/${driveId}/status`, { status: newStatus });
      setDrive(res.data);
    } catch (e) { console.error(e); }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this exam? This will also remove its candidates' results and question bank. This can't be undone.")) return;
    try {
      await api.delete(`/api/drives/${driveId}`);
      navigate("/admin/drives");
    } catch (e) { console.error(e); }
  }

  function copyExamLink() {
    const link = `${window.location.origin}/invite/${drive.inviteSlug}`;
    navigator.clipboard.writeText(link);
    alert("Exam link copied to clipboard!");
  }

  if (!drive) return <div style={{ marginLeft: 240, padding: 40 }}>Loading...</div>;

  const total = results.length;
  const avg = total ? (results.reduce((s, r) => s + (r.percentage || 0), 0) / total) : 0;
  const top = total ? Math.max(...results.map(r => r.percentage || 0)) : 0;
  const completion = total ? Math.round((results.filter(r => r.status === "PASS" || r.percentage >= 0).length / total) * 100) : 0;

  const buckets = [
    { label: "0-20", min: 0, max: 20 }, { label: "20-40", min: 20, max: 40 },
    { label: "40-60", min: 40, max: 60 }, { label: "60-80", min: 60, max: 80 },
    { label: "80-100", min: 80, max: 101 },
  ];
  const dist = buckets.map(b => ({ ...b, count: results.filter(r => (r.percentage || 0) >= b.min && (r.percentage || 0) < b.max).length }));
  const maxCount = Math.max(1, ...dist.map(d => d.count));

  const proficiency = [
    { label: "High (80-100%)", value: results.filter(r => (r.percentage || 0) >= 80).length, color: "#0EA968" },
    { label: "Medium (50-79%)", value: results.filter(r => (r.percentage || 0) >= 50 && (r.percentage || 0) < 80).length, color: "#F5A524" },
    { label: "Low (0-49%)", value: results.filter(r => (r.percentage || 0) < 50).length, color: "#F0454F" },
  ];
  const profTotal = Math.max(1, proficiency.reduce((s, p) => s + p.value, 0));
  let acc = 0;
  const grad = proficiency.map(p => {
    const start = (acc / profTotal) * 360; acc += p.value; const end = (acc / profTotal) * 360;
    return `${p.color} ${start}deg ${end}deg`;
  });

  const top3 = [...results].sort((a, b) => b.percentage - a.percentage).slice(0, 3);
  const tabs = ["Overview", "Candidates", "Settings"];

  return (
    <div className="ep-report">
      <style>{`
        .ep-report{min-height:calc(100vh - 64px);background:#F6F7FB;font-family:'Inter',system-ui,sans-serif;padding:84px 32px 40px;}
        .ep-report-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
        .ep-report-title{display:flex;align-items:center;gap:12px;}
        .ep-back{width:36px;height:36px;border-radius:10px;background:#fff;border:1px solid #ECEEF4;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#4E5266;}
        .ep-report-title h1{font-size:18px;font-weight:800;color:#181C32;margin:0;}
        .ep-report-actions{display:flex;gap:10px;}
        .ep-r-btn{padding:9px 16px;border-radius:9px;font-weight:700;font-size:12.5px;cursor:pointer;border:1px solid #ECEEF4;background:#fff;color:#4E5266;}
        .ep-r-btn.primary{background:#3B5BFD;color:#fff;border-color:#3B5BFD;}
        .ep-r-tabs{display:flex;gap:22px;border-bottom:1px solid #ECEEF4;margin-bottom:20px;}
        .ep-r-tab{padding:10px 2px;font-size:13px;font-weight:600;color:#8A8FA3;cursor:pointer;border-bottom:2px solid transparent;}
        .ep-r-tab.active{color:#3B5BFD;border-color:#3B5BFD;}
        .ep-r-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:18px;}
        .ep-r-stat{background:#fff;border-radius:14px;border:1px solid #F0F1F6;padding:16px 18px;}
        .ep-r-stat .lbl{font-size:12px;color:#8A8FA3;margin-bottom:6px;}
        .ep-r-stat .val{font-size:21px;font-weight:800;color:#181C32;}
        .ep-r-grid{display:grid;grid-template-columns:1.3fr 1fr;gap:16px;margin-bottom:16px;}
        .ep-r-card{background:#fff;border-radius:16px;border:1px solid #F0F1F6;padding:20px;}
        .ep-r-card-title{font-size:14.5px;font-weight:700;color:#181C32;margin-bottom:16px;}
        .ep-bars{display:flex;align-items:flex-end;gap:14px;height:150px;}
        .ep-bar-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;}
        .ep-bar{width:100%;max-width:34px;border-radius:6px 6px 0 0;background:#E4E7F2;}
        .ep-bar.hi{background:#3B5BFD;}
        .ep-bar-lbl{font-size:10.5px;color:#9298B0;margin-top:8px;}
        .ep-donut-wrap{display:flex;align-items:center;gap:20px;}
        .ep-donut{width:110px;height:110px;border-radius:50%;position:relative;flex-shrink:0;}
        .ep-donut-hole{position:absolute;inset:16px;background:#fff;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;}
        .ep-donut-total{font-size:19px;font-weight:800;color:#181C32;}
        .ep-donut-total-label{font-size:9px;color:#9298B0;}
        .ep-legend{display:flex;flex-direction:column;gap:8px;}
        .ep-legend-item{display:flex;align-items:center;gap:8px;font-size:11.5px;color:#4E5266;}
        .ep-legend-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
        .ep-legend-item b{margin-left:auto;color:#181C32;}
        .ep-top-row{display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid #F4F5F9;font-size:13px;color:#4E5266;}
        .ep-top-row:last-child{border-bottom:none;}
        .ep-top-rank{width:20px;font-weight:700;color:#9298B0;}
        .ep-top-avatar{width:32px;height:32px;border-radius:50%;background:#EEF1FF;color:#3B5BFD;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0;}
        .ep-top-name{font-weight:700;color:#181C32;}
        .ep-top-email{font-size:11.5px;color:#9298B0;}
        .ep-top-score{margin-left:auto;font-weight:700;color:#181C32;}
        .ep-cand-table{width:100%;border-collapse:collapse;}
        .ep-cand-table th{text-align:left;font-size:11px;text-transform:uppercase;color:#9298B0;padding:10px 8px;border-bottom:1px solid #F0F1F6;}
        .ep-cand-table td{padding:10px 8px;font-size:13px;color:#4E5266;border-bottom:1px solid #F4F5F9;cursor:pointer;}
        @media(max-width:1100px){.ep-r-stats{grid-template-columns:repeat(2,1fr);}.ep-r-grid{grid-template-columns:1fr;}}
        .ep-set-label{font-size:12px;font-weight:600;color:#6B7089;display:block;margin:14px 0 5px;}
        .ep-set-input{width:100%;padding:9px 12px;border:1px solid #ECEEF4;border-radius:9px;font-size:13px;box-sizing:border-box;font-family:inherit;}
      `}</style>

      <div className="ep-report-top">
        <div className="ep-report-title">
          <div className="ep-back" onClick={() => navigate("/admin/drives")}>←</div>
          <h1>{drive.title}</h1>
        </div>
        <div className="ep-report-actions">
          <button className="ep-r-btn" onClick={copyExamLink}>🔗 Copy Exam Link</button>
          <select
            className="ep-r-btn"
            value={drive.status}
            onChange={e => handleStatusChange(e.target.value)}
            style={{ cursor: "pointer" }}
          >
            <option value="DRAFT">To be scheduled</option>
            <option value="LIVE">Live</option>
            <option value="CLOSED">Closed</option>
          </select>
          <button className="ep-r-btn primary" onClick={() => navigate(`/admin/drive/${driveId}/questions`)}>+ Add Question</button>
          <button className="ep-r-btn" style={{ color: "#F0454F", borderColor: "#F0454F" }} onClick={handleDelete}>Delete</button>
        </div>
      </div>

      <div className="ep-r-tabs">
        {tabs.map(t => <div key={t} className={`ep-r-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</div>)}
      </div>

      {tab === "Overview" && (
        <>
          <div className="ep-r-stats">
            <div className="ep-r-stat"><div className="lbl">Total Candidates</div><div className="val">{total}</div></div>
            <div className="ep-r-stat"><div className="lbl">Average Score</div><div className="val">{avg.toFixed(1)}%</div></div>
            <div className="ep-r-stat"><div className="lbl">Top Score</div><div className="val">{top}%</div></div>
            <div className="ep-r-stat"><div className="lbl">Completion Rate</div><div className="val">{completion}%</div></div>
          </div>

          <div className="ep-r-grid">
            <div className="ep-r-card">
              <div className="ep-r-card-title">Score Distribution</div>
              <div className="ep-bars">
                {dist.map(d => (
                  <div className="ep-bar-col" key={d.label}>
                    <div className={`ep-bar ${d.count === maxCount && d.count > 0 ? "hi" : ""}`} style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: 4 }} />
                    <div className="ep-bar-lbl">{d.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="ep-r-card">
              <div className="ep-r-card-title">Performance Summary</div>
              <div className="ep-donut-wrap">
                <div className="ep-donut" style={{ background: `conic-gradient(${grad.join(",")})` }}>
                  <div className="ep-donut-hole"><span className="ep-donut-total">{total}</span><span className="ep-donut-total-label">Total</span></div>
                </div>
                <div className="ep-legend">
                  {proficiency.map(p => (
                    <div className="ep-legend-item" key={p.label}><span className="ep-legend-dot" style={{ background: p.color }} />{p.label} <b>{p.value} ({profTotal ? Math.round(p.value / profTotal * 100) : 0}%)</b></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="ep-r-card">
            <div className="ep-r-card-title">Recent Top Performers</div>
            {top3.map((r, i) => (
              <div className="ep-top-row" key={r.studentId} onClick={() => navigate(`/admin/candidate/${driveId}/${r.studentId}`)}>
                <span className="ep-top-rank">{i + 1}</span>
                <div className="ep-top-avatar">{(r.studentName || "?").split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
                <div>
                  <div className="ep-top-name">{r.studentName}</div>
                  <div className="ep-top-email">{r.studentEmail}</div>
                </div>
                <span className="ep-top-score">{r.percentage}%</span>
              </div>
            ))}
            {top3.length === 0 && <div style={{ color: "#9298B0", padding: 20, textAlign: "center" }}>No candidates yet.</div>}
          </div>
        </>
      )}

      {tab === "Candidates" && (
        <div className="ep-r-card">
          <table className="ep-cand-table">
            <thead><tr><th>Rank</th><th>Name</th><th>Email</th><th>Score</th><th>Percentile</th><th>Status</th></tr></thead>
            <tbody>
              {results.map(r => (
                <tr key={r.studentId} onClick={() => navigate(`/admin/candidate/${driveId}/${r.studentId}`)}>
                  <td>{r.rank}</td><td>{r.studentName}</td><td>{r.studentEmail}</td>
                  <td>{r.score}/{r.totalQuestions} ({r.percentage}%)</td><td>{r.percentile}%ile</td><td>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "Settings" && settingsForm && (
        <div className="ep-r-card" style={{ maxWidth: 520 }}>
          <div className="ep-r-card-title">Exam Settings</div>
          <form onSubmit={saveSettings}>
            <label className="ep-set-label">Exam Title</label>
            <input className="ep-set-input" required value={settingsForm.title}
              onChange={e => setSettingsForm(f => ({ ...f, title: e.target.value }))} />

            <label className="ep-set-label">Role / Position</label>
            <input className="ep-set-input" value={settingsForm.position}
              onChange={e => setSettingsForm(f => ({ ...f, position: e.target.value }))} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label className="ep-set-label">Category</label>
                <select className="ep-set-input" value={settingsForm.category}
                  onChange={e => setSettingsForm(f => ({ ...f, category: e.target.value }))}>
                  <option>Java</option><option>DSA</option><option>SQL</option><option>DBMS</option><option>Aptitude</option><option>React</option>
                </select>
              </div>
              <div>
                <label className="ep-set-label">Difficulty</label>
                <select className="ep-set-input" value={settingsForm.difficulty}
                  onChange={e => setSettingsForm(f => ({ ...f, difficulty: e.target.value }))}>
                  <option>Easy</option><option>Medium</option><option>Hard</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label className="ep-set-label">Duration (min)</label>
                <input className="ep-set-input" type="number" min="1" value={settingsForm.duration}
                  onChange={e => setSettingsForm(f => ({ ...f, duration: e.target.value }))} />
              </div>
              <div>
                <label className="ep-set-label">Total Questions</label>
                <input className="ep-set-input" type="number" min="1" value={settingsForm.totalQuestions}
                  onChange={e => setSettingsForm(f => ({ ...f, totalQuestions: e.target.value }))} />
              </div>
            </div>

            <label className="ep-set-label">Deadline</label>
            <input className="ep-set-input" type="date" value={settingsForm.deadline || ""}
              onChange={e => setSettingsForm(f => ({ ...f, deadline: e.target.value }))} />

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 22 }}>
              <button type="submit" className="ep-r-btn primary" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              {saved && <span style={{ color: "#0EA968", fontSize: 12.5, fontWeight: 600 }}>✓ Saved</span>}
            </div>
          </form>

          <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #F0F1F6" }}>
            <div className="ep-r-card-title" style={{ marginBottom: 8 }}>Danger Zone</div>
            <p style={{ fontSize: 12.5, color: "#9298B0", marginBottom: 12 }}>
              Deleting this exam removes it permanently, along with its question bank and all candidate results.
            </p>
            <button className="ep-r-btn" style={{ color: "#F0454F", borderColor: "#F0454F" }} onClick={handleDelete}>Delete this exam</button>
          </div>
        </div>
      )}
    </div>
  );
}