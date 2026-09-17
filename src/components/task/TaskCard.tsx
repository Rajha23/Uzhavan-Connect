import React from 'react';
import { Task, TaskStatus, isTaskOverdue } from '../../types';
import { AlertOctagon, MessageSquare, Calendar } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  onStatusChange?: (task: Task, status: TaskStatus) => void;
}

const STATUSES: TaskStatus[] = ['Pending', 'In Progress', 'Completed', 'Blocked'];

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onStatusChange }) => {
  const { t } = useLanguage();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-700';
      case 'High': return 'bg-orange-100 text-orange-700';
      case 'Medium': return 'bg-blue-100 text-blue-700';
      case 'Low': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const overdue = isTaskOverdue(task);

  return (
    <div
      onClick={() => onClick(task)}
      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-3"
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${getPriorityColor(task.priority)}`}>
            {t(`tasks.priority.${task.priority.toLowerCase()}`, task.priority)}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#eaf4ec] text-[#01472e] border border-[#a3b18a]/30">
            {task.assignedRole.replace('_', ' ')}
          </span>
        </div>
        {overdue && (
          <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
            <AlertOctagon className="w-3 h-3" />
            {t('tasks.overdue', 'Overdue')}
          </span>
        )}
      </div>

      <div>
        <h4 className="font-semibold text-slate-800 text-sm line-clamp-2 leading-tight mb-1">{task.title}</h4>
        <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
      </div>

      {onStatusChange && (
        <select
          value={task.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation();
            onStatusChange(task, e.target.value as TaskStatus);
          }}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700"
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      )}

      <div className="flex flex-col gap-1.5 mt-auto pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-[#eaf4ec] text-[#01472e] flex items-center justify-center font-bold text-[10px]">
              {task.assignedToName.charAt(0)}
            </div>
            <span className="truncate max-w-[100px]">{task.assignedToName}</span>
          </span>
          {task.comments.length > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {task.comments.length}
            </span>
          )}
        </div>

        {task.dueDate && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            {task.recurrence && task.recurrence !== 'none' && (
              <span className="ml-auto text-[10px] uppercase tracking-wide text-[#01472e]">
                {t(`tasks.recurrence.${task.recurrence}`, task.recurrence)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
