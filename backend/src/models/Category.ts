export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string; // HEX color code, e.g., "#FF5733"
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
