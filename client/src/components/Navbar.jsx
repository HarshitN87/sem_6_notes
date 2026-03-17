import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        🆘 <span>Crisis</span>Connect
      </div>
      <div className="navbar-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/requests">Requests</NavLink>
        <NavLink to="/map">Map</NavLink>
        <NavLink to="/sms">SMS Sim</NavLink>
      </div>
      <div className="navbar-user">
        <span className="user-role">{user.role}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
