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
  Message,
  Citation,
  CompanyTask,
  Department
} from '@/types';
import { useAuthStore } from './useAuthStore';

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
  companyTasks: CompanyTask[];
  departmentsList: Department[];
  
  // Actions
  addDocument: (doc: Omit<Document, 'id' | 'uploadedAt' | 'uploadedBy' | 'status'>) => void;
  uploadDocumentFile: (file: File, department?: string) => Promise<any>;
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

  // Specific Employee Management Actions
  addEmployee: (employee: {
    employeeId: string;
    name: string;
    email: string;
    department: User['department'];
    designation: string;
    password?: string;
    status?: 'Active' | 'Inactive';
  }) => void;
  updateEmployeePassword: (id: string, newPassword: string) => void;
  deactivateEmployee: (id: string) => void;

  // Administrator Management Actions (Super Admin)
  addAdmin: (admin: {
    employeeId?: string;
    name: string;
    email: string;
    designation?: string;
    department?: string;
    password?: string;
    role?: 'Admin' | 'SuperAdmin';
  }) => void;
  deactivateAdmin: (id: string) => void;

  // Company Task Actions
  addTask: (task: Omit<CompanyTask, 'id' | 'createdAt' | 'createdBy'>) => void;
  updateTask: (id: string, updates: Partial<CompanyTask>) => void;
  deleteTask: (id: string) => void;

  // Department Actions
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  
  addApiKey: (name: string, scopes: string[]) => void;
  revokeApiKey: (id: string) => void;
  
  markNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;
  
  fetchInitialData: () => Promise<void>;
  fetchAuditLogs: () => Promise<void>;
  setActiveChatId: (id: string | null) => void;
  createNewChat: (agentId?: string) => string;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  deleteChat: (id: string) => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  documents: [],
  agents: [],
  workflows: [],
  users: [],
  apiKeys: [],
  auditLogs: [],
  notifications: [],
  chats: [],
  companyTasks: [],
  departmentsList: [],
  activeChatId: null,

  fetchInitialData: async () => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const accessToken = useAuthStore.getState().accessToken;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
    };

    // 1. Fetch Users
    try {
      const userRes = await fetch(`${API_BASE}/users`, { headers });
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.success && Array.isArray(userData.data)) {
          set({ users: userData.data });
        }
      }
    } catch {}

    // 2. Fetch Documents
    try {
      const docRes = await fetch(`${API_BASE}/documents`, { headers });
      if (docRes.ok) {
        const docData = await docRes.json();
        if (docData.success && Array.isArray(docData.data)) {
          set({ documents: docData.data });
        }
      }
    } catch {}

    // 3. Fetch Tasks
    try {
      const taskRes = await fetch(`${API_BASE}/tasks`, { headers });
      if (taskRes.ok) {
        const taskData = await taskRes.json();
        if (taskData.success && Array.isArray(taskData.data)) {
          set({ companyTasks: taskData.data });
        }
      }
    } catch {}

    // 4. Fetch Departments
    try {
      const deptRes = await fetch(`${API_BASE}/departments`, { headers });
      if (deptRes.ok) {
        const deptData = await deptRes.json();
        if (deptData.success && Array.isArray(deptData.data)) {
          set({ departmentsList: deptData.data });
        }
      }
    } catch {}

    // 5. Fetch AI Agents
    try {
      const agentRes = await fetch(`${API_BASE}/agents`, { headers });
      if (agentRes.ok) {
        const agentData = await agentRes.json();
        if (agentData.success && Array.isArray(agentData.data)) {
          set({ agents: agentData.data });
        }
      }
    } catch {}

    // 6. Fetch Workflows
    try {
      const wfRes = await fetch(`${API_BASE}/workflows`, { headers });
      if (wfRes.ok) {
        const wfData = await wfRes.json();
        if (wfData.success && Array.isArray(wfData.data)) {
          set({ workflows: wfData.data });
        }
      }
    } catch {}

    // 7. Fetch API Keys
    try {
      const keyRes = await fetch(`${API_BASE}/api-keys`, { headers });
      if (keyRes.ok) {
        const keyData = await keyRes.json();
        if (keyData.success && Array.isArray(keyData.data)) {
          set({ apiKeys: keyData.data });
        }
      }
    } catch {}

    // 8. Fetch Notifications
    try {
      const notifRes = await fetch(`${API_BASE}/notifications`, { headers });
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        if (notifData.success && Array.isArray(notifData.data)) {
          set({ notifications: notifData.data });
        }
      }
    } catch {}

    // 9. Fetch Chats
    try {
      const chatRes = await fetch(`${API_BASE}/chats`, { headers });
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        if (chatData.success && Array.isArray(chatData.data)) {
          set({ chats: chatData.data });
          if (chatData.data.length > 0 && !get().activeChatId) {
            set({ activeChatId: chatData.data[0].id });
          }
        }
      }
    } catch {}

    // 10. Fetch Audit Logs
    await get().fetchAuditLogs();
  },

  fetchAuditLogs: async () => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const accessToken = useAuthStore.getState().accessToken;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
    };

    try {
      const res = await fetch(`${API_BASE}/audit-logs`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.logs && Array.isArray(data.data.logs)) {
          set({ auditLogs: data.data.logs });
        }
      }
    } catch (err) {
      console.error('Failed to fetch audit logs from backend:', err);
    }
  },

  uploadDocumentFile: async (file: File, department?: string) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const accessToken = useAuthStore.getState().accessToken;
    const user = useAuthStore.getState().user;
    const userDept = department || user?.department || 'Engineering';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('department', userDept);

    try {
      const res = await fetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        headers: {
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          await get().fetchInitialData();
          return data.data;
        }
      }
    } catch (err) {
      console.error('Failed to upload document file to server:', err);
    }
  },

  addDocument: (doc) => {
    const id = 'doc_' + Math.random().toString(36).substr(2, 9);
    const newDoc: Document = {
      ...doc,
      id,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: useAuthStore.getState().user?.name || 'Administrator',
      status: 'Processing',
      progress: 0,
    };
    
    set((state) => ({
      documents: [newDoc, ...state.documents],
    }));
  },

  updateDocumentStatus: (id, status, progress) => {
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, status, progress } : d
      ),
    }));
  },

  deleteDocument: async (id) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const accessToken = useAuthStore.getState().accessToken;

    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
    }));

    try {
      await fetch(`${API_BASE}/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
      });
      await get().fetchAuditLogs();
    } catch (err) {
      console.error('Failed to delete document from backend API:', err);
    }
  },

  addAgent: async (agent) => {
    const id = 'agent_' + Math.random().toString(36).substr(2, 9);
    const newAgent: AIAgent = {
      ...agent,
      id,
      lastUsed: 'Never used',
    };
    set((state) => ({
      agents: [...state.agents, newAgent],
    }));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      const res = await fetch(`${API_BASE}/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(agent),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          set((state) => ({
            agents: state.agents.map((a) => (a.id === id ? { ...a, id: data.data.id } : a)),
          }));
        }
      }
      await get().fetchAuditLogs();
    } catch {}
  },

  updateAgent: async (id, updates) => {
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      await fetch(`${API_BASE}/agents/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      await get().fetchAuditLogs();
    } catch {}
  },

  deleteAgent: async (id) => {
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== id),
    }));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      await fetch(`${API_BASE}/agents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await get().fetchAuditLogs();
    } catch {}
  },

  addWorkflow: async (wf) => {
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
    }));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      const res = await fetch(`${API_BASE}/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(wf),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          set((state) => ({
            workflows: state.workflows.map((w) => (w.id === id ? { ...w, id: data.data.id } : w)),
          }));
        }
      }
      await get().fetchAuditLogs();
    } catch {}
  },

  toggleWorkflowStatus: async (id) => {
    const targetWf = get().workflows.find((w) => w.id === id);
    const nextStatus = targetWf?.status === 'Running' ? 'Paused' : 'Running';

    set((state) => ({
      workflows: state.workflows.map((w) => (w.id === id ? { ...w, status: nextStatus } : w)),
    }));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      await fetch(`${API_BASE}/workflows/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch {}
  },

  runWorkflow: async (id) => {
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === id ? { ...w, status: 'Running' } : w
      ),
    }));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      const res = await fetch(`${API_BASE}/workflows/${id}/run`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.workflow) {
          set((state) => ({
            workflows: state.workflows.map((w) => (w.id === id ? { ...w, ...data.data.workflow } : w)),
          }));
          await get().fetchAuditLogs();
          return;
        }
      }
    } catch {}
  },

  deleteWorkflow: async (id) => {
    set((state) => ({
      workflows: state.workflows.filter((w) => w.id !== id),
    }));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      await fetch(`${API_BASE}/workflows/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await get().fetchAuditLogs();
    } catch {}
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
    }));
  },

  updateUser: (id, updates) => {
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
    }));
  },

  deleteUser: async (id) => {
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
    }));
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      await fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await get().fetchAuditLogs();
    } catch {}
  },

  addEmployee: async (employee) => {
    const id = 'usr_' + Math.random().toString(36).substr(2, 9);
    const newEmployee: User = {
      id,
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      department: employee.department,
      designation: employee.designation,
      password: employee.password || 'TemporaryPass123!',
      role: 'Employee',
      status: employee.status || 'Active',
      joinedAt: new Date().toISOString().split('T')[0],
    };
    set((state) => ({
      users: [newEmployee, ...state.users],
    }));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      const res = await fetch(`${API_BASE}/users/employee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(employee),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          set((state) => ({
            users: state.users.map((u) => (u.id === id ? { ...u, id: data.data.id } : u)),
          }));
        }
      }
      await get().fetchAuditLogs();
    } catch {}
  },

  updateEmployeePassword: async (id, newPassword) => {
    set((state) => ({
      users: state.users.map((u) => u.id === id ? { ...u, password: newPassword } : u),
    }));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      await fetch(`${API_BASE}/users/${id}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      await get().fetchAuditLogs();
    } catch {}
  },

  deactivateEmployee: async (id) => {
    const targetUser = get().users.find((u) => u.id === id);
    const nextStatus = targetUser?.status === 'Active' ? 'Inactive' : 'Active';

    set((state) => ({
      users: state.users.map((u) => u.id === id ? { ...u, status: nextStatus } : u),
    }));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      await fetch(`${API_BASE}/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      await get().fetchAuditLogs();
    } catch {}
  },

  addAdmin: async (admin) => {
    const id = 'usr_' + Math.random().toString(36).substr(2, 9);
    const newAdmin: User = {
      id,
      employeeId: admin.employeeId || `ADM-${Math.floor(100 + Math.random() * 900)}`,
      name: admin.name,
      email: admin.email,
      department: admin.department || 'Engineering',
      designation: admin.designation || 'Enterprise Administrator',
      password: admin.password || 'AdminSecret2026!',
      role: admin.role || 'Admin',
      status: 'Active',
      joinedAt: new Date().toISOString().split('T')[0],
    };

    set((state) => ({
      users: [newAdmin, ...state.users],
    }));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      const res = await fetch(`${API_BASE}/users/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(admin),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          set((state) => ({
            users: state.users.map((u) => (u.id === id ? { ...u, id: data.data.id } : u)),
          }));
        }
      }
      await get().fetchAuditLogs();
    } catch {}
  },

  deactivateAdmin: async (id) => {
    const targetUser = get().users.find((u) => u.id === id);
    const nextStatus = targetUser?.status === 'Active' ? 'Inactive' : 'Active';

    set((state) => ({
      users: state.users.map((u) => u.id === id ? { ...u, status: nextStatus } : u),
    }));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      await fetch(`${API_BASE}/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      await get().fetchAuditLogs();
    } catch {}
  },

  addTask: async (task) => {
    const id = 'task_' + Math.random().toString(36).substr(2, 9);
    const newTask: CompanyTask = {
      ...task,
      id,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'Administrator',
    };
    set((state) => ({
      companyTasks: [newTask, ...state.companyTasks],
    }));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(task),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          set((state) => ({
            companyTasks: state.companyTasks.map((t) => (t.id === id ? { ...t, id: data.data.id } : t)),
          }));
        }
      }
      await get().fetchAuditLogs();
    } catch {}
  },

  updateTask: async (id, updates) => {
    set((state) => ({
      companyTasks: state.companyTasks.map((t) => t.id === id ? { ...t, ...updates } : t),
    }));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      await get().fetchAuditLogs();
    } catch {}
  },

  deleteTask: async (id) => {
    set((state) => ({
      companyTasks: state.companyTasks.filter((t) => t.id !== id),
    }));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await get().fetchAuditLogs();
    } catch {}
  },

  addDepartment: async (dept) => {
    const id = 'dept_' + Math.random().toString(36).substr(2, 9);
    const newDept: Department = {
      ...dept,
      id,
    };
    set((state) => ({
      departmentsList: [...state.departmentsList, newDept],
    }));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      const res = await fetch(`${API_BASE}/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dept),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          set((state) => ({
            departmentsList: state.departmentsList.map((d) => (d.id === id ? { ...d, id: data.data.id } : d)),
          }));
        }
      }
      await get().fetchAuditLogs();
    } catch {}
  },

  updateDepartment: async (id, updates) => {
    set((state) => ({
      departmentsList: state.departmentsList.map((d) => d.id === id ? { ...d, ...updates } : d),
    }));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      await fetch(`${API_BASE}/departments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      await get().fetchAuditLogs();
    } catch {}
  },

  deleteDepartment: async (id) => {
    set((state) => ({
      departmentsList: state.departmentsList.filter((d) => d.id !== id),
    }));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      await fetch(`${API_BASE}/departments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await get().fetchAuditLogs();
    } catch {}
  },

  addApiKey: async (name, scopes) => {
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
    }));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      const res = await fetch(`${API_BASE}/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, scopes }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          set((state) => ({
            apiKeys: state.apiKeys.map((k) => (k.id === id ? { ...k, ...data.data } : k)),
          }));
        }
      }
      await get().fetchAuditLogs();
    } catch {}
  },

  revokeApiKey: async (id) => {
    set((state) => ({
      apiKeys: state.apiKeys.map((k) => (k.id === id ? { ...k, status: 'Revoked' } : k)),
    }));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      await fetch(`${API_BASE}/api-keys/${id}/revoke`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      await get().fetchAuditLogs();
    } catch {}
  },

  markNotificationsAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
  },

  clearNotification: async (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      await fetch(`${API_BASE}/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
  },

  setActiveChatId: (id) => set({ activeChatId: id }),

  createNewChat: async (agentId) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const accessToken = useAuthStore.getState().accessToken;

    const agent = get().agents.find((a) => a.id === agentId);
    const title = agent ? `Chat with ${agent.name}` : 'New AI Consultation';

    try {
      const res = await fetch(`${API_BASE}/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({ agentId, title }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && (data.data?._id || data.data?.id)) {
          const realId = (data.data._id || data.data.id).toString();
          const newChat: ChatSession = {
            id: realId,
            title: data.data.title || title,
            agentId,
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            messages: [],
          };

          set((state) => ({
            chats: [newChat, ...state.chats.filter((c) => c.id !== realId)],
            activeChatId: realId,
          }));
          return realId;
        }
      }
    } catch (err) {
      console.error('Failed to create chat session on backend:', err);
    }

    const tempId = 'chat_' + Math.random().toString(36).substr(2, 9);
    const newChat: ChatSession = {
      id: tempId,
      title,
      agentId,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      messages: [],
    };
    set((state) => ({
      chats: [newChat, ...state.chats],
      activeChatId: tempId,
    }));
    return tempId;
  },

  sendMessage: async (chatId, content) => {
    let targetChatId = chatId;
    if (!targetChatId || targetChatId.startsWith('chat_')) {
      targetChatId = await get().createNewChat();
    }

    const userMsgId = 'msg_' + Math.random().toString(36).substr(2, 9);
    const timestampStr = new Date().toTimeString().split(' ')[0].substring(0, 5);
    const userMessage: Message = {
      id: userMsgId,
      sender: 'user',
      content,
      timestamp: timestampStr,
    };

    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === targetChatId
          ? {
              ...c,
              updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              messages: [...c.messages, userMessage],
            }
          : c
      ),
    }));

    const assistMsgId = 'msg_' + Math.random().toString(36).substr(2, 9);
    const placeholderMessage: Message = {
      id: assistMsgId,
      sender: 'assistant',
      content: '',
      timestamp: timestampStr,
      isStreaming: true,
    };

    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === targetChatId
          ? {
              ...c,
              messages: [...c.messages, placeholderMessage],
            }
          : c
      ),
    }));

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const accessToken = useAuthStore.getState().accessToken;

    let fullResponse = '';
    let ragCitations: Citation[] = [];

    try {
      const res = await fetch(`${API_BASE}/chats/${targetChatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.messages) {
          const assistMsg = data.data.messages.find((m: any) => m.sender === 'assistant');
          if (assistMsg?.content) {
            fullResponse = assistMsg.content;
          }
        }
        if (data.data?.sources && Array.isArray(data.data.sources)) {
          ragCitations = data.data.sources.map((s: any, idx: number) => ({
            id: `cit_${idx}_${Math.random().toString(36).substr(2, 5)}`,
            docName: s.documentName,
            page: s.page || 1,
            relevance: s.relevance || 90,
            textSnippet: s.textSnippet || 'Grounded vector chunk reference text.',
          }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch AI chat response from backend API:', err);
    }

    if (!fullResponse) {
      const currentChat = get().chats.find((c) => c.id === chatId);
      const currentAgent = get().agents.find((a) => a.id === currentChat?.agentId);
      const agentName = currentAgent?.name || 'Enterprise Assistant';
      fullResponse = `As **${agentName}** (${useAuthStore.getState().user?.department || 'Enterprise Ops'}), I have processed your prompt.\n\nVerified query: "${content}".`;
    }

    const responseWords = fullResponse.split(' ');
    let currentContent = '';
    
    for (let i = 0; i < responseWords.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 25));
      currentContent += (i === 0 ? '' : ' ') + responseWords[i];
      
      set((state) => ({
        chats: state.chats.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistMsgId
                    ? {
                        ...m,
                        content: currentContent,
                        isStreaming: i < responseWords.length - 1,
                        citations: i === responseWords.length - 1 ? ragCitations : undefined,
                      }
                    : m
                ),
              }
            : c
        ),
      }));
    }

    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistMsgId
                  ? { ...m, isStreaming: false, citations: ragCitations }
                  : m
              ),
            }
          : c
      ),
    }));
  },

  deleteChat: async (id) => {
    if (!id || id === 'undefined' || id.startsWith('chat_')) {
      set((state) => {
        const nextChats = state.chats.filter((c) => c.id !== id);
        const nextActiveId = state.activeChatId === id
          ? (nextChats.length > 0 ? nextChats[0].id : null)
          : state.activeChatId;
        return { chats: nextChats, activeChatId: nextActiveId };
      });
      return;
    }

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

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      await fetch(`${API_BASE}/chats/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
  },
}));
