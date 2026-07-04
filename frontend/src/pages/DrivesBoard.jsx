import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function DrivesBoard() {
  const [drives, setDrives] = useState([]);
  const [tab, setTab] = useState("All");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", position: "", category: "Java", difficulty: "Medium", duration: 45, totalQuestions: 30, deadline: "" });
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const perPage = 6;

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const res = await api.get(`/api/drives/my/${userId}`);
      setDrives(res.data);
    } catch (e) { console.error(e); }
  }

  async function createDrive(e) {
    e.preventDefault();
    try {
      await api.post("/api/drives/create", { ...form, createdById: userId });
      setShowModal(false);
      setForm({ title: "", position: "", category: "Java", difficulty: "Medium", duration: 45, totalQuestions: 30, deadline: "" });
      fetchData();
    } catch (e) { console.error(e); }
  }

  const statusMap = { LIVE: "Live", DRAFT: "To be scheduled", CLOSED: "Closed" };

  const tabs = ["All", "Live", "Closed", "To be scheduled"];
  const filtered = drives.filter(d => {
    const s = statusMap[d.status] || "To be scheduled";
    if (tab === "All") return true;
    return s === tab;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="ep-exlist">
      <style>{`
     .ep-exlist{min-height:calc(100vh - 64px);background:#F6F7FB;font-family:'Inter',system-ui,sans-serif;padding:88px 32px 40px;}
        .ep-exlist-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px;}
        .ep-exlist-top h1{font-size:20px;font-weight:800;color:#181C32;margin:0 0 4px;}
        .ep-exlist-top p{font-size:13px;color:#8A8FA3;margin:0;}
        .ep-create-btn{background:#3B5BFD;color:#fff;border:none;border-radius:10px;padding:11px 20px;font-weight:700;font-size:13px;cursor:pointer;}
        .ep-exlist-card{background:#fff;border-radius:16px;border:1px solid #F0F1F6;overflow:hidden;}
        .ep-tabs{display:flex;gap:6px;padding:14px 20px 0;border-bottom:1px solid #F0F1F6;}
        .ep-tab{padding:10px 14px;font-size:13px;font-weight:600;color:#8A8FA3;cursor:pointer;border-bottom:2px solid transparent;}
        .ep-tab.active{color:#3B5BFD;border-color:#3B5BFD;}
        table.ep-table{width:100%;border-collapse:collapse;}
        .ep-table th{text-align:left;font-size:11.5px;text-transform:uppercase;letter-spacing:.03em;color:#9298B0;padding:14px 20px;border-bottom:1px solid #F0F1F6;}
        .ep-table td{padding:14px 20px;font-size:13.5px;color:#4E5266;border-bottom:1px solid #F4F5F9;}
        .ep-table tr:last-child td{border-bottom:none;}
        .ep-table .name{font-weight:700;color:#181C32;}
        .ep-status-badge{font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;}
        .ep-row-actions{color:#9298B0;cursor:pointer;font-weight:700;}
        .ep-pagination{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;}
        .ep-pagination span{font-size:12.5px;color:#9298B0;}
        .ep-pg-btns{display:flex;gap:6px;}
        .ep-pg-btn{width:28px;height:28px;border-radius:8px;border:1px solid #ECEEF4;background:#fff;font-size:12.5px;color:#6B7089;cursor:pointer;}
        .ep-pg-btn.active{background:#3B5BFD;color:#fff;border-color:#3B5BFD;}
        .ep-modal-bg{position:fixed;inset:0;background:rgba(20,22,40,.45);display:flex;align-items:center;justify-content:center;z-index:200;}
        .ep-modal{background:#fff;border-radius:16px;padding:24px;width:420px;max-width:90vw;}
        .ep-modal h3{margin:0 0 16px;font-size:16px;color:#181C32;}
        .ep-modal label{font-size:12px;font-weight:600;color:#6B7089;display:block;margin:10px 0 5px;}
        .ep-modal input,.ep-modal select{width:100%;padding:9px 12px;border:1px solid #ECEEF4;border-radius:9px;font-size:13px;box-sizing:border-box;}
        .ep-modal-actions{display:flex;gap:10px;margin-top:20px;}
        .ep-modal-btn{flex:1;padding:10px;border-radius:9px;font-weight:700;font-size:13px;cursor:pointer;border:1px solid #ECEEF4;background:#fff;}
        .ep-modal-btn.primary{background:#3B5BFD;color:#fff;border-color:#3B5BFD;}
      `}</style>

      <div className="ep-exlist-top">
        <div>
          <h1>Exams</h1>
          <p>Create and manage all your hiring assessments.</p>
        </div>
        <button className="ep-create-btn" onClick={() => setShowModal(true)}>+ Create New Exam</button>
      </div>

      <div className="ep-exlist-card">
        <div className="ep-tabs">
          {tabs.map(t => (
            <div key={t} className={`ep-tab ${tab === t ? "active" : ""}`} onClick={() => { setTab(t); setPage(1); }}>{t}</div>
          ))}
        </div>

        <table className="ep-table">
          <thead>
            <tr><th>Exam Name</th><th>Role</th><th>Questions</th><th>Duration</th><th></th></tr>
          </thead>
          <tbody>
            {pageItems.map(d => (
              <tr key={d.id} onClick={() => navigate(`/admin/drives/${d.id}`)} style={{ cursor: "pointer" }}>
                <td className="name">{d.title}</td>
                <td>{d.position || d.category}</td>
                <td>{d.totalQuestions}</td>
                <td>{d.duration} min</td>
                <td className="ep-row-actions" onClick={e => e.stopPropagation()}>⋮</td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: 30, color: "#9298B0" }}>No exams found.</td></tr>
            )}
          </tbody>
        </table>

        <div className="ep-pagination">
          <span>Showing {filtered.length === 0 ? 0 : (page - 1) * perPage + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
          <div className="ep-pg-btns">
            <button className="ep-pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} className={`ep-pg-btn ${page === i + 1 ? "active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
            <button className="ep-pg-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="ep-modal-bg" onClick={() => setShowModal(false)}>
          <div className="ep-modal" onClick={e => e.stopPropagation()}>
            <h3>Create New Exam</h3>
            <form onSubmit={createDrive}>
              <label>Exam Title</label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <label>Role / Position</label>
              <input value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} />
              <label>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option>Java</option><option>DSA</option><option>SQL</option><option>DBMS</option><option>Aptitude</option><option>React</option>
              </select>
              <label>Duration (min)</label>
              <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
              <label>Total Questions</label>
              <input type="number" value={form.totalQuestions} onChange={e => setForm(f => ({ ...f, totalQuestions: e.target.value }))} />
              <div className="ep-modal-actions">
                <button type="button" className="ep-modal-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="ep-modal-btn primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}