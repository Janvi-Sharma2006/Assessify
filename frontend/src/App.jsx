import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ExamPage from "./pages/ExamPage";
import ResultPage from "./pages/ResultPage";
import Scorecard from "./pages/Scorecard";
import DriveInvite from "./pages/DriveInvite";
import Leaderboard from "./pages/Leaderboard";
import ProfilePage from "./pages/ProfilePage";
import AchievementsPage from "./pages/AchievementsPage";
import HelpPage from "./pages/HelpPage";
import QuestionBuilder from "./pages/QuestionBuilder";
import DrivesBoard from "./pages/DrivesBoard";
import DriveDetail from "./pages/DriveDetail";
import CandidateDetail from "./pages/CandidateDetail";
import AboutUs from "./pages/AboutUs";
function ProtectedRoute({ children, role }) {
  const storedRole = localStorage.getItem("role");
  if (!storedRole) return <Navigate to="/" />;
  if (role && Array.isArray(role) && !role.includes(storedRole)) return <Navigate to="/" />;
  if (role && !Array.isArray(role) && role !== storedRole) return <Navigate to="/" />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/invite/:slug" element={<DriveInvite />} />

        <Route path="/admin" element={
          <ProtectedRoute role={["ADMIN", "HR"]}><AdminDashboard /></ProtectedRoute>
        } />

        <Route path="/student" element={
          <ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>
        } />

        <Route path="/exam/:driveId" element={
          <ProtectedRoute><ExamPage /></ProtectedRoute>
        } />

        <Route path="/admin/drive/:driveId/questions" element={
          <ProtectedRoute role={["ADMIN", "HR"]}><QuestionBuilder /></ProtectedRoute>
        } />

        <Route path="/admin/drives" element={
          <ProtectedRoute role={["ADMIN", "HR"]}><DrivesBoard /></ProtectedRoute>
        } />

        <Route path="/admin/drives/:driveId" element={
          <ProtectedRoute role={["ADMIN", "HR"]}><DriveDetail /></ProtectedRoute>
        } />

        <Route path="/admin/candidate/:driveId/:studentId" element={
          <ProtectedRoute role={["ADMIN", "HR"]}><CandidateDetail /></ProtectedRoute>
        } />

        <Route path="/result" element={
          <ProtectedRoute><ResultPage /></ProtectedRoute>
        } />

        <Route path="/scorecard/:driveId" element={
          <ProtectedRoute><Scorecard /></ProtectedRoute>
        } />

        <Route path="/leaderboard" element={
          <ProtectedRoute><Leaderboard /></ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />

        <Route path="/achievements" element={
          <ProtectedRoute><AchievementsPage /></ProtectedRoute>
        } />

  <Route path="/about" element={<AboutUs />} />

          <Route path="/help" element={<HelpPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;