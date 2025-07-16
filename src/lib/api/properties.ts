import axios from './axios';

export interface Property {
  _id: string;
  propertyName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  status: string;
  apartmentCount: number;
  unitsLeft: number;
  file?: string;
  preferredTenants?: string[];
  apartments?: Apartment[];
  createdBy: {
    firstName: string;
    lastName: string;
    email: string;
    file?: string;
    phoneNumber?: string;
    accountType?: string;
  };
  createdAt: string;
}

export interface Apartment {
  _id: string;
  roomId: number;
  description: string;
  rentAmountMetrics?: string;
  rentAmount?: number;
  noOfRooms?: string;
  noOfBaths?: string;
  apartmentStyle?: string;
  leaseTerms?: string;
  paymentOption?: string;
  otherAmentities?: string[];
  listRoom?: boolean;
  assignedToTenant?: boolean;
  propertyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FetchPropertiesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  propertyType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PropertiesResponse {
  status: string;
  message: string;
  data: Property[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export const fetchProperties = async (params: FetchPropertiesParams = {}): Promise<PropertiesResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.status) queryParams.append('status', params.status);
  if (params.propertyType) queryParams.append('propertyType', params.propertyType);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const response = await axios.get(`/properties/all?${queryParams.toString()}`);
  return response.data;
};

export const fetchPropertyById = async (id: string): Promise<Property> => {
  const response = await axios.get(`/properties/single/${id}`);
  return response.data;
};

export const updateProperty = async (id: string, propertyData: Partial<Property>): Promise<Property> => {
  const response = await axios.patch(`/properties/update?propertyId=${id}`, propertyData);
  return response.data;
};

export const deleteProperty = async (id: string): Promise<void> => {
  await axios.delete(`/properties/${id}`);
}; 