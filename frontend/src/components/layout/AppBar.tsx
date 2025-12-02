import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./AppBar.scss";
import whiteLogoWhiteFont from "../../assets/white-logo-white-font.png";

/**
 * AppBar Component
 *
 * Fixed header with BuyIn branding gradient and logo.
 * Matches the design system from the BuyIn brand identity.
 */
export default function AppBar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
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
        {user && (
          <div className="app-bar__user-section">
            <span className="app-bar__user-email">{user.email}</span>
            <button onClick={handleLogout} className="app-bar__logout-button">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
