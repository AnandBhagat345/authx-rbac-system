import { useEffect, useState } from "react";
import api from "../api/axios";

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("users/");
        setUsers(res.data);
      } catch (error) {
        console.log("Not allowed ❌");
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h2>All Users</h2>

      {users.map((u) => (
        <div key={u.id}>
          <p>Email: {u.email}</p>
          <p>Role: {u.role ? u.role.name : "No Role"}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default Users;
