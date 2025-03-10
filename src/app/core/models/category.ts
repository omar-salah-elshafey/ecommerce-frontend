export interface CategoryDto {
  id: string;
  name: string;
  parentCategoryId?: string;
  parentCategoryName?: string;
  subCategories?: CategoryDto[];
}

export interface AddCategoryDto {
  name: string;
  parentCategoryId?: string;
}

export interface UpdateCategoryDto {
  name: string;
  parentCategoryId?: string;
  clearParentCategory: boolean;
}
