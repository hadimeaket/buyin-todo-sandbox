import "./AppBar.scss";
import whiteLogoWhiteFont from "../../assets/white-logo-white-font.png";
import { useAuth } from "../../contexts/AuthContext";

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
  const { user, isAuthenticated } = useAuth();

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
        {isAuthenticated && user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginLeft: "auto",
            }}
          >
            <span style={{ color: "white", fontSize: "0.875rem" }}>
              {user.name || user.email}
            </span>
            {onLogout && (
              <button
                onClick={onLogout}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
                aria-label="Logout"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
