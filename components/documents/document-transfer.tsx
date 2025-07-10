'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Send, Package, Monitor, Check, ChevronsUpDown } from 'lucide-react';
import { Document } from '@/lib/types';
import { mockUsers } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface DocumentTransferProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (documentId: string, toUserId: string, possessionType: 'Digital' | 'Physical', notes?: string, location?: string) => void;
  currentUserId: string;
}

export function DocumentTransfer({ 
  document, 
  isOpen, 
  onClose, 
  onTransfer,
  currentUserId 
}: DocumentTransferProps) {
  const [selectedUser, setSelectedUser] = useState('');
  const [possessionType, setPossessionType] = useState<'Digital' | 'Physical'>('Digital');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [open, setOpen] = useState(false);

  if (!document) return null;

  const availableUsers = mockUsers.filter(u => u.id !== currentUserId);
  const selectedUserData = availableUsers.find(u => u.id === selectedUser);

  const handleTransfer = () => {
    if (selectedUser && document) {
      onTransfer(document.id, selectedUser, possessionType, notes || undefined, location || undefined);
      
      // Reset form
      setSelectedUser('');
      setPossessionType('Digital');
      setNotes('');
      setLocation('');
      setOpen(false);
      onClose();
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setSelectedUser('');
    setPossessionType('Digital');
    setNotes('');
    setLocation('');
    setOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5" />
            <span>Transfer Document</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="font-semibold">{document.title}</h3>
                <p className="text-sm text-gray-600">{document.description}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{document.type}</Badge>
                  <Badge variant="secondary">{document.category}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transfer Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transfer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recipient Selection with Search */}
              <div>
                <Label htmlFor="recipient">Transfer To</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {selectedUserData ? (
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={selectedUserData.avatar} alt={selectedUserData.name} />
                            <AvatarFallback className="text-xs">
                              {selectedUserData.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span>{selectedUserData.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {selectedUserData.role}
                          </Badge>
                        </div>
                      ) : (
                        "Select recipient..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search users..." />
                      <CommandList>
                        <CommandEmpty>No users found.</CommandEmpty>
                        <CommandGroup>
                          {availableUsers.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={`${user.name} ${user.role} ${user.email}`}
                              onSelect={() => {
                                setSelectedUser(user.id);
                                setOpen(false);
                              }}
                            >
                              <div className="flex items-center space-x-2 w-full">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={user.avatar} alt={user.name} />
                                  <AvatarFallback className="text-xs">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{user.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {user.role}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    selectedUser === user.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Possession Type */}
              <div>
                <Label>Possession Type</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Card 
                    className={`cursor-pointer transition-colors ${
                      possessionType === 'Digital' 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setPossessionType('Digital')}
                  >
                    <CardContent className="p-4 text-center">
                      <Monitor className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-medium">Digital</h3>
                      <p className="text-sm text-gray-600">Electronic file transfer</p>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className={`cursor-pointer transition-colors ${
                      possessionType === 'Physical' 
                        ? 'ring-2 ring-green-500 bg-green-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setPossessionType('Physical')}
                  >
                    <CardContent className="p-4 text-center">
                      <Package className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <h3 className="font-medium">Physical</h3>
                      <p className="text-sm text-gray-600">Hard copy document</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Location (for physical documents) */}
              {possessionType === 'Physical' && (
                <div>
                  <Label htmlFor="location">Current Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Admin Office - Desk, Mail Room, etc."
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Transfer Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this transfer..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleTransfer}
                  disabled={!selectedUser}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Transfer Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}