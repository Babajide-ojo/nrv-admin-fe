import axios from './axios';

export interface DashboardMetrics {
  totalVerifications: number;
  totalUsers: number;
  totalProperties: number;
  totalPendingReports: number;
}

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  // Fetch all metrics in parallel
  const [verRes, userRes, propRes, pendingRes] = await Promise.all([
    axios.get('/verification?page=1&limit=1'),
    axios.get('/users?page=1&limit=1'),
    axios.get('/properties/all?page=1&limit=1'),
    axios.get('/verification?status=pending&page=1&limit=1'),
  ]);
  return {
    totalVerifications: verRes.data.pagination?.total || 0,
    totalUsers: userRes.data.pagination?.total || 0,
    totalProperties: propRes.data.pagination?.total || 0,
    totalPendingReports: pendingRes.data.pagination?.total || 0,
  };
}; 