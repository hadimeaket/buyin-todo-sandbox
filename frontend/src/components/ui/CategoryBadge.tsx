import "./CategoryBadge.scss";

interface CategoryBadgeProps {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function CategoryBadge({
  name,
  color,
  size = "md",
  className = "",
}: CategoryBadgeProps) {
  return (
    <span
      className={`category-badge category-badge--${size} ${className}`}
      style={{ backgroundColor: color }}
    >
      {name}
    </span>
  );
}
