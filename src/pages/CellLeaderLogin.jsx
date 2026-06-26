import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import './Auth.css';

function CellLeaderLogin({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phone.trim())) {
        setError('Please enter a valid 10-digit mobile number.');
        setLoading(false);
        return;
      }

      const q = query(collection(db, 'cellleaders'), where('phone', '==', phone.trim()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError('Mobile number not found.');
        setLoading(false);
        return;
      }

      const leaderData = querySnapshot.docs[0].data();
      const leaderId = querySnapshot.docs[0].id;

      if (!leaderData.approved) {
        onLogin({ 
          role: 'cellleader', 
          phone: leaderData.phone,
          name: leaderData.name,
          place: leaderData.place,
          id: leaderId,
          approved: false
        });
        navigate('/pending-approval');
      } else {
        onLogin({ 
          role: 'cellleader', 
          phone: leaderData.phone,
          name: leaderData.name,
          place: leaderData.place,
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
        <p className="auth-subtitle">Sign in with your mobile number.</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mobile Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              pattern="\d{10}"
              maxLength="10"
              placeholder="Enter your 10-digit mobile number"
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
