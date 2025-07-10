'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CheckCircle, 
  XCircle, 
  Package, 
  Monitor, 
  Clock,
  MapPin,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Document } from '@/lib/types';
import { mockUsers } from '@/lib/auth';

interface PossessionAcceptanceProps {
  documents: Document[];
  onAccept: (documentId: string, location?: string, notes?: string) => void;
  onReject: (documentId: string, reason: string) => void;
  currentUserId: string;
}

export function PossessionAcceptance({ 
  documents, 
  onAccept, 
  onReject,
  currentUserId 
}: PossessionAcceptanceProps) {
  const [acceptanceData, setAcceptanceData] = useState<{[key: string]: {location: string, notes: string}}>({});
  const [rejectionData, setRejectionData] = useState<{[key: string]: {reason: string, showForm: boolean}}>({});

  const updateAcceptanceData = (docId: string, field: 'location' | 'notes', value: string) => {
    setAcceptanceData(prev => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        [field]: value
      }
    }));
  };

  const updateRejectionData = (docId: string, field: 'reason' | 'showForm', value: string | boolean) => {
    setRejectionData(prev => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        [field]: value
      }
    }));
  };

  const handleAccept = (documentId: string) => {
    const data = acceptanceData[documentId];
    onAccept(documentId, data?.location, data?.notes);
    
    // Clear form data
    setAcceptanceData(prev => {
      const newData = {...prev};
      delete newData[documentId];
      return newData;
    });
  };

  const handleReject = (documentId: string) => {
    const data = rejectionData[documentId];
    if (data?.reason) {
      onReject(documentId, data.reason);
      
      // Clear form data
      setRejectionData(prev => {
        const newData = {...prev};
        delete newData[documentId];
        return newData;
      });
    }
  };

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-500">No documents awaiting your acceptance.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {documents.map((document) => {
        const transferrer = mockUsers.find(u => u.id === document.possessionHistory[document.possessionHistory.length - 1]?.userId);
        const data = acceptanceData[document.id] || { location: '', notes: '' };
        const rejectionForm = rejectionData[document.id] || { reason: '', showForm: false };

        return (
          <Card key={document.id} className="border-l-4 border-l-orange-500">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{document.title}</span>
                    <Badge className="bg-orange-100 text-orange-800">
                      Awaiting Acceptance
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{document.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {document.possessionType === 'Digital' ? (
                    <Monitor className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Package className="h-5 w-5 text-green-600" />
                  )}
                  <Badge variant="outline">{document.possessionType}</Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Transfer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Transfer Details</h4>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatDistanceToNow(new Date(document.currentPossession.receivedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={transferrer?.avatar} alt={transferrer?.name} />
                    <AvatarFallback className="text-xs">
                      {transferrer?.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{transferrer?.name}</p>
                    <p className="text-sm text-gray-600">{transferrer?.role}</p>
                  </div>
                </div>

                {document.currentPossession.location && (
                  <div className="flex items-center space-x-2 mt-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Location: {document.currentPossession.location}
                    </span>
                  </div>
                )}

                {document.currentPossession.notes && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      <strong>Notes:</strong> {document.currentPossession.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Acceptance Form */}
              {!rejectionForm.showForm && (
                <div className="space-y-4">
                  {document.possessionType === 'Physical' && (
                    <div>
                      <Label htmlFor={`location-${document.id}`}>
                        Current Location (Optional)
                      </Label>
                      <Input
                        id={`location-${document.id}`}
                        value={data.location}
                        onChange={(e) => updateAcceptanceData(document.id, 'location', e.target.value)}
                        placeholder="Where will you store this document?"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor={`notes-${document.id}`}>
                      Acceptance Notes (Optional)
                    </Label>
                    <Textarea
                      id={`notes-${document.id}`}
                      value={data.notes}
                      onChange={(e) => updateAcceptanceData(document.id, 'notes', e.target.value)}
                      placeholder="Any notes about receiving this document..."
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {/* Rejection Form */}
              {rejectionForm.showForm && (
                <div className="space-y-4 bg-red-50 p-4 rounded-lg">
                  <div>
                    <Label htmlFor={`rejection-${document.id}`}>
                      Reason for Rejection *
                    </Label>
                    <Textarea
                      id={`rejection-${document.id}`}
                      value={rejectionForm.reason}
                      onChange={(e) => updateRejectionData(document.id, 'reason', e.target.value)}
                      placeholder="Please explain why you cannot accept this document..."
                      rows={3}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                {!rejectionForm.showForm ? (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => updateRejectionData(document.id, 'showForm', true)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button 
                      onClick={() => handleAccept(document.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept Possession
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => updateRejectionData(document.id, 'showForm', false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleReject(document.id)}
                      disabled={!rejectionForm.reason.trim()}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Confirm Rejection
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}