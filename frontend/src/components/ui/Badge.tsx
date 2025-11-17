import type { ReactNode } from "react";
import "../../styles/ui/Badge.scss";

interface BadgeProps {
  children: ReactNode;
  variant?: "high" | "medium" | "low" | "default";
  className?: string;
}

function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span className={`badge badge--${variant} ${className}`}>{children}</span>
  );
}

export default Badge;
