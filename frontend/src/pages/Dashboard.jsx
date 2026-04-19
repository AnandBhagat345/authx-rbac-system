import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { hasPermission } from "../utils/permissions";
import "../style/admin.css";
import Layout from "../components/Layout";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("users/me/");
        setUser(res.data);
      } catch (error) {
        console.log("Error fetching user");
      }
    };

    fetchUser();
  }, []);

  if (!user) return <h2 style={{ padding: "30px" }}>Loading...</h2>;

  const handleLogout = async () => {
  try {
    const refresh = localStorage.getItem("refresh");

    await api.post("auth/logout/", {
      refresh,
    });

    localStorage.clear();
    navigate("/login");

  } catch (error) {
    console.log("Logout error");
    localStorage.clear();
    navigate("/login");
  }
};

const canViewUsers = hasPermission(user, "user.view");
const canViewAudit = hasPermission(user, "audit.view");
const canAssignRole = hasPermission(user, "role.assign");

const permissions = {
  canViewUsers,
  canViewAudit,
  canAssignRole,
};

return (
  <Layout user={user} handleLogout={handleLogout} permissions={permissions}>
    
    {/* STATS SECTION */}
    <div className="stats">
      <div className="stat-card">
        <h3>👤 Role</h3>
        <p>{user.role?.name || "No Role"}</p>
      </div>

      <div className="stat-card">
        <h3>🔐 Permissions</h3>
        <p>
          {[
            canViewUsers && "Users",
            canViewAudit && "Audit",
            canAssignRole && "Assign",
          ]
            .filter(Boolean)
            .join(", ") || "Limited"}
        </p>
      </div>

      <div className="stat-card">
        <h3>📅 Status</h3>
        <p>Active</p>
      </div>

      <div className="stat-card">
        <h3>🛡 Access Level</h3>
        <p>
          {user.role?.name === "ADMIN" ? "High" : "Restricted"}
        </p>
      </div>
    </div>

    {/* ACTIONS */}
    <div className="card">
      <h2>Quick Actions</h2>

      <div className="actions">
        {canViewUsers && (
          <button onClick={() => navigate("/users")}>
            👥 Manage Users
          </button>
        )}

        {canViewAudit && (
          <button onClick={() => navigate("/audit-logs")}>
            📊 View Audit Logs
          </button>
        )}
      </div>
    </div>

    {/* ACTIVITY */}
    <div className="card">
      <h2>Recent Activity</h2>
      <ul>
        <li>Assigned role to user</li>
        <li>User logged in</li>
        <li>Password reset requested</li>
      </ul>
    </div>

  </Layout>
);
}

export default Dashboard;
