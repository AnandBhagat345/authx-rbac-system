import { useEffect, useState } from "react";
import api from "../api/axios";
import "../style/admin.css";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`audit-logs/?page=${page}`);

      setLogs(res.data.results);
      setNext(res.data.next);
      setPrevious(res.data.previous);
      setCurrentPage(page);

    } catch (error) {
      if (error.response?.status === 403) {
        alert("You do not have permission to view audit logs.");
      } else {
        alert("Failed to load audit logs.");
      }
    }
     finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  return (
    <div className="page-container">
      <div className="card">

        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ marginBottom: "5px" }}>System Audit Logs</h2>
          <p style={{ color: "#666", fontSize: "14px" }}>
            Complete history of administrative actions.
          </p>
        </div>

        {loading ? (
          <p style={{ textAlign: "center" }}>Loading audit history...</p>
        ) : logs.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#777" }}>
            No audit records found.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Actor</th>
                <th>Target</th>
                <th>Action</th>
                <th>Timestamp</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.actor_email || "System"}</td>
                  <td>{log.target_email || "-"}</td>

                  <td>
                    <span className="badge badge-admin">
                      {log.action}
                    </span>
                  </td>

                  <td>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div
            style={{
              marginTop: "25px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "15px"
            }}
          >
            <button
              className="button button-primary"
              disabled={!previous}
              onClick={() => fetchLogs(currentPage - 1)}
            >
              Previous
            </button>

            <span style={{ fontWeight: "500" }}>
              Page {currentPage}
            </span>

            <button
              className="button button-primary"
              disabled={!next}
              onClick={() => fetchLogs(currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default AuditLogs;
