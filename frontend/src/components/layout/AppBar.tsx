import "./AppBar.scss";
import whiteLogoWhiteFont from "../../assets/white-logo-white-font.png";
import { useAuth } from "../../contexts/AuthContext";

/**
 * AppBar Component
 *
 * Fixed header with BuyIn branding gradient and logo.
 * Matches the design system from the BuyIn brand identity.
 */
export default function AppBar() {
  const { user, logout } = useAuth();

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
              <span className="app-bar__user-name">
                {user.name || user.email}
              </span>
              <button onClick={logout} className="app-bar__logout-btn">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
