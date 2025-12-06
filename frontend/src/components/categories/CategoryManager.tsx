import { useState, FormEvent } from "react";
import { categoryApi } from "../../services/categoryApi";
import type { CreateCategoryDto, UpdateCategoryDto, Category } from "../../types/category";
import "./CategoryManager.scss";

interface CategoryManagerProps {
  onClose: () => void;
  onCategoryChange: () => void;
  categories: Category[];
}

export const CategoryManager = ({ onClose, onCategoryChange, categories }: CategoryManagerProps) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateHexColor = (color: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    if (!validateHexColor(color)) {
      setError("Invalid color format. Use HEX format (#RRGGBB or #RGB)");
      return;
    }

    setIsLoading(true);
    try {
      if (editingId) {
        const updateData: UpdateCategoryDto = { name: name.trim(), color };
        await categoryApi.updateCategory(editingId, updateData);
      } else {
        const createData: CreateCategoryDto = { name: name.trim(), color };
        await categoryApi.createCategory(createData);
      }
      
      setName("");
      setColor("#3B82F6");
      setEditingId(null);
      onCategoryChange();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save category");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setName(category.name);
    setColor(category.color);
    setEditingId(category.id);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    setIsLoading(true);
    try {
      await categoryApi.deleteCategory(id);
      onCategoryChange();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete category");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setColor("#3B82F6");
    setEditingId(null);
    setError(null);
  };

  return (
    <div className="category-manager-overlay" onClick={onClose}>
      <div className="category-manager" onClick={(e) => e.stopPropagation()}>
        <div className="category-manager__header">
          <h2>Manage Categories</h2>
          <button onClick={onClose} className="category-manager__close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="category-manager__form">
          {error && <div className="category-manager__error">{error}</div>}
          
          <div className="category-manager__form-group">
            <label htmlFor="categoryName">Category Name</label>
            <input
              id="categoryName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Work, Personal, Shopping"
              maxLength={50}
              disabled={isLoading}
            />
          </div>

          <div className="category-manager__form-group">
            <label htmlFor="categoryColor">Color (HEX)</label>
            <div className="category-manager__color-input">
              <input
                id="categoryColor"
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#3B82F6"
                maxLength={7}
                disabled={isLoading}
              />
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="category-manager__color-picker"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="category-manager__form-actions">
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="category-manager__btn category-manager__btn--cancel"
                disabled={isLoading}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="category-manager__btn category-manager__btn--submit"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : editingId ? "Update" : "Add Category"}
            </button>
          </div>
        </form>

        <div className="category-manager__list">
          <h3>Your Categories</h3>
          {categories.length === 0 ? (
            <p className="category-manager__empty">No categories yet. Create one above!</p>
          ) : (
            <ul>
              {categories.map((category) => (
                <li key={category.id} className="category-manager__item">
                  <div className="category-manager__item-info">
                    <span
                      className="category-manager__color-badge"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="category-manager__item-name">{category.name}</span>
                  </div>
                  <div className="category-manager__item-actions">
                    <button
                      onClick={() => handleEdit(category)}
                      className="category-manager__item-btn"
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="category-manager__item-btn category-manager__item-btn--delete"
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
