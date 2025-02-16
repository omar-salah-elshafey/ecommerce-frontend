export interface PaginatedResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  items: T[];
}
