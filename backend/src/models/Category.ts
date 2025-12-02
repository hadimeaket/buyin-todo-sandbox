export interface Category {
  id: string;
  name: string;
  color: string; // Hex color code (e.g., "#FF5733")
  userId: string;
  createdAt: string;
}

export interface CreateCategoryDto {
  name: string;
  color: string;
}

export interface UpdateCategoryDto {
  name?: string;
  color?: string;
}
