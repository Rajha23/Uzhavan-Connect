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

import { Search, Plus, Filter, LayoutGrid, List, Layers, Sprout, Building2, Truck, ShoppingBag, Factory, ShieldCheck } from 'lucide-react';

export const TaskManagementPage: React.FC = () => {
  const { t } = useLanguage();
  const { currentRole, currentUser } = useApp();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'All'>('All');
  
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await taskService.getAllTasks();
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (currentRole && currentRole !== 'ADMIN') {
      setRoleFilter(currentRole);
    } else {
      setRoleFilter('ALL');
    }
    
    // Listen for global task updates to sync the UI across components
    const handleTasksUpdated = () => fetchTasks();
    window.addEventListener('tasks-updated', handleTasksUpdated);
    
    return () => {
      window.removeEventListener('tasks-updated', handleTasksUpdated);
    };
  }, [currentRole, currentUser]);

  const ROLE_OPTIONS: { role: UserRole | 'ALL'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { role: 'ALL', label: t('tasks.roles.all', undefined, 'All Roles'), icon: Layers },
    { role: 'FARMER', label: t('roles.farmer', undefined, 'Farmer'), icon: Sprout },
    { role: 'FPO_AGGREGATOR', label: t('roles.fpoAggregator', undefined, 'FPO Aggregator'), icon: Building2 },
    { role: 'LOGISTICS', label: t('roles.logistics', undefined, 'Logistics Carrier'), icon: Truck },
    { role: 'RETAIL_BUYER', label: t('roles.retailBuyer', undefined, 'Retail Buyer'), icon: ShoppingBag },
    { role: 'BULK_BUYER', label: t('roles.bulkBuyer', undefined, 'Bulk Buyer'), icon: Factory },
    { role: 'ADMIN', label: t('roles.admin', undefined, 'Admin Ops'), icon: ShieldCheck }
  ];

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesRole = roleFilter === 'ALL' || task.assignedRole === roleFilter;

      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignedToName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignedRole.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
      
      return matchesRole && matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, roleFilter, searchQuery, statusFilter, priorityFilter]);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading tasks...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('tasks.title', undefined, 'Task Management')}</h1>
          <p className="text-sm text-slate-500">{t('tasks.subtitle', undefined, 'Plan, assign and track agricultural supply chain operations across all roles.')}</p>
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#01472e] hover:bg-[#025a3b] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          {t('tasks.createTask', undefined, 'Create Task')}
        </button>
      </div>

      {/* Role Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {ROLE_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = roleFilter === opt.role;
          const count = opt.role === 'ALL' 
            ? tasks.length 
            : tasks.filter(t => t.assignedRole === opt.role).length;

          return (
            <button
              key={opt.role}
              onClick={() => setRoleFilter(opt.role)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#01472e] text-white shadow-soft'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{opt.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Summary Cards */}
      <TaskSummaryCards tasks={filteredTasks} />

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={t('tasks.searchPlaceholder', 'Search tasks, descriptions, assignees...')}
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
              <option value="All">{t('tasks.statusAll', 'All Status')}</option>
              <option value="Pending">{t('tasks.statusPending', 'Pending')}</option>
              <option value="In Progress">{t('tasks.statusInProgress', 'In Progress')}</option>
              <option value="Completed">{t('tasks.statusCompleted', 'Completed')}</option>
              <option value="Blocked">{t('tasks.statusBlocked', 'Blocked')}</option>
            </select>
            <Filter className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          </div>

          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-[#01472e] shadow-sm"
            >
              <option value="All">{t('tasks.priorityAll', 'All Priorities')}</option>
              <option value="Urgent">{t('tasks.priorityUrgent', 'Urgent')}</option>
              <option value="High">{t('tasks.priorityHigh', 'High')}</option>
              <option value="Medium">{t('tasks.priorityMedium', 'Medium')}</option>
              <option value="Low">{t('tasks.priorityLow', 'Low')}</option>
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
            // Re-fetch happens automatically via tasks-updated event
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
