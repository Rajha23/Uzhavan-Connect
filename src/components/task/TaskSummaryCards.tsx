import React from 'react';
import { Task } from '../../types';
import { CheckCircle2, Clock, AlertCircle, ListTodo, AlertOctagon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface TaskSummaryCardsProps {
  tasks: Task[];
}

export const TaskSummaryCards: React.FC<TaskSummaryCardsProps> = ({ tasks }) => {
  const { t } = useLanguage();
  
  const total = tasks.length;
  const pending = tasks.filter(t => t.status === 'Pending').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  
  const now = new Date();
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Completed').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm font-medium text-slate-500">{t('tasks.totalTasks', undefined, 'Total Tasks')}</p>
          <div className="p-2 bg-slate-50 rounded-lg">
            <ListTodo className="w-5 h-5 text-slate-400" />
          </div>
        </div>
        <h4 className="text-2xl font-bold text-slate-800">{total}</h4>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm font-medium text-slate-500">{t('tasks.pending', undefined, 'Pending')}</p>
          <div className="p-2 bg-yellow-50 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
        </div>
        <h4 className="text-2xl font-bold text-slate-800">{pending}</h4>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm font-medium text-slate-500">{t('tasks.inProgress', undefined, 'In Progress')}</p>
          <div className="p-2 bg-blue-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-500" />
          </div>
        </div>
        <h4 className="text-2xl font-bold text-slate-800">{inProgress}</h4>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm font-medium text-slate-500">{t('tasks.completed', undefined, 'Completed')}</p>
          <div className="p-2 bg-green-50 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
        </div>
        <h4 className="text-2xl font-bold text-slate-800">{completed}</h4>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm font-medium text-red-500">{t('tasks.overdue', undefined, 'Overdue')}</p>
          <div className="p-2 bg-red-50 rounded-lg">
            <AlertOctagon className="w-5 h-5 text-red-500" />
          </div>
        </div>
        <h4 className="text-2xl font-bold text-red-600">{overdue}</h4>
      </div>
    </div>
  );
};
