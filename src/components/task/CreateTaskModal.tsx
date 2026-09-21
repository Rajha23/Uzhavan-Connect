import React, { useState } from 'react';
import { TaskPriority, TaskStatus, UserRole, AGRI_TASK_TYPES } from '../../types';
import { X, Save } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { taskService } from '../../services/taskService';

interface CreateTaskModalProps {
  onClose: () => void;
  onTaskCreated: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onClose, onTaskCreated }) => {
  const { t } = useLanguage();
  const { currentUser } = useApp();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    taskType: 'General',
    priority: 'Medium' as TaskPriority,
    status: 'Pending' as TaskStatus,
    assignedToName: '',
    assignedRole: 'FARMER' as UserRole,
    dueDate: '',
    relatedEntityType: 'None' as any,
    relatedEntityId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsSubmitting(true);
    try {
      await taskService.createTask({
        organizationId: currentUser.organization || 'system-org',
        title: formData.title,
        description: formData.description,
        taskType: formData.taskType,
        priority: formData.priority,
        status: formData.status,
        recurrence: 'none',
        createdBy: currentUser.id,
        createdByName: currentUser.name,
        assignedTo: `usr-${Date.now()}`, // simple mock assignment ID
        assignedToName: formData.assignedToName,
        assignedRole: formData.assignedRole,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        relatedEntityType: formData.relatedEntityType,
        relatedEntityId: formData.relatedEntityId
      });
      onTaskCreated();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles: UserRole[] = ['FARMER', 'FPO_AGGREGATOR', 'RETAIL_BUYER', 'BULK_BUYER', 'LOGISTICS', 'ADMIN'];
  const priorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent'];
  const entityTypes = ['None', 'ProduceListing', 'Order', 'DemandRequest', 'QualityInspection'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">{t('tasks.createTask', undefined, 'Create Task')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('tasks.fields.taskTitle', undefined, 'Task Title')} *
              </label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="e.g. Inspect Tomato Lot"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('tasks.fields.description', undefined, 'Description')}
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                placeholder="Details about the task..."
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('tasks.fields.taskType', undefined, 'Task Type')}
              </label>
              <select
                value={formData.taskType}
                onChange={e => setFormData({...formData, taskType: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {AGRI_TASK_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('tasks.fields.priority', undefined, 'Priority')}
              </label>
              <select
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value as TaskPriority})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {priorities.map(p => <option key={p} value={p}>{t(`tasks.priority.${p.toLowerCase()}`, undefined, p)}</option>)}
              </select>
            </div>

            {/* Assignee Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('tasks.fields.assignedTo', undefined, 'Assign To (Name)')} *
              </label>
              <input
                required
                type="text"
                value={formData.assignedToName}
                onChange={e => setFormData({...formData, assignedToName: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="e.g. Murugan"
              />
            </div>

            {/* Assignee Role */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('tasks.fields.assignedRole', undefined, 'Assignee Role')}
              </label>
              <select
                value={formData.assignedRole}
                onChange={e => setFormData({...formData, assignedRole: e.target.value as UserRole})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('tasks.fields.dueDate', undefined, 'Due Date')}
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Related Entity */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Entity Type
                </label>
                <select
                  value={formData.relatedEntityType}
                  onChange={e => setFormData({...formData, relatedEntityType: e.target.value as any})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {entityTypes.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {formData.relatedEntityType !== 'None' && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Entity ID
                  </label>
                  <input
                    type="text"
                    value={formData.relatedEntityId}
                    onChange={e => setFormData({...formData, relatedEntityId: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="ID..."
                  />
                </div>
              )}
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {t('tasks.actions.cancel', undefined, 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {t('tasks.actions.save', undefined, 'Save Task')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
