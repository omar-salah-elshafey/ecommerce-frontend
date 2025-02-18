export interface CartItemsDto {
  id: string;
  productId: string;
  name: string;
  imageUrl: string;
  quantity: number;
  stock: number;
  maxOrderQuantity: number;
  productPrice: number;
  totalPrice: number;
}

export interface CartItemChangeDto {
  productId: string;
  quantity: number;
}

export interface CartDto {
  id: string;
  userId: string;
  items: CartItemsDto[];
  totalCartPrice: number;
}
