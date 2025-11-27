import React, { useState, useEffect } from "react";
import type { Category } from "../../types/category";
import { categoryApi } from "../../services/categoryApi";
import "./CategoryManager.scss";

interface CategoryManagerProps {
  onClose: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  onClose,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", color: "#3B82F6" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryApi.getAllCategories();
      setCategories(data);
      setError("");
    } catch (err) {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const validateHexColor = (color: string): boolean => {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    if (!validateHexColor(formData.color)) {
      setError("Invalid color format. Use HEX format like #FF5733");
      return;
    }

    try {
      if (editingId) {
        await categoryApi.updateCategory(editingId, formData);
      } else {
        await categoryApi.createCategory(formData);
      }
      setFormData({ name: "", color: "#3B82F6" });
      setEditingId(null);
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save category");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, color: category.color });
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Delete this category? Todos with this category will become uncategorized."
      )
    ) {
      return;
    }

    try {
      await categoryApi.deleteCategory(id);
      fetchCategories();
    } catch (err) {
      setError("Failed to delete category");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: "", color: "#3B82F6" });
    setError("");
  };

  return (
    <div className="category-manager-overlay" onClick={onClose}>
      <div className="category-manager" onClick={(e) => e.stopPropagation()}>
        <div className="category-manager__header">
          <h2>Manage Categories</h2>
          <button onClick={onClose} className="close-button">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-row">
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Category name (e.g., Gym, Kochen)"
              className="category-input"
            />
            <input
              type="color"
              value={formData.color}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  color: e.target.value.toUpperCase(),
                })
              }
              className="color-picker"
            />
            <input
              type="text"
              value={formData.color}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  color: e.target.value.toUpperCase(),
                })
              }
              placeholder="#FF5733"
              className="color-input"
              maxLength={7}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? "Update" : "Create"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {error && <div className="error-message">{error}</div>}

        <div className="category-list">
          {loading ? (
            <p>Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="empty-state">No categories yet. Create one above!</p>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="category-item">
                <div className="category-info">
                  <span
                    className="category-color"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="category-name">{category.name}</span>
                </div>
                <div className="category-actions">
                  <button
                    onClick={() => handleEdit(category)}
                    className="btn-edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
