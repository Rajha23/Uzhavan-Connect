import { UserRole } from './index';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Blocked';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export type TaskType =
  | 'General'
  | 'Perform Quality Check'
  | 'Assign Vehicle'
  | 'Confirm Quantity'
  | 'Review Produce'
  | 'Collect Produce'
  | 'Pack Shipment'
  | 'Confirm Delivery'
  | 'Settlement Follow-up';

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  createdAt: string;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
}

export interface Task {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  taskType: TaskType | string;
  priority: TaskPriority;
  status: TaskStatus;
  recurrence: TaskRecurrence;

  createdBy: string;
  createdByName: string;

  assignedTo: string;
  assignedToName: string;
  assignedRole: UserRole;

  startDate?: string;
  dueDate?: string;
  completedAt?: string;

  relatedEntityType?: 'Order' | 'ProduceListing' | 'DemandRequest' | 'QualityInspection' | 'User' | 'Feedback' | 'None';
  relatedEntityId?: string;

  comments: TaskComment[];
  activity: TaskActivity[];

  createdAt: string;
  updatedAt: string;
}

export const AGRI_TASK_TYPES: TaskType[] = [
  'General',
  'Perform Quality Check',
  'Assign Vehicle',
  'Confirm Quantity',
  'Review Produce',
  'Collect Produce',
  'Pack Shipment',
  'Confirm Delivery',
  'Settlement Follow-up'
];

export const isTaskOverdue = (task: Pick<Task, 'dueDate' | 'status'>): boolean => {
  if (!task.dueDate || task.status === 'Completed') return false;
  const due = new Date(task.dueDate).getTime();
  return Number.isFinite(due) && due < Date.now();
};
