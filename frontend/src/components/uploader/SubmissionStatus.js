// import React, { useState, useEffect } from 'react';
// import * as api from '../../api';

function SubmissionStatus({ setView, history, loading }) {
    
    const getStatusClass = (status) => {
        if (status.includes('Follow')) return 'status-followup';
        if (status.includes('No Concerns')) return 'status-completed';
        if (status.includes('Screening')) return 'status-screening'; // <-- ADD THIS
        return '';
    };

    return (
        <div className="uploader-card">
            <div className="upload-header">
                <h1>Student Submissions</h1>
                <button className="upload-back-button" onClick={() => setView('home')}>&#x2190;</button>
            </div>
            <p className="subtitle">This table shows the status of all drawings you have submitted.</p>
            
            {loading ? <p>Loading submissions...</p> : (
            <table className="submission-table">
                <thead>
                    <tr><th>CHILD ID</th><th>UPLOAD DATE</th><th>STATUS</th></tr>
                </thead>
                <tbody>
                    {history.map(item => (
                        <tr key={item._id}>
                            <td>{item.childId}</td>
                            <td>{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                            <td className={getStatusClass(item.caseStatus)}>{item.caseStatus.replace('Completed - ', '')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            )}
        </div>
    );
}

export default SubmissionStatus;