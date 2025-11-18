import "./AppBar.scss";
import whiteLogoWhiteFont from "../assets/white-logo-white-font.png";
import ThemeToggle from "./ThemeToggle";

/**
 * AppBar Component
 *
 * Fixed header with BuyIn branding gradient and logo.
 * Matches the design system from the BuyIn brand identity.
 * Includes theme toggle for light/dark mode switching.
 */
export default function AppBar() {
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
        <ThemeToggle />
      </div>
    </header>
  );
}
