export interface ReviewDto {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface CreateReviewDto {
  productId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewDto {
  rating: number;
  comment: string;
}
