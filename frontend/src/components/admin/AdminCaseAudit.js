import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../../api';
import CaseDetailModal from './CaseDetailModal'; // Import the modal

function AdminCaseAudit({ setView }) {
    const [cases, setCases] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCase, setSelectedCase] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [casesRes, usersRes] = await Promise.all([
                api.getAllAdminCases(),
                api.getAllUsers(),
            ]);
            setCases(casesRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleReassign = async (caseId, newAssessorId) => {
        if (!newAssessorId) return;
        try {
            await api.reassignCase(caseId, newAssessorId);
            alert('Case reassigned successfully!');
            fetchData(); // Refresh list
        } catch (error) {
            alert('Failed to reassign case.');
        }
    };
    
    const assessors = useMemo(() => users.filter(u => u.role === 'Assessor' && u.status === 'Active'), [users]);
    
    const filteredCases = useMemo(() => 
        cases.filter(c => 
            c.drawing?.childId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.assessor?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.status.toLowerCase().includes(searchTerm.toLowerCase())
        ), [cases, searchTerm]);

    return (
        <div className="admin-card">
            {/* Render the modal when a case is selected */}
            <CaseDetailModal caseData={selectedCase} onClose={() => setSelectedCase(null)} />

            <a href="#!" className="back-link" onClick={() => setView('dashboard')}>&larr; Back to Dashboard</a>
            <h3>Case Audit & Reassignment</h3>
            
            <div className="search-bar">{/*...search bar...*/}</div>
            
            <h4 className="text-secondary fw-normal">All Cases ({filteredCases.length})</h4>
            {loading ? <p>Loading cases...</p> : (
            <table className="admin-table table-hover"> {/* Add table-hover for better UX */}
                <thead>
                    <tr><th>CHILD ID</th><th>UPLOAD DATE</th><th>ASSIGNED TO</th><th>STATUS</th><th>ACTIONS</th></tr>
                </thead>
                <tbody>
                    {filteredCases.map(c => (
                        <tr key={c._id} onClick={() => setSelectedCase(c)} style={{ cursor: 'pointer' }}>
                            <td>{c.drawing?.childId}</td>
                            <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                            <td>{c.assessor?.username || 'Unassigned'}</td>
                            <td>{c.status}</td>
                            <td onClick={e => e.stopPropagation()}> {/* Stop click from bubbling up to the row */}
                                <select 
                                    className="form-select form-select-sm" 
                                    defaultValue="" 
                                    onChange={(e) => handleReassign(c._id, e.target.value)}
                                >
                                    <option value="" disabled>Reassign to...</option>
                                    {assessors.map(a => <option key={a._id} value={a._id}>{a.username}</option>)}
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            )}
        </div>
    );
}

export default AdminCaseAudit;