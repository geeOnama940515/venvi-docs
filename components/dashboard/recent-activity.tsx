'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Document } from '@/lib/types';
import { mockUsers } from '@/lib/auth';

interface RecentActivityProps {
  documents: Document[];
}

export function RecentActivity({ documents }: RecentActivityProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'In Review': 'bg-blue-100 text-blue-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Archived': 'bg-purple-100 text-purple-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getUserById = (userId: string) => {
    return mockUsers.find(u => u.id === userId);
  };

  const recentDocuments = documents
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentDocuments.map((document) => {
            const uploader = getUserById(document.uploadedBy);
            const currentHandler = getUserById(document.currentHandler);
            
            return (
              <div key={document.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={uploader?.avatar} alt={uploader?.name} />
                  <AvatarFallback>
                    {uploader?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {document.title}
                    </p>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getStatusColor(document.status)}`}
                    >
                      {document.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      by {uploader?.name} • {formatDistanceToNow(new Date(document.uploadedAt), { addSuffix: true })}
                    </p>
                    {currentHandler && (
                      <p className="text-xs text-blue-600">
                        → {currentHandler.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}