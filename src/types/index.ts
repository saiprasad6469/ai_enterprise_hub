export interface User {
  id: string;
  employeeId?: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'SuperAdmin' | 'Admin' | 'Employee' | 'Member' | 'Viewer' | 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE';
  department: 'Engineering' | 'Legal' | 'HR' | 'Marketing' | 'Operations' | 'Finance' | 'IT' | 'Sales' | string;
  designation?: string;
  password?: string;
  status: 'Active' | 'Inactive' | 'Invited';
  joinedAt: string;
}

export interface CompanyTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // Employee Name
  assignedEmployeeId?: string;
  department: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Deferred';
  deadline: string;
  progress: number; // 0 - 100
  createdBy: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  employeeCount: number;
  documentCount: number;
  description: string;
  status: 'Active' | 'Archived';
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'Uploading' | 'Processing' | 'Indexing' | 'Indexed' | 'Processed' | 'Failed';
  progress?: number;
  department?: string;
  category?: string;
  description?: string;
  accessLevel?: 'Public' | 'Department' | 'Confidential' | 'AdminOnly';
  fileType?: string;
  chunksCount?: number;
}

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  department: string;
  model: string;
  status: 'Active' | 'Maintenance' | 'Disabled';
  lastUsed: string;
  promptTemplate?: string;
}

export interface WorkflowRun {
  id: string;
  runAt: string;
  duration: string;
  status: 'Completed' | 'Failed' | 'Running';
  triggerBy: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'Running' | 'Paused' | 'Failed' | 'Completed';
  lastRun: string;
  steps: string[];
  runs: WorkflowRun[];
}

export interface Citation {
  id: string;
  docName: string;
  page?: number;
  relevance?: number;
  textSnippet: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  agentId?: string;
  updatedAt: string;
  messages: Message[];
  messagesCount?: number;
  lastUpdated?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  secretMasked: string;
  status: 'Active' | 'Revoked';
  scopes: string[];
  created: string;
  lastUsed: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userName?: string;
  userRole?: string;
  department?: string;
  action: string;
  target: string;
  ipAddress: string;
  status: 'Success' | 'Failed';
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  category: 'System' | 'Security' | 'Billing' | 'Workflow' | 'Announcement';
  read: boolean;
  time: string;
}
