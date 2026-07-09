'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminSidebarLayout from '@/components/layout/AdminSidebarLayout';
import {
  fetchStaffById,
  updateStaff,
  onboardStaff,
  Staff,
  StaffRole,
  type OnboardingStatus,
} from '@/lib/api/staff';
import { UserCog, ArrowLeft, UserCheck, Mail, Phone, KeyRound } from 'lucide-react';

function getRoleName(roleId: string | StaffRole): string {
  if (typeof roleId === 'object' && roleId?.name) return roleId.name;
  return '—';
}

function OnboardingBadge({ status }: { status: OnboardingStatus }) {
  switch (status) {
    case 'onboarded':
      return <Badge className="bg-green-100 text-green-800">Onboarded</Badge>;
    case 'invited':
      return <Badge className="bg-blue-100 text-blue-800">Invited</Badge>;
    case 'pending':
      return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
    case 'deactivated':
      return <Badge className="bg-gray-100 text-gray-800">Deactivated</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
  }
}

const StaffDetailPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [onboardPassword, setOnboardPassword] = useState('');
  const [onboardSubmitting, setOnboardSubmitting] = useState(false);
  const [onboardError, setOnboardError] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStaffById(id);
      setStaff(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !onboardPassword || onboardPassword.length < 6) {
      setOnboardError('Password must be at least 6 characters.');
      return;
    }
    setOnboardSubmitting(true);
    setOnboardError(null);
    try {
      await onboardStaff(id, { password: onboardPassword });
      setOnboardOpen(false);
      setOnboardPassword('');
      await load();
    } catch (e) {
      setOnboardError(e instanceof Error ? e.message : 'Onboard failed');
    } finally {
      setOnboardSubmitting(false);
    }
  };

  if (loading && !staff) {
    return (
      <AdminSidebarLayout>
        <p className="text-gray-500">Loading…</p>
      </AdminSidebarLayout>
    );
  }
  if (error || !staff) {
    return (
      <AdminSidebarLayout>
        <div className="space-y-4">
          <Link href="/staff">
            <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Back to staff</Button>
          </Link>
          <p className="text-red-600">{error || 'Staff not found.'}</p>
        </div>
      </AdminSidebarLayout>
    );
  }

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/staff">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <UserCog className="w-7 h-7 text-green-600" />
                {staff.firstName} {staff.lastName}
              </h1>
              <p className="text-gray-500 mt-1">{staff.email}</p>
              <div className="mt-2">
                <OnboardingBadge status={staff.onboardingStatus} />
              </div>
            </div>
          </div>
          {staff.onboardingStatus !== 'onboarded' && (
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setOnboardOpen(true)}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Onboard staff
            </Button>
          )}
        </div>

        {onboardOpen && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Set password to onboard</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => { setOnboardOpen(false); setOnboardError(null); }}>
                Cancel
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOnboard} className="space-y-4 max-w-md">
                {onboardError && (
                  <p className="text-sm text-red-600">{onboardError}</p>
                )}
                <div>
                  <Label htmlFor="onboard-password">Password</Label>
                  <Input
                    id="onboard-password"
                    type="password"
                    value={onboardPassword}
                    onChange={(e) => setOnboardPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" disabled={onboardSubmitting} className="bg-green-600 hover:bg-green-700">
                  {onboardSubmitting ? 'Onboarding…' : 'Onboard'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="w-5 h-5 text-gray-400" />
                <span>{staff.email}</span>
              </div>
              {staff.phone && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span>{staff.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-700">
                <KeyRound className="w-5 h-5 text-gray-400" />
                <span>Role: {getRoleName(staff.roleId)}</span>
              </div>
            </div>
            {staff.invitedAt && (
              <p className="text-sm text-gray-500">Invited: {new Date(staff.invitedAt).toLocaleString()}</p>
            )}
            {staff.onboardedAt && (
              <p className="text-sm text-gray-500">Onboarded: {new Date(staff.onboardedAt).toLocaleString()}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminSidebarLayout>
  );
};

export default StaffDetailPage;
