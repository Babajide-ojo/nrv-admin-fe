'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Eye, 
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  Mail,
} from 'lucide-react';
import AdminSidebarLayout from '@/components/layout/AdminSidebarLayout';
import Link from 'next/link';

interface VerificationResponse {
  _id: string;
  verificationId: string;
  fullName: string;
  email: string;
  phone: string;
  personalReport?: {
    status: string;
    comment: string;
    reviewedBy: string;
    reviewedAt: Date;
  };
  employmentReport?: {
    status: string;
    comment: string;
    reviewedBy: string;
    reviewedAt: Date;
  };
  guarantorReport?: {
    status: string;
    comment: string;
    reviewedBy: string;
    reviewedAt: Date;
  };
  documentsReport?: {
    status: string;
    comment: string;
    reviewedBy: string;
    reviewedAt: Date;
  };
  phoneVerificationResult?: any;
  createdAt: string;
  updatedAt: string;
}

const VerificationResponsesPage = () => {
  const [responses, setResponses] = useState<VerificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadResponses = async () => {
      try {
        // For now, we'll load responses for a specific verification ID
        // In a real app, you'd have an endpoint to get all responses
        const mockResponses: VerificationResponse[] = [
          {
            _id: '1',
            verificationId: 'verification1',
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+2348012345678',
            personalReport: {
              status: 'approved',
              comment: 'Personal information verified successfully',
              reviewedBy: 'Admin User',
              reviewedAt: new Date()
            },
            employmentReport: {
              status: 'pending',
              comment: 'Employment verification in progress',
              reviewedBy: 'Admin User',
              reviewedAt: new Date()
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: '2',
            verificationId: 'verification2',
            fullName: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '+2348098765432',
            personalReport: {
              status: 'rejected',
              comment: 'Personal information incomplete',
              reviewedBy: 'Admin User',
              reviewedAt: new Date()
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        setResponses(mockResponses);
      } catch (error) {
        console.error('Error fetching verification responses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResponses();
  }, []);

  const getReportStatusBadge = (status: string) => {
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

  const getOverallStatus = (response: VerificationResponse) => {
    const reports = [
      response.personalReport?.status,
      response.employmentReport?.status,
      response.guarantorReport?.status,
      response.documentsReport?.status
    ].filter(Boolean);

    if (reports.length === 0) return 'pending';
    if (reports.every(status => status === 'approved')) return 'approved';
    if (reports.some(status => status === 'rejected')) return 'rejected';
    return 'pending';
  };

  const filteredResponses = responses.filter(response => {
    const matchesSearch = response.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.email.toLowerCase().includes(searchTerm.toLowerCase());
    const overallStatus = getOverallStatus(response);
    const matchesStatus = statusFilter === 'all' || overallStatus === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: responses.length,
    approved: responses.filter(r => getOverallStatus(r) === 'approved').length,
    rejected: responses.filter(r => getOverallStatus(r) === 'rejected').length,
    pending: responses.filter(r => getOverallStatus(r) === 'pending').length
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
            <h1 className="text-3xl font-bold text-gray-900">Verification Responses</h1>
            <p className="text-gray-600 mt-1">Review and manage verification responses</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Responses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="pending">Pending</option>
                </select>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Responses</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredResponses.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No verification responses found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Personal</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Employment</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Guarantor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Documents</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Overall Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResponses.map((response) => (
                      <tr key={response._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="ml-3">
                              <p className="font-medium text-gray-900">{response.fullName}</p>
                              <div className="flex items-center text-sm text-gray-500">
                                <Mail className="w-3 h-3 mr-1" />
                                {response.email}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Phone className="w-3 h-3 mr-1" />
                                {response.phone}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {response.personalReport ? (
                            getReportStatusBadge(response.personalReport.status)
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">Not Submitted</Badge>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {response.employmentReport ? (
                            getReportStatusBadge(response.employmentReport.status)
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">Not Submitted</Badge>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {response.guarantorReport ? (
                            getReportStatusBadge(response.guarantorReport.status)
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">Not Submitted</Badge>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {response.documentsReport ? (
                            getReportStatusBadge(response.documentsReport.status)
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">Not Submitted</Badge>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {getReportStatusBadge(getOverallStatus(response))}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Link href={`/verifications/${response._id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Button>
                            </Link>
                            <Button size="sm" variant="outline">
                              <FileText className="w-4 h-4 mr-1" />
                              Report
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminSidebarLayout>
  );
};

export default VerificationResponsesPage; 