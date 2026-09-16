import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Task, TaskStatus } from '../../types';
import { taskService } from '../../services/taskService';
import { CheckCircle2, Clock, AlertCircle, ArrowRight, ClipboardList } from 'lucide-react';

const STATUS_STYLES: Record<TaskStatus, { bg: string; text: string; icon: React.ReactNode }> = {
  'Pending': {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    icon: <Clock className="w-3.5 h-3.5 text-amber-500" />,
  },
  'In Progress': {
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-700',
    icon: <Clock className="w-3.5 h-3.5 text-blue-500 animate-pulse" />,
  },
  'Completed': {
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-700',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
  },
  'Blocked': {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-700',
    icon: <AlertCircle className="w-3.5 h-3.5 text-red-500" />,
  },
};

const PRIORITY_DOT: Record<string, string> = {
  Critical: 'bg-red-500',
  High: 'bg-orange-400',
  Medium: 'bg-amber-400',
  Low: 'bg-emerald-400',
};

interface Props {
  limit?: number;
}

export const UpcomingTasksWidget: React.FC<Props> = ({ limit = 5 }) => {
  const { currentRole, currentUser, setActiveTab } = useApp();
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentRole || !currentUser) return;
    
    const fetchTasks = () => {
      setLoading(true);
      taskService
        .getTasksByRoleOrUser(currentRole, currentUser.id, currentUser.organization)
        .then((data) => {
          // Show only active (non-completed) tasks, sorted by due date
          const active = data
            .filter((t) => t.status !== 'Completed')
            .sort((a, b) => new Date(a.dueDate ?? 0).getTime() - new Date(b.dueDate ?? 0).getTime())
            .slice(0, limit);
          setTasks(active);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    };

    fetchTasks();
    window.addEventListener('tasks-updated', fetchTasks);
    
    return () => {
      window.removeEventListener('tasks-updated', fetchTasks);
    };
  }, [currentRole, currentUser, limit]);

  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed'
  ).length;

  return (
    <div className="agri-card rounded-2xl border border-[#ccd5ae]/40 p-5 shadow-soft space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#01472e]/10 flex items-center justify-center">
            <ClipboardList className="w-4 h-4 text-[#01472e]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#01472e]">
              {t('task.upcomingTasks', 'Upcoming Tasks')}
            </h3>
            {overdue > 0 && (
              <p className="text-xs text-red-500 font-medium">
                {overdue} {t('task.overdue', 'overdue')}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setActiveTab('tasks')}
          className="flex items-center gap-1 text-xs font-semibold text-[#01472e] hover:text-[#013824] transition-colors group"
        >
          {t('task.viewAll', 'View All')}
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-xs text-slate-500">{t('task.allClear', 'All tasks up to date!')}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => {
            const style = STATUS_STYLES[task.status];
            const isOverdue =
              task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';
            return (
              <li
                key={task.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${style.bg} cursor-pointer hover:opacity-80 transition-opacity`}
                onClick={() => setActiveTab('tasks')}
              >
                {/* Priority dot */}
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority] || 'bg-slate-300'}`}
                />
                {/* Icon */}
                {style.icon}
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{task.title}</p>
                  <p className="text-[10px] text-slate-500 truncate">{task.taskType}</p>
                </div>
                {/* Due date */}
                <span
                  className={`text-[10px] font-medium flex-shrink-0 ${
                    isOverdue ? 'text-red-500' : 'text-slate-400'
                  }`}
                >
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })
                    : '—'}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* Footer CTA */}
      <button
        onClick={() => setActiveTab('tasks')}
        className="w-full text-center text-xs font-semibold text-[#01472e] py-2 rounded-xl border border-[#01472e]/20 bg-[#01472e]/5 hover:bg-[#01472e]/10 transition-colors"
      >
        {t('task.openTaskManager', 'Open Task Manager')} →
      </button>
    </div>
  );
};
