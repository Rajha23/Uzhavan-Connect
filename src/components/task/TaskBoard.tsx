import React from 'react';
import { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';
import { useLanguage } from '../../context/LanguageContext';

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange?: (task: Task, status: TaskStatus) => void;
}

const STATUS_I18N: Record<TaskStatus, string> = {
  Pending: 'tasks.pending',
  'In Progress': 'tasks.inProgress',
  Completed: 'tasks.completed',
  Blocked: 'tasks.blocked'
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onTaskClick, onStatusChange }) => {
  const { t } = useLanguage();
  const statuses: TaskStatus[] = ['Pending', 'In Progress', 'Completed', 'Blocked'];

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Pending': return 'border-yellow-400 bg-yellow-50';
      case 'In Progress': return 'border-blue-400 bg-blue-50';
      case 'Completed': return 'border-green-400 bg-green-50';
      case 'Blocked': return 'border-red-400 bg-red-50';
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-full">
      {statuses.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status);

        return (
          <div key={status} className="flex-1 min-w-[300px] bg-slate-50/50 rounded-2xl flex flex-col border border-slate-100">
            <div className={`px-4 py-3 border-t-4 rounded-t-xl flex justify-between items-center ${getStatusColor(status)}`}>
              <h3 className="font-semibold text-slate-800">
                {t(STATUS_I18N[status], status)}
              </h3>
              <span className="bg-white/60 px-2 py-0.5 rounded-full text-xs font-bold text-slate-700">
                {columnTasks.length}
              </span>
            </div>

            <div className="p-3 flex-1 overflow-y-auto flex flex-col gap-3">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={onTaskClick}
                  onStatusChange={onStatusChange}
                />
              ))}

              {columnTasks.length === 0 && (
                <div className="h-full flex items-center justify-center p-6 text-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                  {t('tasks.emptyColumn', 'No tasks in this column')}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
