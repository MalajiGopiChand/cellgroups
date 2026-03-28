import { Link } from 'react-router-dom';
import './RoleSelection.css';

function RoleSelection() {
  return (
    <div className="role-selection-container">
      <div className="role-selection-card glass-card">
        
        <div className="role-header">
          <img src="/icon.png" alt="Bethel Logo" className="title-icon-img" />
          <h1>Bethel Cell</h1>
          <p className="subtitle">Select your role to continue</p>
        </div>
        
        <div className="role-options">
          <Link to="/admin/login" className="role-card">
            <div className="role-icon">🛡️</div>
            <div className="role-content">
              <h2>Admin</h2>
              <p>Manage cell leaders & members</p>
            </div>
          </Link>
          
          <Link to="/cellleader/login" className="role-card">
            <div className="role-icon">👥</div>
            <div className="role-content">
              <h2>Cell Leader</h2>
              <p>Track attendance & announcements</p>
            </div>
          </Link>
        </div>
        
        <div className="role-description">
          <p>This platform helps Cell Leaders nurture families in spiritual growth.</p>
        </div>

      </div>
    </div>
  );
}

export default RoleSelection;
