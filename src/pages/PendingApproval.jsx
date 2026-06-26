import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import './PendingApproval.css';

function PendingApproval({ onLogout }) {
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;
    
    const user = JSON.parse(storedUser);
    if (!user.id) return;

    const unsubscribe = onSnapshot(doc(db, 'cellleaders', user.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.approved) {
          // Update local storage
          const updatedUser = { ...user, approved: true };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Force reload to trigger App.jsx re-render and navigate correctly
          window.location.reload();
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="pending-container">
      <div className="pending-card">
        <div className="pending-icon">⏳</div>
        <h1>Pending Admin Approval</h1>
        <p>Your account registration is complete, but you need admin approval before you can access the dashboard.</p>
        <p className="pending-note">Please wait for the administrator to approve your account. This page will automatically refresh once approved.</p>
        <button onClick={onLogout} className="btn-secondary">Logout</button>
      </div>
    </div>
  );
}

export default PendingApproval;
