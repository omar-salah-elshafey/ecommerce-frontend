export interface ProductImage {
  id: string;
  imageUrl: string;
  isMain: boolean;
}

export interface ProductDto {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  maxOrderQuantity: number;
  SKU: string;
  isFeatured: boolean;
  salesCount: number;
  categoryId: string;
  categoryName: string;
  images: ProductImage[];
  mainImageUrl: string;
}
