export interface WishlistItemDto {
  id: string;
  productId: string;
  name: string;
  imageUrl: string;
  productPrice: number;
  stock: number;
  addedAt: Date;
}

export interface WishlistDto {
  id: string;
  userId: string;
  items: WishlistItemDto[];
}
