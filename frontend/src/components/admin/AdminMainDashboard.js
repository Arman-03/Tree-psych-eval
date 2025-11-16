import React, { useState, useEffect } from 'react';
import * as api from '../../api';

function AdminMainDashboard({ setView }) {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          api.getAdminStats(),
          api.getAdminLogs(),
        ]);
        setStats(statsRes.data);
        setLogs(logsRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="admin-card">
      <h3>Admin Dashboard</h3>
      <h4 className="text-secondary fw-normal">System Analytics</h4>
      {stats ? (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="value">{stats.totalDrawingsScreened}</div>
            <div className="label">Total Drawings Processed</div>
          </div>
          <div className="stat-card">
            <div className="value">{stats.flaggedCasesPending}</div>
            <div className="label">Flagged Cases Pending</div>
          </div>
          <div className="stat-card">
            <div className="value">{stats.averageReviewTime}</div>
            <div className="label">Avg. Review Time</div>
          </div>
          <div className="stat-card">
            <div className="value">{stats.activeAssessors}</div>
            <div className="label">Active Psychologists</div>
          </div>
        </div>
      ) : <p>Loading stats...</p>}
      
      <h4 className="text-secondary fw-normal mt-4">Quick Management</h4>
      <div className="management-buttons">
        <button className="btn-manage-main" onClick={() => setView('users')}>Manage User Accounts</button>
        <button className="btn-manage-main" onClick={() => setView('cases')}>Case Audit & Reassignment</button>
        <button className="btn-manage-secondary" onClick={() => alert('Feature not implemented yet.')}>Export System Data</button>
      </div>

      <h4 className="text-secondary fw-normal mt-4">Recent System Activity Log</h4>
      <div className="activity-log">
        <ul>
          {logs.map(log => <li key={log._id}>{log.message}</li>)}
        </ul>
      </div>
    </div>
  );
}

export default AdminMainDashboard;