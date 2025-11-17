import type { ReactNode, MouseEvent } from "react";
import "../../styles/ui/Card.scss";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      className={`card ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

export default Card;
