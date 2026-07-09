import api from './axios';

export interface Role {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  permissions?: string[];
}

export interface CreateRolePayload {
  name: string;
  slug: string;
  description?: string;
  permissions?: string[];
}

export interface RolesResponse {
  status: string;
  message: string;
  data: Role[];
}

export const fetchRoles = async (): Promise<Role[]> => {
  const response = await api.get<RolesResponse>('/staff/roles');
  return response.data.data;
};

export const createRole = async (payload: CreateRolePayload): Promise<Role> => {
  const response = await api.post<{ status: string; data: Role }>('/staff/roles', payload);
  return response.data.data;
};

export const fetchRoleById = async (id: string): Promise<Role> => {
  const response = await api.get<{ status: string; data: Role }>(`/staff/roles/${id}`);
  return response.data.data;
};
