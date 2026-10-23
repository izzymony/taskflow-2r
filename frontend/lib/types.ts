export type TaskStatus = 'Todo' | 'In Progress' | 'Under Review' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export const TASK_STATUSES: TaskStatus[] = ['Todo', 'In Progress', 'Under Review', 'Completed'];
export const TASK_PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];

/**
 * A row of the `tasks` table.
 *
 * The field names follow the database columns exactly:
 * `id, createdBy, title, status, priority, description, due_date, tags,
 *  updated_at, created_at, assignedTo`.
 */
export interface ITask {
  id: number;
  createdBy: number;
  assignedTo: number | null;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  description: string;
  due_date: string | null; // ISO timestamp
  tags: string[];
  updated_at: string; // ISO timestamp
  created_at: string; // ISO timestamp
  creatorName: string | null;
}

/** Payload accepted by the task endpoints — it maps onto the `tasks` columns. */
export interface ICreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  tags?: string[];
  assignedTo?: number | null;
  clientId?: string | null;
  projectId?: string | null;
}

export type IUpdateTaskInput = Partial<ICreateTaskInput>;

/** Origin of a task: personal workspace tasks or client-scoped tasks. */
export type TaskOrigin = 'personal' | 'client';

/**
 * A project belongs to a client and is owned by a user (userId).
 * Client-scoped tasks are attached to a project via projectId and to the
 * client via clientId so they can be fetched and displayed per client.
 */
export interface IProject {
  id: string;
  name: string;
  clientId: string;
  userId: string;
  description?: string | null;
  status: 'Active' | 'On Hold' | 'Completed' | 'Archived';
  createdAt: string;
  updatedAt: string;
}

export interface ICreateProjectInput {
  name: string;
  clientId: string;
  userId: string;
  description?: string | null;
  status?: 'Active' | 'On Hold' | 'Completed' | 'Archived';
}

/**
 * A task row extended with client/project ownership. When `clientId` is null
 * the task is a personal task (existing behaviour). When `clientId` is set the
 * task belongs to that client and optionally to one of its projects.
 */
export interface IClientTask extends ITask {
  clientId: string | null;
  projectId: string | null;
  origin: TaskOrigin;
}

export interface ICreateClientTaskInput extends ICreateTaskInput {
  clientId: string;
  projectId?: string | null;
}

/** State a workspace page can be previewed in. The App Router passes it through
 * `?state=loading|error|empty` so every screen can be reviewed in isolation.
 */
export type PagePreviewState = 'loading' | 'error' | 'empty';

// ---------- Overview ----------
export interface IActivityEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
}

// ---------- Clients ----------
export type ClientStatus = 'Active' | 'Inactive' | 'Pending';
export type ClientPlan = 'Starter' | 'Growth' | 'Enterprise';
export type BillingType = 'Hourly' | 'Retainer' | 'Fixed_Project';

export interface IClient {
  id: string; // Match backend varchar string key
  userId: string;
  title: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  status: ClientStatus;
  plan: ClientPlan;
  billingType: BillingType;
  rate: string;      // Decimal fields often return as strings to protect precision
  currency: string;
  monthlyBudgetCap: number | null;
  lastActivity: string;
  createdAt: string;
  avatar?: string;
  value: number;
  location: string;
  projects: number;  // Used for tracking the project count on dashboard grids
}

export interface ICreateClientInput {
  id: string;
  title: string;
  userId: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  status?: ClientStatus;
  plan?: ClientPlan;
  billingType?: BillingType; // Converted to camelCase to match backend schema fields
  rate?: string;             // Sent as string stringified decimal "150.00"
  currency?: string;
  monthlyBudgetCap?: number;
 } // Converted to camelCase number

// ---------- Payments ----------
export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue';
export type PaymentMethod = 'Card' | 'Bank transfer' | 'PayPal' | 'Stripe';

export interface IPayment {
  id: string | number;
  invoiceNumber: string;
  client: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  issuedDate: string;
  method: PaymentMethod;
  paidDate?: string | null;
  createdAt: string;
}

export interface ICreatePaymentInput {
  invoiceNumber: string;
  client: string;
  amount: number;
  status?: InvoiceStatus;
  dueDate: string;
  method?: PaymentMethod;
}

// ---------- Schedule ----------
export type ScheduleEventType = 'Meeting' | 'Deadline' | 'Focus';

export interface IScheduleEvent {
  id: string | number;
  title: string;
  description: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  date: string; // yyyy-mm-dd
  attendees: string[];
  type: ScheduleEventType;
  location?: string;
}

export interface ICreateScheduleEventInput {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
  attendees: string[];
  type: ScheduleEventType;
  location?: string;
}

// ---------- Files ----------
export type FileType = 'Document' | 'Image' | 'Spreadsheet' | 'Presentation' | 'PDF' | 'Other';

export interface IFile {
  id: string | number;
  name: string;
  type: FileType;
  size: string;
  modified: string;
  owner: string;
  folder: string;
  url?: string;
}

export interface ICreateFileInput {
  name: string;
  type: FileType;
  size: string;
  owner: string;
  folder?: string;
}

// ---------- Docs ----------
export type DocStatus = 'Draft' | 'Published' | 'Archived';

export interface IDoc {
  id: string | number;
  title: string;
  owner: string;
  lastEdited: string;
  status: DocStatus;
  category: string;
  comments: number;
  createdAt: string;
}

export interface ICreateDocInput {
  title: string;
  owner: string;
  status?: DocStatus;
  category?: string;
}

// ---------- Users ----------
export type UserRole = 'Admin' | 'Editor' | 'Viewer';
export type UserAccess = 'Full' | 'Limited' | 'Read-only';

export interface IUser {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
  access: UserAccess;
  status: 'Active' | 'Invited' | 'Suspended';
  joinedAt: string;
  lastActive: string;
  department: string;
  tasks: number;
  avatar?: string;
}

export interface ICreateUserInput {
  name: string;
  email: string;
  role: UserRole;
  access: UserAccess;
}

// ---------- Workflows ----------
export type WorkflowStatus = 'Active' | 'Draft' | 'Paused';

export interface IWorkflow {
  id: string | number;
  name: string;
  description: string;
  status: WorkflowStatus;
  runs: number;
  lastRun: string | null;
  owner: string;
  steps: string[];
  successRate: number;
  createdAt: string;
}

export interface ICreateWorkflowInput {
  name: string;
  description: string;
  status?: WorkflowStatus;
}

// ---------- Automations ----------
export type AutomationStatus = 'Enabled' | 'Disabled';

export interface IAutomation {
  id: string | number;
  name: string;
  trigger: string;
  action: string;
  status: AutomationStatus;
  runs: number;
  lastRan: string | null;
  owner: string;
  channel: string;
  createdAt: string;
}

export interface ICreateAutomationInput {
  name: string;
  trigger: string;
  action: string;
  status?: AutomationStatus;
}
