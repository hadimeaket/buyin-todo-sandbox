import "./AppBar.scss";
import whiteLogoWhiteFont from "../../assets/white-logo-white-font.png";

interface AppBarProps {
  onLogout?: () => void;
  userEmail?: string;
}

/**
 * AppBar Component
 *
 * Fixed header with BuyIn branding gradient and logo.
 * Matches the design system from the BuyIn brand identity.
 */
export default function AppBar({ onLogout, userEmail }: AppBarProps) {
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
        {onLogout && userEmail && (
          <div className="app-bar__user">
            <span className="app-bar__user-email">{userEmail}</span>
            <button
              onClick={onLogout}
              className="app-bar__logout-btn"
              title="Logout"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
