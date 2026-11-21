export type AddressType = 'HOME' | 'WORK' | 'OTHER';

export interface UserAddress {
  id: string;
  _id?: string;
  uniqueId?: string;
  userId?: string;
  name: string;
  phone: string;
  alternatePhone?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  addressType: AddressType;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressDto {
  name: string;
  phone: string;
  alternatePhone?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  addressType?: AddressType;
  isDefault?: boolean;
}

export interface UpdateAddressDto extends Partial<CreateAddressDto> {}

export interface AddressResponse<T = UserAddress> {
  message: string;
  data: T;
}

export interface AddressListResponse {
  message: string;
  data: UserAddress[];
}
