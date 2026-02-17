import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { hasPermission } from "../utils/permissions";
import "../style/admin.css";

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

  const isAdmin = hasPermission(user, "role.assign");

  return (
    <div className="page-container">
      <div className="card">
        <h1>Welcome Back 👋</h1>
        <p><strong>Email:</strong> {user.email}</p>
        <p>
          <strong>Role:</strong>{" "}
          {user.role ? (
            <span
              className={`badge ${
                user.role.name === "ADMIN"
                  ? "badge-admin"
                  : "badge-user"
              }`}
            >
              {user.role.name}
            </span>
          ) : (
            "No Role"
          )}
        </p>
      </div>

      {isAdmin && (
        <div className="card">
          <h2>Admin Controls</h2>

          <div style={{ display: "flex", gap: "15px", marginTop: "15px" }}>
            <button
              className="button button-primary"
              onClick={() => navigate("/users")}
            >
              Manage Users
            </button>

            <button
              className="button button-primary"
              onClick={() => navigate("/audit-logs")}
            >
              View Audit Logs
            </button>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="card">
          <h2>Your Access</h2>
          <p>
            You have limited access based on your assigned role.
            Contact admin if you need additional permissions.
          </p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
