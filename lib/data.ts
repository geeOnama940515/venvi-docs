import { Document, Notification, DashboardStats, PossessionRecord } from './types';

const DOCUMENTS_KEY = 'document-tracker-documents';
const NOTIFICATIONS_KEY = 'document-tracker-notifications';

export const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Q4 Financial Report',
    description: 'Quarterly financial statements and analysis',
    type: 'Report',
    category: 'Finance',
    status: 'In Review',
    priority: 'High',
    uploadedBy: '3',
    uploadedAt: new Date('2024-01-15'),
    currentHandler: '4',
    dueDate: new Date('2024-01-25'),
    fileSize: 2048576,
    fileName: 'q4-financial-report.pdf',
    tags: ['quarterly', 'finance', 'analysis'],
    possessionType: 'Digital',
    awaitingAcceptance: false,
    currentPossession: {
      id: '1',
      userId: '4',
      userName: 'Lisa Audit',
      possessionType: 'Digital',
      receivedAt: new Date('2024-01-15T10:00:00'),
      acceptedAt: new Date('2024-01-15T10:30:00'),
      status: 'Accepted'
    },
    possessionHistory: [
      {
        id: '1',
        userId: '3',
        userName: 'Mike Accounting',
        possessionType: 'Digital',
        receivedAt: new Date('2024-01-15T09:00:00'),
        acceptedAt: new Date('2024-01-15T09:00:00'),
        transferredAt: new Date('2024-01-15T10:00:00'),
        transferredTo: '4',
        status: 'Transferred'
      }
    ],
    workflow: [
      {
        id: '1',
        role: 'Accounting',
        userId: '3',
        action: 'Upload',
        status: 'Complete',
        timestamp: new Date('2024-01-15T09:00:00'),
        comment: 'Initial upload of Q4 financial report'
      },
      {
        id: '2',
        role: 'Accounting',
        userId: '3',
        action: 'Transfer',
        status: 'Complete',
        timestamp: new Date('2024-01-15T10:00:00'),
        comment: 'Transferred to Audit for review'
      },
      {
        id: '3',
        role: 'Audit',
        userId: '4',
        action: 'Accept',
        status: 'Complete',
        timestamp: new Date('2024-01-15T10:30:00'),
        comment: 'Accepted possession for review'
      }
    ],
    comments: [
      {
        id: '1',
        userId: '3',
        userName: 'Mike Accounting',
        content: 'Initial Q4 report ready for review',
        timestamp: new Date('2024-01-15T09:30:00'),
        type: 'Comment'
      }
    ]
  },
  {
    id: '2',
    title: 'Employee Handbook Update',
    description: 'Updated employee handbook with new policies',
    type: 'Policy',
    category: 'HR',
    status: 'Approved',
    priority: 'Medium',
    uploadedBy: '2',
    uploadedAt: new Date('2024-01-10'),
    currentHandler: '1',
    dueDate: new Date('2024-01-20'),
    fileSize: 1024000,
    fileName: 'employee-handbook-v2.pdf',
    tags: ['policy', 'handbook', 'hr'],
    possessionType: 'Digital',
    awaitingAcceptance: false,
    currentPossession: {
      id: '2',
      userId: '1',
      userName: 'John Admin',
      possessionType: 'Digital',
      receivedAt: new Date('2024-01-12T11:00:00'),
      acceptedAt: new Date('2024-01-12T11:15:00'),
      status: 'Accepted'
    },
    possessionHistory: [
      {
        id: '2',
        userId: '2',
        userName: 'Sarah HR',
        possessionType: 'Digital',
        receivedAt: new Date('2024-01-10T14:00:00'),
        acceptedAt: new Date('2024-01-10T14:00:00'),
        transferredAt: new Date('2024-01-12T11:00:00'),
        transferredTo: '1',
        status: 'Transferred'
      }
    ],
    workflow: [
      {
        id: '3',
        role: 'HR',
        userId: '2',
        action: 'Upload',
        status: 'Complete',
        timestamp: new Date('2024-01-10T14:00:00'),
        comment: 'Updated handbook with new remote work policies'
      },
      {
        id: '4',
        role: 'Admin',
        userId: '1',
        action: 'Approve',
        status: 'Complete',
        timestamp: new Date('2024-01-12T11:00:00'),
        comment: 'Approved - ready for distribution'
      }
    ],
    comments: [
      {
        id: '2',
        userId: '2',
        userName: 'Sarah HR',
        content: 'Updated with latest remote work policies',
        timestamp: new Date('2024-01-10T14:30:00'),
        type: 'Comment'
      }
    ]
  },
  {
    id: '3',
    title: 'Vendor Contract - Tech Solutions',
    description: 'Annual contract with Tech Solutions Inc.',
    type: 'Contract',
    category: 'Legal',
    status: 'Pending',
    priority: 'Critical',
    uploadedBy: '1',
    uploadedAt: new Date('2024-01-12'),
    currentHandler: '2',
    targetDestination: '2',
    dueDate: new Date('2024-01-18'),
    fileSize: 512000,
    fileName: 'tech-solutions-contract.pdf',
    tags: ['contract', 'vendor', 'technology'],
    possessionType: 'Physical',
    awaitingAcceptance: true,
    currentPossession: {
      id: '3',
      userId: '1',
      userName: 'John Admin',
      possessionType: 'Physical',
      receivedAt: new Date('2024-01-12T16:00:00'),
      acceptedAt: new Date('2024-01-12T16:00:00'),
      transferredAt: new Date('2024-01-12T16:30:00'),
      transferredTo: '2',
      location: 'Admin Office - Desk',
      status: 'Transferred'
    },
    possessionHistory: [],
    workflow: [
      {
        id: '5',
        role: 'Admin',
        userId: '1',
        action: 'Upload',
        status: 'Complete',
        timestamp: new Date('2024-01-12T16:00:00'),
        comment: 'Contract ready for HR review'
      },
      {
        id: '6',
        role: 'Admin',
        userId: '1',
        action: 'Transfer',
        status: 'Complete',
        timestamp: new Date('2024-01-12T16:30:00'),
        comment: 'Physical document sent to HR office'
      },
      {
        id: '7',
        role: 'HR',
        userId: '2',
        action: 'Receive',
        status: 'Pending',
        timestamp: new Date('2024-01-12T16:30:00'),
        comment: 'Awaiting acceptance of physical document'
      }
    ],
    comments: []
  }
];

export const getDocuments = (): Document[] => {
  if (typeof window === 'undefined') return mockDocuments;
  
  const stored = localStorage.getItem(DOCUMENTS_KEY);
  if (!stored) {
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(mockDocuments));
    return mockDocuments;
  }
  
  try {
    return JSON.parse(stored);
  } catch {
    return mockDocuments;
  }
};

export const saveDocument = (document: Document): void => {
  if (typeof window === 'undefined') return;
  
  const documents = getDocuments();
  const index = documents.findIndex(d => d.id === document.id);
  
  if (index >= 0) {
    documents[index] = document;
  } else {
    documents.push(document);
  }
  
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
};

export const transferDocument = (documentId: string, fromUserId: string, toUserId: string, possessionType: 'Digital' | 'Physical', notes?: string, location?: string): boolean => {
  const documents = getDocuments();
  const document = documents.find(d => d.id === documentId);
  
  if (!document || document.currentPossession.userId !== fromUserId) {
    return false;
  }

  // Update current possession to transferred status
  document.currentPossession.transferredAt = new Date();
  document.currentPossession.transferredTo = toUserId;
  document.currentPossession.status = 'Transferred';
  if (notes) document.currentPossession.notes = notes;

  // Add to possession history
  document.possessionHistory.push({...document.currentPossession});

  // Create new pending possession record
  document.currentPossession = {
    id: Date.now().toString(),
    userId: toUserId,
    userName: '', // Will be filled when accepted
    possessionType,
    receivedAt: new Date(),
    status: 'Pending',
    location,
    notes
  };

  document.awaitingAcceptance = true;
  document.targetDestination = toUserId;
  document.currentHandler = toUserId;

  // Add workflow step
  document.workflow.push({
    id: Date.now().toString(),
    role: '', // Will be filled based on user
    userId: fromUserId,
    action: 'Transfer',
    status: 'Complete',
    timestamp: new Date(),
    comment: notes || `Transferred ${possessionType.toLowerCase()} document to recipient`
  });

  saveDocument(document);
  return true;
};

export const acceptDocumentPossession = (documentId: string, userId: string, userName: string, location?: string, notes?: string): boolean => {
  const documents = getDocuments();
  const document = documents.find(d => d.id === documentId);
  
  if (!document || !document.awaitingAcceptance || document.targetDestination !== userId) {
    return false;
  }

  // Update current possession
  document.currentPossession.acceptedAt = new Date();
  document.currentPossession.userName = userName;
  document.currentPossession.status = 'Accepted';
  if (location) document.currentPossession.location = location;
  if (notes) document.currentPossession.notes = notes;

  document.awaitingAcceptance = false;
  document.targetDestination = undefined;

  // Add workflow step
  document.workflow.push({
    id: Date.now().toString(),
    role: '', // Will be filled based on user
    userId: userId,
    action: 'Accept',
    status: 'Complete',
    timestamp: new Date(),
    comment: notes || `Accepted possession of ${document.possessionType.toLowerCase()} document`
  });

  saveDocument(document);
  return true;
};

export const getDocumentsAwaitingAcceptance = (userId: string): Document[] => {
  const documents = getDocuments();
  return documents.filter(d => d.awaitingAcceptance && d.targetDestination === userId);
};

export const getDocumentsInPossession = (userId: string): Document[] => {
  const documents = getDocuments();
  return documents.filter(d => 
    !d.awaitingAcceptance && 
    d.currentPossession.userId === userId && 
    d.currentPossession.status === 'Accepted'
  );
};

export const getNotifications = (userId: string): Notification[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(NOTIFICATIONS_KEY);
  const allNotifications: Notification[] = stored ? JSON.parse(stored) : [];
  
  return allNotifications.filter(n => n.userId === userId);
};

export const addNotification = (notification: Notification): void => {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem(NOTIFICATIONS_KEY);
  const notifications: Notification[] = stored ? JSON.parse(stored) : [];
  
  notifications.push(notification);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
};

export const markNotificationAsRead = (notificationId: string): void => {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem(NOTIFICATIONS_KEY);
  const notifications: Notification[] = stored ? JSON.parse(stored) : [];
  
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }
};

export const getDashboardStats = (userId: string, userRole: string): DashboardStats => {
  const documents = getDocuments();
  const userDocuments = documents.filter(d => d.uploadedBy === userId);
  const pendingForUser = documents.filter(d => d.currentHandler === userId && d.status !== 'Approved');
  const awaitingAcceptance = getDocumentsAwaitingAcceptance(userId);
  const inPossession = getDocumentsInPossession(userId);
  
  return {
    totalDocuments: documents.length,
    pendingReview: pendingForUser.length,
    approvedToday: documents.filter(d => 
      d.status === 'Approved' && 
      new Date(d.uploadedAt).toDateString() === new Date().toDateString()
    ).length,
    overdueDocuments: documents.filter(d => 
      d.dueDate && new Date(d.dueDate) < new Date() && d.status !== 'Approved'
    ).length,
    myDocuments: userDocuments.length,
    recentActivity: documents.filter(d => 
      new Date(d.uploadedAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
    awaitingAcceptance: awaitingAcceptance.length,
    inMyPossession: inPossession.length
  };
};