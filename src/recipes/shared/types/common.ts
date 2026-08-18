export type ID = string | number;

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
