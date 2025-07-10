'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { DocumentCard } from '@/components/documents/document-card';
import { DocumentViewer } from '@/components/documents/document-viewer';
import { DocumentTransfer } from '@/components/documents/document-transfer';
import { PossessionAcceptance } from '@/components/documents/possession-acceptance';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Upload, Search, Filter, Plus, Bell, Users, Settings, Activity, CheckCircle, Send, HandMetal, Check, ChevronsUpDown, UserPlus } from 'lucide-react';
import { getCurrentUser, mockUsers } from '@/lib/auth';
import { 
  getDocuments, 
  saveDocument, 
  getDashboardStats, 
  addNotification,
  transferDocument,
  acceptDocumentPossession,
  getDocumentsAwaitingAcceptance,
  getDocumentsInPossession
} from '@/lib/data';
import { Document, User, Notification } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [transferDocument, setTransferDocument] = useState<Document | null>(null);
  const [awaitingDocuments, setAwaitingDocuments] = useState<Document[]>([]);
  const [possessionDocuments, setPossessionDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetUserOpen, setTargetUserOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    type: 'Other',
    category: '',
    priority: 'Medium',
    dueDate: '',
    possessionType: 'Digital' as 'Digital' | 'Physical',
    location: '',
    targetUserId: '', // New field for target user
    transferNotes: '' // New field for transfer notes
  });

  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);
    
    const docs = getDocuments();
    setDocuments(docs);
    setFilteredDocuments(docs);
    
    // Load awaiting and possession documents
    setAwaitingDocuments(getDocumentsAwaitingAcceptance(user.id));
    setPossessionDocuments(getDocumentsInPossession(user.id));
  }, [router]);

  useEffect(() => {
    let filtered = documents;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(doc => doc.status === filterStatus);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(doc => doc.priority === filterPriority);
    }

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, filterStatus, filterPriority]);

  const refreshData = () => {
    if (!currentUser) return;
    
    const docs = getDocuments();
    setDocuments(docs);
    setAwaitingDocuments(getDocumentsAwaitingAcceptance(currentUser.id));
    setPossessionDocuments(getDocumentsInPossession(currentUser.id));
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Auto-populate title if empty
    if (!uploadForm.title) {
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
      setUploadForm(prev => ({
        ...prev,
        title: nameWithoutExtension.replace(/[-_]/g, ' ')
      }));
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !uploadForm.title) return;

    setIsUploading(true);
    
    try {
      const newDocument: Document = {
        id: Date.now().toString(),
        title: uploadForm.title,
        description: uploadForm.description,
        type: uploadForm.type as any,
        category: uploadForm.category,
        status: 'Pending',
        priority: uploadForm.priority as any,
        uploadedBy: currentUser.id,
        uploadedAt: new Date(),
        currentHandler: uploadForm.targetUserId || currentUser.id,
        dueDate: uploadForm.dueDate ? new Date(uploadForm.dueDate) : undefined,
        fileSize: selectedFile?.size || 1024, // Default size if no file
        fileName: selectedFile?.name || `${uploadForm.title}.pdf`, // Default filename if no file
        tags: uploadForm.category.split(',').map(tag => tag.trim()).filter(Boolean),
        possessionType: uploadForm.possessionType,
        awaitingAcceptance: !!uploadForm.targetUserId,
        targetDestination: uploadForm.targetUserId || undefined,
        currentPossession: {
          id: Date.now().toString(),
          userId: uploadForm.targetUserId || currentUser.id,
          userName: uploadForm.targetUserId ? '' : currentUser.name, // Will be filled when accepted
          possessionType: uploadForm.possessionType,
          receivedAt: new Date(),
          acceptedAt: uploadForm.targetUserId ? undefined : new Date(),
          status: uploadForm.targetUserId ? 'Pending' : 'Accepted',
          location: uploadForm.location || undefined,
          notes: uploadForm.transferNotes || undefined
        },
        possessionHistory: uploadForm.targetUserId ? [{
          id: (Date.now() - 1).toString(),
          userId: currentUser.id,
          userName: currentUser.name,
          possessionType: uploadForm.possessionType,
          receivedAt: new Date(),
          acceptedAt: new Date(),
          transferredAt: new Date(),
          transferredTo: uploadForm.targetUserId,
          status: 'Transferred',
          notes: uploadForm.transferNotes || undefined
        }] : [],
        workflow: [
          {
            id: Date.now().toString(),
            role: currentUser.role,
            userId: currentUser.id,
            action: 'Upload',
            status: 'Complete',
            timestamp: new Date(),
            comment: uploadForm.targetUserId 
              ? `Document uploaded and transferred to recipient`
              : 'Document uploaded and in possession'
          },
          ...(uploadForm.targetUserId ? [{
            id: (Date.now() + 1).toString(),
            role: currentUser.role,
            userId: currentUser.id,
            action: 'Transfer' as const,
            status: 'Complete' as const,
            timestamp: new Date(),
            comment: uploadForm.transferNotes || `Transferred ${uploadForm.possessionType.toLowerCase()} document to recipient`
          }] : [])
        ],
        comments: []
      };

      saveDocument(newDocument);
      refreshData();
      
      // Add notification for target user if specified
      if (uploadForm.targetUserId) {
        const targetUser = mockUsers.find(u => u.id === uploadForm.targetUserId);
        const notification: Notification = {
          id: Date.now().toString(),
          userId: uploadForm.targetUserId,
          title: 'New Document Received',
          message: `${currentUser.name} has uploaded and transferred "${newDocument.title}" to you`,
          type: 'Possession',
          documentId: newDocument.id,
          read: false,
          timestamp: new Date(),
          actionRequired: true
        };
        addNotification(notification);
      }

      // Reset form
      setUploadForm({
        title: '',
        description: '',
        type: 'Other',
        category: '',
        priority: 'Medium',
        dueDate: '',
        possessionType: 'Digital',
        location: '',
        targetUserId: '',
        transferNotes: ''
      });
      setSelectedFile(null);
      setTargetUserOpen(false);
      
      setActiveTab('documents');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentTransfer = (documentId: string, toUserId: string, possessionType: 'Digital' | 'Physical', notes?: string, location?: string) => {
    if (!currentUser) return;

    const success = transferDocument(documentId, currentUser.id, toUserId, possessionType, notes, location);
    
    if (success) {
      const recipient = mockUsers.find(u => u.id === toUserId);
      const doc = documents.find(d => d.id === documentId);
      
      // Add notification for recipient
      const notification: Notification = {
        id: Date.now().toString(),
        userId: toUserId,
        title: 'Document Transfer Received',
        message: `${currentUser.name} has transferred "${doc?.title}" to you`,
        type: 'Possession',
        documentId: documentId,
        read: false,
        timestamp: new Date(),
        actionRequired: true
      };
      addNotification(notification);
      
      refreshData();
      setTransferDocument(null);
    }
  };

  const handleAcceptPossession = (documentId: string, location?: string, notes?: string) => {
    if (!currentUser) return;

    const success = acceptDocumentPossession(documentId, currentUser.id, currentUser.name, location, notes);
    
    if (success) {
      refreshData();
    }
  };

  const handleRejectPossession = (documentId: string, reason: string) => {
    if (!currentUser) return;
    
    // In a real implementation, you'd handle rejection logic here
    console.log('Rejecting document:', documentId, 'Reason:', reason);
    refreshData();
  };

  const handleDocumentAction = (documentId: string, action: string, comment?: string) => {
    if (!currentUser) return;

    const updatedDocuments = documents.map(doc => {
      if (doc.id === documentId) {
        const updatedDoc = { ...doc };
        
        if (action === 'approve') {
          updatedDoc.status = 'Approved';
          updatedDoc.workflow.push({
            id: Date.now().toString(),
            role: currentUser.role,
            userId: currentUser.id,
            action: 'Approve',
            status: 'Complete',
            timestamp: new Date(),
            comment: comment || 'Document approved'
          });
        } else if (action === 'reject') {
          updatedDoc.status = 'Rejected';
          updatedDoc.workflow.push({
            id: Date.now().toString(),
            role: currentUser.role,
            userId: currentUser.id,
            action: 'Reject',
            status: 'Complete',
            timestamp: new Date(),
            comment: comment || 'Document rejected'
          });
        }
        
        saveDocument(updatedDoc);
        return updatedDoc;
      }
      return doc;
    });

    setDocuments(updatedDocuments);
    setSelectedDocument(null);
  };

  const handleAddComment = (documentId: string, content: string) => {
    if (!currentUser) return;

    const updatedDocuments = documents.map(doc => {
      if (doc.id === documentId) {
        const updatedDoc = { ...doc };
        updatedDoc.comments.push({
          id: Date.now().toString(),
          userId: currentUser.id,
          userName: currentUser.name,
          content,
          timestamp: new Date(),
          type: 'Comment'
        });
        saveDocument(updatedDoc);
        return updatedDoc;
      }
      return doc;
    });

    setDocuments(updatedDocuments);
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const stats = getDashboardStats(currentUser.id, currentUser.role);
  const availableUsers = mockUsers.filter(u => u.id !== currentUser.id);
  const selectedTargetUser = availableUsers.find(u => u.id === uploadForm.targetUserId);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {currentUser.name}
                  </h1>
                  <p className="text-gray-600">
                    Here's an overview of your document activity
                  </p>
                </div>
                
                <StatsOverview stats={stats} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RecentActivity documents={documents} />
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button 
                        onClick={() => setActiveTab('upload')}
                        className="w-full justify-start"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setActiveTab('documents')}
                        className="w-full justify-start"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Browse Documents
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setActiveTab('possession')}
                        className="w-full justify-start"
                      >
                        <HandMetal className="h-4 w-4 mr-2" />
                        Accept Documents ({stats.awaitingAcceptance})
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Documents */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
                  <Button onClick={() => setActiveTab('upload')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>

                {/* Filters */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search documents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="In Review">In Review</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priority</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Document Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDocuments.map((document) => (
                    <DocumentCard
                      key={document.id}
                      document={document}
                      onView={(doc) => setSelectedDocument(doc)}
                      onDownload={(doc) => {
                        // Mock download
                        console.log('Downloading:', doc.fileName);
                      }}
                      onTransfer={
                        document.currentPossession.userId === currentUser.id && 
                        document.currentPossession.status === 'Accepted'
                          ? (doc) => setTransferDocument(doc)
                          : undefined
                      }
                    />
                  ))}
                </div>

                {filteredDocuments.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No documents found matching your criteria.</p>
                  </div>
                )}
              </div>
            )}

            {/* Document Possession */}
            {activeTab === 'possession' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Document Possession</h1>
                  <p className="text-gray-600 mt-1">
                    Accept documents transferred to you and manage your current possession
                  </p>
                </div>

                <Tabs defaultValue="awaiting" className="space-y-6">
                  <TabsList>
                    <TabsTrigger value="awaiting" className="flex items-center space-x-2">
                      <HandMetal className="h-4 w-4" />
                      <span>Awaiting Acceptance ({awaitingDocuments.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="possession" className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>In My Possession ({possessionDocuments.length})</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="awaiting">
                    <PossessionAcceptance
                      documents={awaitingDocuments}
                      onAccept={handleAcceptPossession}
                      onReject={handleRejectPossession}
                      currentUserId={currentUser.id}
                    />
                  </TabsContent>

                  <TabsContent value="possession">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {possessionDocuments.map((document) => (
                        <DocumentCard
                          key={document.id}
                          document={document}
                          onView={(doc) => setSelectedDocument(doc)}
                          onDownload={(doc) => {
                            console.log('Downloading:', doc.fileName);
                          }}
                          onTransfer={(doc) => setTransferDocument(doc)}
                        />
                      ))}
                    </div>
                    
                    {possessionDocuments.length === 0 && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center py-8">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents in Possession</h3>
                            <p className="text-gray-500">You don't currently have any documents in your possession.</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Upload */}
            {activeTab === 'upload' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
                    <p className="text-gray-600 mt-1">
                      Upload and categorize your document for processing
                    </p>
                  </div>
                  {selectedFile && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      File Ready
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* File Upload Section */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Select File (Optional)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FileUpload
                          onFileSelect={handleFileSelect}
                          onFileRemove={handleFileRemove}
                          selectedFile={selectedFile}
                          maxSize={50 * 1024 * 1024} // 50MB
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          File upload is optional for testing. A default file will be created if none is selected.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Document Information */}
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Document Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleUpload} className="space-y-4">
                          <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                              id="title"
                              value={uploadForm.title}
                              onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                              required
                              placeholder="Enter document title"
                            />
                          </div>

                          <div>
                            <Label htmlFor="type">Type</Label>
                            <Select value={uploadForm.type} onValueChange={(value) => setUploadForm({...uploadForm, type: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Invoice">Invoice</SelectItem>
                                <SelectItem value="Contract">Contract</SelectItem>
                                <SelectItem value="Report">Report</SelectItem>
                                <SelectItem value="Policy">Policy</SelectItem>
                                <SelectItem value="Form">Form</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="possessionType">Possession Type</Label>
                            <Select value={uploadForm.possessionType} onValueChange={(value: 'Digital' | 'Physical') => setUploadForm({...uploadForm, possessionType: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Digital">Digital</SelectItem>
                                <SelectItem value="Physical">Physical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Target User Selection */}
                          <div>
                            <Label>Transfer To (Optional)</Label>
                            <Popover open={targetUserOpen} onOpenChange={setTargetUserOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={targetUserOpen}
                                  className="w-full justify-between"
                                  type="button"
                                >
                                  {selectedTargetUser ? (
                                    <div className="flex items-center space-x-2">
                                      <Avatar className="h-5 w-5">
                                        <AvatarImage src={selectedTargetUser.avatar} alt={selectedTargetUser.name} />
                                        <AvatarFallback className="text-xs">
                                          {selectedTargetUser.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="truncate">{selectedTargetUser.name}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {selectedTargetUser.role}
                                      </Badge>
                                    </div>
                                  ) : (
                                    <div className="flex items-center space-x-2 text-gray-500">
                                      <UserPlus className="h-4 w-4" />
                                      <span>Keep in my possession</span>
                                    </div>
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
                                      <CommandItem
                                        value="keep-possession"
                                        onSelect={() => {
                                          setUploadForm({...uploadForm, targetUserId: ''});
                                          setTargetUserOpen(false);
                                        }}
                                      >
                                        <div className="flex items-center space-x-2 w-full">
                                          <UserPlus className="h-4 w-4 text-gray-500" />
                                          <span>Keep in my possession</span>
                                          <Check
                                            className={cn(
                                              "ml-auto h-4 w-4",
                                              !uploadForm.targetUserId ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                        </div>
                                      </CommandItem>
                                      {availableUsers.map((user) => (
                                        <CommandItem
                                          key={user.id}
                                          value={`${user.name} ${user.role} ${user.email}`}
                                          onSelect={() => {
                                            setUploadForm({...uploadForm, targetUserId: user.id});
                                            setTargetUserOpen(false);
                                          }}
                                        >
                                          <div className="flex items-center space-x-2 w-full">
                                            <Avatar className="h-5 w-5">
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
                                                uploadForm.targetUserId === user.id ? "opacity-100" : "opacity-0"
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

                          {/* Transfer Notes (only show if target user is selected) */}
                          {uploadForm.targetUserId && (
                            <div>
                              <Label htmlFor="transferNotes">Transfer Notes</Label>
                              <Textarea
                                id="transferNotes"
                                value={uploadForm.transferNotes}
                                onChange={(e) => setUploadForm({...uploadForm, transferNotes: e.target.value})}
                                rows={2}
                                placeholder="Add notes about this transfer..."
                              />
                            </div>
                          )}

                          {uploadForm.possessionType === 'Physical' && (
                            <div>
                              <Label htmlFor="location">Current Location</Label>
                              <Input
                                id="location"
                                value={uploadForm.location}
                                onChange={(e) => setUploadForm({...uploadForm, location: e.target.value})}
                                placeholder="e.g., Office Desk, Filing Cabinet"
                              />
                            </div>
                          )}

                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={uploadForm.description}
                              onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                              rows={3}
                              placeholder="Brief description of the document"
                            />
                          </div>

                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Input
                              id="category"
                              value={uploadForm.category}
                              onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
                              placeholder="e.g., Finance, HR, Legal"
                            />
                          </div>

                          <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={uploadForm.priority} onValueChange={(value) => setUploadForm({...uploadForm, priority: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input
                              id="dueDate"
                              type="date"
                              value={uploadForm.dueDate}
                              onChange={(e) => setUploadForm({...uploadForm, dueDate: e.target.value})}
                            />
                          </div>

                          <div className="flex flex-col space-y-2 pt-4">
                            <Button 
                              type="submit" 
                              disabled={isUploading || !uploadForm.title}
                              className="w-full"
                            >
                              {isUploading ? 'Uploading...' : 
                               uploadForm.targetUserId ? 'Upload & Transfer Document' : 'Upload Document'}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setActiveTab('documents')}
                              className="w-full"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Tracking */}
            {activeTab === 'tracking' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Document Tracking</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {documents.filter(doc => doc.status !== 'Approved' && doc.status !== 'Archived').map((document) => (
                    <Card key={document.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{document.title}</span>
                          <div className="flex items-center space-x-2">
                            <Badge className={
                              document.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              document.status === 'In Review' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {document.status}
                            </Badge>
                            {document.awaitingAcceptance && (
                              <Badge className="bg-orange-100 text-orange-800">
                                Awaiting Acceptance
                              </Badge>
                            )}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {document.workflow.map((step) => (
                            <div key={step.id} className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                step.status === 'Complete' ? 'bg-green-500' :
                                step.status === 'Pending' ? 'bg-yellow-500' :
                                'bg-gray-300'
                              }`} />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{step.action}</span>
                                  <span className="text-sm text-gray-500">{step.role}</span>
                                </div>
                                {step.comment && (
                                  <p className="text-sm text-gray-600">{step.comment}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Current Possession Info */}
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Current Possession:</span>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{document.possessionType}</Badge>
                              <span className="text-sm text-gray-600">
                                {document.currentPossession.userName}
                              </span>
                            </div>
                          </div>
                          {document.currentPossession.location && (
                            <p className="text-sm text-gray-500 mt-1">
                              Location: {document.currentPossession.location}
                            </p>
                          )}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedDocument(document)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {['archive', 'users', 'notifications', 'settings'].includes(activeTab) && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900 capitalize">{activeTab}</h1>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <p className="text-gray-500">
                        {activeTab === 'archive' && 'Archived documents will appear here.'}
                        {activeTab === 'users' && 'User management features will be available here.'}
                        {activeTab === 'notifications' && 'Your notifications will appear here.'}
                        {activeTab === 'settings' && 'System settings will be available here.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewer
        document={selectedDocument}
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
        onAddComment={handleAddComment}
        onApprove={(docId) => handleDocumentAction(docId, 'approve')}
        onReject={(docId, reason) => handleDocumentAction(docId, 'reject', reason)}
        currentUserId={currentUser.id}
      />

      {/* Document Transfer Modal */}
      <DocumentTransfer
        document={transferDocument}
        isOpen={!!transferDocument}
        onClose={() => setTransferDocument(null)}
        onTransfer={handleDocumentTransfer}
        currentUserId={currentUser.id}
      />
    </div>
  );
}