export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'HR' | 'Accounting' | 'Audit';
  avatar?: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  type: 'Invoice' | 'Contract' | 'Report' | 'Policy' | 'Form' | 'Other';
  category: string;
  status: 'Draft' | 'Pending' | 'In Review' | 'Approved' | 'Rejected' | 'Archived';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  uploadedBy: string;
  uploadedAt: Date;
  currentHandler: string;
  dueDate?: Date;
  fileSize: number;
  fileName: string;
  tags: string[];
  workflow: WorkflowStep[];
  comments: Comment[];
  // New possession tracking fields
  possessionType: 'Digital' | 'Physical';
  currentPossession: PossessionRecord;
  possessionHistory: PossessionRecord[];
  targetDestination?: string; // User ID of intended recipient
  awaitingAcceptance: boolean;
}

export interface PossessionRecord {
  id: string;
  userId: string;
  userName: string;
  possessionType: 'Digital' | 'Physical';
  receivedAt: Date;
  acceptedAt?: Date;
  transferredAt?: Date;
  transferredTo?: string;
  location?: string; // For physical documents
  notes?: string;
  status: 'Pending' | 'Accepted' | 'Transferred' | 'Lost';
}

export interface WorkflowStep {
  id: string;
  role: string;
  userId: string;
  action: 'Upload' | 'Review' | 'Approve' | 'Reject' | 'Comment' | 'Archive' | 'Transfer' | 'Accept' | 'Receive';
  status: 'Pending' | 'Complete' | 'Skipped';
  timestamp: Date;
  comment?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  type: 'Comment' | 'System' | 'Status Change' | 'Possession Change';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'Document' | 'System' | 'Warning' | 'Success' | 'Possession';
  documentId?: string;
  read: boolean;
  timestamp: Date;
  actionRequired?: boolean;
}

export interface DashboardStats {
  totalDocuments: number;
  pendingReview: number;
  approvedToday: number;
  overdueDocuments: number;
  myDocuments: number;
  recentActivity: number;
  awaitingAcceptance: number;
  inMyPossession: number;
}

export interface DocumentTransfer {
  id: string;
  documentId: string;
  fromUserId: string;
  toUserId: string;
  possessionType: 'Digital' | 'Physical';
  transferredAt: Date;
  acceptedAt?: Date;
  notes?: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
}