import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const FAQS = [
  {
    q: "How do I start an exam?",
    a: "Go to the Exams tab, find an available exam, and click 'Start Exam'. Make sure you have enough time before the duration ends — once started, the timer cannot be paused."
  },
  {
    q: "Can I retake an exam I've already attempted?",
    a: "Once submitted, an exam attempt is final. You can review your past attempts under the Results tab, but a new attempt isn't allowed unless your admin re-publishes it."
  },
  {
    q: "Where can I see my scores?",
    a: "Visit the Results tab to view all your past scores, pass/fail status, and percentage breakdown for every exam you've attempted."
  },
  {
    q: "How do I update my profile information?",
    a: "Click your name in the top-right corner and choose 'Account Settings' to update your phone number, institution, and other details."
  },
  {
    q: "What do the badges on my profile mean?",
    a: "Badges are earned automatically based on your activity — like completing your first exam or scoring above 90%. Check 'Achievements & Badges' under your profile menu."
  },
  {
    q: "I forgot my password — what do I do?",
    a: "Currently password resets aren't self-service. Please reach out to support using the contact details below and we'll help you regain access."
  },
];

function HelpPage() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(0);
  const [search, setSearch] = useState("");

  const filteredFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="page">
      {/* Hero banner */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--indigo-light), var(--purple-dark))",
          borderRadius: "var(--radius-lg)",
          padding: "36px 36px",
          marginBottom: 24,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,.08)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", opacity: 0.75, marginBottom: 10 }}>
            Support center
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.4px", marginBottom: 8 }}>
            ❓ Help &amp; Support
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.6, opacity: 0.9, maxWidth: 560, marginBottom: 20 }}>
            Answers to common questions, plus a direct line to our support team if you're still stuck.
          </div>
          <input
            className="form-input"
            placeholder="🔍 Search FAQs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 380, background: "rgba(255,255,255,.95)" }}
          />
        </div>
      </div>

      {/* Quick stats row */}
      <div className="icon-stats-grid" style={{ marginBottom: 22 }}>
        <div className="icon-stat-card">
          <div className="icon-stat-icon purple">📚</div>
          <div>
            <div className="icon-stat-val">{FAQS.length}</div>
            <div className="icon-stat-lbl">FAQs available</div>
          </div>
        </div>
        <div className="icon-stat-card">
          <div className="icon-stat-icon green">⚡</div>
          <div>
            <div className="icon-stat-val">24 hrs</div>
            <div className="icon-stat-lbl">Avg. response time</div>
          </div>
        </div>
        <div className="icon-stat-card">
          <div className="icon-stat-icon blue">🕐</div>
          <div>
            <div className="icon-stat-val">Mon–Sat</div>
            <div className="icon-stat-lbl">Support availability</div>
          </div>
        </div>
        <div className="icon-stat-card">
          <div className="icon-stat-icon amber">📧</div>
          <div>
            <div className="icon-stat-val">Email</div>
            <div className="icon-stat-lbl">Preferred contact</div>
          </div>
        </div>
      </div>

      <div className="two-col">
        {/* FAQs — left column */}
        <div className="card">
          <div className="card-title">Frequently Asked Questions</div>
          {filteredFaqs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <div className="empty-state-title">No matching questions</div>
              <div style={{ fontSize: 13 }}>Try a different search term, or contact support directly.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredFaqs.map((item, i) => (
                <div
                  key={item.q}
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  style={{
                    border: "1px solid var(--border-2)",
                    borderRadius: "var(--radius)",
                    padding: "13px 16px",
                    cursor: "pointer",
                    background: openIndex === i ? "var(--purple-pale)" : "var(--surface)",
                    transition: "background .12s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>{item.q}</span>
                    <span
                      style={{
                        flexShrink: 0,
                        width: 22, height: 22, borderRadius: "50%",
                        background: openIndex === i ? "var(--purple)" : "var(--surface-2)",
                        color: openIndex === i ? "#fff" : "var(--text-4)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700,
                      }}
                    >
                      {openIndex === i ? "−" : "+"}
                    </span>
                  </div>
                  {openIndex === i && (
                    <p style={{ color: "var(--text-3)", fontSize: 12.5, marginTop: 10, lineHeight: 1.6 }}>
                      {item.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact — right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-title">📩 Contact Support</div>
            <p style={{ color: "var(--text-3)", fontSize: 12.5, marginBottom: 18, lineHeight: 1.6 }}>
              Still stuck? Reach out and we'll get back to you within 24 hours.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-2)" }}>
                <span className="icon-stat-icon blue" style={{ width: 30, height: 30, fontSize: 13 }}>📧</span>
                support@examportal.com
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-2)" }}>
                <span className="icon-stat-icon green" style={{ width: 30, height: 30, fontSize: 13 }}>📞</span>
                +91 98765 43210
              </div>
            </div>
          </div>

          <div className="card" style={{ background: "var(--purple-pale)", border: "1px solid var(--purple-border)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--purple-dark)", marginBottom: 6 }}>
              💡 Tip
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.6 }}>
              Most login and scoring issues are resolved by checking the FAQ first — try the search bar above before reaching out.
            </div>
          </div>
        </div>
      </div>

      <button className="btn btn-outline" style={{ marginTop: 20 }} onClick={() => navigate(-1)}>
        ← Back
      </button>
    </div>
  );
}

export default HelpPage;