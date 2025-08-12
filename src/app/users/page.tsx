'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Users, UserCheck, Building, Mail, Phone } from 'lucide-react';
import AdminSidebarLayout from '@/components/layout/AdminSidebarLayout';
import DataTable, { ColumnConfig } from '@/components/ui/DataTable';
import { useState, useEffect } from 'react';

interface User {
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

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Replace with your actual API call
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  const getUserTypeBadge = (accountType: string | undefined | null) => {
    if (!accountType) {
      return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
    switch (accountType.toLowerCase()) {
      case 'landlord':
        return <Badge className="bg-purple-100 text-purple-800">Landlord</Badge>;
      case 'tenant':
        return <Badge className="bg-green-100 text-green-800">Tenant</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{accountType}</Badge>;
    }
  };

  const getStatusBadge = (status: string | undefined | null) => {
    if (!status) {
      return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const columns: ColumnConfig<User>[] = [
    {
      key: 'name' as any,
      label: 'User',
      render: (_value, row) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-green-600" />
          </div>
          <div className="ml-3">
            <p className="font-medium text-gray-900">{row.firstName} {row.lastName}</p>
            <p className="text-sm text-gray-500">ID: {row._id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (_value, row) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <Mail className="w-3 h-3 text-gray-400 mr-2" />
            {row.email}
          </div>
          <div className="flex items-center text-sm">
            <Phone className="w-3 h-3 text-gray-400 mr-2" />
            {row.phoneNumber}
          </div>
        </div>
      ),
    },
    {
      key: 'accountType',
      label: 'Type',
      render: (value, _row) => getUserTypeBadge(typeof value === 'string' ? value : ''),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, _row) => getStatusBadge(typeof value === 'string' ? value : ''),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (value, _row) => typeof value === 'string' ? new Date(value).toLocaleDateString() : '',
    },
    {
      key: 'actions_user' as any,
      label: 'Actions',
      render: () => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
            <Eye className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminSidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600 mt-1">Manage tenants and landlords</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Users className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{columns.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Landlords</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.accountType === 'landlord').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tenants</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.accountType === 'tenant').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <DataTable
          endpoint="/users"
          columns={columns}
          searchTerm={true}
          className="bg-white/60 backdrop-blur-lg rounded-2xl border-0 shadow-lg"
          initialPageSize={10}
        />
      </div>
    </AdminSidebarLayout>
  );
};

export default UsersPage; 