import { useState, useEffect } from "react";
import type { Category, CreateCategoryDto } from "../../types/category";
import { categoryApi } from "../../services/categoryApi";
import { Button } from "../../components/ui";
import { CategoryForm } from "./CategoryForm";
import "./CategoryList.scss";

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryApi.getAllCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateCategoryDto) => {
    const newCategory = await categoryApi.createCategory(data);
    setCategories((prev) => [newCategory, ...prev]);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await categoryApi.deleteCategory(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete category");
    }
  };

  if (loading) {
    return <div className="category-list">Loading categories...</div>;
  }

  if (showForm) {
    return (
      <CategoryForm
        onSubmit={handleCreate}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="category-list">
      <div className="category-list__header">
        <h2 className="category-list__title">Categories</h2>
        <Button onClick={() => setShowForm(true)}>New Category</Button>
      </div>

      {error && <div className="category-list__error">{error}</div>}

      {categories.length === 0 ? (
        <div className="category-list__empty">
          No categories yet. Create your first category!
        </div>
      ) : (
        <div className="category-list__grid">
          {categories.map((category) => (
            <div key={category.id} className="category-list__item">
              <div className="category-list__item-header">
                <div
                  className="category-list__item-color"
                  style={{ backgroundColor: category.color }}
                />
                <span className="category-list__item-name">
                  {category.name}
                </span>
                <div className="category-list__item-actions">
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="category-list__delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
