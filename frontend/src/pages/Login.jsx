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

export default function Login() {
  const [tab, setTab] = useState("HR");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const { token, role, userId, name, email: em, company } = res.data;

      const isHrAccount = role === "ADMIN" || role === "HR";
      if ((tab === "HR" && !isHrAccount) || (tab === "STUDENT" && isHrAccount)) {
        setError(
          isHrAccount
            ? "This is an HR/Admin account. Switch to the HR / Admin tab to sign in."
            : "This is a Candidate account. Switch to the Candidate tab to sign in."
        );
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", userId);
      localStorage.setItem("name", name);
      localStorage.setItem("email", em);
      if (company) localStorage.setItem("company", company);

      if (isHrAccount) {
        navigate("/admin");
      } else {
        const pending = localStorage.getItem("pendingExamRedirect");
        if (pending) {
          localStorage.removeItem("pendingExamRedirect");
          navigate(pending);
        } else {
          navigate("/student");
        }
      }
    } catch (error) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
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
          {FEATURES.map(f => (
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

      <div className="login-right">
        <div className="login-form-card">
          <div className="login-tabs">
            {["HR", "STUDENT"].map(t => (
              <div
                key={t}
                className={`login-tab ${tab === t ? "active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t === "HR" ? "HR / Admin" : "Candidate"}
              </div>
            ))}
          </div>

          <div className="login-heading" style={{ textAlign: "center" }}>Welcome back</div>

          <form onSubmit={handleLogin}>
            <div className="login-field">
              <label className="login-field-label">Email</label>
              <div className="login-field-input-wrap">
                <input
                  className="login-field-input"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-field-label">Password</label>
              <div className="login-field-input-wrap">
                <input
                  className="login-field-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="login-field-toggle"
                  onClick={() => setShowPassword(s => !s)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button
              className="login-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <div className="login-footer">
            Don't have an account? <Link to="/register">Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}