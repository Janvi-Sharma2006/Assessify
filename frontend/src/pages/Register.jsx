import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const FEATURES = [
  {
    icon: "🎯",
    title: "Smart Assessments",
    desc: "Create aptitude, technical, and coding tests with customizable difficulty levels."
  },
  {
    icon: "⚡",
    title: "Instant Evaluation",
    desc: "Automatic scoring with detailed reports, rankings, and performance analytics."
  },
  {
    icon: "🔒",
    title: "Secure Online Exams",
    desc: "Tab-switch monitoring, countdown timer, and anti-cheating features ensure fair assessments."
  }
];

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "HR",
    company: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handle = (e) =>
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/api/auth/register", form);
      navigate("/");
    } catch {
      setError("Registration failed. Email may already exist.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* Left Section */}
      <div className="login-left">
        <div className="login-left-brand">
          <div className="login-left-brand-mark">⚡</div>
          <span className="login-left-brand-name">Assessify</span>
        </div>

        <div className="login-left-eyebrow">
          <span className="login-left-eyebrow-dot" />
          Built for hiring teams
        </div>

        <div className="login-left-headline">
          Where hiring<br />
          decisions get<br />
          evidence.
        </div>

        <div className="login-left-sub">
          Assessify streamlines online recruitment by enabling organizations to create secure assessments, evaluate candidates instantly, and make smarter hiring decisions through real-time analytics and automated scoring.
        </div>

        <div className="login-left-feats">
          {FEATURES.map((f) => (
            <div className="login-left-feat" key={f.title}>
              <span className="login-left-feat-icon">{f.icon}</span>
              <div>
                <div className="login-left-feat-title">{f.title}</div>
                <div className="login-left-feat-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Section */}
      <div className="login-right">
        <div className="login-form-card">
          <div className="login-heading" style={{ textAlign: "center" }}>Create account</div>
          <div className="login-sub" style={{ textAlign: "center" }}>Get started for free</div>

          <form onSubmit={submit}>
            {/* Name */}
            <div className="login-field">
              <label className="login-field-label">Full Name</label>

              <div className="login-field-input-wrap">
                <input
                  className="login-field-input"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handle}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="login-field">
              <label className="login-field-label">Email Address</label>

              <div className="login-field-input-wrap">
                <input
                  className="login-field-input"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handle}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label className="login-field-label">Password</label>

              <div className="login-field-input-wrap">
                <input
                  className="login-field-input"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handle}
                  required
                />

                <button
                  type="button"
                  className="login-field-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Role */}
            <div className="login-field">
              <label className="login-field-label">Role</label>

              <div className="login-field-input-wrap">
                <select
                  className="login-field-input"
                  name="role"
                  value={form.role}
                  onChange={handle}
                >
                  <option value="HR">HR / Admin</option>
                  <option value="STUDENT">Candidate / Student</option>
                </select>
              </div>
            </div>

            {/* Company */}
            {form.role === "HR" && (
              <div className="login-field">
                <label className="login-field-label">Organization</label>

                <div className="login-field-input-wrap">
                  <input
                    className="login-field-input"
                    type="text"
                    name="company"
                    placeholder="Enter organization name"
                    value={form.company}
                    onChange={handle}
                  />
                </div>
              </div>
            )}

            {error && <div className="error-msg">{error}</div>}

            <button
              className="login-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Account →"}
            </button>
          </form>

          <div className="login-footer">
            Already have an account? <Link to="/">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}