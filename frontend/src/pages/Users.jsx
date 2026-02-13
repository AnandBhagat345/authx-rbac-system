import { useEffect, useState } from "react";
import api from "../api/axios";

function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("users/");
      setUsers(res.data);
    } catch (error) {
      console.log("Not allowed ❌");
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get("roles/");
      setRoles(res.data);
    } catch (error) {
      console.log("Error fetching roles");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleRoleChange = async (userId, roleId) => {
    try {
      await api.put(`users/${userId}/assign-role/`, {
        role_id: roleId,
      });

      fetchUsers(); // refresh list
    } catch (error) {
      console.log("Role update failed");
    }
  };

    return (
    <div>
      <h2>All Users</h2>

      {users.map((u) => (
        <div key={u.id}>
          <p>Email: {u.email}</p>

          <select
            value={u.role ? u.role.id : ""}
            onChange={(e) =>
              handleRoleChange(u.id, e.target.value)
            }
          >
            <option value="">No Role</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default Users;
