import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "./api/axios";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import AuditLogs from "./pages/AuditLogs";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {

  //  Initial user from localStorage (no extra render)
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [loading, setLoading] = useState(true);

  //  Verify user from backend on app start
 useEffect(() => {
  const verifyUser = async () => {
    const token = localStorage.getItem("access");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("users/me/");
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (err) {
      setUser(null);
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  verifyUser();
}, []);

  //  GLOBAL AUTH GATE
  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Initializing App...</h2>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login setUser={setUser} />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute user={user} requiredPermission="role.assign">
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute user={user} requiredPermission="audit.view">
              <AuditLogs />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
