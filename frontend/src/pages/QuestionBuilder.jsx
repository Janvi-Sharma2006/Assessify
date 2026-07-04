import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const EMPTY_FORM = {
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "A",
};

export default function QuestionBuilder() {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const [drive, setDrive] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchData(); }, [driveId]);

  async function fetchData() {
    try {
      const [driveRes, qRes] = await Promise.all([
        api.get(`/api/drives/${driveId}`),
        api.get(`/api/questions/drive/${driveId}`),
      ]);
      setDrive(driveRes.data);
      setQuestions(qRes.data);
    } catch (e) { console.error(e); }
  }

  function handle(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function addQuestion(e) {
    e.preventDefault();
    setError("");

    if (!form.questionText || !form.optionA || !form.optionB || !form.optionC || !form.optionD) {
      setError("Fill in the question and all four options.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/api/questions/add", {
        ...form,
        category: drive.category || "General",
        difficulty: drive.difficulty || "Medium",
        driveId: parseInt(driveId),
      });
      setForm(EMPTY_FORM);
      fetchData();
    } catch {
      setError("Could not add question. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuestion(id) {
    try {
      await api.delete(`/api/questions/${id}`);
      fetchData();
    } catch (e) { console.error(e); }
  }

  if (!drive) {
    return <div className="page"><div className="empty-state">Loading drive...</div></div>;
  }

  const optKeys = ["A", "B", "C", "D"];

  return (
    <div className="page">
      <div className="page-top">
        <div>
          <div className="page-title">{drive.title}</div>
          <div className="page-sub">
            {questions.length} question{questions.length !== 1 ? "s" : ""} added
            {drive.category && ` · ${drive.category}`}
            {drive.difficulty && ` · ${drive.difficulty}`}
          </div>
        </div>
        <button className="btn" onClick={() => navigate("/admin")}>← Back to drives</button>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title">Add a question</div>
          <form onSubmit={addQuestion}>
            <div className="form-group">
              <label className="form-label">Question text</label>
              <input className="form-input" name="questionText" placeholder="What is the time complexity of binary search?"
                value={form.questionText} onChange={handle} />
            </div>

            {optKeys.map(k => (
              <div className="form-group" key={k}>
                <label className="form-label">Option {k}</label>
                <input className="form-input" name={`option${k}`} placeholder={`Option ${k}`}
                  value={form[`option${k}`]} onChange={handle} />
              </div>
            ))}

            <div className="form-group">
              <label className="form-label">Correct answer</label>
              <select className="form-select" name="correctAnswer" value={form.correctAnswer} onChange={handle}>
                {optKeys.map(k => <option key={k} value={k}>Option {k}</option>)}
              </select>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button className="btn btn-primary" type="submit" disabled={saving} style={{ width: "100%", marginTop: 8 }}>
              {saving ? "Adding..." : "+ Add question"}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-title">Questions in this drive</div>
          {questions.length === 0 ? (
            <div className="empty-state" style={{ padding: "24px 0" }}>
              <div className="empty-state-icon">❓</div>
              <div className="empty-state-title">No questions yet</div>
              <div style={{ fontSize: 13 }}>Add your first question using the form</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {questions.map((q, i) => (
                <div key={q.id} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>
                      {i + 1}. {q.questionText}
                    </div>
                    <button className="btn btn-sm" onClick={() => deleteQuestion(q.id)} title="Delete">✕</button>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-4)", marginTop: 6 }}>
                    Correct: Option {q.correctAnswer}
                    {q.category && ` · ${q.category}`}
                    {q.difficulty && ` · ${q.difficulty}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}