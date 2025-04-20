export interface CreateOrderDto {
  phoneNumber: string;
  addressId?: string;
  governorateId: string;
  cityId: string;
  region: string;
}

export interface OrderDto {
  id: string;
  orderDate: Date;
  totalAmount: number;
  status: string;
  addressId: string;
  governorate: string;
  city: string;
  region: string;
  items: OrderItemDto[];
  userFullName: string;
  phoneNumber: string;
}

export interface OrderItemDto {
  id: string;
  productId: string;
  name: string;
  imageUrl: string;
  quantity: number;
  snapShotPrice: number;
}

export enum OrderStatus {
  Pending = 1,
  Processing,
  Shipped,
  Delivered,
  Cancelled,
}

export interface UpdateOrderStatusDto {
  orderId: string;
  newStatus: OrderStatus;
}
