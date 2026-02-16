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
          <ProtectedRoute user={user}>
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
