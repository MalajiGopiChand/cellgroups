import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import './Auth.css';

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First check Firebase for admin credentials
      const q = query(
        collection(db, 'admins'), 
        where('email', '==', email.trim().toLowerCase()),
        where('password', '==', password)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        try {
          await addDoc(collection(db, 'login_history'), {
            email: email.trim().toLowerCase(),
            role: 'admin',
            loginTime: new Date()
          });
        } catch (logErr) {
          console.error("Failed to save login history: ", logErr);
        }
        
        onLogin({ role: 'admin', email: email.trim().toLowerCase() });
        navigate('/admin/dashboard');
      } else if (email.trim().toLowerCase() === 'bethel@gmail.com' && password === '123456') {
        try {
          await addDoc(collection(db, 'login_history'), {
            email: email.trim().toLowerCase(),
            role: 'admin',
            loginTime: new Date()
          });
        } catch (logErr) {
          console.error("Failed to save login history: ", logErr);
        }
        // Fallback for initial setup
        onLogin({ role: 'admin', email: email.trim().toLowerCase() });
        navigate('/admin/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      console.error('Error logging in admin:', err);
      // Fallback if network or permissions fail
      if (email.trim().toLowerCase() === 'bethel@gmail.com' && password === '123456') {
        onLogin({ role: 'admin', email: email.trim().toLowerCase() });
        navigate('/admin/dashboard');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-card">
        <h1>Admin Login</h1>
        <p className="auth-subtitle">Sign in to access the admin dashboard</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '16px' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p className="admin-link">
            <Link to="/">Back to Role Selection</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
