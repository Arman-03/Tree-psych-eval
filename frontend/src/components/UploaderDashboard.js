import React, { useState, useEffect, useCallback } from 'react';
import './UploaderDashboard.css';
import logoUrl from '../assets/choice-foundation-logo.png';
import * as api from '../api';

// Import child components
import UploaderHome from './uploader/UploaderHome';
import UploadForm from './uploader/UploadForm';
import SubmissionStatus from './uploader/SubmissionStatus';

function UploaderDashboard() {
  const [view, setView] = useState('home'); // 'home', 'upload', 'status'
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.getMyDrawingsWithCases();
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch submission history.", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch history only when the status view is active or for the first time
    if (view === 'status' || history.length === 0) {
        fetchHistory();
    }
  }, [view, fetchHistory, history.length]);

  const handleUploadSuccess = () => {
      fetchHistory().then(() => {
          setView('status'); // After successful upload, show the status page
      });
  };

  const renderContent = () => {
    switch (view) {
      case 'upload':
        return <UploadForm setView={setView} onUploadSuccess={handleUploadSuccess} />;
      case 'status':
        return <SubmissionStatus setView={setView} history={history} loading={loading} />;
      case 'home':
      default:
        return <UploaderHome setView={setView} />;
    }
  };

  return (
    <div className="uploader-container">
      <header className="uploader-header">
        <img src={logoUrl} alt="Choice Foundation" className="uploader-logo" />
      </header>
      <main className="uploader-card-container">
        {renderContent()}
      </main>
    </div>
  );
}

export default UploaderDashboard;