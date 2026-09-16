import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { X, Calendar, Clock, User, Tag, FileText, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { taskService } from '../../services/taskService';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onTaskUpdated: (updatedTask: Task) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onTaskUpdated }) => {
  const { t } = useLanguage();
  const { currentUser, currentRole } = useApp();
  
  const [commentText, setCommentText] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === task.status || !currentUser) return;
    
    setIsUpdatingStatus(true);
    try {
      const updated = await taskService.updateTaskStatus(task.id, newStatus, currentUser.id, currentUser.name);
      onTaskUpdated(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !currentUser || !currentRole) return;
    
    setIsSubmittingComment(true);
    try {
      const updated = await taskService.addComment(
        task.id, 
        currentUser.id, 
        currentUser.name, 
        currentRole, 
        commentText.trim()
      );
      onTaskUpdated(updated);
      setCommentText('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Low': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const statuses: TaskStatus[] = ['Pending', 'In Progress', 'Completed', 'Blocked'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div>
            <div className="flex gap-2 mb-2">
              <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${getPriorityColor(task.priority)}`}>
                {t(`tasks.priority.${task.priority.toLowerCase()}`, undefined, task.priority)}
              </span>
              <span className="text-xs font-medium px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                {task.taskType}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">{task.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
          
          {/* Left Column: Details */}
          <div className="flex-1 flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                {t('tasks.fields.description', undefined, 'Description')}
              </h3>
              <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {task.description || 'No description provided.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><User className="w-3.5 h-3.5"/> {t('tasks.fields.assignedTo', undefined, 'Assigned To')}</p>
                <p className="font-semibold text-slate-800 text-sm">{task.assignedToName}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5"/> {t('tasks.fields.assignedRole', undefined, 'Role')}</p>
                <p className="font-semibold text-slate-800 text-sm">{task.assignedRole}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> {t('tasks.fields.dueDate', undefined, 'Due Date')}</p>
                <p className="font-semibold text-slate-800 text-sm">
                  {task.dueDate ? new Date(task.dueDate).toLocaleString() : 'No date set'}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Created By</p>
                <p className="font-semibold text-slate-800 text-sm">{task.createdByName}</p>
              </div>
            </div>
            
            {task.relatedEntityId && (
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                <p className="text-xs text-primary font-medium mb-1">{t('tasks.fields.relatedEntity', undefined, 'Related Entity')} ({task.relatedEntityType})</p>
                <p className="font-semibold text-primary">{task.relatedEntityId}</p>
              </div>
            )}
          </div>

          {/* Right Column: Activity & Comments */}
          <div className="flex-1 flex flex-col border-t md:border-t-0 md:border-l border-slate-100 md:pl-8 pt-6 md:pt-0">
            
            {/* Status Changer */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">{t('tasks.actions.changeStatus', undefined, 'Status')}</h3>
              <div className="flex flex-wrap gap-2">
                {statuses.map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={isUpdatingStatus}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      task.status === status 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t(`tasks.${status.replace(' ', '').toLowerCase()}`, undefined, status)}
                  </button>
                ))}
              </div>
            </div>

            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              Activity & Comments
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {/* Merge and sort activity and comments */}
              {[...task.activity.map(a => ({...a, type: 'activity'})), ...task.comments.map(c => ({...c, type: 'comment', timestamp: c.createdAt}))]
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                .map((item: any) => (
                  item.type === 'activity' ? (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-slate-600"><span className="font-medium text-slate-800">{item.userName}</span> {item.action.toLowerCase()}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{new Date(item.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ) : (
                    <div key={item.id} className="flex gap-3 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs">
                        {item.userName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline mb-1">
                          <p className="font-semibold text-slate-800">{item.userName}</p>
                          <p className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleString()}</p>
                        </div>
                        <p className="text-slate-600">{item.text}</p>
                      </div>
                    </div>
                  )
                ))
              }
            </div>

            {/* Comment Input */}
            <div className="mt-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Type a comment..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || isSubmittingComment}
                  className="bg-primary text-white p-2.5 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
