import { type Task, type InsertTask } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getTask(id: string): Promise<Task | undefined>;
  getAllTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  getTasksByDateRange(startDate: Date, endDate: Date): Promise<Task[]>;
}

export class MemStorage implements IStorage {
  private tasks: Map<string, Task>;

  constructor() {
    this.tasks = new Map();
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) => 
      new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    );
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      ...insertTask,
      id,
      completed: false,
      followUpSent: false,
      priority: insertTask.priority || "medium",
      followUpEnabled: insertTask.followUpEnabled ?? true,
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) {
      return undefined;
    }
    
    const updatedTask = { ...existingTask, ...updates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getTasksByDateRange(startDate: Date, endDate: Date): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => {
      const taskDate = new Date(task.scheduledTime);
      return taskDate >= startDate && taskDate <= endDate;
    }).sort((a, b) => 
      new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    );
  }
}

export const storage = new MemStorage();
