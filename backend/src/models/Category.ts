export interface Category {
  id: string;
  name: string;
  color: string; // HEX color format (#RRGGBB)
  userId: string;
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
