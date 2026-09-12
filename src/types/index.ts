export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'Admin' | 'Employee';
  department: 'Engineering' | 'Legal' | 'HR' | 'Marketing' | 'Operations' | 'Finance';
  status: 'Active' | 'Inactive' | 'Invited';
  joinedAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'Processed' | 'Processing' | 'Failed';
  progress?: number;
  department?: string;
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
  action: string;
  target: string;
  ipAddress: string;
  status: 'Success' | 'Failed';
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  category: 'System' | 'Security' | 'Billing' | 'Workflow';
  read: boolean;
  time: string;
}
