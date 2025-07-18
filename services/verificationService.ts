import axios, { AxiosResponse } from 'axios';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9000';

console.log(API);



// --- Types ---
export interface Verification {
  id: string;
  userId: string;
  status: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface VerificationListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  [key: string]: any;
}

export interface VerificationListResponse {
  data: Verification[];
  total: number;
  page: number;
  limit: number;
}

export interface NinParams { nin: string; }
export interface BvnParams { bvn: string; }
export interface PhoneParams { phone: string; }
export interface DlParams { dl: string; }
export interface VinParams { vin: string; }
export interface ByEmailParams { email: string; }

export interface EmploymentPayload { [key: string]: any; }
export interface GuarantorPayload { [key: string]: any; }
export interface AffordabilityPayload { [key: string]: any; }
export interface AmlPayload { [key: string]: any; }
export interface TenantVerificationPayload { [key: string]: any; }
export interface CreateVerificationPayload { [key: string]: any; }

export interface VerificationResponse {
  id: string;
  verificationId: string;
  result: string;
  createdAt: string;
  [key: string]: any;
}

export const verificationService = {
  list: (params: VerificationListQuery) => axios.get<VerificationListResponse>(`${API}/verification`, { params }),
  getById: (id: string) => axios.get<Verification>(`${API}/verification/${id}`),
  verifyNIN: (params: NinParams) => axios.get<any>(`${API}/verification/nin-basic`, { params }),
  verifyBVN: (params: BvnParams) => axios.get<any>(`${API}/verification/bvn`, { params }),
  verifyPhone: (params: PhoneParams) => axios.get<any>(`${API}/verification/phone-basic`, { params }),
  verifyDL: (params: DlParams) => axios.get<any>(`${API}/verification/dl-basic`, { params }),
  verifyVIN: (params: VinParams) => axios.get<any>(`${API}/verification/vin-basic`, { params }),
  verifyEmployment: (id: string, data: EmploymentPayload) => axios.patch<any>(`${API}/verification/${id}/employment`, data),
  verifyGuarantor: (id: string, data: GuarantorPayload) => axios.patch<any>(`${API}/verification/${id}/guarantor`, data),
  verifyAffordability: (id: string, data: AffordabilityPayload) => axios.post<any>(`${API}/verification/${id}/affordability`, data),
  amlScreening: (data: AmlPayload) => axios.post<any>(`${API}/verification/aml-screening`, data),
  getResponse: (id: string) => axios.get<VerificationResponse>(`${API}/verification/response/${id}`),
  getResponseByUser: (userId: string) => axios.get<VerificationResponse[]>(`${API}/verification/response/user/${userId}`),
  getResponseByRequest: (verificationId: string) => axios.get<VerificationResponse[]>(`${API}/verification/response/by-request/${verificationId}`),
  getStatuses: () => axios.get<string[]>(`${API}/verification/statuses`),
  getByEmail: (params: ByEmailParams) => axios.get<Verification>(`${API}/verification/by-email`, { params }),
  createTenantVerification: (data: TenantVerificationPayload) => axios.post<any>(`${API}/verification/tenant`, data),
  create: (data: CreateVerificationPayload) => axios.post<any>(`${API}/verification`, data),
}; 