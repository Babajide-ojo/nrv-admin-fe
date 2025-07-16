'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  Users, 
  Building, 
  FileText,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import AdminSidebarLayout from '@/components/layout/AdminSidebarLayout';
import { getDashboardMetrics, DashboardMetrics } from '@/lib/api/dashboard';

const DashboardPage = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
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
          <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight drop-shadow-lg">Dashboard</h1>
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
                    <CardTitle className="text-base font-semibold text-blue-900 flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor} shadow-sm`}>
                      {stat.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-extrabold text-blue-900 animate-fade-in">
                      {loading ? <span className="animate-pulse">...</span> : stat.value}
                    </div>
                    <div className="flex items-center space-x-2 text-xs mt-2">
                      <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                        {stat.change}
                      </span>
                   
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Quick Actions</h2>
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
                          <h3 className="font-semibold text-blue-900">{action.title}</h3>
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

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Recent Activity</h2>
          <Card className="bg-white/60 backdrop-blur-lg border-0 rounded-2xl">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-lg text-blue-900">System Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">New user registration</p>
                    <p className="text-xs text-gray-500">John Doe registered as a tenant</p>
                  </div>
                  <span className="text-xs text-gray-400">2 min ago</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">Property verification completed</p>
                    <p className="text-xs text-gray-500">Property #12345 verified successfully</p>
                  </div>
                  <span className="text-xs text-gray-400">15 min ago</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">New property added</p>
                    <p className="text-xs text-gray-500">Luxury apartment complex added</p>
                  </div>
                  <span className="text-xs text-gray-400">1 hour ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminSidebarLayout>
  );
};

export default DashboardPage; 