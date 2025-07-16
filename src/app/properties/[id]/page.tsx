'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AdminSidebarLayout from '@/components/layout/AdminSidebarLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchPropertyById, Property, Apartment } from '@/lib/api/properties';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Home } from 'lucide-react';

const PropertyDetailsPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchPropertyById(id)
      .then((data: any) => setProperty(data.data))
      .catch(() => setError('Failed to load property details.'))
      .finally(() => setLoading(false));
  }, [id]);

  const getPropertyTypeBadge = (type: string | null | undefined) => {
    if (!type) return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    switch (type.toLowerCase()) {
      case 'apartment':
        return <Badge className="bg-blue-100 text-blue-800">Apartment</Badge>;
      case 'house':
        return <Badge className="bg-green-100 text-green-800">House</Badge>;
      case 'commercial':
        return <Badge className="bg-purple-100 text-purple-800">Commercial</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>;
    }
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

  if (error || !property) {
    return (
      <AdminSidebarLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600 text-lg font-medium">{error || 'Property not found.'}</div>
        </div>
      </AdminSidebarLayout>
    );
  }

  return (
    <AdminSidebarLayout>
      <div className="max-w-5xl mx-auto py-10 px-2 md:px-0">
        {/* Property Image Banner */}
        {property.file && (
          <div className="relative w-full h-56 md:h-72 rounded-2xl overflow-hidden mb-8 shadow-lg border border-slate-100 bg-white flex items-center justify-center">
            <img
              src={property.file}
              alt="Property"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-transparent to-transparent" />
          </div>
        )}
        <Card className="shadow-2xl border-0 bg-white/60 backdrop-blur-lg rounded-3xl border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-4xl font-extrabold text-blue-900 tracking-tight drop-shadow-lg">
              <Building className="text-blue-500 text-5xl" />
              {property.propertyName || (property.apartments && property.apartments[0]?.description) || 'Unnamed Property'}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {getPropertyTypeBadge(property.propertyType)}
              <Badge className="bg-gray-100 text-gray-800 capitalize shadow-sm">{property.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-10">
              {/* Owner/Landlord Info */}
              <div className="md:w-1/3 flex flex-col items-center bg-white/80 rounded-2xl p-8 border border-slate-100 shadow-md">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 mb-4 bg-slate-100 flex items-center justify-center">
                  <img
                    src={property.createdBy && property.createdBy.file ? property.createdBy.file : property.file || '/default-avatar.png'}
                    alt="Owner"
                    className="object-cover w-full h-full"
                    onError={e => (e.currentTarget.src = '/default-avatar.png')}
                  />
                </div>
                <div className="font-extrabold text-2xl text-blue-900 mb-1 tracking-tight drop-shadow-sm">
                  {property.createdBy ? `${property.createdBy.firstName} ${property.createdBy.lastName}` : 'N/A'}
                </div>
                <div className="text-sm text-gray-500 mb-1">{property.createdBy && property.createdBy.email ? property.createdBy.email : ''}</div>
                <div className="text-sm text-gray-500 mb-1">{property.createdBy && property.createdBy.phoneNumber ? property.createdBy.phoneNumber : ''}</div>
                {property.createdBy && property.createdBy.accountType && (
                  <Badge className="bg-blue-100 text-blue-800 mt-1 capitalize shadow">{property.createdBy.accountType}</Badge>
                )}
              </div>
              {/* Property Info */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-2 text-gray-700 text-lg">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <span>{property.streetAddress}, {property.city}, {property.state}, {property.zipCode}</span>
                </div>
                {property.apartments && property.apartments[0]?.description && (
                  <div className="text-gray-700 text-base">
                    <span className="font-semibold">Description:</span> {property.apartments[0].description}
                  </div>
                )}
                {property.apartments?.[0]?.apartmentStyle && (
                  <div className="text-gray-700 text-base">
                    <span className="font-semibold">Style:</span> {property.apartments[0].apartmentStyle}
                  </div>
                )}
                {property.apartments?.[0]?.leaseTerms && (
                  <div className="text-gray-700 text-base">
                    <span className="font-semibold">Lease Terms:</span> {property.apartments[0].leaseTerms}
                  </div>
                )}
                {property.apartments?.[0]?.paymentOption && (
                  <div className="text-gray-700 text-base">
                    <span className="font-semibold">Payment Option:</span> {property.apartments[0].paymentOption}
                  </div>
                )}
                {property.apartments?.[0]?.rentAmount && (
                  <div className="text-gray-700 text-base">
                    <span className="font-semibold">Rent:</span> ₦{property.apartments[0].rentAmount.toLocaleString()} {property.apartments[0].rentAmountMetrics || ''}
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-700 text-base">
                  <Home className="w-5 h-5 text-blue-400" />
                  <span>Units: {property.apartmentCount} (Occupied: {property.apartmentCount && property.unitsLeft !== undefined ? property.apartmentCount - property.unitsLeft : 0})</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 text-base">
                  <span className="font-semibold">Units Left:</span>
                  <span>{property.unitsLeft}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 text-base">
                  <span className="font-semibold">Created At:</span>
                  <span>{property.createdAt ? new Date(property.createdAt).toLocaleString() : 'N/A'}</span>
                </div>
                {Array.isArray(property.apartments?.[0]?.otherAmentities) && property.apartments[0].otherAmentities.length > 0 && (
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">Amenities:</div>
                    <div className="flex flex-wrap gap-2">
                      {property.apartments[0].otherAmentities.map((a: string) => (
                        <Badge key={a} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <span className="inline-block w-3 h-3 bg-blue-400 rounded-full mr-1" />
                          {a}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {Array.isArray(property.preferredTenants) && property.preferredTenants.length > 0 && (
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">Preferred Tenants:</div>
                    <div className="flex flex-wrap gap-2">
                      {property.preferredTenants.map((t: string) => (
                        <Badge key={t} className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-1" />
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="border-t border-slate-200 my-6" />
              </div>
            </div>
            {/* Apartments/Rooms */}
            {Array.isArray(property.apartments) && property.apartments.length > 0 && (
              <div className="mt-10">
                <h3 className="font-bold text-xl text-blue-900 mb-4 border-b border-blue-100 pb-2">Apartments / Rooms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {(property.apartments as Apartment[]).map((room: unknown) => (
                    <Card key={room.roomId || room._id} className="border border-blue-100 bg-white shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 rounded-2xl">
                      <CardContent className="p-6 space-y-3">
                        <div className="font-bold text-blue-800 text-lg mb-1 flex items-center gap-2">
                          <Home className="w-5 h-5 text-blue-400" />
                          {room.description || 'No description'}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge className="bg-gray-100 text-gray-800">Style: {room.apartmentStyle || 'N/A'}</Badge>
                          <Badge className="bg-gray-100 text-gray-800">Lease: {room.leaseTerms || 'N/A'}</Badge>
                          <Badge className="bg-gray-100 text-gray-800">Payment: {room.paymentOption || 'N/A'}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="font-semibold">Rooms:</span> {room.noOfRooms || 'N/A'}
                          <span className="font-semibold ml-4">Baths:</span> {room.noOfBaths || 'N/A'}
                        </div>
                        <div className="text-gray-700">
                          <span className="font-semibold">Rent:</span> ₦{room.rentAmount ? room.rentAmount.toLocaleString() : 'N/A'} {room.rentAmountMetrics || ''}
                        </div>
                        <div className="text-gray-700">
                          <span className="font-semibold">Assigned to Tenant:</span> {room.assignedToTenant ? 'Yes' : 'No'}
                        </div>
                        {/* TODO: Add proper type for room. */}
                        {room.otherAmentities && Array.isArray(room.otherAmentities) && room.otherAmentities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {room.otherAmentities.map((a: string) => (
                              <Badge key={a} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-1" />
                                {a}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-2">Created: {room.createdAt ? new Date(room.createdAt).toLocaleString() : 'N/A'}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminSidebarLayout>
  );
};

export default PropertyDetailsPage; 