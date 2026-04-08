import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import "../style/login.css";

function Login({setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError("");

      const res = await api.post("auth/token/", {
        email,
        password,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      const userRes = await api.get("users/me/");
      localStorage.setItem("user", JSON.stringify(userRes.data));
      setUser(userRes.data);

      navigate("/dashboard");

    } catch (error) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>

        {error && <div className="login-error">{error}</div>}

        <input
          type="email"
          placeholder="Email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

         <p
        style={{ cursor: "pointer", marginTop: "-10px", color: "blue" }}
        onClick={() => navigate("/forgot-password")}
      >
        Forgot Password?
      </p>

        <button className="login-button" onClick={handleLogin}>
          Login
        </button>

      
      <p 
      onClick={() => navigate("/register")}>Don't have an account? 
       <button style={{ cursor: "pointer", color: "blue" }}> Register</button>
    </p>
      </div>
    </div>
  );
}

export default Login;
