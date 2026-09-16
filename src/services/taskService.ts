import { Task, TaskStatus, TaskComment, TaskActivity, UserRole } from '../types';
import { INITIAL_TASKS } from '../data/mockTasks';

const UZHAVAN_TASKS_KEY = 'uzhavan_tasks';

// In-memory store
let tasksStore: Task[] = [...INITIAL_TASKS];

// Try to hydrate from localStorage
try {
  const cached = localStorage.getItem(UZHAVAN_TASKS_KEY);
  if (cached) {
    tasksStore = JSON.parse(cached);
  } else {
    localStorage.setItem(UZHAVAN_TASKS_KEY, JSON.stringify(tasksStore));
  }
} catch (e) {
  console.error('Failed to load tasks from localStorage', e);
}

const persistTasks = () => {
  try {
    localStorage.setItem(UZHAVAN_TASKS_KEY, JSON.stringify(tasksStore));
  } catch (e) {
    console.error('Failed to save tasks to localStorage', e);
  }
};

export const taskService = {
  getTasks: async (): Promise<Task[]> => {
    return [...tasksStore];
  },

  getTasksByRoleOrUser: async (role: UserRole, userId?: string, organizationId?: string): Promise<Task[]> => {
    // Basic RBAC/Isolation logic
    // Admin sees all
    if (role === 'ADMIN') return [...tasksStore];

    return tasksStore.filter(task => {
      // If a task is assigned to the specific user, they can see it
      if (userId && task.assignedTo === userId) return true;
      // If a task is assigned to the organization, users in the org might see it (depending on exact business logic)
      if (organizationId && task.organizationId === organizationId) return true;
      // If the user created the task, they can see it
      if (userId && task.createdBy === userId) return true;
      
      // Fallback: match by role as a simple demo filter if no user/org strictly matches
      return task.assignedRole === role;
    });
  },

  createTask: async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'activity'>): Promise<Task> => {
    const newTask: Task = {
      ...taskData,
      id: `tsk-${Date.now()}`,
      comments: [],
      activity: [
        {
          id: `act-${Date.now()}`,
          taskId: '', // set below
          userId: taskData.createdBy,
          userName: taskData.createdByName,
          action: 'Task created',
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    newTask.activity[0].taskId = newTask.id;

    tasksStore = [newTask, ...tasksStore];
    persistTasks();
    return newTask;
  },

  updateTaskStatus: async (taskId: string, newStatus: TaskStatus, userId: string, userName: string): Promise<Task> => {
    const taskIndex = tasksStore.findIndex(t => t.id === taskId);
    if (taskIndex === -1) throw new Error('Task not found');

    const task = tasksStore[taskIndex];
    const oldStatus = task.status;
    
    if (oldStatus === newStatus) return task;

    task.status = newStatus;
    task.updatedAt = new Date().toISOString();
    
    const activity: TaskActivity = {
      id: `act-${Date.now()}`,
      taskId,
      userId,
      userName,
      action: `Status changed from ${oldStatus} to ${newStatus}`,
      timestamp: new Date().toISOString()
    };
    
    task.activity.push(activity);
    
    tasksStore = [...tasksStore];
    persistTasks();
    return task;
  },

  addComment: async (taskId: string, userId: string, userName: string, userRole: UserRole, text: string): Promise<Task> => {
    const taskIndex = tasksStore.findIndex(t => t.id === taskId);
    if (taskIndex === -1) throw new Error('Task not found');

    const task = tasksStore[taskIndex];
    
    const comment: TaskComment = {
      id: `cmt-${Date.now()}`,
      taskId,
      userId,
      userName,
      userRole,
      text,
      createdAt: new Date().toISOString()
    };
    
    task.comments.push(comment);
    
    const activity: TaskActivity = {
      id: `act-${Date.now()}`,
      taskId,
      userId,
      userName,
      action: 'Comment added',
      timestamp: new Date().toISOString()
    };
    
    task.activity.push(activity);
    task.updatedAt = new Date().toISOString();
    
    tasksStore = [...tasksStore];
    persistTasks();
    return task;
  },
  
  deleteTask: async (taskId: string): Promise<boolean> => {
    const initialLength = tasksStore.length;
    tasksStore = tasksStore.filter(t => t.id !== taskId);
    if (tasksStore.length !== initialLength) {
      persistTasks();
      return true;
    }
    return false;
  }
};
