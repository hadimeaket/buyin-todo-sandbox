export interface Category {
  id: string;
  name: string;
  color: string; // Hex color code like "#FF5733"
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  color: string;
}

export interface UpdateCategoryDto {
  name?: string;
  color?: string;
}
