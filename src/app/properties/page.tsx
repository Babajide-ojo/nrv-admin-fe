'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building,
  MapPin,
  Users,
  Home
} from 'lucide-react';
import AdminSidebarLayout from '@/components/layout/AdminSidebarLayout';
import { fetchProperties } from '@/lib/api/properties';
import DataTable, { ColumnConfig } from '@/components/ui/DataTable';

interface Property {
  _id: string;
  propertyName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType?: string;
  status?: string;
  apartmentCount?: number;
  unitsLeft?: number;
  createdBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

const PropertiesPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const response = await fetchProperties();
        setProperties(response.data);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  const getPropertyTypeBadge = (type: string | null | undefined) => {
    if (!type) {
      return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
    
    switch (type.toLowerCase()) {
      case 'apartment':
        return <Badge className="bg-green-100 text-green-800">Apartment</Badge>;
      case 'house':
        return <Badge className="bg-green-100 text-green-800">House</Badge>;
      case 'commercial':
        return <Badge className="bg-purple-100 text-purple-800">Commercial</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string | null | undefined) => {
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



  const columns: ColumnConfig<Property>[] = [
    {
      key: 'propertyName',
      label: 'Property',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <Building className="w-4 h-4 text-green-600" />
          </div>
          <div className="ml-3">
            <p className="font-medium text-gray-900">{row.propertyName}</p>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-3 h-3 mr-1" />
              {row.streetAddress}, {row.city}, {row.state}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'createdBy',
      label: 'Owner',
      render: (value, row) => (
        row.createdBy ? (
          <div>
            <p className="font-medium text-gray-900">
              {row.createdBy.firstName} {row.createdBy.lastName}
            </p>
            <p className="text-sm text-gray-500">{row.createdBy.email}</p>
          </div>
        ) : (
          <span className="text-gray-400">No owner</span>
        )
      ),
    },
    {
      key: 'propertyType',
      label: 'Type',
      render: (value) => getPropertyTypeBadge(value as string),
    },
    {
      key: 'apartmentCount',
      label: 'Units',
      render: (value, row) => (
        <div className="text-sm">
          <p className="font-medium">{((row.apartmentCount || 0) - (row.unitsLeft || 0))}/{row.apartmentCount || 0}</p>
          <p className="text-gray-500">occupied</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => getStatusBadge(value as string),
    },
  ];

  const handleRowClick = (property: Property) => {
    if (property._id) {
      window.location.href = `/properties/${property._id}`;
    }
  };

  const stats = {
    total: properties.length,
    active: properties.filter(p => p.status?.toLowerCase() === 'active').length,
    apartments: properties.filter(p => p.propertyType?.toLowerCase() === 'apartment').length,
    totalUnits: properties.reduce((sum, p) => sum + (p.apartmentCount || 0), 0),
    occupiedUnits: properties.reduce((sum, p) => sum + ((p.apartmentCount || 0) - (p.unitsLeft || 0)), 0)
  };

  if (loading) {
    return (
      <AdminSidebarLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
            <p className="text-gray-600 mt-1">Manage all properties and units</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Building className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Building className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Home className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
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
                  <p className="text-sm font-medium text-gray-600">Apartments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.apartments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Units</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUnits}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Occupied</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.occupiedUnits}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>



        {/* Properties Table */}
        <Card>
          <CardHeader>
            <CardTitle>Property Management</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              endpoint="/properties/all"
              columns={columns}
              filters={[
                {
                  name: 'propertyType',
                  label: 'Property Type',
                  options: [
                    { value: 'all', label: 'All Types' },
                    { value: 'apartment', label: 'Apartments' },
                    { value: 'house', label: 'Houses' },
                    { value: 'commercial', label: 'Commercial' },
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

export default PropertiesPage; 