import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import "../style/admin.css";


function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);


  // ---- FETCH USERS ----

  const fetchUsers = async (page = 1) => {
  try {
    const res = await api.get(`users/?page=${page}`);

    setUsers(res.data.results);
    setTotalCount(res.data.count);
    setNext(res.data.next);
    setPrevious(res.data.previous);
    setCurrentPage(page);

    } catch (error) {
      console.log("Not allowed ❌");
    }
  };

  // ---- FETCH ROLES ----
  const fetchRoles = async () => {
    try {
      const res = await api.get("roles/");
      setRoles(res.data);
    } catch (error) {
      console.log("Error fetching roles");
    }
  };

  useEffect(() => {
    fetchUsers(1);
    fetchRoles();
  }, []);

  // ---- ROLE CHANGE ----
  const handleRoleChange = async (userId, roleId, roleName) => {
    const confirmChange = window.confirm(
      `Are you sure you want to assign role "${roleName}" to this user?`
    );

    if (!confirmChange) return;

    try {
      await api.put(`users/${userId}/assign-role/`, {
        role_id: roleId,
      });

      fetchUsers();
    } catch (error) {
      console.log("Role update failed");
    }
  };

  // ---- FILTER LOGIC ----
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
    <div className="page-container">
    <div className="card">
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
      <table className="table">
  <thead>
    <tr>
      <th>Email</th>
      <th>Role</th>
      <th>Actions</th>
    </tr>
  </thead>

  <tbody>
    {users.map((u) => (
      <tr key={u.id}>
        <td>{u.email}</td>

        <td>
          {u.role ? (
            <span
              className={`badge ${
                u.role.name === "ADMIN"
                  ? "badge-admin"
                  : "badge-user"
              }`}
            >
              {u.role.name}
            </span>
          ) : (
            "No Role"
          )}
        </td>

        <td>
          <select
            value={u.role ? u.role.id : ""}
            onChange={(e) => {
              const selectedRoleId = parseInt(e.target.value);
              const selectedRole = roles.find(
                (r) => r.id === selectedRoleId
              );

              handleRoleChange(
                u.id,
                selectedRoleId,
                selectedRole ? selectedRole.name : "No Role"
              );
            }}
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

      
      <div style={{ marginTop: "20px" }}>
        <button
          disabled={!previous}
          onClick={() => fetchUsers(currentPage - 1)}
        >
          Previous
        </button>

        <span style={{ margin: "0 10px" }}>
          Page {currentPage}{"/"}{Math.ceil(totalCount / 5)
}
        </span>

        <button
          disabled={!next}
          onClick={() => fetchUsers(currentPage + 1)}
        >
          Next
        </button>
      </div>

      </div>

    </div>
  );
}

export default Users;
