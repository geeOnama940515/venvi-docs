'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Calendar, 
  User, 
  Clock,
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Document, Comment, WorkflowStep } from '@/lib/types';
import { mockUsers } from '@/lib/auth';

interface DocumentViewerProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onAddComment: (documentId: string, comment: string) => void;
  onApprove: (documentId: string) => void;
  onReject: (documentId: string, reason: string) => void;
  currentUserId: string;
}

export function DocumentViewer({ 
  document, 
  isOpen, 
  onClose, 
  onAddComment, 
  onApprove, 
  onReject,
  currentUserId 
}: DocumentViewerProps) {
  const [newComment, setNewComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  if (!document) return null;

  const uploader = mockUsers.find(u => u.id === document.uploadedBy);
  const currentHandler = mockUsers.find(u => u.id === document.currentHandler);

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

  const getWorkflowIcon = (action: string, status: string) => {
    if (status === 'Complete') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === 'Pending') return <Clock className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-gray-400" />;
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(document.id, newComment.trim());
      setNewComment('');
    }
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(document.id, rejectReason.trim());
      setRejectReason('');
      setShowRejectDialog(false);
    }
  };

  const canApprove = document.currentHandler === currentUserId && document.status === 'In Review';
  const canReject = document.currentHandler === currentUserId && document.status === 'In Review';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>{document.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(document.status)}>
                      {document.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Priority</label>
                  <div className="mt-1">
                    <Badge variant="outline">{document.priority}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <p className="mt-1 text-sm">{document.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="mt-1 text-sm">{document.category}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-sm">{document.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Uploaded By</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={uploader?.avatar} alt={uploader?.name} />
                      <AvatarFallback className="text-xs">
                        {uploader?.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{uploader?.name}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Handler</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={currentHandler?.avatar} alt={currentHandler?.name} />
                      <AvatarFallback className="text-xs">
                        {currentHandler?.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{currentHandler?.name}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {document.workflow.map((step, index) => {
                  const stepUser = mockUsers.find(u => u.id === step.userId);
                  return (
                    <div key={step.id} className="flex items-center space-x-3">
                      {getWorkflowIcon(step.action, step.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{step.action}</span>
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(step.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {stepUser?.name} ({step.role})
                        </div>
                        {step.comment && (
                          <p className="text-sm text-gray-500 mt-1">{step.comment}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {document.comments.map((comment) => {
                  const commentUser = mockUsers.find(u => u.id === comment.userId);
                  return (
                    <div key={comment.id} className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={commentUser?.avatar} alt={commentUser?.name} />
                        <AvatarFallback className="text-xs">
                          {commentUser?.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{comment.userName}</span>
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                      </div>
                    </div>
                  );
                })}

                {document.comments.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No comments yet</p>
                )}
              </div>

              <Separator className="my-4" />

              {/* Add Comment */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex justify-between">
                  <div className="flex space-x-2">
                    {canApprove && (
                      <Button 
                        onClick={() => onApprove(document.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    )}
                    {canReject && (
                      <Button 
                        variant="destructive"
                        onClick={() => setShowRejectDialog(true)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    )}
                  </div>
                  <Button 
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reject Dialog */}
        {showRejectDialog && (
          <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Please provide a reason for rejecting this document:
                </p>
                <Textarea
                  placeholder="Enter rejection reason..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleReject}
                    disabled={!rejectReason.trim()}
                  >
                    Reject Document
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}