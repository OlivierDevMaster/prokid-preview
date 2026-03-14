export interface PaginationOptions {
  enabled?: boolean;
  limit?: number;
  page?: number;
}

export interface PaginationResult<T> {
  count: number;
  data: T[];
}
