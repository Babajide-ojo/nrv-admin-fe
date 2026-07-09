'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import AdminSidebarLayout from '@/components/layout/AdminSidebarLayout';
import {
  fetchStaff,
  Staff,
  StaffRole,
  type OnboardingStatus,
} from '@/lib/api/staff';
import { fetchRoles, Role } from '@/lib/api/roles';
import { UserCog, Plus, Search, Eye, UserCheck, Clock } from 'lucide-react';

function getRoleName(roleId: string | StaffRole): string {
  if (typeof roleId === 'object' && roleId?.name) return roleId.name;
  return '—';
}

function getOnboardingBadge(status: OnboardingStatus) {
  switch (status) {
    case 'onboarded':
      return <Badge className="bg-green-100 text-green-800"><UserCheck className="w-3 h-3 mr-1" />Onboarded</Badge>;
    case 'invited':
      return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Invited</Badge>;
    case 'pending':
      return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
    case 'deactivated':
      return <Badge className="bg-gray-100 text-gray-800">Deactivated</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
  }
}

const StaffPage = () => {
  const [list, setList] = useState<Staff[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetchStaff({
        page,
        limit: pagination.limit,
        search: search || undefined,
        roleId: roleFilter || undefined,
        onboardingStatus: statusFilter || undefined,
      });
      setList(res.data);
      setPagination(res.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles().then(setRoles).catch(console.error);
  }, []);

  useEffect(() => {
    load(pagination.page);
  }, [pagination.page, search, roleFilter, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(1);
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <UserCog className="w-7 h-7 text-green-600" />
              Staff
            </h1>
            <p className="text-gray-500 mt-1">Create and onboard staff members.</p>
          </div>
          <Link href="/staff/new">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create staff
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Staff list</CardTitle>
            <p className="text-sm text-gray-500">Filter and search staff.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSearch} className="flex flex-wrap gap-2 items-center">
              <div className="flex flex-1 min-w-[200px] items-center border rounded-md">
                <Search className="w-4 h-4 ml-3 text-gray-400" />
                <Input
                  className="border-0 focus-visible:ring-0"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="rounded-md border border-input px-3 py-2 text-sm"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All roles</option>
                {roles.map((r) => (
                  <option key={r._id} value={r._id}>{r.name}</option>
                ))}
              </select>
              <select
                className="rounded-md border border-input px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="invited">Invited</option>
                <option value="onboarded">Onboarded</option>
                <option value="deactivated">Deactivated</option>
              </select>
              <Button type="submit" variant="outline">Search</Button>
            </form>

            {loading ? (
              <p className="text-gray-500 py-4">Loading…</p>
            ) : list.length === 0 ? (
              <p className="text-gray-500 py-4">No staff found.</p>
            ) : (
              <>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Onboarding</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((s) => (
                        <tr key={s._id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">
                            {s.firstName} {s.lastName}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{s.email}</td>
                          <td className="py-3 px-4">{getRoleName(s.roleId)}</td>
                          <td className="py-3 px-4">{getOnboardingBadge(s.onboardingStatus)}</td>
                          <td className="py-3 px-4">
                            <Link href={`/staff/${s._id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-1" /> View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-gray-500">
                    Page {pagination.page} of {pagination.totalPages || 1} ({pagination.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => load(pagination.page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => load(pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminSidebarLayout>
  );
};

export default StaffPage;
