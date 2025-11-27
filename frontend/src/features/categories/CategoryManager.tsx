import { useState, useEffect } from "react";
import type { Category, CreateCategoryDto } from "../../types/category";
import { categoryApi } from "../../services/categoryApi";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import "./CategoryManager.scss";

interface CategoryManagerProps {
  onClose: () => void;
}

const PRESET_COLORS = [
  "#FF0000", // Rot
  "#00FF00", // Grün
  "#0000FF", // Blau
  "#FFFF00", // Gelb
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FFA500", // Orange
  "#800080", // Lila
  "#FFC0CB", // Rosa
  "#A52A2A", // Braun
];

function CategoryManager({ onClose }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newCategory, setNewCategory] = useState<CreateCategoryDto>({
    name: "",
    color: PRESET_COLORS[0],
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<CreateCategoryDto>({
    name: "",
    color: "",
  });
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setError("Kategorien konnten nicht geladen werden");
    }
  };

  const handleCreate = async () => {
    if (!newCategory.name.trim()) {
      setError("Kategoriename ist erforderlich");
      return;
    }

    try {
      await categoryApi.createCategory(newCategory);
      setNewCategory({ name: "", color: PRESET_COLORS[0] });
      setIsCreating(false);
      setError("");
      await loadCategories();
    } catch (err: any) {
      setError(err.message || "Kategorie konnte nicht erstellt werden");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editingCategory.name.trim()) {
      setError("Kategoriename ist erforderlich");
      return;
    }

    try {
      await categoryApi.updateCategory(id, editingCategory);
      setEditingId(null);
      setError("");
      await loadCategories();
    } catch (err: any) {
      setError(err.message || "Kategorie konnte nicht aktualisiert werden");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Möchtest du diese Kategorie wirklich löschen?")) {
      return;
    }

    try {
      await categoryApi.deleteCategory(id);
      await loadCategories();
    } catch (err: any) {
      setError(err.message || "Kategorie konnte nicht gelöscht werden");
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditingCategory({ name: category.name, color: category.color });
    setError("");
  };

  return (
    <div className="category-manager">
      <div className="category-manager__header">
        <h2>Kategorien verwalten</h2>
        <button
          className="category-manager__close-btn"
          onClick={onClose}
          aria-label="Schließen"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {error && <div className="category-manager__error">{error}</div>}

      <div className="category-manager__content">
        {/* Create New Category */}
        <div className="category-manager__create-section">
          {!isCreating ? (
            <Button onClick={() => setIsCreating(true)} variant="primary">
              + Neue Kategorie
            </Button>
          ) : (
            <div className="category-form">
              <Input
                type="text"
                placeholder="Kategoriename"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
              />
              <div className="category-form__colors">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`category-form__color-btn ${
                      newCategory.color === color ? "active" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewCategory({ ...newCategory, color })}
                    title={color}
                  />
                ))}
              </div>
              <div className="category-form__actions">
                <Button onClick={handleCreate} variant="primary">
                  Erstellen
                </Button>
                <Button
                  onClick={() => {
                    setIsCreating(false);
                    setNewCategory({ name: "", color: PRESET_COLORS[0] });
                    setError("");
                  }}
                  variant="secondary"
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Category List */}
        <div className="category-manager__list">
          <h3>Bestehende Kategorien</h3>
          {categories.length === 0 ? (
            <p className="category-manager__empty">
              Noch keine Kategorien vorhanden
            </p>
          ) : (
            <div className="category-list">
              {categories.map((category) => (
                <div key={category.id} className="category-item">
                  {editingId === category.id ? (
                    <div className="category-form">
                      <Input
                        type="text"
                        placeholder="Kategoriename"
                        value={editingCategory.name}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            name: e.target.value,
                          })
                        }
                      />
                      <div className="category-form__colors">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            className={`category-form__color-btn ${
                              editingCategory.color === color ? "active" : ""
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() =>
                              setEditingCategory({
                                ...editingCategory,
                                color,
                              })
                            }
                            title={color}
                          />
                        ))}
                      </div>
                      <div className="category-form__actions">
                        <Button
                          onClick={() => handleUpdate(category.id)}
                          variant="primary"
                        >
                          Speichern
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingId(null);
                            setError("");
                          }}
                          variant="secondary"
                        >
                          Abbrechen
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
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
                          className="category-item__edit-btn"
                          onClick={() => startEditing(category)}
                          aria-label="Bearbeiten"
                        >
                          <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          className="category-item__delete-btn"
                          onClick={() => handleDelete(category.id)}
                          aria-label="Löschen"
                        >
                          <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoryManager;
