import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../api';
import './AssessorDashboard.css'; // Import our new CSS file
import ReviewView from './ReviewView'; // Import the new component

// Logo URL - replace with your actual logo if available
import logoUrl from '../assets/choice-foundation-logo.png'; // Example logo

// Helper component for the dashboard view
const DashboardView = ({ cases, onSelectCase }) => {
    const [activeTab, setActiveTab] = useState('flagged');
    const [completedFilter, setCompletedFilter] = useState('all');

    const filteredCases = useMemo(() => {
        switch (activeTab) {
            case 'flagged':
                return cases.filter(c => c.status === 'Flagged for Review');
            case 'pending':
                // Note: The mockups also show 'Initial Screening', so let's include that.
                return cases.filter(c => c.status === 'Initial Screening' || c.status === 'Flagged for Review');
            case 'completed':
                if (completedFilter === 'all') {
                    return cases.filter(c => c.status.startsWith('Completed'));
                }
                return cases.filter(c => c.status === completedFilter);
            default:
                return [];
        }
    }, [cases, activeTab, completedFilter]);

    const getStatusClass = (status) => {
        if (status === 'Flagged for Review') return 'status-flagged';
        if (status === 'Completed - Follow-up Needed') return 'status-followup';
        if (status === 'Completed - No Concerns') return 'status-completed';
        if (status === 'Initial Screening') return 'status-screening';
        return '';
    };

    return (
        <div className="dashboard-card">
            <div className="text-center">
                <img src={logoUrl} alt="Choice Foundation" className="foundation-logo" />
                <h2>Caseload Dashboard</h2>
            </div>
            <div className="dashboard-tabs">
                <button className={`tab-button ${activeTab === 'flagged' ? 'active' : ''}`} onClick={() => setActiveTab('flagged')}>Flagged for Review</button>
                <button className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>Pending Cases</button>
                <button className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>Completed</button>
            </div>
            <div className="queue-info">
                <span>Queue: {activeTab.toUpperCase()} ({filteredCases.length} cases)</span>
                {activeTab === 'completed' && (
                    <select className="form-select form-select-sm w-auto" value={completedFilter} onChange={e => setCompletedFilter(e.target.value)}>
                        <option value="all">All Completed</option>
                        <option value="Completed - No Concerns">No Concerns</option>
                        <option value="Completed - Follow-up Needed">Follow Up</option>
                    </select>
                )}
            </div>
            <table className="case-table">
                <thead>
                    <tr><th>CHILD ID</th><th>AGE</th><th>UPLOAD DATE</th><th>STATUS</th></tr>
                </thead>
                <tbody>
                    {filteredCases.map(c => (
                        <tr key={c._id} onClick={() => onSelectCase(c)} style={{ cursor: 'pointer' }}>
                            <td>{c.drawing?.childId || 'N/A'}</td>
                            <td>{c.drawing?.childAge || 'N/A'}</td>
                            <td>{c.drawing ? new Date(c.drawing.createdAt).toLocaleDateString() : 'N/A'}</td>
                            <td className={getStatusClass(c.status)}>{c.status.replace('Completed - ', '')}</td>
                        </tr>
                    ))}
                     {filteredCases.length === 0 && (
                        <tr>
                            <td colSpan="4" className="text-center text-muted">No cases in this queue.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

// Main AssessorDashboard Component
function AssessorDashboard() {
  const [view, setView] = useState('welcome'); // 'welcome', 'dashboard', 'review'
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.getAssignedCases();
      setCases(data);
    } catch (error) {
      console.error("Failed to fetch cases", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);
  
  const handleSelectCase = (caseData) => {
      setSelectedCase(caseData);
      setView('review');
  };

  const handleReturnToDashboard = () => {
      setSelectedCase(null);
      setView('dashboard');
      fetchCases(); // Refresh data after an action
  }

  const handleSaveReview = async (caseId, reportText, finalStatus) => {
    setIsSubmitting(true);
    try {
        await api.submitReview(caseId, { assessorReport: reportText, finalStatus });
        alert('Review submitted successfully!');
        handleReturnToDashboard();
    } catch (error) {
        alert('Failed to submit review.');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="assessor-container">
      {loading && <p>Loading...</p>}
      {!loading && view === 'welcome' && (
        <div className="welcome-card text-center">
            <img src={logoUrl} alt="Choice Foundation" className="foundation-logo" />
            <h2>Welcome, Assessor</h2>
            <p className="lead">Your ML-assisted HTP interpretation platform is ready. Review cases quickly and efficiently using the AI-generated analysis.</p>
            <button className="btn btn-lg btn-info text-white mt-3" onClick={() => setView('dashboard')}>Start Reviewing Cases</button>
        </div>
      )}
      {!loading && view === 'dashboard' && <DashboardView cases={cases} onSelectCase={handleSelectCase} />}
      
      {/* --- THIS IS THE KEY CHANGE --- */}
      {!loading && view === 'review' && selectedCase && (
        <ReviewView 
            caseData={selectedCase} 
            onSave={handleSaveReview} 
            onBack={handleReturnToDashboard}
            isSubmitting={isSubmitting}
            // Add the isReadOnly prop based on the case's status
            isReadOnly={selectedCase.status.startsWith('Completed')}
        />
      )}
      {/* --- END OF CHANGE --- */}

    </div>
  );
}

export default AssessorDashboard;