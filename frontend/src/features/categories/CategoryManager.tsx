import { useState } from "react";
import type { Category, CreateCategoryDto } from "../../types/category";
import "./CategoryManager.scss";

interface CategoryManagerProps {
  categories: Category[];
  onCreateCategory: (data: CreateCategoryDto) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function CategoryManager({
  categories,
  onCreateCategory,
  onDeleteCategory,
  isLoading = false,
}: CategoryManagerProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategoryName.trim()) {
      setError("Category name is required");
      return;
    }

    setIsAdding(true);
    setError("");

    try {
      await onCreateCategory({ name: newCategoryName.trim() });
      setNewCategoryName("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create category"
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? It will be removed from all associated todos."
      )
    ) {
      return;
    }

    try {
      await onDeleteCategory(id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete category"
      );
    }
  };

  return (
    <div className="category-manager">
      <h3 className="category-manager__title">Categories</h3>

      {error && <div className="category-manager__error">{error}</div>}

      <form onSubmit={handleSubmit} className="category-manager__form">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="New category name..."
          className="category-manager__input"
          disabled={isAdding || isLoading}
          maxLength={50}
        />
        <button
          type="submit"
          className="category-manager__add-button"
          disabled={isAdding || isLoading || !newCategoryName.trim()}
        >
          {isAdding ? (
            <span className="loading-spinner" />
          ) : (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          )}
        </button>
      </form>

      <div className="category-manager__list">
        {categories.length === 0 ? (
          <p className="category-manager__empty">
            No categories yet. Create one above!
          </p>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="category-item">
              <div className="category-item__content">
                <div
                  className="category-item__color"
                  style={{ backgroundColor: category.color }}
                />
                <span className="category-item__name">{category.name}</span>
              </div>
              <button
                onClick={() => handleDelete(category.id)}
                className="category-item__delete"
                disabled={isLoading}
                aria-label={`Delete ${category.name}`}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
