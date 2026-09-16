import { Task } from '../types';

export const INITIAL_TASKS: Task[] = [
  {
    id: 'tsk-001',
    organizationId: 'fpo-cauvery-delta',
    title: 'Verify Tomato Quality (Lot #TL-001)',
    description: 'Perform standard brix and firmness test on arriving tomato lot.',
    taskType: 'Perform Quality Check',
    priority: 'High',
    status: 'Pending',
    createdBy: 'usr-fpo-manager',
    createdByName: 'Arun Kumar',
    assignedTo: 'usr-fpo-manager',
    assignedToName: 'Arun Kumar',
    assignedRole: 'FPO_AGGREGATOR',
    dueDate: '2026-09-17T18:00:00Z',
    relatedEntityType: 'ProduceListing',
    relatedEntityId: 'LST-TOM-001',
    comments: [],
    activity: [
      {
        id: 'act-001',
        taskId: 'tsk-001',
        userId: 'system',
        userName: 'System',
        action: 'Task automatically created upon lot arrival.',
        timestamp: '2026-09-16T10:00:00Z'
      }
    ],
    createdAt: '2026-09-16T10:00:00Z',
    updatedAt: '2026-09-16T10:00:00Z'
  },
  {
    id: 'tsk-002',
    organizationId: 'fpo-cauvery-delta',
    title: 'Coordinate Logistics for Match #MT-550',
    description: 'Assign a CoolReefer EV to transport 500kg of Tomatoes.',
    taskType: 'Assign Vehicle',
    priority: 'Urgent',
    status: 'In Progress',
    createdBy: 'usr-fpo-manager',
    createdByName: 'Arun Kumar',
    assignedTo: 'usr-logistics-coordinator',
    assignedToName: 'Logistics Partner',
    assignedRole: 'LOGISTICS',
    dueDate: '2026-09-16T12:00:00Z',
    relatedEntityType: 'Order',
    relatedEntityId: 'ORD-TOM-991',
    comments: [
      {
        id: 'cmt-001',
        taskId: 'tsk-002',
        userId: 'usr-logistics-coordinator',
        userName: 'Logistics Partner',
        userRole: 'LOGISTICS',
        text: 'Vehicle TN-15-AGRI-5510 is assigned. Pending departure confirmation.',
        createdAt: '2026-09-16T10:30:00Z'
      }
    ],
    activity: [
      {
        id: 'act-002',
        taskId: 'tsk-002',
        userId: 'usr-logistics-coordinator',
        userName: 'Logistics Partner',
        action: 'Status changed from Pending to In Progress',
        timestamp: '2026-09-16T10:30:00Z'
      }
    ],
    createdAt: '2026-09-16T09:00:00Z',
    updatedAt: '2026-09-16T10:30:00Z'
  },
  {
    id: 'tsk-003',
    organizationId: 'fpo-cauvery-delta',
    title: 'Confirm Harvest Quantity',
    description: 'Confirm the final harvested quantity of Onions for tomorrow\'s pickup.',
    taskType: 'Confirm Quantity',
    priority: 'Medium',
    status: 'Pending',
    createdBy: 'usr-fpo-manager',
    createdByName: 'Arun Kumar',
    assignedTo: 'usr-farmer-1',
    assignedToName: 'Murugan',
    assignedRole: 'FARMER',
    dueDate: '2026-09-18T10:00:00Z',
    relatedEntityType: 'ProduceListing',
    relatedEntityId: 'LST-ONI-003',
    comments: [],
    activity: [],
    createdAt: '2026-09-16T11:00:00Z',
    updatedAt: '2026-09-16T11:00:00Z'
  },
  {
    id: 'tsk-004',
    organizationId: 'buyer-itc-foods',
    title: 'Review Delivered Produce',
    description: 'Check the grade of incoming Tomato delivery from Cauvery Delta FPO.',
    taskType: 'Review Produce',
    priority: 'High',
    status: 'Pending',
    createdBy: 'system',
    createdByName: 'System',
    assignedTo: 'usr-retail-buyer',
    assignedToName: 'Retail Buyer',
    assignedRole: 'RETAIL_BUYER',
    dueDate: '2026-09-16T18:00:00Z',
    relatedEntityType: 'Order',
    relatedEntityId: 'ORD-TOM-991',
    comments: [],
    activity: [],
    createdAt: '2026-09-16T08:00:00Z',
    updatedAt: '2026-09-16T08:00:00Z'
  }
];
