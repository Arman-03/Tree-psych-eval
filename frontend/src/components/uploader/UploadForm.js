import React, { useState, useRef } from 'react';
import * as api from '../../api';

function UploadForm({ setView, onUploadSuccess }) {
  const [formData, setFormData] = useState({ childId: '', childAge: '', teacherNotes: '' });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select an image file.');
      return;
    }

    setLoading(true);
    setMessage('');
    const submissionData = new FormData();
    Object.keys(formData).forEach(key => submissionData.append(key, formData[key]));
    submissionData.append('image', file);

    try {
      await api.submitDrawing(submissionData);
      alert('Drawing submitted successfully!');
      onUploadSuccess(); // This will trigger a data refresh and view change
    } catch (error) {
      setMessage('Submission failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="uploader-card">
      <div className="upload-header">
        <h1>Upload Drawing</h1>
        <button className="upload-back-button" onClick={() => setView('home')}>&#x2190;</button>
      </div>
      <p className="subtitle">Follow these steps to upload a drawing for analysis.</p>
      
      {message && <div className="alert alert-danger">{message}</div>}

      <form onSubmit={handleSubmit}>
        <h4>Step 1: Upload Image</h4>
        <p>Please upload a clear picture of the drawing.</p>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
        <div className="image-dropzone" onClick={() => fileInputRef.current.click()}>
          {previewUrl ? <img src={previewUrl} alt="Drawing preview" /> : 'Select or Capture an image'}
        </div>

        <h4 className="mt-4">Step 2: Enter Details</h4>
        <div className="form-group">
          <label htmlFor="childId">Child ID</label>
          <input type="text" id="childId" name="childId" placeholder="e.g., CH-1234" value={formData.childId} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="childAge">Child Age</label>
          <input type="number" id="childAge" name="childAge" placeholder="e.g., 7" value={formData.childAge} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="teacherNotes">Notes (Optional)</label>
          <textarea id="teacherNotes" name="teacherNotes" placeholder="Any relevant notes from teacher" value={formData.teacherNotes} onChange={handleChange} rows="3"></textarea>
        </div>
        
        <button type="submit" className="uploader-btn btn-primary-upload mt-4" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit for Analysis'}
        </button>
      </form>
    </div>
  );
}

export default UploadForm;