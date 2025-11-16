import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../../api';

// Simple Modal Component (can be extracted to its own file later)
const CreateUserModal = ({ show, onClose, onUserCreated }) => {
    const [userData, setUserData] = useState({ username: '', password: '', role: 'Uploader' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.createUser(userData);
            alert('User created successfully!');
            onUserCreated();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user. Username may already exist.');
        }
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Create New User</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            <div className="mb-3">
                                <label className="form-label">Username</label>
                                <input type="text" className="form-control" value={userData.username} onChange={e => setUserData({ ...userData, username: e.target.value })} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Password</label>
                                <input type="password" placeholder="Password" className="form-control" value={userData.password} onChange={e => setUserData({ ...userData, password: e.target.value })} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Role</label>
                                <select className="form-select" value={userData.role} onChange={e => setUserData({ ...userData, role: e.target.value })}>
                                    <option value="Uploader">Uploader</option>
                                    <option value="Assessor">Assessor (Psychologist)</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                            <button type="submit" className="btn btn-primary">Create User</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


function AdminUserManagement({ setView }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleToggleStatus = async (user) => {
        const action = user.status === 'Active' ? 'deactivate' : 'activate';
        const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';

        if (window.confirm(`Are you sure you want to ${action} user '${user.username}'?`)) {
            try {
                // For deactivation, we use the DELETE endpoint which sets status to Inactive
                // For activation, we use the PUT endpoint
                if (action === 'deactivate') {
                    await api.deleteUser(user._id);
                } else {
                    await api.updateUser(user._id, { status: newStatus });
                }
                alert(`User ${action}d successfully.`);
                fetchUsers(); // Refresh the list
            } catch (error) {
                alert(`Failed to ${action} user.`);
            }
        }
    };
    
    return (
        <div className="admin-card">
            <CreateUserModal 
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onUserCreated={fetchUsers}
            />
            <a href="#!" className="back-link" onClick={() => setView('dashboard')}>&larr; Back to Dashboard</a>
            <h3>User Management</h3>
            <button className="btn btn-primary my-3" onClick={() => setShowCreateModal(true)}>
                Create New User Account
            </button>
            
            <h4 className="text-secondary fw-normal">System Users ({users.length})</h4>
            {loading ? <p>Loading users...</p> : (
            <table className="admin-table">
                <thead>
                    <tr><th>NAME</th><th>ROLE</th><th>STATUS</th><th>ACTIONS</th></tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user.username}</td>
                            <td>{user.role}</td>
                            <td>
                                <span className={user.status === 'Active' ? 'status-active' : 'status-inactive'}>{user.status}</span>
                            </td>
                            <td>
                                <button className="btn-action btn-edit" onClick={() => alert('Edit feature not yet implemented.')}>Edit</button>
                                {user.status === 'Active' ? 
                                    <button className="btn-action btn-deactivate" onClick={() => handleToggleStatus(user)}>Deactivate</button> : 
                                    <button className="btn-action btn-activate" onClick={() => handleToggleStatus(user)}>Activate</button>
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            )}
        </div>
    );
}

export default AdminUserManagement;