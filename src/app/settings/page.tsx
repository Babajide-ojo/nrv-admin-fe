'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminSidebarLayout from '@/components/layout/AdminSidebarLayout';
import {
  fetchPlatformSettings,
  updatePlatformSettings,
} from '@/lib/api/platform-settings';
import { approveManagerNin, fetchUsers, User } from '@/lib/api/users';
import { Settings } from 'lucide-react';

const SettingsPage = () => {
  const [credits, setCredits] = useState('1');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [managers, setManagers] = useState<User[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const loadManagers = async () => {
    const result = await fetchUsers({
      role: 'shortlet_manager',
      limit: 100,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setManagers(result.data || []);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchPlatformSettings();
        setCredits(String(data.shortletSignupBonusCredits ?? 1));
        await loadManagers();
        setError(null);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : 'Could not load platform settings.',
        );
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    const value = Math.max(0, Math.floor(Number(credits) || 0));
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const data = await updatePlatformSettings(value);
      setCredits(String(data.shortletSignupBonusCredits ?? value));
      setSaved(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Could not save platform settings.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-7 h-7 text-green-600" />
            Settings
          </h1>
          <p className="text-gray-500 mt-1">
            Configure free guest-check credits for new shortlet managers.
          </p>
        </div>

        {error ? (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">
            {error}
          </div>
        ) : null}
        {saved ? (
          <div className="rounded-lg bg-green-50 border border-green-200 text-green-800 px-4 py-3">
            Settings saved.
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Shortlet manager signup bonus</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : (
              <form onSubmit={(event) => void handleSave(event)} className="max-w-md space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shortlet-bonus">
                    Free guest-check credits for new shortlet managers
                  </Label>
                  <Input
                    id="shortlet-bonus"
                    type="number"
                    min={0}
                    step={1}
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    Granted once after an admin approves the manager’s NIN.
                    Listing a shortlet is not required.
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shortlet manager NIN review</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : managers.length === 0 ? (
              <p className="text-sm text-gray-500">No shortlet managers yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 pr-3">Manager</th>
                      <th className="py-2 pr-3">NIN</th>
                      <th className="py-2 pr-3">Review</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managers.map((manager) => {
                      const approved = Boolean(manager.managerNinVerifiedAt);
                      return (
                        <tr key={manager._id} className="border-b last:border-0">
                          <td className="py-3 pr-3">
                            <p className="font-medium text-gray-900">
                              {manager.firstName} {manager.lastName}
                            </p>
                            <p className="text-gray-500">{manager.email}</p>
                          </td>
                          <td className="py-3 pr-3 font-mono">
                            {manager.nin || manager.ninLast4 || '—'}
                          </td>
                          <td className="py-3 pr-3">
                            {approved ? 'Approved' : 'Pending'}
                          </td>
                          <td className="py-3">
                            {approved ? (
                              <span className="text-gray-400">Done</span>
                            ) : (
                              <Button
                                size="sm"
                                disabled={approvingId === manager._id}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={async () => {
                                  setApprovingId(manager._id);
                                  setError(null);
                                  try {
                                    await approveManagerNin(manager._id);
                                    await loadManagers();
                                  } catch (e) {
                                    setError(
                                      e instanceof Error
                                        ? e.message
                                        : 'Could not approve this NIN.',
                                    );
                                  } finally {
                                    setApprovingId(null);
                                  }
                                }}
                              >
                                {approvingId === manager._id
                                  ? 'Approving…'
                                  : 'Approve'}
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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

export default SettingsPage;
