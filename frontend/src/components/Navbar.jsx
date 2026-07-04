import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name") || "";
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const hidden = ["/", "/register"];
  if (hidden.includes(location.pathname) || location.pathname.startsWith("/invite")) return null;

  const isAdmin = role === "ADMIN" || role === "HR";

  const links = isAdmin
    ? [
        { to: "/admin", label: "Dashboard" },
        { to: "/admin/drives", label: "Exams" },
        { to: "/leaderboard", label: "Leaderboard" },
          { to: "/about", label: "About Us" },
      ]
    : [
        { to: "/student", label: "Assessments" },
        { to: "/result", label: "Results" },
        { to: "/leaderboard", label: "Leaderboard" },
        { to: "/about", label: "About Us" },
      ];

  return (
    <header className="ep-nav">
      <style>{`
     .ep-nav{position:fixed;top:0;left:0;right:0;height:var(--navbar-height);background:#fff;border-bottom:1px solid #EEF0F5;display:flex;align-items:center;padding:0 28px;z-index:100;font-family:'Inter',system-ui,sans-serif;}
        .ep-nav-logo{display:flex;align-items:center;gap:9px;text-decoration:none;margin-right:36px;}
        .ep-nav-logo-mark{width:32px;height:32px;border-radius:9px;background:#3B5BFD;display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px;font-weight:800;}
        .ep-nav-logo-name{font-size:16px;font-weight:800;color:#181C32;letter-spacing:-0.3px;}
        .ep-nav-links{display:flex;align-items:center;gap:6px;flex:1;}
        .ep-nav-link{padding:8px 14px;border-radius:9px;color:#6B7089;text-decoration:none;font-size:13.5px;font-weight:600;transition:background .15s,color .15s;}
        .ep-nav-link:hover{background:#F5F6FB;color:#181C32;}
        .ep-nav-link.active{background:#EEF1FF;color:#3B5BFD;}
        .ep-nav-right{display:flex;align-items:center;gap:12px;}
        .ep-nav-icon{width:36px;height:36px;border-radius:10px;background:#F5F6FB;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px;}
        .ep-nav-signout{background:transparent;border:1px solid #ECEEF4;color:#4E5266;padding:8px 14px;border-radius:9px;font-size:12.5px;font-weight:600;cursor:pointer;}
        .ep-nav-avatar{width:36px;height:36px;border-radius:50%;background:#3B5BFD;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12.5px;cursor:pointer;}
      `}</style>

      <Link to={isAdmin ? "/admin" : "/student"} className="ep-nav-logo">
        <div className="ep-nav-logo-mark">A</div>
        <span className="ep-nav-logo-name">Assessify</span>
      </Link>

      <nav className="ep-nav-links">
        {links.map(l => (
          <Link key={l.to} to={l.to} className={`ep-nav-link ${location.pathname === l.to ? "active" : ""}`}>
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="ep-nav-right">
     <button
       className="ep-nav-icon"
       onClick={() => navigate("/help")}
       title="Help"
     >
       ℹ️
     </button>
        <button className="ep-nav-signout" onClick={() => { localStorage.clear(); navigate("/"); }}>Sign out</button>
        <div className="ep-nav-avatar" onClick={() => navigate("/profile")}>{initials || "U"}</div>
      </div>
    </header>
  );
}