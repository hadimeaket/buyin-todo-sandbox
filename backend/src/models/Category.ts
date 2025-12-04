/**
 * Category Type Definitions
 *
 * Categories allow users to organize todos with colors
 */

export interface Category {
  id: string;
  name: string;
  color: string; // HEX format: #RRGGBB
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
