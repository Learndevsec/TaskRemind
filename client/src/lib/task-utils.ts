import { Task } from "@shared/schema";
import { isToday, isPast, isFuture, startOfDay, endOfDay } from "date-fns";

export function getTodaysTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => isToday(new Date(task.scheduledTime)));
}

export function getUpcomingTasks(tasks: Task[]): Task[] {
  const today = new Date();
  return tasks.filter(task => {
    const taskDate = new Date(task.scheduledTime);
    return isFuture(taskDate) && !isToday(taskDate);
  });
}

export function getOverdueTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => {
    const taskDate = new Date(task.scheduledTime);
    return isPast(taskDate) && !task.completed && !isToday(taskDate);
  });
}

export function getTaskStats(tasks: Task[]) {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const pending = total - completed;
  const overdue = getOverdueTasks(tasks).length;

  return {
    total,
    completed,
    pending,
    overdue,
  };
}

export function isTaskOverdue(task: Task): boolean {
  const taskDate = new Date(task.scheduledTime);
  return isPast(taskDate) && !task.completed;
}

export function getTasksByDateRange(tasks: Task[], startDate: Date, endDate: Date): Task[] {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);
  
  return tasks.filter(task => {
    const taskDate = new Date(task.scheduledTime);
    return taskDate >= start && taskDate <= end;
  });
}

export function sortTasksByScheduledTime(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => 
    new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
  );
}

export function getTaskCountByPriority(tasks: Task[]) {
  return tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
