import api from './axios';

export type OnboardingStatus = 'pending' | 'invited' | 'onboarded' | 'deactivated';

export interface StaffRole {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Staff {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roleId: string | StaffRole;
  onboardingStatus: OnboardingStatus;
  status: string;
  invitedBy?: string;
  invitedAt?: string;
  onboardedAt?: string;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface FetchStaffParams {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  onboardingStatus?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StaffListResponse {
  status: string;
  message: string;
  data: Staff[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateStaffPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roleId: string;
  password?: string;
  onboardingStatus?: OnboardingStatus;
}

export interface UpdateStaffPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  roleId?: string;
  password?: string;
  onboardingStatus?: OnboardingStatus;
  status?: string;
}

export interface OnboardStaffPayload {
  password: string;
}

export const fetchStaff = async (params: FetchStaffParams = {}): Promise<StaffListResponse> => {
  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set('page', String(params.page));
  if (params.limit != null) searchParams.set('limit', String(params.limit));
  if (params.search) searchParams.set('search', params.search);
  if (params.roleId) searchParams.set('roleId', params.roleId);
  if (params.onboardingStatus) searchParams.set('onboardingStatus', params.onboardingStatus);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  const response = await api.get<StaffListResponse>(`/staff?${searchParams.toString()}`);
  return response.data;
};

export const fetchStaffById = async (id: string): Promise<Staff> => {
  const response = await api.get<{ status: string; data: Staff }>(`/staff/${id}`);
  return response.data.data;
};

export const createStaff = async (payload: CreateStaffPayload): Promise<Staff> => {
  const response = await api.post<{ status: string; data: Staff }>('/staff', payload);
  return response.data.data;
};

export const updateStaff = async (id: string, payload: UpdateStaffPayload): Promise<Staff> => {
  const response = await api.patch<{ status: string; data: Staff }>(`/staff/${id}`, payload);
  return response.data.data;
};

export const onboardStaff = async (id: string, payload: OnboardStaffPayload): Promise<Staff> => {
  const response = await api.post<{ status: string; data: Staff }>(`/staff/${id}/onboard`, payload);
  return response.data.data;
};

export const deleteStaff = async (id: string): Promise<void> => {
  await api.delete(`/staff/${id}`);
};
