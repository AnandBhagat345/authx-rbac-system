import { useNavigate } from "react-router-dom";

function Layout({ children, user, handleLogout, permissions }) {
  const navigate = useNavigate();

  const { canViewUsers, canViewAudit } = permissions;

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>AuthX</h2>
        <ul>
          <li onClick={() => navigate("/")}>Dashboard</li>

          {canViewUsers && (
            <li onClick={() => navigate("/users")}>Users</li>
          )}

          {canViewAudit && (
            <li onClick={() => navigate("/audit-logs")}>
              Audit Logs
            </li>
          )}
        </ul>
      </aside>

      <div className="main">
        <div className="topbar">
          <span>{user.email}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>

        {children}
      </div>
    </div>
  );
}

export default Layout;