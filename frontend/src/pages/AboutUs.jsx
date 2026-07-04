import { useNavigate } from "react-router-dom";

const FEATURES = [
  { icon: "📝", color: "purple", title: "Custom Assessments", desc: "Build MCQ-based drives with sections, difficulty levels, and time limits tailored to any role." },
  { icon: "🔗", color: "blue", title: "Invite-Based Access", desc: "Every drive gets a unique invite link or code so candidates can join without pre-existing accounts." },
  { icon: "⏱", color: "amber", title: "Timed, Proctored Exams", desc: "Live countdown timers and tab-switch tracking help maintain exam integrity end to end." },
  { icon: "📊", color: "green", title: "Instant Scorecards", desc: "Students get an immediate breakdown of performance, section-wise scores, and pass/fail status." },
  { icon: "🏆", color: "purple", title: "Leaderboards", desc: "Candidates see how they rank against peers on each assessment, encouraging healthy competition." },
  { icon: "👥", color: "blue", title: "Role-Based Dashboards", desc: "Separate, purpose-built views for Admins, HR, and Students — everyone sees what they need." },
];

const STEPS_STUDENT = [
  "Receive an invite link or code from your institute/recruiter",
  "Log in and open the assessment from your dashboard",
  "Attempt the timed MCQ exam within the given duration",
  "Get your scorecard and result instantly after submission",
];

const STEPS_ADMIN = [
  "Create a drive with title, category, duration, and marks",
  "Add MCQ questions and set the difficulty level",
  "Publish the drive and share the generated invite link",
  "Track candidate scores, rankings, and status from one dashboard",
];

export default function AboutUs() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isAdmin = role === "ADMIN" || role === "HR";
  const steps = isAdmin ? STEPS_ADMIN : STEPS_STUDENT;

  return (
    <div className="page">
      {/* Hero banner */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--purple), var(--purple-dark))",
          borderRadius: "var(--radius-lg)",
          padding: "40px 36px",
          marginBottom: 24,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,.08)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", opacity: 0.75, marginBottom: 10 }}>
            About the platform
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-.5px", marginBottom: 10 }}>
            Assessify
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.9, maxWidth: 620 }}>
            A hiring assessment platform built for {isAdmin ? "recruiters and admins" : "candidates"} — fast,
            fair, invite-based MCQ testing with instant results and real-time tracking.
          </div>
        </div>
      </div>

      {/* Feature grid */}
      <div className="card-title" style={{ marginBottom: 14 }}>Key Features</div>
      <div className="icon-stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 26 }}>
        {FEATURES.map((f, i) => (
          <div className="icon-stat-card" key={i}>
            <div className={`icon-stat-icon ${f.color}`}>{f.icon}</div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 5 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.55 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* How it works + contact, side by side */}
      <div className="two-col">
        <div className="card">
          <div className="card-title">
            {isAdmin ? "How it works — Admins & HR" : "How it works — Students"}
          </div>
          <div>
            {steps.map((step, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  padding: "12px 0",
                  borderBottom: i < steps.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <div
                  style={{
                    width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                    background: "var(--purple-pale)", color: "var(--purple)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5, paddingTop: 3 }}>
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">📩 Get in Touch</div>
          <div style={{ fontSize: 12.5, color: "var(--text-3)", marginBottom: 16, lineHeight: 1.6 }}>
            Have questions, feedback, or need support? Reach out anytime.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-2)" }}>
              <span className="icon-stat-icon blue" style={{ width: 30, height: 30, fontSize: 13 }}>📧</span>
              support@assessify.com
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-2)" }}>
              <span className="icon-stat-icon green" style={{ width: 30, height: 30, fontSize: 13 }}>📞</span>
              +91 98765 43210
            </div>
          </div>
        </div>
      </div>

      <button className="btn" style={{ marginTop: 20 }} onClick={() => navigate(-1)}>
        ← Back
      </button>
    </div>
  );
}