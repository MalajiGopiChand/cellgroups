import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import RoleSelection from './pages/RoleSelection';
import InstallInstructions from './components/InstallInstructions';
import AdminLogin from './pages/AdminLogin';
import CellLeaderLogin from './pages/CellLeaderLogin';
import CellLeaderSignup from './pages/CellLeaderSignup';
import AdminDashboard from './pages/AdminDashboard';
import CellLeaderDashboard from './pages/CellLeaderDashboard';
import PendingApproval from './pages/PendingApproval';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <InstallInstructions />
      <Routes>
        <Route 
          path="/" 
          element={
            user ? (
              user.role === 'admin' ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/cellleader/dashboard" replace />
              )
            ) : (
              <RoleSelection />
            )
          } 
        />
        <Route 
          path="/admin/login" 
          element={
            user?.role === 'admin' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <AdminLogin onLogin={handleLogin} />
            )
          } 
        />
        <Route 
          path="/cellleader/login" 
          element={
            user?.role === 'cellleader' ? (
              user.approved !== false ? (
                <Navigate to="/cellleader/dashboard" replace />
              ) : (
                <Navigate to="/pending-approval" replace />
              )
            ) : (
              <CellLeaderLogin onLogin={handleLogin} />
            )
          } 
        />
        <Route 
          path="/signup" 
          element={
            user ? (
              <Navigate to="/cellleader/dashboard" replace />
            ) : (
              <CellLeaderSignup />
            )
          } 
        />
        <Route path="/admin/*" element={user?.role === 'admin' ? <AdminDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/admin/login" replace />} />
        <Route path="/cellleader/*" element={user?.role === 'cellleader' && user.approved !== false ? <CellLeaderDashboard user={user} onLogout={handleLogout} /> : user?.role === 'cellleader' ? <PendingApproval onLogout={handleLogout} /> : <Navigate to="/cellleader/login" replace />} />
        <Route 
          path="/pending-approval" 
          element={<PendingApproval onLogout={handleLogout} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
