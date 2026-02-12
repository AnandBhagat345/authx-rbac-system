import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";


function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("users/me/");
        setUser(res.data);
      } catch (error) {
        console.log("Error fetching user");
      }
    };

    fetchUser();
  }, []);

  if (!user) return <h2>Loading...</h2>;

  return (
    <div>
      <h1>Dashboard 🚀</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role ? user.role.name : "No Role"}</p>

      {user.role && user.role.name === "ADMIN" && (
        <button onClick={() => navigate("/users")}>
        Manage Users
  </button>
)}

    </div>
  );
}

export default Dashboard;
