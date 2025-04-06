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
  sku: string;
  isFeatured: boolean;
  salesCount: number;
  categoryId: string;
  categoryName: string;
  images: ProductImage[];
  mainImageUrl: string;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stock: number;
  maxOrderQuantity: number;
  sku: string;
  isFeatured: boolean;
  images: File[];
  categoryId: string;
}

export interface UpdateProductDto {
  name: string;
  description: string;
  price: number;
  stock: number;
  maxOrderQuantity: number;
  isFeatured: boolean;
  imagesToDelete: string[];
  newImages: File[];
  categoryId?: string;
}
