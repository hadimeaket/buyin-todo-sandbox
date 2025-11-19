import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import "./Drawer.scss";

interface DrawerProps {
  className?: string;
  totalCount: number;
  activeCount: number;
  completedCount: number;
  onAddTask: () => void;
}

export default function Drawer({
  className = "",
  totalCount,
  activeCount,
  completedCount,
  onAddTask,
}: DrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`drawer ${isExpanded ? "drawer--expanded" : ""} ${className}`}
    >
      <div className="drawer__content">
        {/* Expand/Minimize Toggle */}
        <button
          className="drawer__action drawer__action--toggle"
          onClick={handleToggleExpand}
          title={isExpanded ? "Minimize drawer" : "Expand drawer"}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isExpanded ? (
              // Minimize icon (chevrons right)
              <>
                <polyline points="11 17 6 12 11 7" />
                <polyline points="18 17 13 12 18 7" />
              </>
            ) : (
              // Expand icon (chevrons left)
              <>
                <polyline points="13 17 18 12 13 7" />
                <polyline points="6 17 11 12 6 7" />
              </>
            )}
          </svg>
          {isExpanded && <span className="drawer__label">Minimize</span>}
        </button>

        <div className="drawer__divider"></div>
        {/* Task Statistics */}
        <div className="drawer__stats">
          <div className="drawer__stat" title="Total tasks">
            <svg
              className="drawer__stat-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
            <span className="drawer__stat-value drawer__stat-value--total">
              {totalCount}
            </span>
          </div>
          <div className="drawer__stat" title="Active tasks">
            <svg
              className="drawer__stat-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span className="drawer__stat-value drawer__stat-value--active">
              {activeCount}
            </span>
          </div>
          <div className="drawer__stat" title="Completed tasks">
            <svg
              className="drawer__stat-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="drawer__stat-value drawer__stat-value--completed">
              {completedCount}
            </span>
          </div>
        </div>

        <div className="drawer__divider"></div>

        {/* Theme Toggle */}
        <button
          className="drawer__action"
          onClick={toggleTheme}
          title={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {theme === "dark" ? (
            // Sun icon for light mode
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          ) : (
            // Moon icon for dark mode
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          )}
          {isExpanded && (
            <span className="drawer__label">
              {theme === "dark" ? "Light" : "Dark"}
            </span>
          )}
        </button>

        {/* Settings Button */}
        <button
          className="drawer__action"
          onClick={() => console.log("Settings clicked")}
          title="Settings"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {isExpanded && <span className="drawer__label">Settings</span>}
        </button>

        {/* Help Button */}
        <button
          className="drawer__action"
          onClick={() => console.log("Help clicked")}
          title="Help"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
          {isExpanded && <span className="drawer__label">Help</span>}
        </button>

        {/* Spacer to push Add Task button to bottom */}
        <div className="drawer__spacer"></div>

        {/* Add Task Button */}
        <button
          className="drawer__action drawer__action--add-task"
          onClick={onAddTask}
          title="Add task"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {isExpanded && <span className="drawer__label">Add Task</span>}
        </button>
      </div>
    </div>
  );
}
