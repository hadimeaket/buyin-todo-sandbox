export interface Category {
  id: string;
  name: string;
  color: string; // Hex color code like "#FF5733"
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryDto {
  name: string;
  color: string;
}

export interface UpdateCategoryDto {
  name?: string;
  color?: string;
}
