export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string; // HEX format: #RRGGBB
  created_at: Date;
  updated_at: Date;
}

export interface CreateCategoryDto {
  name: string;
  color: string;
}

export interface UpdateCategoryDto {
  name?: string;
  color?: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  color: string;
  created_at: Date;
  updated_at: Date;
}
