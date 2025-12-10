import type { Category } from "../../types/category";
import "./CategoryBadge.scss";

interface CategoryBadgeProps {
  category: Category;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span
      className="category-badge"
      style={{ backgroundColor: category.color }}
    >
      {category.name}
    </span>
  );
}
