import './PendingApproval.css';

function PendingApproval({ onLogout }) {
  return (
    <div className="pending-container">
      <div className="pending-card">
        <div className="pending-icon">⏳</div>
        <h1>Pending Admin Approval</h1>
        <p>Your account registration is complete, but you need admin approval before you can access the dashboard.</p>
        <p className="pending-note">Please wait for the administrator to approve your account. You will be able to access your dashboard once approved.</p>
        <button onClick={onLogout} className="btn-secondary">Logout</button>
      </div>
    </div>
  );
}

export default PendingApproval;
