import "./AppBar.scss";
import whiteLogoWhiteFont from "../../assets/white-logo-white-font.png";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui";

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
        {user && (
          <div className="app-bar__actions">
            <span className="app-bar__user-email">{user.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="app-bar__logout"
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
