'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  User,
  Activity,
  HandMetal,
  Package
} from 'lucide-react';
import { DashboardStats } from '@/lib/types';

interface StatsOverviewProps {
  stats: DashboardStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const statItems = [
    {
      title: 'Total Documents',
      value: stats.totalDocuments,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pending Review',
      value: stats.pendingReview,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Approved Today',
      value: stats.approvedToday,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Overdue',
      value: stats.overdueDocuments,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Awaiting Acceptance',
      value: stats.awaitingAcceptance,
      icon: HandMetal,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'In My Possession',
      value: stats.inMyPossession,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {item.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {item.value}
              </div>
              {item.title === 'Overdue' && item.value > 0 && (
                <Badge variant="destructive" className="mt-2">
                  Attention Required
                </Badge>
              )}
              {item.title === 'Pending Review' && item.value > 0 && (
                <Badge variant="secondary" className="mt-2">
                  Action Needed
                </Badge>
              )}
              {item.title === 'Awaiting Acceptance' && item.value > 0 && (
                <Badge className="mt-2 bg-orange-100 text-orange-800">
                  Accept Documents
                </Badge>
              )}
              {item.title === 'In My Possession' && item.value > 0 && (
                <Badge className="mt-2 bg-purple-100 text-purple-800">
                  Your Responsibility
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}