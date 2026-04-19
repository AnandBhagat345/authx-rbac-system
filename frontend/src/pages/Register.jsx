import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../style/auth.css";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await api.post("register/", {
        email,
        password,
      });

      setMessage("Registered successfully. Check email for verification 📩");

      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error) {
      setMessage("Registration failed (Check your email format or use a stronger password)");
      console.log(error.response?.data);
    }
  };

return (
  <div className="auth-page">
    <div className="auth-card">
      <h2 className="auth-title">Register</h2>

      <input
        type="email"
        placeholder="Email"
        className="auth-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="auth-input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="auth-button" onClick={handleRegister}>
        Register
      </button>

      {message && <p className="auth-message">{message}</p>}
    </div>
  </div>
);
}

export default Register;