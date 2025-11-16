import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';
import logoUrl from '../assets/choice-foundation-logo.png';

// Import the new child components from their files
import AdminMainDashboard from './admin/AdminMainDashboard';
import AdminUserManagement from './admin/AdminUserManagement';
import AdminCaseAudit from './admin/AdminCaseAudit';

function AdminDashboard() {
  const { logout } = useAuth();
  const [view, setView] = useState('welcome'); // 'welcome', 'dashboard', 'users', 'cases'

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <AdminMainDashboard setView={setView} />;
      case 'users':
        return <AdminUserManagement setView={setView} />;
      case 'cases':
        return <AdminCaseAudit setView={setView} />;
      case 'welcome':
      default:
        return (
          <div className="admin-card text-center">
            <h1>Welcome, Admin</h1>
            <p className="lead">Control system access, monitor performance, and manage all cases.</p>
            <button className="btn btn-lg btn-info text-white mt-3 px-5" onClick={() => setView('dashboard')}>
              Access Admin Dashboard
            </button>
          </div>
        );
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <img src={logoUrl} alt="Choice Foundation" className="admin-logo" />
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </header>
      <main>
        {renderContent()}
      </main>
    </div>
  );
}

export default AdminDashboard;