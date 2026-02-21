import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import './Auth.css';

function CellLeaderSignup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    place: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate inputs
      if (!formData.name.trim() || !formData.email.trim() || !formData.place.trim() || !formData.phone.trim()) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      // Check if email already exists
      const emailToCheck = formData.email.trim().toLowerCase();
      const q = query(collection(db, 'cellleaders'), where('email', '==', emailToCheck));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setError('Email already exists. Please use a different email.');
        setLoading(false);
        return;
      }

      // Add new cell leader
      const docRef = await addDoc(collection(db, 'cellleaders'), {
        name: formData.name.trim(),
        email: emailToCheck,
        place: formData.place.trim(),
        phone: formData.phone.trim(),
        approved: false,
        createdAt: serverTimestamp()
      });

      console.log('Registration successful, document ID:', docRef.id);

      setSuccess(true);
      setTimeout(() => {
        navigate('/cellleader/login');
      }, 2000);
    } catch (error) {
      console.error('Error signing up:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'permission-denied') {
        setError('Permission denied. Please check Firebase Firestore security rules. Make sure "cellleaders" collection allows write access.');
      } else if (error.code === 'unavailable') {
        setError('Service temporarily unavailable. Please check your internet connection and try again.');
      } else if (error.code === 'failed-precondition') {
        setError('Database error. Please try again in a moment.');
      } else {
        setError(`Registration failed: ${error.message || 'Please check your connection and try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="success-message">
            <h2>Registration Successful!</h2>
            <p>Your account is pending admin approval. You will be redirected to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Cell Leader Signup</h1>
        <p className="auth-subtitle">Create your account to get started</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label>Place</label>
            <input
              type="text"
              name="place"
              value={formData.place}
              onChange={handleChange}
              required
              placeholder="Enter your place"
            />
          </div>
          
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/cellleader/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}

export default CellLeaderSignup;
