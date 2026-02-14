import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";

function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    try {
      const res = await api.get("users/");
      setUsers(res.data);
    } catch (error) {
      console.log("Not allowed ❌");
    }
  };

  // ================= FETCH ROLES =================
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

  // ================= ROLE CHANGE =================
  const handleRoleChange = async (userId, roleId) => {
    try {
      await api.put(`users/${userId}/assign-role/`, {
        role_id: roleId,
      });
      fetchUsers();
    } catch (error) {
      console.log("Role update failed");
    }
  };

  // ================= FILTER LOGIC =================
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = u.email
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "" ||
        (u.role && u.role.name === roleFilter);

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  return (
    <div>
      <h2>User Management Panel</h2>

      {/* SEARCH + FILTER */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ marginLeft: "10px" }}
        >
          <option value="">All Roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Change Role</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.role ? u.role.name : "No Role"}</td>
              <td>{u.is_active ? "Active" : "Inactive"}</td>

              <td>
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Users;
