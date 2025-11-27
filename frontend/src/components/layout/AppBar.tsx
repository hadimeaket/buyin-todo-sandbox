import "./AppBar.scss";
import whiteLogoWhiteFont from "../../assets/white-logo-white-font.png";

/**
 * AppBar Component
 *
 * Fixed header with BuyIn branding gradient and logo.
 * Matches the design system from the BuyIn brand identity.
 */
interface AppBarProps {
  onLogout?: () => void;
}

export default function AppBar({ onLogout }: AppBarProps) {
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
        {onLogout && (
          <button
            onClick={onLogout}
            className="app-bar__logout"
            aria-label="Logout"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
