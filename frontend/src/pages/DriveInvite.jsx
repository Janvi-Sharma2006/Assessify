import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function DriveInvite() {
  const { slug } = useParams();
  const [drive, setDrive] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
    api.get(`/api/drives/invite/${slug}`)
      .then(r => setDrive(r.data))
      .catch(() => setError("This invite link is invalid or expired."));
  }, [slug]);

 function proceed() {
     if (role === "STUDENT") {
       navigate(`/exam/${drive.id}`);
     } else {
       // not logged in as candidate yet — send to login, remembering where to go after
       localStorage.setItem("pendingExamRedirect", `/exam/${drive.id}`);
       navigate("/");
     }
   }

  if (error) return (
    <div className="page" style={{ maxWidth: 480, margin: "80px auto", textAlign: "center" }}>
      <div style={{ fontSize: 36, marginBottom: 16 }}>❌</div>
      <div className="page-title">Invalid link</div>
      <div className="page-sub">{error}</div>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/")}>Go to login</button>
    </div>
  );

  if (!drive) return <div className="page"><div className="empty-state">Loading...</div></div>;

  return (
    <div className="page" style={{ maxWidth: 480, margin: "60px auto" }}>
      <div className="card" style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--purple)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
          You're invited to
        </div>
        <div className="page-title" style={{ marginBottom: 6 }}>{drive.title}</div>
        <div style={{ fontSize: 13, color: "var(--text-4)", marginBottom: 20, lineHeight: 1.7 }}>
          {drive.position && <span>Position: <strong>{drive.position}</strong><br /></span>}
          ⏱ {drive.duration} min &nbsp;·&nbsp; ❓ {drive.totalQuestions} questions
          {drive.category && <span> &nbsp;·&nbsp; 🏷 {drive.category}</span>}
        </div>
        <span className={`badge ${(drive.status || "draft").toLowerCase()}`} style={{ marginBottom: 24, display: "inline-block" }}>
          {drive.status}
        </span>
        <br />
        <button className="btn btn-primary" style={{ padding: "11px 28px", fontSize: 14 }} onClick={proceed}>
          {role === "STUDENT" ? "Start assessment →" : "Sign in to take this test →"}
        </button>
      </div>
    </div>
  );
}