import { useEffect, useState } from "react";
import api from "../api/axios";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);

  const fetchLogs = async (page = 1) => {
    try {
      const res = await api.get(`audit-logs/?page=${page}`);

      setLogs(res.data.results);
      setNext(res.data.next);
      setPrevious(res.data.previous);
      setCurrentPage(page);
    } catch (error) {
      console.log("Not allowed ❌");
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  return (
    <div className="page-container">
    <div className="card">

      <h2>Audit History</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Actor</th>
            <th>Target</th>
            <th>Action</th>
            <th>Time</th>
          </tr>
        </thead>

        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.actor_email}</td>
              <td>{log.target_email}</td>
              <td>{log.action}</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "20px" }}>
        <button
          disabled={!previous}
          onClick={() => fetchLogs(currentPage - 1)}
        >
          Previous
        </button>

        <span style={{ margin: "0 10px" }}>
          Page {currentPage}
        </span>

        <button
          disabled={!next}
          onClick={() => fetchLogs(currentPage + 1)}
        >
          Next
        </button>
      </div>
      </div>
    </div>
  );
}

export default AuditLogs;
