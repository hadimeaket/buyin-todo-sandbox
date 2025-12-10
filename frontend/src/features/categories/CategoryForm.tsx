import { useState, type FormEvent } from "react";
import type { CreateCategoryDto, Category } from "../../types/category";
import { Input, Button } from "../../components/ui";
import "./CategoryForm.scss";

interface CategoryFormProps {
  onSubmit: (data: CreateCategoryDto) => Promise<void>;
  onCancel: () => void;
  initialData?: Category;
}

export function CategoryForm({
  onSubmit,
  onCancel,
  initialData,
}: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [color, setColor] = useState(initialData?.color || "#FF5733");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    // Validate HEX color
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(color)) {
      setError("Invalid color format. Please use HEX format (e.g., #FF5733)");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), color: color.toUpperCase() });
      setName("");
      setColor("#FF5733");
    } catch (err: any) {
      setError(err.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="category-form">
      <h2 className="category-form__title">
        {initialData ? "Edit Category" : "New Category"}
      </h2>
      <form onSubmit={handleSubmit} className="category-form__form">
        <div className="category-form__field">
          <label htmlFor="category-name" className="category-form__label">
            Name
          </label>
          <Input
            id="category-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Work, Personal, Shopping"
            maxLength={50}
            disabled={isSubmitting}
          />
        </div>

        <div className="category-form__field">
          <label htmlFor="category-color" className="category-form__label">
            Color
          </label>
          <div className="category-form__color-input">
            <input
              id="category-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="category-form__color-picker"
              disabled={isSubmitting}
            />
            <span className="category-form__color-text">{color}</span>
          </div>
        </div>

        {error && <div className="category-form__error">{error}</div>}

        <div className="category-form__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
            className="category-form__button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="category-form__button"
          >
            {isSubmitting ? "Saving..." : initialData ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
}
