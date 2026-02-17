import { BrowserRouter, Routes, Route , Navigate} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AuditLogs from "./pages/AuditLogs";
import { useNavigate } from "react-router-dom";
import Users from "./pages/Users";
import { useState, useEffect } from "react";


function App() {
const [user, setUser] = useState(null);

const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await api.get("users/me/");
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  fetchUser();
}, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);


  return (
    <BrowserRouter>
     <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
    


      <Route path="/login" element={<Login />} />

      <Route
        path="/users"
        element={
          <ProtectedRoute user={user} requiredPermission="role.assign">
            <Users />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user} loading={loading}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      <Route path="/audit-logs" element={<AuditLogs />} />

    </Routes>

    </BrowserRouter>
  );
}

export default App;
