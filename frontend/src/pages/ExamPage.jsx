import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ExamPage() {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const [drive, setDrive] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [tabViolations, setTabViolations] = useState(0);
  const [started, setStarted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const startTime = useRef(Date.now());
  const submitted = useRef(false);
  const answersRef = useRef(answers);
  const questionsRef = useRef(questions);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);

  useEffect(() => {
    api.get(`/api/drives/${driveId}`).then(r => {
      setDrive(r.data);
      if (r.data) setTimeLeft(r.data.duration * 60);
    }).catch(console.error);
    api.get(`/api/questions/drive/${driveId}`).then(r => setQuestions(r.data)).catch(console.error);
  }, [driveId]);

  const submitExam = useCallback(async () => {
    if (submitted.current) return;
    submitted.current = true;
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    const answerList = questionsRef.current.map(q => ({
      questionId: q.id,
      selectedAnswer: answersRef.current[q.id] || "",
    }));
    try {
      const res = await api.post("/api/results/submit", {
        driveId: parseInt(driveId),
        studentId: parseInt(localStorage.getItem("userId")),
        timeTakenSeconds: timeTaken,
        tabViolations,
        answers: answerList,
      });
      navigate("/result", { state: { result: res.data, driveTitle: drive?.title, questions: questionsRef.current, answers: answersRef.current } });
    } catch (e) {
      alert(e.response?.data?.error || "Submission failed");
      submitted.current = false;
    }
  }, [driveId, drive, navigate, tabViolations]);

  useEffect(() => {
    if (!started || timeLeft === null) return;
    if (timeLeft <= 0) { submitExam(); return; }
    const t = setTimeout(() => setTimeLeft(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, started, submitExam]);

  // Effect 1: just counts violations, listener never needs to rebind
  useEffect(() => {
    if (!started) return;
    function onVisibility() {
      if (document.hidden) {
        setTabViolations(v => v + 1);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [started]);

  // Effect 2: reacts to the count and triggers submit exactly once
  useEffect(() => {
    if (started && tabViolations >= 3 && !submitted.current) {
      submitExam();
    }
  }, [tabViolations, started, submitExam]);

  const style = (
    <style>{`
     .ep-exlist{min-height:calc(100vh - 64px);background:#F6F7FB;font-family:'Inter',system-ui,sans-serif;padding:24px 32px 40px;margin-top:64px;box-sizing:border-box;}
      .ep-take-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
      .ep-take-title-row{display:flex;align-items:center;gap:14px;}
      .ep-back{width:36px;height:36px;border-radius:10px;background:#fff;border:1px solid #ECEEF4;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#4E5266;font-size:16px;flex-shrink:0;}
      .ep-take-h{}
      .ep-take-h h1{font-size:17px;font-weight:800;color:#181C32;margin:0;}
      .ep-take-h span{font-size:12px;color:#9298B0;}
      .ep-timer-box{background:#fff;border:1px solid #ECEEF4;border-radius:12px;padding:8px 18px;text-align:center;}
      .ep-timer-box.warn{border-color:#F0454F;background:#FFF3F3;}
      .ep-timer-box .val{font-size:16px;font-weight:800;color:#181C32;}
      .ep-timer-box.warn .val{color:#F0454F;}
      .ep-timer-box .lbl{font-size:10px;color:#9298B0;}
      .ep-end-btn{background:#FFF1F1;color:#F0454F;border:none;border-radius:10px;padding:10px 18px;font-weight:700;font-size:13px;cursor:pointer;margin-left:12px;}
      .ep-top-right{display:flex;align-items:center;}

      .ep-take-grid{display:grid;grid-template-columns:220px 1fr 260px;gap:18px;align-items:stretch;}
      .ep-panel{background:#fff;border-radius:16px;border:1px solid #F0F1F6;padding:18px;display:flex;flex-direction:column;height:100%;}
      .ep-qgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
      .ep-qbtn{aspect-ratio:1;border-radius:8px;border:1px solid #ECEEF4;background:#fff;color:#6B7089;font-weight:700;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
      .ep-qbtn.answered{background:#E8FBF2;color:#0EA968;border-color:#E8FBF2;}
      .ep-qbtn.marked{background:#FFF6E6;color:#C98A0A;border-color:#FFF6E6;}
      .ep-qbtn.current{background:#3B5BFD;color:#fff;border-color:#3B5BFD;}
      .ep-legend{display:flex;flex-direction:column;gap:8px;font-size:11.5px;color:#4E5266;margin-top:6px;}
      .ep-legend div{display:flex;align-items:center;gap:8px;}
      .ep-dot{width:9px;height:9px;border-radius:3px;flex-shrink:0;}

      .ep-badges{display:flex;gap:8px;margin-bottom:14px;}
      .ep-badge{font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;}
      .ep-qtext{font-size:15.5px;font-weight:700;color:#181C32;margin-bottom:16px;line-height:1.5;}
      .ep-options{display:flex;flex-direction:column;gap:10px;margin-bottom:20px;}
      .ep-option{display:flex;align-items:center;gap:12px;border:1.5px solid #ECEEF4;border-radius:12px;padding:12px 14px;cursor:pointer;font-size:13.5px;color:#4E5266;}
      .ep-option.selected{border-color:#3B5BFD;background:#F6F8FF;color:#181C32;}
      .ep-radio{width:18px;height:18px;border-radius:50%;border:2px solid #D6D9E4;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
      .ep-option.selected .ep-radio{border-color:#3B5BFD;}
      .ep-radio-dot{width:9px;height:9px;border-radius:50%;background:#3B5BFD;}
      .ep-opt-key{font-weight:700;color:#9298B0;width:16px;}
      .ep-option.selected .ep-opt-key{color:#3B5BFD;}
      .ep-take-footer{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:16px;}
      .ep-mark-check{display:flex;align-items:center;gap:8px;font-size:12.5px;color:#6B7089;cursor:pointer;}
      .ep-nav-btns{display:flex;gap:10px;}
      .ep-btn{padding:10px 22px;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;border:1px solid #ECEEF4;background:#fff;color:#4E5266;}
      .ep-btn:disabled{opacity:.5;cursor:not-allowed;}
      .ep-btn-primary{background:#3B5BFD;border-color:#3B5BFD;color:#fff;}

      .ep-side-title{font-size:13.5px;font-weight:800;color:#181C32;margin-bottom:12px;}
      .ep-detail-row{display:flex;justify-content:space-between;font-size:12.5px;color:#6B7089;padding:7px 0;border-bottom:1px solid #F4F5F9;}
      .ep-detail-row:last-child{border-bottom:none;}
      .ep-detail-row b{color:#181C32;}
      .ep-instr{font-size:12px;color:#6B7089;line-height:1.9;margin:0;padding-left:16px;}
      .ep-viol{background:#FFF1F1;border:1px solid #FFD7D7;border-radius:10px;padding:8px 10px;font-size:11px;color:#F0454F;margin-bottom:12px;}

      .ep-start-wrap{max-width:840px;margin:0 auto;}
      .ep-start-hero{background:linear-gradient(135deg,#3B5BFD 0%,#6D5BFF 100%);border-radius:20px;padding:36px 40px;color:#fff;margin-bottom:20px;}
      .ep-start-hero .kicker{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;opacity:.85;margin-bottom:8px;}
      .ep-start-hero h1{font-size:26px;font-weight:800;margin:0 0 10px;}
      .ep-start-hero p{font-size:13.5px;opacity:.9;margin:0;line-height:1.6;max-width:560px;}
      .ep-start-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;}
      .ep-stat-card{background:#fff;border:1px solid #F0F1F6;border-radius:14px;padding:18px 16px;text-align:center;}
      .ep-stat-card .icon{font-size:20px;margin-bottom:8px;}
      .ep-stat-card .val{font-size:19px;font-weight:800;color:#181C32;}
      .ep-stat-card .lbl{font-size:11.5px;color:#9298B0;margin-top:2px;font-weight:600;}
      .ep-start-body{background:#fff;border:1px solid #F0F1F6;border-radius:16px;padding:32px 36px;}
      .ep-start-body h2{font-size:15px;font-weight:800;color:#181C32;margin:0 0 18px;}
      .ep-rules{display:grid;grid-template-columns:1fr 1fr;gap:14px 24px;margin-bottom:26px;}
      .ep-rule{display:flex;align-items:flex-start;gap:12px;font-size:13px;color:#4E5266;line-height:1.55;}
      .ep-rule .ri{width:30px;height:30px;border-radius:9px;background:#F3EEFF;color:#8B5CF6;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}
      .ep-rule.warn .ri{background:#FFF1F1;color:#F0454F;}
      .ep-rule b{color:#181C32;}
      .ep-agree-box{display:flex;align-items:flex-start;gap:12px;background:#F8F9FC;border:1px solid #ECEEF4;border-radius:12px;padding:16px 18px;margin-bottom:24px;cursor:pointer;}
      .ep-agree-box input{width:18px;height:18px;margin-top:2px;accent-color:#3B5BFD;cursor:pointer;flex-shrink:0;}
      .ep-agree-box span{font-size:13px;color:#4E5266;line-height:1.6;}
      .ep-start-footer{display:flex;align-items:center;justify-content:flex-end;gap:14px;}
      .ep-start-hint{font-size:12px;color:#F0454F;margin-right:auto;}
      .ep-btn-lg{padding:13px 30px;font-size:14px;}
      @media(max-width:1200px){.ep-take-grid{grid-template-columns:200px 1fr;}.ep-take-grid>.ep-panel:last-child{display:none;}}
    `}</style>
  );

  if (!drive || questions.length === 0) {
    return (
      <div className="ep-exlist">
        {style}
        <div className="ep-panel" style={{ textAlign: "center", padding: 60 }}>Loading assessment...</div>
      </div>
    );
  }

  const mins = String(Math.floor((timeLeft || 0) / 3600)).padStart(2, "0");
  const rem = String(Math.floor(((timeLeft || 0) % 3600) / 60)).padStart(2, "0");
  const secs = String((timeLeft || 0) % 60).padStart(2, "0");
  const isWarning = timeLeft !== null && timeLeft < 120;
  const q = questions[current];
  const opts = [
    { key: "A", val: q.optionA },
    { key: "B", val: q.optionB },
    { key: "C", val: q.optionC },
    { key: "D", val: q.optionD },
  ];

  if (!started) {
    return (
      <div className="ep-exlist">
        {style}
        <div className="ep-start-wrap">
          <div className="ep-start-hero">
            <div className="kicker">Assessment briefing</div>
            <h1>{drive.title}</h1>
            <p>Please read the details and rules below carefully before you begin. Once you start, the timer runs continuously and cannot be paused.</p>
          </div>

          <div className="ep-start-stats">
            <div className="ep-stat-card">
              <div className="icon">⏱️</div>
              <div className="val">{drive.duration}</div>
              <div className="lbl">Minutes</div>
            </div>
            <div className="ep-stat-card">
              <div className="icon">❓</div>
              <div className="val">{questions.length}</div>
              <div className="lbl">Questions</div>
            </div>
            <div className="ep-stat-card">
              <div className="icon">🎯</div>
              <div className="val">{drive.totalMarks}</div>
              <div className="lbl">Total Marks</div>
            </div>
            <div className="ep-stat-card">
              <div className="icon">⚠️</div>
              <div className="val">{drive.negativeMark ?? "-0.25"}</div>
              <div className="lbl">Negative Mark</div>
            </div>
          </div>

          <div className="ep-start-body">
            <h2>Instructions</h2>
            <div className="ep-rules">
              <div className="ep-rule"><span className="ri">✅</span><span><b>All questions are mandatory.</b> You must attempt every question before submitting.</span></div>
              <div className="ep-rule"><span className="ri">🧭</span><span><b>Free navigation.</b> Move between questions in any order using the question grid.</span></div>
              <div className="ep-rule"><span className="ri">🔁</span><span><b>Review anytime.</b> You can change any answer until you submit the test.</span></div>
              <div className="ep-rule warn"><span className="ri">⏳</span><span><b>Timer can't be paused.</b> Once started, the countdown runs continuously.</span></div>
              <div className="ep-rule warn"><span className="ri">🚫</span><span><b>Stay on this tab.</b> Switching tabs counts as a violation — <b>3 violations trigger auto-submit.</b></span></div>
              <div className="ep-rule warn"><span className="ri">❗</span><span><b>Submit in time.</b> The test auto-submits automatically when the timer hits zero.</span></div>
            </div>

            <label className="ep-agree-box">
              <input type="checkbox" checked={agreed} onChange={() => setAgreed(a => !a)} />
              <span>I have read and understood the instructions above, and I agree to complete this assessment honestly and without external assistance.</span>
            </label>

            <div className="ep-start-footer">
              {!agreed && <span className="ep-start-hint">Please accept the terms above to continue</span>}
              <button
                className="ep-btn ep-btn-primary ep-btn-lg"
                disabled={!agreed}
                onClick={() => { startTime.current = Date.now(); setStarted(true); }}>
                Start assessment →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ep-exlist">
      {style}
      <div className="ep-take-top">
        <div className="ep-take-title-row">
          <div className="ep-back" onClick={() => window.confirm("Leave the test? Your progress will be lost.") && navigate("/student")}>←</div>
          <div className="ep-take-h">
            <h1>{drive.title}</h1>
            <span>Question {current + 1} of {questions.length}</span>
          </div>
        </div>
        <div className="ep-top-right">
          <div className={`ep-timer-box ${isWarning ? "warn" : ""}`}>
            <div className="val">{mins}:{rem}:{secs}</div>
            <div className="lbl">Time Left</div>
          </div>
          <button className="ep-end-btn" onClick={submitExam}>End Test</button>
        </div>
      </div>

      <div className="ep-take-grid">
        <div className="ep-panel">
          {tabViolations > 0 && <div className="ep-viol">⚠️ Tab violation: {tabViolations}/3</div>}
          <div className="ep-qgrid">
            {questions.map((_, i) => (
              <button key={i}
                className={`ep-qbtn ${i === current ? "current" : answers[questions[i].id] ? "answered" : marked[questions[i].id] ? "marked" : ""}`}
                onClick={() => setCurrent(i)}>{i + 1}</button>
            ))}
          </div>
          <div className="ep-legend">
            <div><span className="ep-dot" style={{ background: "#0EA968" }} />Answered</div>
            <div><span className="ep-dot" style={{ background: "#3B5BFD" }} />Current</div>
            <div><span className="ep-dot" style={{ background: "#fff", border: "1px solid #D6D9E4" }} />Not Answered</div>
            <div><span className="ep-dot" style={{ background: "#F5A524" }} />Marked</div>
          </div>
        </div>

        <div className="ep-panel">
          <div className="ep-badges">
            {q.difficulty && <span className="ep-badge" style={{ background: "#FFF6E6", color: "#C98A0A" }}>{q.difficulty}</span>}
            {q.category && <span className="ep-badge" style={{ background: "#F3EEFF", color: "#8B5CF6" }}>{q.category}</span>}
          </div>
          <div className="ep-qtext">{q.questionText}</div>
          <div className="ep-options">
            {opts.map(o => (
              <div key={o.key}
                className={`ep-option ${answers[q.id] === o.key ? "selected" : ""}`}
                onClick={() => setAnswers(a => ({ ...a, [q.id]: o.key }))}>
                <div className="ep-radio">{answers[q.id] === o.key && <div className="ep-radio-dot" />}</div>
                <span className="ep-opt-key">{o.key}</span>
                <span>{o.val}</span>
              </div>
            ))}
          </div>
          <div className="ep-take-footer">
            <label className="ep-mark-check">
              <input type="checkbox" checked={!!marked[q.id]} onChange={() => setMarked(m => ({ ...m, [q.id]: !m[q.id] }))} />
              Mark for Review
            </label>
            <div className="ep-nav-btns">
              <button className="ep-btn" disabled={current === 0} onClick={() => setCurrent(c => c - 1)}>Previous</button>
              {current < questions.length - 1
                ? <button className="ep-btn ep-btn-primary" onClick={() => setCurrent(c => c + 1)}>Next</button>
                : <button className="ep-btn ep-btn-primary" onClick={submitExam}>Submit ✓</button>}
            </div>
          </div>
        </div>

        <div className="ep-panel">
          <div className="ep-side-title">Details</div>
          <div className="ep-detail-row"><span>Total Questions</span><b>{questions.length}</b></div>
          <div className="ep-detail-row"><span>Total Marks</span><b>{drive.totalMarks}</b></div>
          <div className="ep-detail-row"><span>Negative Mark</span><b>{drive.negativeMark ?? "-0.25"}</b></div>
        </div>
      </div>
    </div>
  );
}