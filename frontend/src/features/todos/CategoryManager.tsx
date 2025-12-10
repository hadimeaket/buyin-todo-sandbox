import { useState, useEffect } from "react";
import type { Category, CreateCategoryDto } from "../../types/todo";
import { categoryApi } from "../../services/categoryApi";
import { Button, Input, CategoryBadge } from "../../components/ui";
import "./CategoryManager.scss";

interface CategoryManagerProps {
  onClose: () => void;
}

export default function CategoryManager({ onClose }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<CreateCategoryDto>({
    name: "",
    color: "#FF6B6B",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<CreateCategoryDto>({
    name: "",
    color: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryApi.getAllCategories();
      setCategories(data);
    } catch (err) {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const validateColor = (color: string): boolean => {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      setError("Category name is required");
      return;
    }
    if (!validateColor(newCategory.color)) {
      setError("Color must be in HEX format (#RRGGBB)");
      return;
    }

    try {
      setError(null);
      const created = await categoryApi.createCategory(newCategory);
      setCategories([created, ...categories]);
      setNewCategory({ name: "", color: "#FF6B6B" });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create category");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editData.name?.trim()) {
      setError("Category name is required");
      return;
    }
    if (editData.color && !validateColor(editData.color)) {
      setError("Color must be in HEX format (#RRGGBB)");
      return;
    }

    try {
      setError(null);
      const updated = await categoryApi.updateCategory(id, editData);
      setCategories(categories.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update category");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? It will be removed from all todos."))
      return;

    try {
      await categoryApi.deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err) {
      setError("Failed to delete category");
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditData({ name: category.name, color: category.color });
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

        <form className="category-manager__form" onSubmit={handleCreate}>
          <Input
            type="text"
            placeholder="Category name"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
          />
          <div className="category-manager__color-input">
            <Input
              type="text"
              placeholder="#RRGGBB"
              value={newCategory.color}
              onChange={(e) =>
                setNewCategory({ ...newCategory, color: e.target.value })
              }
            />
            <input
              type="color"
              value={newCategory.color}
              onChange={(e) =>
                setNewCategory({ ...newCategory, color: e.target.value })
              }
              className="category-manager__color-picker"
            />
          </div>
          <Button type="submit" variant="primary">
            Add Category
          </Button>
        </form>

        {error && <div className="category-manager__error">{error}</div>}

        {loading ? (
          <div className="category-manager__loading">Loading...</div>
        ) : (
          <div className="category-manager__list">
            {categories.length === 0 ? (
              <p className="category-manager__empty">
                No categories yet. Create one above!
              </p>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="category-manager__item">
                  {editingId === category.id ? (
                    <div className="category-manager__edit">
                      <Input
                        type="text"
                        value={editData.name}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                      />
                      <div className="category-manager__color-input">
                        <Input
                          type="text"
                          value={editData.color}
                          onChange={(e) =>
                            setEditData({ ...editData, color: e.target.value })
                          }
                        />
                        <input
                          type="color"
                          value={editData.color}
                          onChange={(e) =>
                            setEditData({ ...editData, color: e.target.value })
                          }
                          className="category-manager__color-picker"
                        />
                      </div>
                      <div className="category-manager__actions">
                        <Button
                          onClick={() => handleUpdate(category.id)}
                          variant="primary"
                          size="sm"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingId(null)}
                          variant="secondary"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <CategoryBadge
                        name={category.name}
                        color={category.color}
                      />
                      <div className="category-manager__actions">
                        <Button
                          onClick={() => startEdit(category)}
                          variant="secondary"
                          size="sm"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(category.id)}
                          variant="secondary"
                          size="sm"
                        >
                          Delete
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
