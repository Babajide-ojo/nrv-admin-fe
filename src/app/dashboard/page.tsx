'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  Users, 
  Building, 
  FileText,
  ArrowRight,
  Activity,
  Clock,
} from 'lucide-react';
import AdminSidebarLayout from '@/components/layout/AdminSidebarLayout';
import { getDashboardMetrics, DashboardMetrics } from '@/lib/api/dashboard';
import { fetchVerifications } from '@/lib/api/verifications';
import {
  formatRelativeTime,
  formatVerificationStatusAction,
  mapVerificationToRow,
  type VerificationRow,
} from '@/lib/verification/map-verification-row';

const RECENT_VERIFICATIONS_LIMIT = 5;

const DashboardPage = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentVerifications, setRecentVerifications] = useState<VerificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState<string | null>(null);
  const stats = [
    {
      title: 'Total Verifications',
      value: metrics ? metrics.totalVerifications.toLocaleString() : '...',

     
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/verifications'
    },
    {
      title: 'Active Users',
      value: metrics ? metrics.totalUsers.toLocaleString() : '...',
    
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/users'
    },
    {
      title: 'Properties',
      value: metrics ? metrics.totalProperties.toLocaleString() : '...',
  
      icon: Building,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/properties'
    },
    {
      title: 'Pending Reports',
      value: metrics ? metrics.totalPendingReports.toLocaleString() : '...',

      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      href: '/verifications'
    }
  ];

  useEffect(() => {
    setLoading(true);
    getDashboardMetrics()
      .then(setMetrics)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchVerifications({ page: 1, limit: RECENT_VERIFICATIONS_LIMIT, sortOrder: 'desc' })
      .then((res) => {
        setRecentVerifications((res.data ?? []).map((item) => mapVerificationToRow(item as unknown as Record<string, unknown>)));
      })
      .catch(() => setRecentError('Failed to load recent verifications'))
      .finally(() => setRecentLoading(false));
  }, []);

  const quickActions = [
    {
      title: 'Review Verifications',
      description: 'Check pending user verifications',
      icon: Shield,
      href: '/verifications',
      color: 'bg-blue-500'
    },
    {
      title: 'Manage Users',
      description: 'View and manage all users',
      icon: Users,
      href: '/users',
      color: 'bg-green-500'
    },
    {
      title: 'Property Overview',
      description: 'Monitor all properties and units',
      icon: Building,
      href: '/properties',
      color: 'bg-purple-500'
    },
    {
      title: 'Generate Reports',
      description: 'Create detailed system reports',
      icon: FileText,
      href: '/reports',
      color: 'bg-orange-500'
    }
  ];

  return (
    <AdminSidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-extrabold text-green-900 tracking-tight drop-shadow-lg">Dashboard</h1>
          <p className="text-gray-600 mt-1 text-lg">Welcome to the admin dashboard</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link key={index} href={stat.href} className="block">
                <Card className="hover:shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer bg-white/60 backdrop-blur-lg border-0 rounded-2xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-semibold text-green-900 flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                      {stat.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-extrabold text-green-900 animate-fade-in">
                      {loading ? <span className="animate-pulse">...</span> : stat.value}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-green-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} href={action.href}>
                  <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-white via-slate-50 to-blue-50 border-0 rounded-2xl">
                    <CardContent className="p-6 min-h-[180px] md:min-h-[200px] flex flex-col justify-center">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${action.color} shadow`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-green-900">{action.title}</h3>
                          <p className="text-sm text-gray-500">{action.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Verifications */}
        <div>
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-2xl font-bold text-green-900">Recent Verifications</h2>
            <Link href="/verifications" className="text-sm font-medium text-green-700 hover:underline">
              View all
            </Link>
          </div>
          <Card className="bg-white/60 backdrop-blur-lg border-0 rounded-2xl">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-lg text-blue-900">Latest tenant screening requests</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLoading ? (
                  <p className="py-4 text-center text-sm text-gray-500">Loading...</p>
                ) : recentError ? (
                  <p className="py-4 text-center text-sm text-red-500">{recentError}</p>
                ) : recentVerifications.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-500">No verification requests yet.</p>
                ) : (
                  recentVerifications.map((item) => (
                    <Link
                      key={item.id}
                      href={`/verifications/${item.id}`}
                      className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="rounded-full bg-green-100 p-2">
                        <Clock className="w-4 h-4 text-green-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-900">
                          {formatVerificationStatusAction(item.status)}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {item.tenantName} · {item.reference}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {item.verificationType === 'premium' ? 'Premium' : 'Standard'}
                          {item.email ? ` · ${item.email}` : ''}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-gray-400">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminSidebarLayout>
  );
};

export default DashboardPage; 