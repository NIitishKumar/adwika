export interface FitSize {
  id: string; // UniqueID
  uniqueId?: string;
  name: string;
  fitCode: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFitSizeDto {
  name: string;
  fitCode: string;
  displayOrder: number;
  isActive?: boolean;
}

export type UpdateFitSizeDto = Partial<CreateFitSizeDto>;

export interface FitSizeApiResponse<T = FitSize> {
  message: string;
  data: T;
}

export type FitSizeStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export type FitSizeSortField = 'displayOrder' | 'name' | 'fitCode';

export type SortDirection = 'asc' | 'desc';
