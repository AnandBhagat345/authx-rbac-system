import { useState } from "react";
import api from "../api/axios";

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
    <div>
      <h2>Forgot Password</h2>

      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={handleSubmit}>Send Reset Link</button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default ForgotPassword;