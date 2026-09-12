"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const User_1 = require("../models/User");
const Department_1 = require("../models/Department");
const Agent_1 = require("../models/Agent");
const Workflow_1 = require("../models/Workflow");
const Task_1 = require("../models/Task");
const ApiKey_1 = require("../models/ApiKey");
const Notification_1 = require("../models/Notification");
const ragService_1 = require("./ragService");
const SALT_ROUNDS = 12;
exports.seedService = {
    async seedAll() {
        if (mongoose_1.default.connection.readyState !== 1)
            return;
        try {
            // 1. Seed Departments
            const deptCount = await Department_1.Department.countDocuments();
            if (deptCount === 0) {
                console.log('🌱 Seeding initial departments into MongoDB...');
                await Department_1.Department.create([
                    { name: 'Engineering', code: 'ENG', head: 'Sarah Connor', employeeCount: 14, documentCount: 18, description: 'Core software engineering, AI pipelines, and platform infrastructure.' },
                    { name: 'Human Resources', code: 'HR', head: 'Elena Rostova', employeeCount: 6, documentCount: 12, description: 'Talent acquisition, internal policy governance, and employee wellness.' },
                    { name: 'Finance & Accounts', code: 'FIN', head: 'Kyle Reese', employeeCount: 8, documentCount: 24, description: 'Corporate budget planning, treasury operations, and fiscal audits.' },
                    { name: 'Marketing & PR', code: 'MKT', head: 'John Doe', employeeCount: 10, documentCount: 15, description: 'Brand expansion, campaign management, and digital engagement.' },
                    { name: 'Operations & Logistics', code: 'OPS', head: 'Alice Smith', employeeCount: 9, documentCount: 11, description: 'Enterprise workflows, supply chain routing, and operational efficiency.' },
                    { name: 'Legal & Compliance', code: 'LEG', head: 'Claire Lee', employeeCount: 4, documentCount: 16, description: 'Regulatory compliance, contract analysis, and risk mitigation.' },
                    { name: 'IT Infrastructure', code: 'IT', head: 'Marcus Wright', employeeCount: 7, documentCount: 9, description: 'Internal hardware provisioning, VPN networking, and identity vault.' },
                ]);
            }
            // 2. Seed Users
            const superAdminCount = await User_1.User.countDocuments({ role: { $in: ['SUPER_ADMIN', 'SuperAdmin'] } });
            if (superAdminCount === 0) {
                console.log('🌱 Seeding initial user accounts into MongoDB...');
                const superHash = await bcryptjs_1.default.hash('superpassword123', SALT_ROUNDS);
                const adminHash = await bcryptjs_1.default.hash('adminpassword123', SALT_ROUNDS);
                const empHash = await bcryptjs_1.default.hash('employeepassword123', SALT_ROUNDS);
                await User_1.User.create([
                    { name: 'Enterprise Super Admin', email: 'superadmin@enterprise.ai', employeeId: 'SADM-001', designation: 'Chief Governance Officer', passwordHash: superHash, role: 'SuperAdmin', department: 'Engineering', status: 'Active', refreshTokens: [] },
                    { name: 'Workspace Admin', email: 'admin@enterprise.ai', employeeId: 'ADM-101', designation: 'Operations Director', passwordHash: adminHash, role: 'Admin', department: 'Engineering', status: 'Active', refreshTokens: [] },
                    { name: 'Sarah Connor', email: 'sarah.connor@sky-net.io', employeeId: 'ADM-102', designation: 'Lead Systems Admin', passwordHash: adminHash, role: 'Admin', department: 'Engineering', status: 'Active', refreshTokens: [] },
                    { name: 'Alice Employee', email: 'employee@enterprise.ai', employeeId: 'EMP-201', designation: 'Senior AI Engineer', passwordHash: empHash, role: 'Employee', department: 'Engineering', status: 'Active', refreshTokens: [] },
                    { name: 'John Doe', email: 'john.doe@sky-net.io', employeeId: 'EMP-202', designation: 'Senior Marketing Strategist', passwordHash: empHash, role: 'Employee', department: 'Marketing', status: 'Active', refreshTokens: [] },
                    { name: 'Alice Smith', email: 'alice.smith@sky-net.io', employeeId: 'EMP-203', designation: 'Operations Manager', passwordHash: empHash, role: 'Employee', department: 'Operations', status: 'Active', refreshTokens: [] },
                    { name: 'Bob Johnson', email: 'bob.johnson@sky-net.io', employeeId: 'EMP-204', designation: 'Backend AI Engineer', passwordHash: empHash, role: 'Employee', department: 'Engineering', status: 'Active', refreshTokens: [] },
                    { name: 'Claire Lee', email: 'claire.lee@sky-net.io', employeeId: 'EMP-205', designation: 'Legal Counsel & Risk Officer', passwordHash: empHash, role: 'Employee', department: 'Legal', status: 'Active', refreshTokens: [] },
                    { name: 'Kyle Reese', email: 'kyle.reese@sky-net.io', employeeId: 'EMP-206', designation: 'Senior Financial Analyst', passwordHash: empHash, role: 'Employee', department: 'Finance', status: 'Active', refreshTokens: [] },
                ]);
            }
            else {
                // Ensure John Doe (Marketing) user exists
                const johnUser = await User_1.User.findOne({ email: 'john.doe@sky-net.io' });
                if (!johnUser) {
                    const empHash = await bcryptjs_1.default.hash('employeepassword123', SALT_ROUNDS);
                    await User_1.User.create({
                        name: 'John Doe',
                        email: 'john.doe@sky-net.io',
                        employeeId: 'EMP-202',
                        designation: 'Senior Marketing Strategist',
                        passwordHash: empHash,
                        role: 'Employee',
                        department: 'Marketing',
                        status: 'Active',
                        refreshTokens: [],
                    });
                }
            }
            // Clean up orphaned document chunks from old test runs
            await mongoose_1.default.model('Document').deleteMany({ name: /company policy handbook/i });
            await mongoose_1.default.model('DocumentChunk').deleteMany({ documentName: /company policy handbook/i });
            const defaultUser = await User_1.User.findOne();
            const defaultUserId = defaultUser ? defaultUser._id : new mongoose_1.default.Types.ObjectId();
            // 3. Seed AI Agents
            const agentCount = await Agent_1.Agent.countDocuments();
            if (agentCount === 0) {
                console.log('🌱 Seeding initial AI agents into MongoDB...');
                await Agent_1.Agent.create([
                    { name: 'Legal Counsel Copilot', description: 'Specialized in interpreting compliance rules, contract definitions, and liability clauses.', department: 'Legal', model: 'Llama 3.3 70B — Groq', status: 'Active', createdBy: defaultUserId },
                    { name: 'Engineering Documentation Bot', description: 'Assists with technical specs, API lookups, code snippets, and systems design queries.', department: 'Engineering', model: 'Llama 3.3 70B — Groq', status: 'Active', createdBy: defaultUserId },
                    { name: 'HR Assistant Bot', description: 'Answers employee handbook queries, leave policies, onboarding procedures, and templates.', department: 'HR', model: 'Llama 3.3 70B — Groq', status: 'Active', createdBy: defaultUserId },
                    { name: 'Financial Analyst Expert', description: 'Performs calculations, reviews growth margins, checks balance sheets, and estimates cash flows.', department: 'Finance', model: 'Llama 3.3 70B — Groq', status: 'Active', createdBy: defaultUserId },
                    { name: 'Marketing Copywriter AI', description: 'Generates SEO-friendly landing page text, email newsletters, and social media drafts.', department: 'Marketing', model: 'Llama 3.3 70B — Groq', status: 'Maintenance', createdBy: defaultUserId },
                    { name: 'Ops Process Optimizer', description: 'Analyzes process logs, resource bottlenecks, and automates standard runbooks.', department: 'Operations', model: 'Llama 3.3 70B — Groq', status: 'Active', createdBy: defaultUserId },
                ]);
            }
            // 4. Seed Workflows
            const workflowCount = await Workflow_1.Workflow.countDocuments();
            if (workflowCount === 0) {
                console.log('🌱 Seeding initial workflows into MongoDB...');
                await Workflow_1.Workflow.create([
                    {
                        name: 'Automatic Contract Analysis',
                        description: 'Triggered when a contract PDF is uploaded to Legal. Extracts key terms, checks GDPR flags, and sends summary alert.',
                        status: 'Completed',
                        steps: ['Trigger: PDF File Uploaded', 'AI Node: Extract Liability & Term length', 'AI Node: GDPR Risk Assessment', 'Slack Alert: Publish Summary', 'Email Alert: Notify Legal Admin'],
                        runs: [
                            { runAt: new Date(Date.now() - 3600000), duration: '14.2s', status: 'Completed', triggerBy: 'System Upload' },
                            { runAt: new Date(Date.now() - 86400000), duration: '15.1s', status: 'Completed', triggerBy: 'System Upload' },
                        ],
                        createdBy: defaultUserId,
                    },
                    {
                        name: 'Tech Stack Documentation Update',
                        description: 'Syncs GitHub repositories weekly, parses Markdown docs, and updates Vector Database embeddings for the AI agents.',
                        status: 'Completed',
                        steps: ['Trigger: Scheduled Cron (Weekly)', 'Github Fetch: Pull /docs folder', 'AI Node: Chunk & Tokenize', 'Vector DB: Upsert Pinecone Index'],
                        runs: [
                            { runAt: new Date(Date.now() - 172800000), duration: '120.4s', status: 'Completed', triggerBy: 'Cron Trigger' },
                        ],
                        createdBy: defaultUserId,
                    },
                    {
                        name: 'Invoice Processing Pipeline',
                        description: 'OCR processing on invoice documents, validation of totals, matching with purchase orders, and flagging anomalies.',
                        status: 'Paused',
                        steps: ['Trigger: Email attachment matching invoice@', 'AI Node: OCR Text Extraction', 'AI Node: PO Match & Math Verification', 'ERP Sync: Sync to Finance Ledger'],
                        runs: [
                            { runAt: new Date(Date.now() - 259200000), duration: '22.3s', status: 'Completed', triggerBy: 'Email Trigger' },
                        ],
                        createdBy: defaultUserId,
                    },
                    {
                        name: 'Customer Feedback Sentiment Monitor',
                        description: 'Tracks support tickets. Classifies sentiment, highlights critical complaints, and drafts response recommendations.',
                        status: 'Completed',
                        steps: ['Trigger: Webhook', 'AI Node: Sentiment Classification', 'AI Node: Draft Apology & Suggest Solution', 'Zendesk Sync: Inject draft context'],
                        runs: [
                            { runAt: new Date(Date.now() - 7200000), duration: '5.4s', status: 'Completed', triggerBy: 'Webhook' },
                        ],
                        createdBy: defaultUserId,
                    },
                ]);
            }
            // 5. Seed Company Tasks
            const taskCount = await Task_1.Task.countDocuments();
            if (taskCount === 0) {
                console.log('🌱 Seeding initial company tasks into MongoDB...');
                await Task_1.Task.create([
                    { title: 'Review Q3 Security Audit Logs', department: 'Engineering', assignedTo: 'Bob Johnson', priority: 'High', status: 'In Progress', dueDate: '2026-08-30', createdBy: 'Administrator' },
                    { title: 'Update Vector Embeddings for HR Handbook', department: 'HR', assignedTo: 'Alice Smith', priority: 'Urgent', status: 'Pending', dueDate: '2026-08-25', createdBy: 'Administrator' },
                    { title: 'Prepare Annual Tax Depreciation Ledger', department: 'Finance', assignedTo: 'Kyle Reese', priority: 'Medium', status: 'In Progress', dueDate: '2026-09-05', createdBy: 'Administrator' },
                    { title: 'Ingest Marketing Campaign Assets to Vector DB', department: 'Marketing', assignedTo: 'John Doe', priority: 'Low', status: 'Completed', dueDate: '2026-08-20', createdBy: 'Administrator' },
                    { title: 'Audit GDPR Consent Logs in Production DB', department: 'Legal', assignedTo: 'Claire Lee', priority: 'High', status: 'Pending', dueDate: '2026-08-28', createdBy: 'Administrator' },
                ]);
            }
            // 6. Seed API Keys
            const keyCount = await ApiKey_1.ApiKey.countDocuments();
            if (keyCount === 0) {
                console.log('🌱 Seeding initial API keys into MongoDB...');
                const initialKeys = [
                    { name: 'Production Chat Client', keyPrefix: 'aeh_live_9a2f', status: 'Active', scopes: ['chat:write', 'chat:read'] },
                    { name: 'Zendesk Ticket Webhook', keyPrefix: 'aeh_live_82bc', status: 'Active', scopes: ['workflows:trigger'] },
                    { name: 'Stripe Invoice Ingestion', keyPrefix: 'aeh_live_1091', status: 'Active', scopes: ['documents:write'] },
                    { name: 'Local Test Key', keyPrefix: 'aeh_test_88df', status: 'Revoked', scopes: ['*'] },
                ];
                for (const k of initialKeys) {
                    const raw = `aeh_live_${crypto_1.default.randomBytes(16).toString('hex')}`;
                    const hash = crypto_1.default.createHash('sha256').update(raw).digest('hex');
                    await ApiKey_1.ApiKey.create({
                        name: k.name,
                        keyPrefix: k.keyPrefix,
                        keyHash: hash,
                        status: k.status,
                        scopes: k.scopes,
                        userId: defaultUserId,
                    });
                }
            }
            // 7. Seed Notifications
            const notifCount = await Notification_1.Notification.countDocuments();
            if (notifCount === 0) {
                console.log('🌱 Seeding initial notifications into MongoDB...');
                await Notification_1.Notification.create([
                    { title: 'Workflow Executed', description: 'Workflow "Automatic Contract Analysis" completed analysis successfully.', category: 'Workflow', read: false },
                    { title: 'API Key Generated', description: 'API Key "Production Chat Client" has been provisioned.', category: 'Security', read: false },
                    { title: 'New User Joined', description: 'Miles Dyson accepted invitation and joined Engineering team.', category: 'System', read: false },
                    { title: 'Invoices Pipeline Running', description: 'Workflow "Invoice Processing Pipeline" has processed 5 invoices automatically.', category: 'Workflow', read: true },
                    { title: 'Billing Threshold Reached', description: 'Your workspace has consumed 80% of allocated monthly model tokens.', category: 'Billing', read: true },
                ]);
            }
            // 8. Seed Enterprise RAG Documents & Vector Chunks
            await ragService_1.ragService.seedEnterpriseDocuments();
            console.log('✅ Full MongoDB database seeding completed successfully.');
        }
        catch (err) {
            console.error('Error during seedService.seedAll:', err);
        }
    },
};
//# sourceMappingURL=seedService.js.map