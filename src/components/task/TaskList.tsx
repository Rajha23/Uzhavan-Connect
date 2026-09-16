import React from 'react';
import { Task } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Calendar, ChevronRight } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskClick }) => {
  const { t } = useLanguage();

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-700';
      case 'High': return 'bg-orange-100 text-orange-700';
      case 'Medium': return 'bg-blue-100 text-blue-700';
      case 'Low': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500">{t('tasks.emptyState', undefined, 'No tasks found matching your criteria.')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
              <th className="p-4 font-semibold">{t('tasks.fields.taskTitle', undefined, 'Task')}</th>
              <th className="p-4 font-semibold">{t('tasks.fields.status', undefined, 'Status')}</th>
              <th className="p-4 font-semibold">{t('tasks.fields.priority', undefined, 'Priority')}</th>
              <th className="p-4 font-semibold">{t('tasks.fields.assignedTo', undefined, 'Assigned To')}</th>
              <th className="p-4 font-semibold">{t('tasks.fields.dueDate', undefined, 'Due Date')}</th>
              <th className="p-4 font-semibold w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map(task => (
              <tr 
                key={task.id} 
                onClick={() => onTaskClick(task)}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="p-4">
                  <p className="font-semibold text-slate-800 text-sm line-clamp-1">{task.title}</p>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{task.taskType}</p>
                </td>
                <td className="p-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusBadge(task.status)}`}>
                    {t(`tasks.${task.status.replace(' ', '').toLowerCase()}`, undefined, task.status)}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md ${getPriorityBadge(task.priority)}`}>
                    {t(`tasks.priority.${task.priority.toLowerCase()}`, undefined, task.priority)}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                      {task.assignedToName.charAt(0)}
                    </div>
                    <span className="text-sm text-slate-700">{task.assignedToName}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {task.dueDate ? (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="p-4 text-right">
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
