import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

    // Fixed admin credentials
    if (email === 'bethel@gmail.com' && password === '123456') {
      onLogin({ role: 'admin', email });
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials');
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
              placeholder="bethel@gmail.com"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password"
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading}>
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
