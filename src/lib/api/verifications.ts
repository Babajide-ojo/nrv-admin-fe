import api from './axios';

export interface Verification {
  id: string;
  userId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  // Add more fields as needed
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface FetchVerificationsParams {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface FetchVerificationsResponse {
  status: string;
  message: string;
  data: Verification[];
  pagination?: unknown;
}

export const fetchVerifications = async (params: FetchVerificationsParams = {}): Promise<FetchVerificationsResponse> => {
  const { page = 1, limit = 10, ...rest } = params;
  const response = await api.get('/verification', {
    params: { ...rest, page, limit },
  });
  return response.data;
};

export const fetchVerificationById = async (id: string): Promise<Verification> => {
  const response = await api.get(`/verification/${id}`);
  return response.data.data;
};

export const fetchVerificationResponsesByVerificationId = async (verificationId: string) => {
  const response = await api.get(`/verification/response/by-verification/${verificationId}`);
  return response.data.data;
};

export const updatePersonalReport = async (id: string, report: { status: string; comment: string; reviewedBy: string; reviewedAt: Date }) => {
  const response = await api.patch(`/verification/response/${id}/personal-report`, report);
  return response.data.data;
};

export const updateEmploymentReport = async (id: string, report: { status: string; comment: string; reviewedBy: string; reviewedAt: Date }) => {
  const response = await api.patch(`/verification/response/${id}/employment-report`, report);
  return response.data.data;
};

export const updateGuarantorReport = async (id: string, report: { status: string; comment: string; reviewedBy: string; reviewedAt: Date }) => {
  const response = await api.patch(`/verification/response/${id}/guarantor-report`, report);
  return response.data.data;
};

export const updateDocumentsReport = async (id: string, report: { status: string; comment: string; reviewedBy: string; reviewedAt: Date }) => {
  const response = await api.patch(`/verification/response/${id}/documents-report`, report);
  return response.data.data;
};

export const verifyPhoneNumber = async (responseId: string, phone: string) => {
  const response = await api.post(`/verification/phone-verify/${responseId}`, { phone });
  return response.data.data;
}; 