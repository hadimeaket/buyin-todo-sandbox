import React, { useState, useEffect } from "react";
import type { Category, CreateCategoryDto } from "../../types/category";
import { categoryApi } from "../../services/categoryApi";
import "./CategoryManager.scss";

interface CategoryManagerProps {
  onClose: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ onClose }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", color: "#3B82F6" });
  const [colorError, setColorError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryApi.getAll();
      setCategories(data);
    } catch (err: any) {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const validateHexColor = (color: string): boolean => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    return hexRegex.test(color);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setColorError("");

    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    if (!validateHexColor(formData.color)) {
      setColorError(
        "Invalid hex color. Must be in format #RRGGBB (e.g., #3B82F6)"
      );
      return;
    }

    try {
      if (editingId) {
        await categoryApi.update(editingId, formData);
      } else {
        await categoryApi.create(formData as CreateCategoryDto);
      }
      await fetchCategories();
      setFormData({ name: "", color: "#3B82F6" });
      setEditingId(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save category");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, color: category.color });
    setError("");
    setColorError("");
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm("Are you sure? Todos with this category will have it removed.")
    ) {
      return;
    }

    try {
      await categoryApi.delete(id);
      await fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete category");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: "", color: "#3B82F6" });
    setError("");
    setColorError("");
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, color: value });
    setColorError("");
  };

  return (
    <div className="category-manager-overlay" onClick={onClose}>
      <div className="category-manager" onClick={(e) => e.stopPropagation()}>
        <div className="category-manager__header">
          <h2>Manage Categories</h2>
          <button className="category-manager__close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="category-manager__form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category-name">Category Name</label>
              <input
                id="category-name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Work, Personal"
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category-color">
                Color (Hex)
                <span
                  className="color-preview"
                  style={{ backgroundColor: formData.color }}
                />
              </label>
              <div className="color-input-group">
                <input
                  id="category-color"
                  type="text"
                  value={formData.color}
                  onChange={handleColorChange}
                  placeholder="#3B82F6"
                  maxLength={7}
                  className={colorError ? "error" : ""}
                />
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  title="Pick a color"
                />
              </div>
              {colorError && <span className="error-text">{colorError}</span>}
            </div>
          </div>

          {error && <div className="error-alert">{error}</div>}

          <div className="form-actions">
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
            )}
            <button type="submit" className="btn-primary">
              {editingId ? "Update" : "Add"} Category
            </button>
          </div>
        </form>

        <div className="category-manager__list">
          {loading ? (
            <div className="loading">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="empty-state">
              No categories yet. Create your first one above!
            </div>
          ) : (
            <ul>
              {categories.map((category) => (
                <li key={category.id} className="category-item">
                  <div className="category-info">
                    <span
                      className="category-color"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="category-name">{category.name}</span>
                    <span className="category-hex">{category.color}</span>
                  </div>
                  <div className="category-actions">
                    <button
                      onClick={() => handleEdit(category)}
                      className="btn-icon"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="btn-icon"
                      title="Delete"
                    >
                      🗑️
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

export default CategoryManager;
