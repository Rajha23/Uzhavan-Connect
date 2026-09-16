import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { Task, TaskPriority, TaskStatus, UserRole } from '../types';
import { taskService } from '../services/taskService';

import {
  TaskSummaryCards,
  TaskBoard,
  TaskList,
  TaskModal,
  CreateTaskModal
} from '../components/task';

import { Search, Plus, Filter, LayoutGrid, List } from 'lucide-react';

export const TaskManagementPage: React.FC = () => {
  const { t } = useLanguage();
  const { currentRole, currentUser } = useApp();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'All'>('All');
  
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchTasks = async () => {
    if (!currentRole || !currentUser) return;
    
    setIsLoading(true);
    try {
      const data = await taskService.getTasksByRoleOrUser(currentRole, currentUser.id, currentUser.organization);
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentRole, currentUser]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignedToName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading tasks...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('tasks.title', undefined, 'Task Management')}</h1>
          <p className="text-sm text-slate-500">{t('tasks.subtitle', undefined, 'Plan, assign and track agricultural operations efficiently.')}</p>
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#01472e] hover:bg-[#025a3b] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-5 h-5" />
          {t('tasks.createTask', undefined, 'Create Task')}
        </button>
      </div>

      {/* Summary Cards */}
      <TaskSummaryCards tasks={tasks} />

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks, descriptions, assignees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#01472e]/20 focus:border-[#01472e] shadow-sm"
          />
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="appearance-none bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-[#01472e] shadow-sm"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Blocked">Blocked</option>
            </select>
            <Filter className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          </div>

          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-[#01472e] shadow-sm"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          
          {/* View Toggles */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'board' ? 'bg-white shadow-sm text-[#01472e]' : 'text-slate-500 hover:text-slate-700'}`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-[#01472e]' : 'text-slate-500 hover:text-slate-700'}`}
              title="List View"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {viewMode === 'board' ? (
          <TaskBoard tasks={filteredTasks} onTaskClick={setSelectedTask} />
        ) : (
          <div className="overflow-y-auto pr-2">
            <TaskList tasks={filteredTasks} onTaskClick={setSelectedTask} />
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={(updated) => {
            setTasks(tasks.map(t => t.id === updated.id ? updated : t));
            setSelectedTask(updated);
          }}
        />
      )}

      {isCreateModalOpen && (
        <CreateTaskModal
          onClose={() => setIsCreateModalOpen(false)}
          onTaskCreated={() => {
            setIsCreateModalOpen(false);
            fetchTasks(); // Refresh
          }}
        />
      )}
    </div>
  );
};
