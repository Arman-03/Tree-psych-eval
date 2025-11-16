import React from 'react';

function UploaderHome({ setView }) {
    return (
        <div className="uploader-card">
            <h1>Uploader Dashboard</h1>
            <p className="subtitle">Manage your uploads and check the status of evaluations</p>
            <button className="uploader-btn btn-primary-upload" onClick={() => setView('upload')}>
                Upload a New Drawing
            </button>
            <button className="uploader-btn btn-secondary-upload" onClick={() => setView('status')}>
                Check Submission Status
            </button>
        </div>
    );
}

export default UploaderHome;