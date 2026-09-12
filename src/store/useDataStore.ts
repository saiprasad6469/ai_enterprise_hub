import { create } from 'zustand';
import { 
  Document, 
  AIAgent, 
  Workflow, 
  User, 
  ApiKey, 
  AuditLog, 
  Notification, 
  ChatSession, 
  Message 
} from '@/types';

interface DataState {
  documents: Document[];
  agents: AIAgent[];
  workflows: Workflow[];
  users: User[];
  apiKeys: ApiKey[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  chats: ChatSession[];
  activeChatId: string | null;
  
  // Actions
  addDocument: (doc: Omit<Document, 'id' | 'uploadedAt' | 'uploadedBy' | 'status'>) => void;
  updateDocumentStatus: (id: string, status: Document['status'], progress?: number) => void;
  deleteDocument: (id: string) => void;
  
  addAgent: (agent: Omit<AIAgent, 'id' | 'lastUsed'>) => void;
  updateAgent: (id: string, updates: Partial<AIAgent>) => void;
  deleteAgent: (id: string) => void;
  
  addWorkflow: (wf: Omit<Workflow, 'id' | 'lastRun' | 'runs' | 'status'>) => void;
  toggleWorkflowStatus: (id: string) => void;
  runWorkflow: (id: string) => Promise<void>;
  deleteWorkflow: (id: string) => void;
  
  addUser: (user: Omit<User, 'id' | 'joinedAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  addApiKey: (name: string, scopes: string[]) => void;
  revokeApiKey: (id: string) => void;
  
  markNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;
  
  setActiveChatId: (id: string | null) => void;
  createNewChat: (agentId?: string) => string;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  deleteChat: (id: string) => void;
}

// Initial Mock Data
const initialDocs: Document[] = [
  { id: 'doc_1', name: 'Q4_Financial_Report.pdf', type: 'PDF', size: '4.2 MB', uploadedBy: 'Sarah Connor', uploadedAt: '2026-07-20', status: 'Processed', department: 'Finance' },
  { id: 'doc_2', name: 'Employee_Handbook_2026.docx', type: 'DOCX', size: '1.8 MB', uploadedBy: 'Sarah Connor', uploadedAt: '2026-07-18', status: 'Processed', department: 'HR' },
  { id: 'doc_3', name: 'GDPR_Compliance_Checklist.txt', type: 'TXT', size: '254 KB', uploadedBy: 'Sarah Connor', uploadedAt: '2026-07-15', status: 'Processed', department: 'Legal' },
  { id: 'doc_4', name: 'Marketing_Strategy_v2.pptx', type: 'PPTX', size: '12.4 MB', uploadedBy: 'John Doe', uploadedAt: '2026-07-22', status: 'Processed', department: 'Marketing' },
  { id: 'doc_5', name: 'Customer_Churn_Q2.csv', type: 'CSV', size: '3.1 MB', uploadedBy: 'Alice Smith', uploadedAt: '2026-07-21', status: 'Processed', department: 'Operations' },
  { id: 'doc_6', name: 'API_Documentation_Draft.pdf', type: 'PDF', size: '8.9 MB', uploadedBy: 'Bob Johnson', uploadedAt: '2026-07-23', status: 'Processing', progress: 45, department: 'Engineering' },
  { id: 'doc_7', name: 'Supplier_Contract_Draft.docx', type: 'DOCX', size: '940 KB', uploadedBy: 'Claire Lee', uploadedAt: '2026-07-19', status: 'Processed', department: 'Legal' },
  { id: 'doc_8', name: 'Infrastructure_Cost_Model.xlsx', type: 'XLSX', size: '5.2 MB', uploadedBy: 'Sarah Connor', uploadedAt: '2026-07-12', status: 'Processed', department: 'Engineering' },
];

const initialAgents: AIAgent[] = [
  { id: 'agent_1', name: 'Legal Counsel Copilot', description: 'Specialized in interpreting compliance rules, contract definitions, and liability clauses.', department: 'Legal', model: 'GPT-4o Enterprise', status: 'Active', lastUsed: '2026-07-23 15:45' },
  { id: 'agent_2', name: 'Engineering Documentation Bot', description: 'Assists with technical specs, API lookups, code snippets, and systems design queries.', department: 'Engineering', model: 'Claude 3.5 Sonnet', status: 'Active', lastUsed: '2026-07-23 18:10' },
  { id: 'agent_3', name: 'HR Assistant Bot', description: 'Answers employee handbook queries, leave policies, onboarding procedures, and templates.', department: 'HR', model: 'Llama 3.1 70B', status: 'Active', lastUsed: '2026-07-22 09:30' },
  { id: 'agent_4', name: 'Financial Analyst Expert', description: 'Performs calculations, reviews growth margins, checks balance sheets, and estimates cash flows.', department: 'Finance', model: 'GPT-4o Enterprise', status: 'Active', lastUsed: '2026-07-23 11:20' },
  { id: 'agent_5', name: 'Marketing Copywriter AI', description: 'Generates SEO-friendly landing page text, email newsletters, and Twitter/LinkedIn drafts.', department: 'Marketing', model: 'Claude 3.5 Sonnet', status: 'Maintenance', lastUsed: '2026-07-19 14:02' },
  { id: 'agent_6', name: 'Ops Process Optimizer', description: 'Analyzes process logs, resource bottlenecks, and automates standard runbooks.', department: 'Operations', model: 'Llama 3.1 70B', status: 'Disabled', lastUsed: '2026-07-10 17:50' },
];

const initialWorkflows: Workflow[] = [
  {
    id: 'wf_1',
    name: 'Automatic Contract Analysis',
    description: 'Triggered when a contract PDF is uploaded to Legal. Extracts key terms, checks GDPR flags, and sends summary to Slack.',
    status: 'Running',
    lastRun: '2026-07-23 17:30',
    steps: ['Trigger: PDF File Uploaded', 'AI Node: Extract Liability & Term length', 'AI Node: GDPR Risk Assessment', 'Slack Alert: Publish Summary', 'Email Alert: Notify Legal Admin'],
    runs: [
      { id: 'run_1_1', runAt: '2026-07-23 17:30', duration: '14.2s', status: 'Completed', triggerBy: 'System Upload' },
      { id: 'run_1_2', runAt: '2026-07-22 14:15', duration: '15.1s', status: 'Completed', triggerBy: 'System Upload' },
      { id: 'run_1_3', runAt: '2026-07-20 11:05', duration: '12.8s', status: 'Failed', triggerBy: 'Sarah Connor' },
    ],
  },
  {
    id: 'wf_2',
    name: 'Tech Stack Documentation Update',
    description: 'Syncs GitHub repositories weekly, parses Markdown docs, and updates Vector Database embeddings for the AI agents.',
    status: 'Completed',
    lastRun: '2026-07-23 04:00',
    steps: ['Trigger: Scheduled Cron (Weekly)', 'Github Fetch: Pull /docs folder', 'AI Node: Chunk & Tokenize', 'Vector DB: Upsert Pinecone Index'],
    runs: [
      { id: 'run_2_1', runAt: '2026-07-23 04:00', duration: '120.4s', status: 'Completed', triggerBy: 'Cron Trigger' },
      { id: 'run_2_2', runAt: '2026-07-16 04:00', duration: '115.8s', status: 'Completed', triggerBy: 'Cron Trigger' },
    ],
  },
  {
    id: 'wf_3',
    name: 'Invoice Processing Pipeline',
    description: 'OCR processing on invoice documents, validation of totals, matching with purchase orders, and flagging anomalies.',
    status: 'Paused',
    lastRun: '2026-07-21 16:45',
    steps: ['Trigger: Email attachment matching invoice@', 'AI Node: OCR Text Extraction', 'AI Node: PO Match & Math Verification', 'Approved Check: Router node', 'ERP Sync: Sync to Finance Ledger'],
    runs: [
      { id: 'run_3_1', runAt: '2026-07-21 16:45', duration: '22.3s', status: 'Completed', triggerBy: 'Email Trigger' },
      { id: 'run_3_2', runAt: '2026-07-20 09:12', duration: '24.1s', status: 'Failed', triggerBy: 'Email Trigger' },
    ],
  },
  {
    id: 'wf_4',
    name: 'Customer Feedback Sentiment Monitor',
    description: 'Tracks support tickets. Classifies sentiment, highlights critical complaints, and drafts response recommendations for support agents.',
    status: 'Completed',
    lastRun: '2026-07-23 18:20',
    steps: ['Trigger: Zendesk webhook', 'AI Node: Sentiment Classification', 'Router Node: If Sentiment is negative', 'AI Node: Draft Apology & Suggest Solution', 'Zendesk Sync: Inject draft context'],
    runs: [
      { id: 'run_4_1', runAt: '2026-07-23 18:20', duration: '5.4s', status: 'Completed', triggerBy: 'Webhook' },
      { id: 'run_4_2', runAt: '2026-07-23 18:15', duration: '4.8s', status: 'Completed', triggerBy: 'Webhook' },
      { id: 'run_4_3', runAt: '2026-07-23 18:02', duration: '5.1s', status: 'Completed', triggerBy: 'Webhook' },
    ],
  },
];

const initialUsers: User[] = [
  { id: 'usr_1', name: 'Sarah Connor', email: 'sarah.connor@sky-net.io', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', role: 'Admin', department: 'Engineering', status: 'Active', joinedAt: '2025-01-15' },
  { id: 'usr_2', name: 'John Doe', email: 'john.doe@sky-net.io', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', role: 'Member', department: 'Marketing', status: 'Active', joinedAt: '2025-03-20' },
  { id: 'usr_3', name: 'Alice Smith', email: 'alice.smith@sky-net.io', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', role: 'Member', department: 'Operations', status: 'Active', joinedAt: '2025-02-10' },
  { id: 'usr_4', name: 'Bob Johnson', email: 'bob.johnson@sky-net.io', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', role: 'Member', department: 'Engineering', status: 'Active', joinedAt: '2025-05-12' },
  { id: 'usr_5', name: 'Claire Lee', email: 'claire.lee@sky-net.io', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', role: 'Viewer', department: 'Legal', status: 'Active', joinedAt: '2025-06-01' },
  { id: 'usr_6', name: 'Kyle Reese', email: 'kyle.reese@sky-net.io', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', role: 'Member', department: 'Finance', status: 'Active', joinedAt: '2025-01-20' },
  { id: 'usr_7', name: 'Miles Dyson', email: 'miles.dyson@sky-net.io', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', role: 'Member', department: 'Engineering', status: 'Invited', joinedAt: '2026-07-21' },
  { id: 'usr_8', name: 'Marcus Wright', email: 'marcus.wright@sky-net.io', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', role: 'Member', department: 'Operations', status: 'Inactive', joinedAt: '2025-10-15' },
];

const initialApiKeys: ApiKey[] = [
  { id: 'key_1', name: 'Production Chat Client', keyPrefix: 'aeh_live_9a2f', secretMasked: '••••••••••••••••••••••••••••••••••••3fa4', status: 'Active', scopes: ['chat:write', 'chat:read'], created: '2026-01-10', lastUsed: '2026-07-23 18:40' },
  { id: 'key_2', name: 'Zendesk Ticket Webhook', keyPrefix: 'aeh_live_82bc', secretMasked: '••••••••••••••••••••••••••••••••••••66ab', status: 'Active', scopes: ['workflows:trigger'], created: '2026-03-15', lastUsed: '2026-07-23 18:20' },
  { id: 'key_3', name: 'Stripe Invoice Ingestion', keyPrefix: 'aeh_live_1091', secretMasked: '••••••••••••••••••••••••••••••••••••bf51', status: 'Active', scopes: ['documents:write'], created: '2026-04-20', lastUsed: '2026-07-21 16:45' },
  { id: 'key_4', name: 'Local Test Key', keyPrefix: 'aeh_test_88df', secretMasked: '••••••••••••••••••••••••••••••••••••7c2a', status: 'Revoked', scopes: ['*'], created: '2026-05-01', lastUsed: '2026-05-15 10:22' },
];

const initialLogs: AuditLog[] = [
  { id: 'log_1', timestamp: '2026-07-23 18:40:15', user: 'sarah.connor@sky-net.io', action: 'API_KEY_USE', target: 'Production Chat Client', ipAddress: '192.168.1.15', status: 'Success' },
  { id: 'log_2', timestamp: '2026-07-23 18:20:10', user: 'system_webhook', action: 'WORKFLOW_TRIGGER', target: 'Customer Feedback Sentiment Monitor', ipAddress: '34.201.55.10', status: 'Success' },
  { id: 'log_3', timestamp: '2026-07-23 18:10:05', user: 'sarah.connor@sky-net.io', action: 'CHAT_CREATE', target: 'Session with Engineering Documentation Bot', ipAddress: '192.168.1.15', status: 'Success' },
  { id: 'log_4', timestamp: '2026-07-23 15:45:00', user: 'claire.lee@sky-net.io', action: 'CHAT_CREATE', target: 'Session with Legal Counsel Copilot', ipAddress: '192.168.1.42', status: 'Success' },
  { id: 'log_5', timestamp: '2026-07-23 12:30:12', user: 'sarah.connor@sky-net.io', action: 'AGENT_CREATE', target: 'Ops Process Optimizer', ipAddress: '192.168.1.15', status: 'Success' },
  { id: 'log_6', timestamp: '2026-07-23 11:15:44', user: 'kyle.reese@sky-net.io', action: 'DOC_UPLOAD', target: 'Infrastructure_Cost_Model.xlsx', ipAddress: '192.168.1.12', status: 'Success' },
  { id: 'log_7', timestamp: '2026-07-23 09:30:00', user: 'sarah.connor@sky-net.io', action: 'SETTINGS_UPDATE', target: 'Workspace Security Config', ipAddress: '192.168.1.15', status: 'Success' },
  { id: 'log_8', timestamp: '2026-07-22 14:15:33', user: 'system_upload', action: 'WORKFLOW_TRIGGER', target: 'Automatic Contract Analysis', ipAddress: '10.0.4.12', status: 'Success' },
  { id: 'log_9', timestamp: '2026-07-22 14:12:00', user: 'john.doe@sky-net.io', action: 'DOC_UPLOAD', target: 'Marketing_Strategy_v2.pptx', ipAddress: '192.168.1.28', status: 'Success' },
  { id: 'log_10', timestamp: '2026-07-21 16:45:10', user: 'system_webhook', action: 'WORKFLOW_TRIGGER', target: 'Invoice Processing Pipeline', ipAddress: '54.80.20.14', status: 'Success' },
  { id: 'log_11', timestamp: '2026-07-20 11:05:00', user: 'sarah.connor@sky-net.io', action: 'WORKFLOW_TRIGGER', target: 'Automatic Contract Analysis', ipAddress: '192.168.1.15', status: 'Failed' },
  { id: 'log_12', timestamp: '2026-07-18 10:00:00', user: 'sarah.connor@sky-net.io', action: 'USER_INVITE', target: 'miles.dyson@sky-net.io', ipAddress: '192.168.1.15', status: 'Success' },
];

const initialNotifications: Notification[] = [
  { id: 'not_1', title: 'Workflow Failed', description: 'Workflow "Automatic Contract Analysis" failed on step 3: "GDPR Risk Assessment". File size exceeded token limit.', category: 'Workflow', read: false, time: '10m ago' },
  { id: 'not_2', title: 'API Key Revoked', description: 'API Key "Local Test Key" has been marked as revoked by Admin.', category: 'Security', read: false, time: '2h ago' },
  { id: 'not_3', title: 'New User Joined', description: 'Miles Dyson accepted their invitation and joined the Engineering team.', category: 'System', read: false, time: '1d ago' },
  { id: 'not_4', title: 'Invoices Pipeline Running', description: 'Workflow "Invoice Processing Pipeline" has processed 5 invoices automatically.', category: 'Workflow', read: true, time: '2d ago' },
  { id: 'not_5', title: 'Billing Threshold Reached', description: 'Your workspace has consumed 80% of the allocated monthly model tokens.', category: 'Billing', read: true, time: '3d ago' },
];

const initialChats: ChatSession[] = [
  {
    id: 'chat_1',
    title: 'GDPR Compliance Check',
    agentId: 'agent_1',
    updatedAt: '2026-07-23 15:47',
    messages: [
      { id: 'm1_1', sender: 'user', content: 'What are the main liabilities described in the GDPR compliance text?', timestamp: '15:45' },
      { 
        id: 'm1_2', 
        sender: 'assistant', 
        content: 'Based on the uploaded document [GDPR_Compliance_Checklist.txt](doc_3), the primary liabilities include:\n\n1. **Administrative Fines**: Up to €20 million or 4% of the global annual turnover of the preceding financial year, whichever is higher.\n2. **Right to Compensation**: Any person who has suffered material or non-material damage has the right to receive compensation from the controller or processor.\n\nHere is a code snippet that highlights how to check consent flags in database schemas:\n\n```python\ndef is_gdpr_compliant(user_data):\n    # Ensure data minimization and consent flags are checked\n    consent_given = user_data.get("gdpr_consent", False)\n    anonymized = user_data.get("is_anonymized", False)\n    return consent_given or anonymized\n```\n\nLet me know if you would like me to draft an amendment draft matching this format.', 
        timestamp: '15:46',
        citations: [
          { id: 'cit_1', docName: 'GDPR_Compliance_Checklist.txt', page: 2, textSnippet: 'Article 82 outline: Right to compensation and liability rules for data controllers...' },
          { id: 'cit_2', docName: 'GDPR_Compliance_Checklist.txt', page: 4, textSnippet: 'Article 83 outline: General conditions for imposing administrative fines up to 20,000,000 EUR...' }
        ]
      }
    ]
  },
  {
    id: 'chat_2',
    title: 'Cost Estimation API Integration',
    agentId: 'agent_2',
    updatedAt: '2026-07-23 18:12',
    messages: [
      { id: 'm2_1', sender: 'user', content: 'How do I query the infrastructure cost model from my service?', timestamp: '18:10' },
      {
        id: 'm2_2',
        sender: 'assistant',
        content: 'You can extract calculations from the spreadsheet using our API. Use the following payload format to trigger calculations for the AWS ec2 instances node:\n\n```json\n{\n  "document_id": "doc_8",\n  "sheet_name": "Cost Model",\n  "inputs": {\n    "instance_count": 25,\n    "region": "us-east-1"\n  }\n}\n```\n\nThis will evaluate the formula cells and return the updated monthly projection.',
        timestamp: '18:12',
        citations: [
          { id: 'cit_3', docName: 'Infrastructure_Cost_Model.xlsx', page: 1, textSnippet: 'AWS EC2 pricing projections formulas: B12 = A12 * 730 * InstanceRate' }
        ]
      }
    ]
  }
];

export const useDataStore = create<DataState>((set, get) => ({
  documents: initialDocs,
  agents: initialAgents,
  workflows: initialWorkflows,
  users: initialUsers,
  apiKeys: initialApiKeys,
  auditLogs: initialLogs,
  notifications: initialNotifications,
  chats: initialChats,
  activeChatId: 'chat_1',

  addDocument: (doc) => {
    const id = 'doc_' + Math.random().toString(36).substr(2, 9);
    const newDoc: Document = {
      ...doc,
      id,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: 'Sarah Connor',
      status: 'Processing',
      progress: 0,
    };
    
    // Add to documents list
    set((state) => ({
      documents: [newDoc, ...state.documents],
      auditLogs: [
        {
          id: 'log_' + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          user: 'sarah.connor@sky-net.io',
          action: 'DOC_UPLOAD',
          target: doc.name,
          ipAddress: '192.168.1.15',
          status: 'Success',
        },
        ...state.auditLogs,
      ],
    }));

    // Simulate progress updates
    const interval = setInterval(() => {
      set((state) => {
        const targetDoc = state.documents.find((d) => d.id === id);
        if (!targetDoc) {
          clearInterval(interval);
          return state;
        }

        const nextProgress = (targetDoc.progress || 0) + 15;
        if (nextProgress >= 100) {
          clearInterval(interval);
          return {
            documents: state.documents.map((d) =>
              d.id === id ? { ...d, status: 'Processed', progress: undefined } : d
            ),
          };
        } else {
          return {
            documents: state.documents.map((d) =>
              d.id === id ? { ...d, progress: nextProgress } : d
            ),
          };
        }
      });
    }, 400);
  },

  updateDocumentStatus: (id, status, progress) => {
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, status, progress } : d
      ),
    }));
  },

  deleteDocument: (id) => {
    const doc = get().documents.find(d => d.id === id);
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
      auditLogs: doc ? [
        {
          id: 'log_' + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          user: 'sarah.connor@sky-net.io',
          action: 'DOC_DELETE',
          target: doc.name,
          ipAddress: '192.168.1.15',
          status: 'Success',
        },
        ...state.auditLogs,
      ] : state.auditLogs
    }));
  },

  addAgent: (agent) => {
    const id = 'agent_' + Math.random().toString(36).substr(2, 9);
    const newAgent: AIAgent = {
      ...agent,
      id,
      lastUsed: 'Never used',
    };
    set((state) => ({
      agents: [...state.agents, newAgent],
      auditLogs: [
        {
          id: 'log_' + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          user: 'sarah.connor@sky-net.io',
          action: 'AGENT_CREATE',
          target: agent.name,
          ipAddress: '192.168.1.15',
          status: 'Success',
        },
        ...state.auditLogs,
      ],
    }));
  },

  updateAgent: (id, updates) => {
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      auditLogs: [
        {
          id: 'log_' + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          user: 'sarah.connor@sky-net.io',
          action: 'AGENT_UPDATE',
          target: `Agent ID: ${id}`,
          ipAddress: '192.168.1.15',
          status: 'Success',
        },
        ...state.auditLogs,
      ],
    }));
  },

  deleteAgent: (id) => {
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== id),
      auditLogs: [
        {
          id: 'log_' + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          user: 'sarah.connor@sky-net.io',
          action: 'AGENT_DELETE',
          target: `Agent ID: ${id}`,
          ipAddress: '192.168.1.15',
          status: 'Success',
        },
        ...state.auditLogs,
      ],
    }));
  },

  addWorkflow: (wf) => {
    const id = 'wf_' + Math.random().toString(36).substr(2, 9);
    const newWf: Workflow = {
      ...wf,
      id,
      status: 'Completed',
      lastRun: 'Never run',
      runs: [],
    };
    set((state) => ({
      workflows: [...state.workflows, newWf],
      auditLogs: [
        {
          id: 'log_' + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          user: 'sarah.connor@sky-net.io',
          action: 'WORKFLOW_CREATE',
          target: wf.name,
          ipAddress: '192.168.1.15',
          status: 'Success',
        },
        ...state.auditLogs,
      ],
    }));
  },

  toggleWorkflowStatus: (id) => {
    set((state) => ({
      workflows: state.workflows.map((w) => {
        if (w.id === id) {
          const nextStatus = w.status === 'Running' ? 'Paused' : 'Running';
          return { ...w, status: nextStatus };
        }
        return w;
      }),
    }));
  },

  runWorkflow: async (id) => {
    // Set status to running
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === id ? { ...w, status: 'Running' } : w
      ),
    }));

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const success = Math.random() > 0.15;
    const runId = 'run_' + Math.random().toString(36).substr(2, 9);
    const newRun = {
      id: runId,
      runAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      duration: (3 + Math.random() * 5).toFixed(1) + 's',
      status: success ? 'Completed' as const : 'Failed' as const,
      triggerBy: 'Sarah Connor',
    };

    set((state) => {
      const updatedWorkflows = state.workflows.map((w) => {
        if (w.id === id) {
          return {
            ...w,
            status: success ? ('Completed' as const) : ('Failed' as const),
            lastRun: newRun.runAt,
            runs: [newRun, ...w.runs],
          };
        }
        return w;
      });

      const newAudit = {
        id: 'log_' + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: 'sarah.connor@sky-net.io',
        action: 'WORKFLOW_TRIGGER',
        target: `Workflow ID: ${id}`,
        ipAddress: '192.168.1.15',
        status: success ? ('Success' as const) : ('Failed' as const),
      };

      const newNotif = success 
        ? null 
        : {
            id: 'not_' + Math.random().toString(36).substr(2, 9),
            title: 'Workflow Execution Failed',
            description: `Workflow run ${runId} encountered an error.`,
            category: 'Workflow' as const,
            read: false,
            time: 'Just now',
          };

      return {
        workflows: updatedWorkflows,
        auditLogs: [newAudit, ...state.auditLogs],
        notifications: newNotif ? [newNotif, ...state.notifications] : state.notifications,
      };
    });
  },

  deleteWorkflow: (id) => {
    set((state) => ({
      workflows: state.workflows.filter((w) => w.id !== id),
    }));
  },

  addUser: (user) => {
    const id = 'usr_' + Math.random().toString(36).substr(2, 9);
    const newUser: User = {
      ...user,
      id,
      joinedAt: new Date().toISOString().split('T')[0],
    };
    set((state) => ({
      users: [...state.users, newUser],
      auditLogs: [
        {
          id: 'log_' + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          user: 'sarah.connor@sky-net.io',
          action: 'USER_INVITE',
          target: user.email,
          ipAddress: '192.168.1.15',
          status: 'Success',
        },
        ...state.auditLogs,
      ],
    }));
  },

  updateUser: (id, updates) => {
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
    }));
  },

  deleteUser: (id) => {
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
    }));
  },

  addApiKey: (name, scopes) => {
    const id = 'key_' + Math.random().toString(36).substr(2, 9);
    const suffix = Math.random().toString(36).substr(2, 4);
    const newKey: ApiKey = {
      id,
      name,
      keyPrefix: `aeh_live_${Math.random().toString(36).substr(2, 4)}`,
      secretMasked: `••••••••••••••••••••••••••••••••••••${suffix}`,
      status: 'Active',
      scopes,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never used',
    };
    set((state) => ({
      apiKeys: [...state.apiKeys, newKey],
      auditLogs: [
        {
          id: 'log_' + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          user: 'sarah.connor@sky-net.io',
          action: 'API_KEY_CREATE',
          target: name,
          ipAddress: '192.168.1.15',
          status: 'Success',
        },
        ...state.auditLogs,
      ],
    }));
  },

  revokeApiKey: (id) => {
    set((state) => ({
      apiKeys: state.apiKeys.map((k) => (k.id === id ? { ...k, status: 'Revoked' } : k)),
      auditLogs: [
        {
          id: 'log_' + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          user: 'sarah.connor@sky-net.io',
          action: 'API_KEY_REVOKE',
          target: `Key ID: ${id}`,
          ipAddress: '192.168.1.15',
          status: 'Success',
        },
        ...state.auditLogs,
      ],
    }));
  },

  markNotificationsAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  clearNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  setActiveChatId: (id) => set({ activeChatId: id }),

  createNewChat: (agentId) => {
    const id = 'chat_' + Math.random().toString(36).substr(2, 9);
    const agent = get().agents.find((a) => a.id === agentId);
    const title = agent ? `Chat with ${agent.name}` : 'New AI Consultation';
    const newChat: ChatSession = {
      id,
      title,
      agentId,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      messages: [],
    };
    set((state) => ({
      chats: [newChat, ...state.chats],
      activeChatId: id,
    }));
    return id;
  },

  sendMessage: async (chatId, content) => {
    const userMsgId = 'msg_' + Math.random().toString(36).substr(2, 9);
    const timestampStr = new Date().toTimeString().split(' ')[0].substring(0, 5);
    const userMessage: Message = {
      id: userMsgId,
      sender: 'user',
      content,
      timestamp: timestampStr,
    };

    // Add user message to active chat
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId
          ? {
              ...c,
              updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              messages: [...c.messages, userMessage],
            }
          : c
      ),
    }));

    // Simulate agent typing/streaming
    const assistMsgId = 'msg_' + Math.random().toString(36).substr(2, 9);
    const placeholderMessage: Message = {
      id: assistMsgId,
      sender: 'assistant',
      content: '',
      timestamp: timestampStr,
      isStreaming: true,
    };

    // Add placeholder assistant message
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: [...c.messages, placeholderMessage],
            }
          : c
      ),
    }));

    // Simulate streaming content and citation lookups
    const currentChat = get().chats.find((c) => c.id === chatId);
    const currentAgent = get().agents.find((a) => a.id === currentChat?.agentId);
    const agentName = currentAgent?.name || 'Enterprise Assistant';

    // Formulate response based on user input
    let fullResponse = `As the AI Agent specializing in ${currentAgent?.department || 'Enterprise Ops'}, I have searched your workspace database.\n\nHere is a breakdown of your query:\n\n1. **Context Matching**: Checked references across documents.\n2. **Verification**: Executed parameter lookups.\n\nBelow is a standard template configuration for this action:\n\n\`\`\`javascript\n// Auto-generated configuration for ${agentName}\nconst agentConfig = {\n  model: "${currentAgent?.model || 'GPT-4o'}",\n  temperature: 0.2,\n  maxTokens: 4096,\n  stream: true\n};\nconsole.log("Ready to execute query.");\n\`\`\`\n\nIs there any other folder or specific criteria you would like me to review?`;
    
    if (content.toLowerCase().includes('contract') || content.toLowerCase().includes('gdpr')) {
      fullResponse = `Under the GDPR guidelines and Article 82, standard data processors are fully liable for any compliance infringements unless they prove they are not responsible for the event. Here is a summary of recommended actions:\n\n* **Conduct DPIA** for risky datasets.\n* **Audit sub-processors** every 12 months.\n* **Verify Consent Logs** inside database transactions.\n\n\`\`\`sql\n-- Sample query to audit consent expiration\nSELECT user_id, consent_date, consent_scope \nFROM user_consent \nWHERE consent_revoked = FALSE \n  AND consent_date < NOW() - INTERVAL '1 year';\n\`\`\`\n\nYou should update this in your compliance logs.`;
    }

    const citationDocs = get().documents.slice(0, 2);
    const mockCitations = citationDocs.map((d, index) => ({
      id: `cit_${Math.random().toString(36).substr(2, 5)}`,
      docName: d.name,
      page: index + 1,
      textSnippet: `Relevant reference text extracted from ${d.name} regarding consent validation and scope limits.`,
    }));

    const responseWords = fullResponse.split(' ');
    let currentContent = '';
    
    for (let i = 0; i < responseWords.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 45));
      currentContent += (i === 0 ? '' : ' ') + responseWords[i];
      
      set((state) => ({
        chats: state.chats.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistMsgId
                    ? { ...m, content: currentContent }
                    : m
                ),
              }
            : c
        ),
      }));
    }

    // Complete the streaming state and attach citations
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistMsgId
                  ? { ...m, isStreaming: false, citations: mockCitations }
                  : m
              ),
            }
          : c
      ),
    }));
  },

  deleteChat: (id) => {
    set((state) => {
      const nextChats = state.chats.filter((c) => c.id !== id);
      const nextActiveId = state.activeChatId === id
        ? (nextChats.length > 0 ? nextChats[0].id : null)
        : state.activeChatId;
      return {
        chats: nextChats,
        activeChatId: nextActiveId,
      };
    });
  },
}));


