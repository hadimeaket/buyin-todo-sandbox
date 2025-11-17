import "../styles/Header.scss";

interface HeaderProps {
  totalCount: number;
  activeCount: number;
  completedCount: number;
}

function Header({ totalCount, activeCount, completedCount }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__container">
        <h1 className="header__title">Tasks</h1>

        <div className="header__stats">
          <div className="header__stat">
            <span className="header__stat-label">Total</span>
            <span className="header__stat-value header__stat-value--total">
              {totalCount}
            </span>
          </div>
          <div className="header__stat">
            <span className="header__stat-label">Active</span>
            <span className="header__stat-value header__stat-value--active">
              {activeCount}
            </span>
          </div>
          <div className="header__stat">
            <span className="header__stat-label">Completed</span>
            <span className="header__stat-value header__stat-value--completed">
              {completedCount}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
