export interface CategoryDto {
  id: string;
  name: string;
  parentCategoryId?: string;
  parentCategoryName?: string;
  subCategories?: CategoryDto[];
}
