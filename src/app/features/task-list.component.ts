import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MobileHeaderComponent } from '../shared/mobile-header.component';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

interface TaskStats {
  date: string;
  completed: number;
  total: number;
}

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MobileHeaderComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  yearTasks: Task[] = [];
  monthTasks: Task[] = [];
  dayTasks: Task[] = [];
  
  dailyStats: TaskStats[] = [];
  
  showAddModal = false;
  showEditModal = false;
  currentTaskType: 'year' | 'month' | 'day' = 'day';
  newTaskTitle = '';
  editingTask: Task | null = null;
  editTaskTitle = '';

  ngOnInit() {
    this.loadTasks();
    this.checkAndResetDailyTasks();
    this.loadDailyStats();
  }

  loadTasks() {
    try {
      const saved = localStorage.getItem('taskListData');
      
      if (saved) {
        const data = JSON.parse(saved);
        this.yearTasks = data.yearTasks || [];
        this.monthTasks = data.monthTasks || [];
        this.dayTasks = data.dayTasks || [];
      } else {
        this.loadDefaultTasks();
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      this.loadDefaultTasks();
    }
  }

  loadDefaultTasks() {
    this.yearTasks = [
      { id: this.generateId(), title: 'Học một kỹ năng mới', completed: false, createdAt: new Date() },
      { id: this.generateId(), title: 'Đọc 12 cuốn sách', completed: false, createdAt: new Date() },
      { id: this.generateId(), title: 'Tiết kiệm 10 triệu', completed: false, createdAt: new Date() }
    ];

    this.monthTasks = [
      { id: this.generateId(), title: 'Hoàn thành dự án công việc', completed: false, createdAt: new Date() },
      { id: this.generateId(), title: 'Tập thể dục 3 lần/tuần', completed: false, createdAt: new Date() },
      { id: this.generateId(), title: 'Gặp gỡ bạn bè', completed: false, createdAt: new Date() }
    ];

    this.dayTasks = [
      { id: this.generateId(), title: 'Uống đủ 2 lít nước', completed: false, createdAt: new Date() },
      { id: this.generateId(), title: 'Tập thể dục 30 phút', completed: false, createdAt: new Date() },
      { id: this.generateId(), title: 'Đọc sách 20 phút', completed: false, createdAt: new Date() },
      { id: this.generateId(), title: 'Viết nhật ký', completed: false, createdAt: new Date() }
    ];

    this.saveTasks();
  }

  saveTasks() {
    try {
      const data = {
        yearTasks: this.yearTasks,
        monthTasks: this.monthTasks,
        dayTasks: this.dayTasks,
        lastSaveDate: new Date().toISOString()
      };
      
      localStorage.setItem('taskListData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }

  checkAndResetDailyTasks() {
    try {
      const lastResetDate = localStorage.getItem('lastDailyTaskReset');
      const today = new Date().toDateString();

      if (lastResetDate !== today) {
        // Save stats before reset
        this.saveDailyStats();
        
        // Reset all daily tasks to incomplete
        this.dayTasks.forEach(task => task.completed = false);
        
        localStorage.setItem('lastDailyTaskReset', today);
        this.saveTasks();
      }
    } catch (error) {
      console.error('Error checking daily reset:', error);
    }
  }

  saveDailyStats() {
    const today = new Date().toISOString().split('T')[0];
    const completed = this.dayTasks.filter(t => t.completed).length;
    const total = this.dayTasks.length;

    const stats = this.dailyStats;
    const existingIndex = stats.findIndex(s => s.date === today);

    if (existingIndex >= 0) {
      stats[existingIndex] = { date: today, completed, total };
    } else {
      stats.push({ date: today, completed, total });
    }

    // Keep only last 30 days
    if (stats.length > 30) {
      stats.splice(0, stats.length - 30);
    }

    localStorage.setItem('dailyTaskStats', JSON.stringify(stats));
  }

  loadDailyStats() {
    const saved = localStorage.getItem('dailyTaskStats');
    if (saved) {
      this.dailyStats = JSON.parse(saved);
    }
  }

  getInProgressTasks(type: 'year' | 'month' | 'day'): Task[] {
    const tasks = this.getTasksByType(type);
    return tasks.filter(t => !t.completed);
  }

  getCompletedTasks(type: 'year' | 'month' | 'day'): Task[] {
    const tasks = this.getTasksByType(type);
    return tasks.filter(t => t.completed);
  }

  getTasksByType(type: 'year' | 'month' | 'day'): Task[] {
    switch (type) {
      case 'year': return this.yearTasks;
      case 'month': return this.monthTasks;
      case 'day': return this.dayTasks;
    }
  }

  toggleTask(task: Task) {
    task.completed = !task.completed;
    this.saveTasks();
    
    // Update stats if it's a daily task
    if (this.dayTasks.includes(task)) {
      this.saveDailyStats();
      this.loadDailyStats();
    }
  }

  openAddModal(type: 'year' | 'month' | 'day') {
    this.currentTaskType = type;
    this.newTaskTitle = '';
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.newTaskTitle = '';
  }

  addTask() {
    if (!this.newTaskTitle.trim()) return;

    const newTask: Task = {
      id: this.generateId(),
      title: this.newTaskTitle.trim(),
      completed: false,
      createdAt: new Date()
    };

    switch (this.currentTaskType) {
      case 'year':
        this.yearTasks.push(newTask);
        break;
      case 'month':
        this.monthTasks.push(newTask);
        break;
      case 'day':
        this.dayTasks.push(newTask);
        break;
    }

    this.saveTasks();
    this.closeAddModal();
  }

  openEditModal(task: Task) {
    this.editingTask = task;
    this.editTaskTitle = task.title;
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingTask = null;
    this.editTaskTitle = '';
  }

  saveEdit() {
    if (this.editingTask && this.editTaskTitle.trim()) {
      this.editingTask.title = this.editTaskTitle.trim();
      this.saveTasks();
      this.closeEditModal();
    }
  }

  deleteTask(task: Task, type: 'year' | 'month' | 'day') {
    if (!confirm('Bạn có chắc muốn xóa task này?')) return;

    switch (type) {
      case 'year':
        this.yearTasks = this.yearTasks.filter(t => t.id !== task.id);
        break;
      case 'month':
        this.monthTasks = this.monthTasks.filter(t => t.id !== task.id);
        break;
      case 'day':
        this.dayTasks = this.dayTasks.filter(t => t.id !== task.id);
        break;
    }

    this.saveTasks();
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getTaskTypeLabel(type: 'year' | 'month' | 'day'): string {
    switch (type) {
      case 'year': return 'Năm';
      case 'month': return 'Tháng';
      case 'day': return 'Ngày';
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  }

  getCompletionRate(stat: TaskStats): number {
    return stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
  }

  // === Export CSV ===
  exportCSV() {
    const rows: string[] = [];
    rows.push('type,title,completed');
    
    this.yearTasks.forEach(t => rows.push(`year,"${t.title.replace(/"/g, '""')}",${t.completed}`));
    this.monthTasks.forEach(t => rows.push(`month,"${t.title.replace(/"/g, '""')}",${t.completed}`));
    this.dayTasks.forEach(t => rows.push(`day,"${t.title.replace(/"/g, '""')}",${t.completed}`));

    const csvContent = '\uFEFF' + rows.join('\n'); // BOM for UTF-8
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  // === Import CSV ===
  triggerImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) this.readCSVFile(file);
    };
    input.click();
  }

  private readCSVFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const text = e.target.result as string;
        this.parseCSV(text);
      } catch (error) {
        alert('Lỗi đọc file CSV!');
      }
    };
    reader.readAsText(file, 'UTF-8');
  }

  private parseCSV(text: string) {
    const lines = text.split('\n').filter(l => l.trim());
    
    // Skip header
    if (lines.length < 2) {
      alert('File CSV trống!');
      return;
    }

    const yearTasks: Task[] = [];
    const monthTasks: Task[] = [];
    const dayTasks: Task[] = [];

    for (let i = 1; i < lines.length; i++) {
      const match = lines[i].match(/^(\w+),"(.+)",(true|false)$/);
      if (!match) continue;

      const task: Task = {
        id: this.generateId(),
        title: match[2].replace(/""/g, '"'),
        completed: match[3] === 'true',
        createdAt: new Date()
      };

      switch (match[1]) {
        case 'year': yearTasks.push(task); break;
        case 'month': monthTasks.push(task); break;
        case 'day': dayTasks.push(task); break;
      }
    }

    if (yearTasks.length + monthTasks.length + dayTasks.length === 0) {
      alert('Không tìm thấy task hợp lệ trong file!');
      return;
    }

    if (confirm(`Import ${yearTasks.length} task năm, ${monthTasks.length} task tháng, ${dayTasks.length} task ngày?\n\nDữ liệu hiện tại sẽ bị thay thế.`)) {
      this.yearTasks = yearTasks;
      this.monthTasks = monthTasks;
      this.dayTasks = dayTasks;
      this.saveTasks();
    }
  }
}
