'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  User
} from 'lucide-react';
import AdminSidebarLayout from '@/components/layout/AdminSidebarLayout';
import { fetchVerifications, Verification } from '@/lib/api/verifications';
import DataTable, { ColumnConfig } from '@/components/ui/DataTable';
import { useRouter } from 'next/navigation';
import * as LabelPrimitive from "@radix-ui/react-label";

interface VerificationWithUser extends Verification {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  requestedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const VerificationsPage = () => {
  const [verifications, setVerifications] = useState<VerificationWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadVerifications = async () => {
      try {
        const res = await fetchVerifications();
        setVerifications(res.data || []);
      } catch (error) {
        console.error('Error fetching verifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVerifications();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const columns: ColumnConfig<VerificationWithUser>[] = [
    {
      key: 'firstName',
      label: 'User',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="font-medium text-gray-900">
              {row.firstName || 'Unknown'} {row.lastName || 'User'}
            </p>
            <p className="text-sm text-gray-500">{row.email || 'No email'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Type',
      render: () => <Badge variant="outline">Tenant Verification</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => getStatusBadge(value as string),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value) => (
        <span className="text-sm text-gray-500">
          {new Date(value as string).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const handleRowClick = (verification: VerificationWithUser) => {
    if (verification._id) {
      router.push(`/verifications/${verification._id}`);
    }
  };

  const stats = {
    total: verifications.length,
    pending: verifications.filter(v => v.status?.toLowerCase() === 'pending').length,
    approved: verifications.filter(v => v.status?.toLowerCase() === 'approved').length,
    rejected: verifications.filter(v => v.status?.toLowerCase() === 'rejected').length,
  };

  if (loading) {
    return (
      <AdminSidebarLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminSidebarLayout>
    );
  }

  return (
    <AdminSidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Verifications</h1>
            <p className="text-gray-600 mt-1">Manage user verification requests</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Shield className="w-4 h-4 mr-2" />
            New Verification
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verifications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              endpoint="/verification"
              columns={columns}
              filters={[
                {
                  name: 'status',
                  label: 'Status',
                  options: [
                    { value: 'all', label: 'All Status' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'rejected', label: 'Rejected' },
                  ],
                },
              ]}
              onRowClick={handleRowClick}
              className="shadow-none border-0"
            />
          </CardContent>
        </Card>
      </div>
    </AdminSidebarLayout>
  );
};

export default VerificationsPage; 