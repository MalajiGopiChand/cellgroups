import { Link } from 'react-router-dom';
import './RoleSelection.css';

function RoleSelection() {
  return (
    <div className="role-selection-container role-light">
      <div className="role-selection-card">
        <div className="role-header">
          <h1>Bethel Cell Leaders</h1>
          <p className="subtitle">Select your role to continue</p>
          <div className="role-description">
            <p>This website helps Cell Leaders guide families in spiritual growth in a simple and organized way. It supports regular activities like weekly Thursday prayer meetings, encourages punctuality, and helps maintain unity within the group.</p>
            <p>By keeping everything clear and easy to use, the platform allows Cell Leaders to focus more on caring for families, building faith, and strengthening the spiritual community.</p>
          </div>
        </div>
        
        <div className="role-options">
          <Link to="/admin/login" className="role-card admin-card">
            <div className="role-icon">👨‍💼</div>
            <h2>Admin</h2>
            <p>Access admin dashboard to manage cell leaders and members</p>
            <div className="role-button">Continue as Admin</div>
          </Link>
          
          <Link to="/cellleader/login" className="role-card cellleader-card">
            <div className="role-icon">👥</div>
            <h2>Cell Leader</h2>
            <p>Manage your members, track attendance, and view announcements</p>
            <div className="role-button">Continue as Cell Leader</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;
