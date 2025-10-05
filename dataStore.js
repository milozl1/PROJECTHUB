// dataStore.js - gestiune date + persistență localStorage
// Cheie unică în localStorage
const STORAGE_KEY = 'projecthub-data-v1';

const DefaultSeedData = () => ({
  projects: [
    {
      id: 'proj-1',
      name: 'Redesign Website',
      description: 'Complete overhaul of company website with modern design',
      status: 'In Progress',
      progress: 65,
      startDate: '2025-09-01',
      dueDate: '2025-10-31',
      priority: 'High',
      color: '#3B82F6',
      teamMembers: ['user-1', 'user-2', 'user-3'],
      tags: ['design', 'development', 'marketing']
    },
    {
      id: 'proj-2',
      name: 'Mobile App Development',
      description: 'Native iOS and Android application for customer portal',
      status: 'In Progress',
      progress: 30,
      startDate: '2025-08-15',
      dueDate: '2025-12-15',
      priority: 'Critical',
      color: '#10B981',
      teamMembers: ['user-4', 'user-5', 'user-1'],
      tags: ['mobile', 'development', 'ios', 'android']
    },
    {
      id: 'proj-3',
      name: 'Marketing Campaign Q4',
      description: 'Holiday marketing campaign across all channels',
      status: 'Not Started',
      progress: 5,
      startDate: '2025-10-01',
      dueDate: '2025-12-31',
      priority: 'Medium',
      color: '#8B5CF6',
      teamMembers: ['user-6', 'user-2'],
      tags: ['marketing', 'campaign', 'social']
    }
  ],
  tasks: [
    {
      id: 'task-1',
      projectId: 'proj-1',
      title: 'Create wireframes for homepage',
      description: 'Design low-fidelity wireframes for the new homepage layout',
      startDate: '2025-09-05',
      status: 'Done',
      priority: 'High',
      assignedTo: 'user-2',
      dueDate: '2025-09-15',
      estimatedHours: 16,
      actualHours: 18,
      tags: ['design', 'wireframes'],
      dependencies: [],
      subtasks: [
        { id: 'sub-1', title: 'Research competitor layouts', completed: true },
        { id: 'sub-2', title: 'Sketch initial concepts', completed: true },
        { id: 'sub-3', title: 'Create digital wireframes', completed: true }
      ]
    },
    {
      id: 'task-2',
      projectId: 'proj-1',
      title: 'Develop responsive navigation',
      description: 'Implement mobile-first navigation with hamburger menu',
      startDate: '2025-09-10',
      status: 'In Progress',
      priority: 'High',
      assignedTo: 'user-1',
      dueDate: '2025-09-30',
      estimatedHours: 24,
      actualHours: 12,
      tags: ['development', 'responsive', 'navigation'],
      dependencies: ['task-1'],
      subtasks: [
        { id: 'sub-4', title: 'HTML structure', completed: true },
        { id: 'sub-5', title: 'CSS styling', completed: false },
        { id: 'sub-6', title: 'JavaScript functionality', completed: false }
      ]
    },
    {
      id: 'task-3',
      projectId: 'proj-2',
      title: 'Setup development environment',
      description: 'Configure React Native development environment for both platforms',
      startDate: '2025-08-16',
      status: 'Done',
      priority: 'Critical',
      assignedTo: 'user-4',
      dueDate: '2025-08-20',
      estimatedHours: 8,
      actualHours: 6,
      tags: ['setup', 'react-native', 'development'],
      dependencies: [],
      subtasks: []
    },
    {
      id: 'task-4',
      projectId: 'proj-2',
      title: 'Design app architecture',
      description: 'Create technical architecture diagram and component structure',
      startDate: '2025-09-10',
      status: 'In Progress',
      priority: 'High',
      assignedTo: 'user-5',
      dueDate: '2025-09-30',
      estimatedHours: 20,
      actualHours: 8,
      tags: ['architecture', 'planning'],
      dependencies: ['task-3'],
      subtasks: [
        { id: 'sub-7', title: 'Database design', completed: true },
        { id: 'sub-8', title: 'API structure', completed: false },
        { id: 'sub-9', title: 'Component hierarchy', completed: false }
      ]
    }
  ],
  users: [
    {
      id: 'user-1',
      name: 'Alex Popescu',
      email: 'alex@company.com',
      role: 'Full Stack Developer',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      skills: ['JavaScript', 'React', 'Node.js', 'Python'],
      hoursPerWeek: 40
    },
    {
      id: 'user-2',
      name: 'Maria Ionescu',
      email: 'maria@company.com',
      role: 'UX/UI Designer',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping'],
      hoursPerWeek: 40
    },
    {
      id: 'user-3',
      name: 'Andrei Vasilescu',
      email: 'andrei@company.com',
      role: 'Frontend Developer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      skills: ['React', 'Vue.js', 'CSS', 'TypeScript'],
      hoursPerWeek: 40
    },
    {
      id: 'user-4',
      name: 'Diana Moldovan',
      email: 'diana@company.com',
      role: 'Mobile Developer',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      skills: ['React Native', 'Flutter', 'iOS', 'Android'],
      hoursPerWeek: 40
    },
    {
      id: 'user-5',
      name: 'Radu Constantinescu',
      email: 'radu@company.com',
      role: 'Backend Developer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      skills: ['Node.js', 'Python', 'PostgreSQL', 'Docker'],
      hoursPerWeek: 40
    },
    {
      id: 'user-6',
      name: 'Carmen Dumitrescu',
      email: 'carmen@company.com',
      role: 'Marketing Manager',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      skills: ['Digital Marketing', 'Content Strategy', 'Analytics', 'SEO'],
      hoursPerWeek: 40
    }
  ],
  timeEntries: [
    { id: 'time-1', taskId: 'task-1', userId: 'user-2', date: '2025-09-28', hours: 4, description: 'Finalized wireframes and created responsive breakpoints' },
    { id: 'time-2', taskId: 'task-2', userId: 'user-1', date: '2025-09-29', hours: 6, description: 'Implemented HTML structure and started CSS styling' },
    { id: 'time-3', taskId: 'task-4', userId: 'user-5', date: '2025-09-27', hours: 8, description: 'Completed database design and API endpoint mapping' }
  ],
  comments: [
    {
      id: 'comment-1',
      taskId: 'task-2',
      userId: 'user-2',
      text: 'Great progress on the HTML structure! The navigation looks clean. @user-1 let me know when you\'re ready for design review.',
      timestamp: '2025-09-29T14:30:00Z'
    },
    {
      id: 'comment-2',
      taskId: 'task-4',
      userId: 'user-4',
      text: 'The database design looks solid. We should consider adding indexes for the user queries we discussed.',
      timestamp: '2025-09-28T10:15:00Z'
    }
  ]
});

const DataStore = {
  _data: null,
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this._data = JSON.parse(raw);
      } else {
        this._data = DefaultSeedData();
        this.save();
      }
    } catch (e) {
      console.error('Eroare load data, se folosește seed:', e);
      this._data = DefaultSeedData();
    }
    return this._data;
  },
  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
    } catch (e) {
      console.warn('Nu pot salva datele în localStorage', e);
    }
  },
  getData() {
    if (!this._data) this.load();
    return this._data;
  },
  addProject(project) {
    this._data.projects.push(project);
    this.save();
  },
  updateProject(id, partial) {
    const p = this._data.projects.find(pr => pr.id === id);
    if (p) Object.assign(p, partial);
    this.save();
  },
  addTask(task) {
    this._data.tasks.push(task);
    this.save();
  },
  updateTask(id, partial) {
    const t = this._data.tasks.find(tsk => tsk.id === id);
    if (t) Object.assign(t, partial);
    this.save();
  },
  addTimeEntry(entry) {
    this._data.timeEntries.push(entry);
    this.save();
  }
};

// Expune global
window.DataStore = DataStore;
