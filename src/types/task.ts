import { UserRole } from './index';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Blocked';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

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
  action: string; // e.g. "Status changed from Pending to In Progress"
  timestamp: string;
}

export interface Task {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  taskType: string;
  priority: TaskPriority;
  status: TaskStatus;
  
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
