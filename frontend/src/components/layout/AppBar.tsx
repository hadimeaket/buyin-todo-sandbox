import "./AppBar.scss";
import whiteLogoWhiteFont from "../../assets/white-logo-white-font.png";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * AppBar Component
 *
 * Fixed header with BuyIn branding gradient and logo.
 * Matches the design system from the BuyIn brand identity.
 */
export default function AppBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-bar">
      <div className="app-bar__toolbar">
        <div className="app-bar__logo-container">
          <img
            src={whiteLogoWhiteFont}
            alt="BuyIn - Sourcing Tomorrow's Success"
            className="app-bar__logo"
          />
        </div>
        <div className="app-bar__user-section">
          {user && (
            <>
              <span className="app-bar__user-name">{user.name}</span>
              <button 
                className="app-bar__logout-btn" 
                onClick={handleLogout}
                title="Logout"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
