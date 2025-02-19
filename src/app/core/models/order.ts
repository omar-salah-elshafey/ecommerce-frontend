export interface CityDto {
  id: string;
  name: string;
}

export interface CreateOrderDto {
  phoneNumber: string;
  governorateId: string;
  cityId: string;
  region: string;
}

export interface GovernorateDto {
  id: string;
  name: string;
  cities: CityDto[];
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
  userName: string;
}

export interface OrderItemDto {
  id: string;
  productId: string;
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

export const OrderStatusLabels: { [key in OrderStatus]: string } = {
  [OrderStatus.Pending]: 'قيد الانتظار',
  [OrderStatus.Processing]: 'جاري التجهيز',
  [OrderStatus.Shipped]: 'تم الشحن',
  [OrderStatus.Delivered]: 'تم التسليم',
  [OrderStatus.Cancelled]: 'ملغى',
};

export interface UpdateOrderStatusDto {
  orderId: string;
  newStatus: OrderStatus;
}
