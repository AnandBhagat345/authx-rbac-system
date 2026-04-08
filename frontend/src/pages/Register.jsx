import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

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
      setMessage("Registration failed");
      console.log(error.response?.data);
    }
  };

  return (
    <div>
      <h2>Register</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleRegister}>Register</button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;