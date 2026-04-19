import { useState } from "react";
import api from "../api/axios";
import "../style/auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    try {
      await api.post("password-reset/", { email });
      setMessage("Reset link sent to email");
    } catch {
      setMessage("Something went wrong");
    }
  };

return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="auth-button" onClick={handleSubmit}>
          Send Reset Link
        </button>

        {message && <p className="auth-message">{message}</p>}
      </div>
    </div>
  );
}

export default ForgotPassword;