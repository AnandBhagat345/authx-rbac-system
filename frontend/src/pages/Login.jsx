import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";




function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();


  const handleLogin = async () => {
    try {
      const res = await api.post("auth/token/", {
        email,
        password,
      });

      localStorage.setItem("access", res.data.access);
      navigate("/dashboard");
      alert("Login Successful "); 

    } catch (error) {
      alert("Login failed ❌");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
