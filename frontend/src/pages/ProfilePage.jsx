import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const UNIVERSITIES = [
  "Chitkara University",
  "Punjab University",
  "Lovely Professional University",
  "Amity University",
  "Delhi University",
  "Mumbai University",
  "VIT University",
  "SRM University",
  "Chandigarh University",
  "Anna University",
  "Other"
];

const STREAMS = ["B.Tech", "BCA", "MCA", "B.Sc", "M.Tech", "MBA", "BBA", "B.Com", "Other"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const SECTIONS = ["A", "B", "C", "D", "E"];
const DESIGNATIONS = ["HR Executive", "HR Manager", "Talent Acquisition Specialist", "Recruiter", "Hiring Manager", "Founder / CXO", "Other"];

function ProfilePage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");
  const email = localStorage.getItem("email") || "";

  const [form, setForm] = useState({
    phone: "",
    rollNumber: "",
    institution: "",
    stream: "",
    year: "",
    section: "",
    dateOfBirth: "",
    department: "",
    designation: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get(`/api/profile/${userId}`)
      .then(res => {
        if (res.data.exists) {
          setForm({
            phone: res.data.phone || "",
            rollNumber: res.data.rollNumber || "",
            institution: res.data.institution || "",
            stream: res.data.stream || "",
            year: res.data.year || "",
            section: res.data.section || "",
            dateOfBirth: res.data.dateOfBirth || "",
            department: res.data.department || "",
            designation: res.data.designation || ""
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const save = async () => {
    setSaving(true);
    try {
      await api.post("/api/profile/save", { userId: parseInt(userId), ...form });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const initials = name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";
  const isAdmin = role === "ADMIN" || role === "HR";

  if (loading) return <div className="spinner" />;

  return (
    <div className="page">

      {/* AVATAR SECTION */}
      <div className="card" style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--blue), var(--blue-glow))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.8rem",
          fontWeight: 800,
          color: "white",
          flexShrink: 0
        }}>
          {initials}
        </div>
        <div>
          <h1 className="page-title" style={{ marginBottom: "0.2rem" }}>{name}</h1>
          <p style={{ color: "var(--gray)", fontSize: "0.9rem" }}>{email}</p>
          <span className="exam-badge" style={{ marginTop: "0.4rem", display: "inline-block" }}>
            {isAdmin ? "👨‍💼 Admin" : "🎓 Student"}
          </span>
        </div>
      </div>

      {saved && (
        <div className="auth-success" style={{ marginBottom: "1.5rem" }}>
          ✅ Profile saved successfully!
        </div>
      )}

      {/* BASIC INFO + INSTITUTION — side by side */}
      <div className="two-col" style={{ gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
        <div className="card">
          <div className="section-title" style={{ marginBottom: "1.2rem" }}>📋 Basic Information</div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={name} disabled style={{ opacity: 0.6 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" value={email} disabled style={{ opacity: 0.6 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              className="form-input"
              placeholder="e.g. 9876543210"
              value={form.phone}
              onChange={update("phone")}
              maxLength={10}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Date of Birth</label>
            <input
              className="form-input"
              type="date"
              value={form.dateOfBirth}
              onChange={update("dateOfBirth")}
            />
          </div>
        </div>

        {/* INSTITUTION INFO */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: "1.2rem" }}>
            {isAdmin ? "🏢 Organization Details" : "🏫 Institution Details"}
          </div>

          <div className="form-group">
            <label className="form-label">{isAdmin ? "Organization" : "University / School"}</label>
            {isAdmin ? (
              <input
                className="form-input"
                placeholder="e.g. Google, TCS, Infosys"
                value={form.institution}
                onChange={update("institution")}
              />
            ) : (
              <select className="form-select" value={form.institution} onChange={update("institution")}>
                <option value="">-- Select Institution --</option>
                {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            )}
          </div>

          {/* STUDENT ONLY FIELDS */}
          {role === "STUDENT" && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Stream</label>
                  <select className="form-select" value={form.stream} onChange={update("stream")}>
                    <option value="">-- Select Stream --</option>
                    {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select className="form-select" value={form.year} onChange={update("year")}>
                    <option value="">-- Select Year --</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Section / Class</label>
                  <select className="form-select" value={form.section} onChange={update("section")}>
                    <option value="">-- Select Section --</option>
                    {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Roll Number</label>
                  <input
                    className="form-input"
                    placeholder="e.g. 2210992345"
                    value={form.rollNumber}
                    onChange={update("rollNumber")}
                  />
                </div>
              </div>
            </>
          )}

          {/* ADMIN / HR ONLY FIELDS */}
          {isAdmin && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Designation</label>
              <select className="form-select" value={form.designation} onChange={update("designation")}>
                <option value="">-- Select Designation --</option>
                {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: "1.5rem" }} />

      {/* ACTIONS */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
        <button className="btn btn-outline" onClick={() => navigate(isAdmin ? "/admin" : "/student")}>
          ← Back
        </button>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save Profile ✓"}
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;