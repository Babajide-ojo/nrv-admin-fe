import axios from './axios';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  accountType: 'landlord' | 'tenant';
  status: string;
  isOnboarded: boolean;
  createdAt: string;
}

export interface FetchUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UsersResponse {
  status: string;
  message: string;
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export const fetchUsers = async (params: FetchUsersParams = {}): Promise<UsersResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.role) queryParams.append('role', params.role);
  if (params.status) queryParams.append('status', params.status);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const response = await axios.get(`/users?${queryParams.toString()}`);
  return response.data;
};

export const fetchUserById = async (id: string): Promise<User> => {
  const response = await axios.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  const response = await axios.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await axios.delete(`/users/${id}`);
}; 