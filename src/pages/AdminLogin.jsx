import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Fixed admin credentials
    if (email.trim().toLowerCase() === 'bethel@gmail.com') {
      onLogin({ role: 'admin', email });
      navigate('/admin/dashboard');
    } else {
      setError('Invalid admin email');
    }
    setLoading(false);
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
