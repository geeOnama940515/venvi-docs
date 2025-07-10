'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  FileText, 
  Calendar, 
  User, 
  Clock,
  Download,
  Eye,
  MessageSquare,
  AlertTriangle,
  Send,
  Package,
  Monitor,
  MapPin
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Document } from '@/lib/types';
import { mockUsers } from '@/lib/auth';

interface DocumentCardProps {
  document: Document;
  onView: (document: Document) => void;
  onDownload: (document: Document) => void;
  onTransfer?: (document: Document) => void;
  className?: string;
}

export function DocumentCard({ document, onView, onDownload, onTransfer, className }: DocumentCardProps) {
  const uploader = mockUsers.find(u => u.id === document.uploadedBy);
  const currentHandler = mockUsers.find(u => u.id === document.currentHandler);
  const possessionHolder = mockUsers.find(u => u.id === document.currentPossession.userId);

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

  const getPriorityColor = (priority: string) => {
    const colors = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-orange-100 text-orange-800',
      'Critical': 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isOverdue = document.dueDate && new Date(document.dueDate) < new Date() && document.status !== 'Approved';

  return (
    <Card className={`hover:shadow-lg transition-shadow duration-200 flex flex-col h-full ${className} ${
      document.awaitingAcceptance ? 'border-l-4 border-l-orange-500' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                {document.title}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{document.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
            {isOverdue && <AlertTriangle className="h-5 w-5 text-red-500" />}
            {document.possessionType === 'Digital' ? (
              <Monitor className="h-4 w-4 text-blue-600" />
            ) : (
              <Package className="h-4 w-4 text-green-600" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Status and Priority */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge 
            variant="secondary" 
            className={`${getStatusColor(document.status)} text-xs`}
          >
            {document.status}
          </Badge>
          <Badge 
            variant="outline" 
            className={`${getPriorityColor(document.priority)} text-xs`}
          >
            {document.priority}
          </Badge>
          {document.awaitingAcceptance && (
            <Badge className="bg-orange-100 text-orange-800 text-xs">
              Awaiting
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">{document.possessionType}</Badge>
        </div>

        {/* File Info */}
        <div className="text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{document.fileName}</span>
            <span className="text-xs flex-shrink-0">({formatFileSize(document.fileSize)})</span>
          </div>
        </div>

        {/* Current Possession */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Current Possession</span>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                document.currentPossession.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                document.currentPossession.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}
            >
              {document.currentPossession.status}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6 flex-shrink-0">
              <AvatarImage src={possessionHolder?.avatar} alt={possessionHolder?.name} />
              <AvatarFallback className="text-xs">
                {possessionHolder?.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600 truncate">{possessionHolder?.name}</span>
          </div>
          
          {document.currentPossession.location && (
            <div className="flex items-center space-x-2 mt-1">
              <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0" />
              <span className="text-xs text-gray-500 truncate">{document.currentPossession.location}</span>
            </div>
          )}
        </div>

        {/* People */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <Avatar className="h-6 w-6 flex-shrink-0">
              <AvatarImage src={uploader?.avatar} alt={uploader?.name} />
              <AvatarFallback className="text-xs">
                {uploader?.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600 truncate">
              by {uploader?.name}
            </span>
          </div>
          
          {currentHandler && currentHandler.id !== document.currentPossession.userId && (
            <div className="flex items-center space-x-2 flex-shrink-0">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-600 truncate">{currentHandler.name}</span>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1 min-w-0 flex-1">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {formatDistanceToNow(new Date(document.uploadedAt), { addSuffix: true })}
            </span>
          </div>
          
          {document.dueDate && (
            <div className={`flex items-center space-x-1 flex-shrink-0 ${isOverdue ? 'text-red-600' : ''}`}>
              <Clock className="h-4 w-4" />
              <span className="truncate">
                Due {formatDistanceToNow(new Date(document.dueDate), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>

        {/* Spacer to push actions to bottom */}
        <div className="flex-1"></div>

        {/* Actions - Fixed at bottom */}
        <div className="pt-4 border-t mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onView(document)}
                className="flex items-center space-x-1 text-xs px-2 py-1 h-8"
              >
                <Eye className="h-3 w-3" />
                <span>View</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDownload(document)}
                className="flex items-center space-x-1 text-xs px-2 py-1 h-8"
              >
                <Download className="h-3 w-3" />
                <span>Download</span>
              </Button>
              {onTransfer && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onTransfer(document)}
                  className="flex items-center space-x-1 text-xs px-2 py-1 h-8"
                >
                  <Send className="h-3 w-3" />
                  <span>Transfer</span>
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MessageSquare className="h-4 w-4" />
              <span>{document.comments.length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}