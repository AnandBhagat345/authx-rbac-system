import { useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import "../style/auth.css";

function ResetPassword() {
  const { uid, token } = useParams();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    if (!password) {
      setMessage("Enter new password");
      return;
    }

    try {
      await api.post(`password-reset-confirm/${uid}/${token}/`, {
        new_password: password,
      });

      setMessage("Password reset successful ✅");
    } catch (error) {
      setMessage("Invalid or expired link ❌");
      console.log(error.response?.data);
    }
  };

 return (
  <div className="auth-page">
    <div className="auth-card">
      <h2 className="auth-title">Reset Password</h2>

      <input
        type="password"
        placeholder="New Password"
        className="auth-input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="auth-button" onClick={handleReset}>
        Reset Password
      </button>

      {message && <p className="auth-message">{message}</p>}
    </div>
  </div>
);
}

export default ResetPassword;