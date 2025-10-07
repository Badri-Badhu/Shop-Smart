import React, { useState, useEffect } from 'react';
import FlashMessage from '../../../components/common/FlashMessage';
import "./css/DealerApplications.css"
const DealerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApprovePopup, setShowApprovePopup] = useState(false);
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [showMakePendingPopup, setShowMakePendingPopup] = useState(false); // ✅ New state for popup
  const [currentAppId, setCurrentAppId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [flash, setFlash] = useState({ message: '', type: '' });

  const showFlash = (message, type) => {
    setFlash({ message, type });
  };

  const fetchApplications = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showFlash('Authentication token missing.', 'error');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Admin/dealer-applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setApplications(data);
      } else {
        showFlash(data.msg || 'Failed to fetch applications.', 'error');
      }
    } catch (err) {
      console.error(err);
      showFlash('Server error. Could not fetch applications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleRejectClick = (id) => {
    setCurrentAppId(id);
    setShowRejectPopup(true);
  };

  const handleApproveClick = (id) => {
    setCurrentAppId(id);
    setShowApprovePopup(true);
  };
  
  // ✅ New handler to open the "make pending" popup
  const handleMakePendingClick = (id) => {
    setCurrentAppId(id);
    setShowMakePendingPopup(true);
  };
  
  const approveApplication = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Admin/dealer-applications/approve/${currentAppId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approvalMessage: "Congratulations! Your application has been approved. You are now a dealer." })
      });

      const data = await res.json();
      if (res.ok) {
        showFlash(data.msg, 'success');
        setShowApprovePopup(false);
        fetchApplications();
      } else {
        showFlash(data.msg || 'Failed to approve application.', 'error');
      }
    } catch (err) {
      showFlash('Server error. Could not approve application.', 'error');
    }
  };

  const rejectApplication = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Admin/dealer-applications/reject/${currentAppId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      const data = await res.json();
      if (res.ok) {
        showFlash(data.msg, 'success');
        setShowRejectPopup(false);
        setRejectionReason('');
        fetchApplications();
      } else {
        showFlash(data.msg || 'Failed to reject application.', 'error');
      }
    } catch (err) {
      showFlash('Server error. Could not reject application.', 'error');
    }
  };
  
  // ✅ New API call to make application pending
  const makePendingApplication = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Admin/dealer-applications/make-pending/${currentAppId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      if (res.ok) {
        showFlash(data.msg, 'success');
        setShowMakePendingPopup(false);
        fetchApplications();
      } else {
        showFlash(data.msg || 'Failed to update application status.', 'error');
      }
    } catch (err) {
      showFlash('Server error. Could not update application.', 'error');
    }
  };

  if (loading) {
    return <div className="loading-state">Loading applications...</div>;
  }
  
  // ✅ Separate applications by status
  const pendingApplications = applications.filter(app => app.status === 'pending');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');
  
  return (
    <div className="admin-applications-container">
      {flash.message && <FlashMessage message={flash.message} type={flash.type} onClose={() => setFlash({ message: '', type: '' })} />}
      
      <div className="application-section">
        <h2>Pending Applications</h2>
        {pendingApplications.length === 0 ? (
          <p className="no-applications">No new pending applications at this time.</p>
        ) : (
          <div className="applications-grid">
            {pendingApplications.map((app) => (
              <div key={app._id} className="application-card">
                <div className="user-details">
                  <h3>{app.user.firstName} {app.user.lastName}</h3>
                  <p><strong>Email:</strong> {app.user.email}</p>
                  <p><strong>Orders Placed:</strong> {app.orderCount}</p>
                </div>
                <div className="action-buttons">
                  <button className="prof-btn approve-btn" onClick={() => handleApproveClick(app._id)}>Approve</button>
                  <button className="prof-btn reject-btn" onClick={() => handleRejectClick(app._id)}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="application-section rejected-section">
        <h2>Rejected Applications</h2>
        {rejectedApplications.length === 0 ? (
          <p className="no-applications">No rejected applications.</p>
        ) : (
          <div className="applications-grid">
            {rejectedApplications.map((app) => (
              <div key={app._id} className="application-card rejected-card">
                <div className="user-details">
                  <h3>{app.user.firstName} {app.user.lastName}</h3>
                  <p><strong>Email:</strong> {app.user.email}</p>
                  <p><strong>Orders Placed:</strong> {app.orderCount}</p>
                  <p className="rejection-reason-text"><strong>Reason:</strong> {app.rejectionReason}</p>
                </div>
                <div className="action-buttons">
                  <button className="prof-btn make-pending-btn" onClick={() => handleMakePendingClick(app._id)}>Make Pending</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approve Confirmation Popup */}
      {showApprovePopup && (
        <div className="prof-popup-overlay">
          <div className="prof-popup-content">
            <h3>Confirm Approval</h3>
            <p>Are you sure you want to approve this application?</p>
            <div className="prof-popup-actions">
              <button className="prof-btn prof-cancel-btn" onClick={() => setShowApprovePopup(false)}>Cancel</button>
              <button className="prof-btn approve-btn" onClick={approveApplication}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Popup with Reason */}
      {showRejectPopup && (
        <div className="prof-popup-overlay">
          <div className="prof-popup-content">
            <h3>Reject Application</h3>
            <p>Please provide a reason for rejection:</p>
            <textarea
              className="prof-textarea"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason here..."
            />
            <div className="prof-popup-actions">
              <button className="prof-btn prof-cancel-btn" onClick={() => setShowRejectPopup(false)}>Cancel</button>
              <button className="prof-btn reject-btn" onClick={rejectApplication}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ New "Make Pending" Confirmation Popup */}
      {showMakePendingPopup && (
        <div className="prof-popup-overlay">
          <div className="prof-popup-content">
            <h3>Confirm Action</h3>
            <p>Are you sure you want to make this application pending again?</p>
            <div className="prof-popup-actions">
              <button className="prof-btn prof-cancel-btn" onClick={() => setShowMakePendingPopup(false)}>Cancel</button>
              <button className="prof-btn make-pending-btn" onClick={makePendingApplication}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealerApplications;