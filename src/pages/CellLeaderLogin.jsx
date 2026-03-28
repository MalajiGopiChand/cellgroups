import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import './Auth.css';

function CellLeaderLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const q = query(collection(db, 'cellleaders'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError('Email not found');
        setLoading(false);
        return;
      }

      const leaderData = querySnapshot.docs[0].data();
      const leaderId = querySnapshot.docs[0].id;

      if (!leaderData.approved) {
        onLogin({ 
          role: 'cellleader', 
          email: leaderData.email,
          name: leaderData.name,
          place: leaderData.place,
          phone: leaderData.phone,
          id: leaderId,
          approved: false
        });
        navigate('/pending-approval');
      } else {
        onLogin({ 
          role: 'cellleader', 
          email: leaderData.email,
          name: leaderData.name,
          place: leaderData.place,
          phone: leaderData.phone,
          id: leaderId,
          approved: true
        });
        navigate('/cellleader/dashboard');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-card">
        <h1>Cell Leader Login</h1>
        <p className="auth-subtitle">Sign in with your email</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
          <p className="admin-link">
            <Link to="/">Back to Role Selection</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default CellLeaderLogin;
