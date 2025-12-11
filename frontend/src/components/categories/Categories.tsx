import { useState, useEffect } from "react";
import { categoryApi } from "../../services/todoApi";
import type { Category, CreateCategoryDto } from "../../types/category";
import "./Categories.scss";

interface CategoriesProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E2",
  "#F8B739",
  "#52D273",
];

export function Categories({ isOpen, onClose }: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: DEFAULT_COLORS[0],
  });
  const [editForm, setEditForm] = useState({ name: "", color: "" });

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryApi.getAllCategories();
      setCategories(data);
    } catch (err) {
      setError("Failed to load categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: any) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const dto: CreateCategoryDto = {
        name: newCategory.name.trim(),
        color: newCategory.color,
      };
      const created = await categoryApi.createCategory(dto);
      setCategories([...categories, created]);
      setNewCategory({ name: "", color: DEFAULT_COLORS[0] });
    } catch (err) {
      setError("Failed to create category");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditForm({ name: category.name, color: category.color });
  };

  const handleUpdate = async (id: string) => {
    if (!editForm.name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const updated = await categoryApi.updateCategory(id, {
        name: editForm.name.trim(),
        color: editForm.color,
      });
      setCategories(categories.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
    } catch (err) {
      setError("Failed to update category");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? Todos will not be deleted."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await categoryApi.deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err) {
      setError("Failed to delete category");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="categories-modal__overlay" onClick={onClose}>
      <div
        className="categories-modal__modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="categories-modal__header">
          <h2 className="categories-modal__title">Manage Categories</h2>
          <button className="categories-modal__close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="categories-modal__content">
          {error && <div className="categories-modal__error">{error}</div>}

          <div className="categories-modal__section">
            <h3 className="categories-modal__section-title">
              Create New Category
            </h3>
            <form className="categories-modal__form" onSubmit={handleCreate}>
              <div className="categories-modal__field">
                <label className="categories-modal__label">Name</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  placeholder="Category name"
                  disabled={loading}
                  className="categories-modal__input"
                  required
                />
              </div>

              <div className="categories-modal__field">
                <label className="categories-modal__label">Color</label>
                <div className="categories-modal__color-section">
                  <div className="categories-modal__color-picker">
                    <input
                      type="color"
                      value={newCategory.color}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          color: e.target.value,
                        })
                      }
                      disabled={loading}
                      className="categories-modal__color-input"
                    />
                    <span
                      style={{
                        color: "var(--theme-text-secondary)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {newCategory.color}
                    </span>
                  </div>
                  <div className="categories-modal__color-presets">
                    {DEFAULT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`categories-modal__color-preset ${
                          newCategory.color === color
                            ? "categories-modal__color-preset--active"
                            : ""
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() =>
                          setNewCategory({ ...newCategory, color })
                        }
                        disabled={loading}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="categories-modal__actions">
                <button
                  type="submit"
                  disabled={loading || !newCategory.name.trim()}
                  className="button button--primary"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>

          <div className="categories-modal__section">
            <h3 className="categories-modal__section-title">Your Categories</h3>
            {loading && categories.length === 0 ? (
              <div className="categories-modal__loading">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="categories-modal__empty">
                No categories yet. Create one above!
              </div>
            ) : (
              <div className="categories-modal__list">
                {categories.map((category) => (
                  <div key={category.id} className="category-item">
                    {editingId === category.id ? (
                      <div className="category-item__edit">
                        <div className="category-item__edit-row">
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            disabled={loading}
                            className="categories-modal__input"
                            style={{ flex: 1 }}
                          />
                          <input
                            type="color"
                            value={editForm.color}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                color: e.target.value,
                              })
                            }
                            disabled={loading}
                            className="categories-modal__color-input"
                          />
                        </div>
                        <div className="categories-modal__actions">
                          <button
                            onClick={() => handleUpdate(category.id)}
                            disabled={loading || !editForm.name.trim()}
                            className="button button--primary"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            disabled={loading}
                            className="button button--ghost"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="category-item__view">
                        <div className="category-item__info">
                          <div
                            className="category-item__color"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="category-item__name">
                            {category.name}
                          </span>
                        </div>
                        <div className="category-item__actions">
                          <button
                            onClick={() => handleEdit(category)}
                            disabled={loading}
                            className="button button--ghost button--sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            disabled={loading}
                            className="button button--ghost button--sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
