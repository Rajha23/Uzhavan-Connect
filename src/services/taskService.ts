import { Task, TaskStatus, TaskComment, TaskActivity, UserRole, isTaskOverdue } from '../types';
import { INITIAL_TASKS } from '../data/mockTasks';

const UZHAVAN_TASKS_KEY = 'uzhavan_tasks_v3';

let tasksStore: Task[] = [...INITIAL_TASKS];

try {
  const cached = localStorage.getItem(UZHAVAN_TASKS_KEY);
  if (cached) {
    const parsed = JSON.parse(cached) as Task[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      tasksStore = parsed.map((task) => ({
        ...task,
        recurrence: task.recurrence || 'none',
        comments: task.comments || [],
        activity: task.activity || []
      }));
    }
  } else {
    localStorage.setItem(UZHAVAN_TASKS_KEY, JSON.stringify(tasksStore));
  }
} catch (e) {
  console.error('Failed to load tasks from localStorage', e);
}

const persistTasks = () => {
  try {
    localStorage.setItem(UZHAVAN_TASKS_KEY, JSON.stringify(tasksStore));
    window.dispatchEvent(new Event('tasks-updated'));
  } catch (e) {
    console.error('Failed to save tasks to localStorage', e);
  }
};

const canViewTask = (
  task: Task,
  role: UserRole,
  userId?: string,
  organizationId?: string
): boolean => {
  if (role === 'ADMIN') return true;
  if (task.assignedRole === role) return true;
  if (userId && (task.assignedTo === userId || task.createdBy === userId)) return true;
  if (
    role === 'FPO_AGGREGATOR' &&
    organizationId &&
    task.organizationId === organizationId
  ) {
    return true;
  }
  return false;
};

export const taskService = {
  getTasks: async (): Promise<Task[]> => {
    return [...tasksStore];
  },

  getAllTasks: async (filterRole?: UserRole | 'ALL'): Promise<Task[]> => {
    if (filterRole && filterRole !== 'ALL') {
      return tasksStore.filter((task) => task.assignedRole === filterRole);
    }
    return [...tasksStore];
  },

  getTasksByRoleOrUser: async (
    role: UserRole,
    userId?: string,
    organizationId?: string,
    filterRole?: UserRole | 'ALL'
  ): Promise<Task[]> => {
    let result = tasksStore.filter((task) => canViewTask(task, role, userId, organizationId));
    if (filterRole && filterRole !== 'ALL') {
      result = result.filter((task) => task.assignedRole === filterRole);
    }
    return result;
  },

  createTask: async (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'activity'>
  ): Promise<Task> => {
    const newTask: Task = {
      ...taskData,
      recurrence: taskData.recurrence || 'none',
      id: `tsk-${Date.now()}`,
      comments: [],
      activity: [
        {
          id: `act-${Date.now()}`,
          taskId: '',
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

  updateTaskStatus: async (
    taskId: string,
    newStatus: TaskStatus,
    userId: string,
    userName: string
  ): Promise<Task> => {
    const taskIndex = tasksStore.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) throw new Error('Task not found');

    const task = tasksStore[taskIndex];
    const oldStatus = task.status;

    if (oldStatus === newStatus) return task;

    task.status = newStatus;
    task.updatedAt = new Date().toISOString();
    if (newStatus === 'Completed') {
      task.completedAt = new Date().toISOString();
    }

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

  addComment: async (
    taskId: string,
    userId: string,
    userName: string,
    userRole: UserRole,
    text: string
  ): Promise<Task> => {
    const taskIndex = tasksStore.findIndex((t) => t.id === taskId);
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
    tasksStore = tasksStore.filter((t) => t.id !== taskId);
    if (tasksStore.length !== initialLength) {
      persistTasks();
      return true;
    }
    return false;
  },

  isOverdue: isTaskOverdue
};
