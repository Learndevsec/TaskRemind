import { useCallback, useRef } from "react";
import { Task } from "@shared/schema";
import { useNotifications } from "./use-notifications";

export function useTaskScheduler() {
  const { showTaskReminder } = useNotifications();
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const followUpTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const scheduleTask = useCallback((task: Task) => {
    if (task.completed) return;

    const now = new Date();
    const scheduledTime = new Date(task.scheduledTime);
    const timeUntilTask = scheduledTime.getTime() - now.getTime();

    // Clear existing timeouts for this task
    const existingTimeout = timeoutsRef.current.get(task.id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    const existingFollowUp = followUpTimeoutsRef.current.get(task.id);
    if (existingFollowUp) {
      clearTimeout(existingFollowUp);
    }

    // Don't schedule if the time has already passed
    if (timeUntilTask <= 0) return;

    // Schedule main notification
    const mainTimeout = setTimeout(() => {
      showTaskReminder(task.title, false);
      
      // Schedule follow-up if enabled
      if (task.followUpEnabled && !task.followUpSent) {
        const followUpTimeout = setTimeout(() => {
          showTaskReminder(task.title, true);
        }, 60 * 60 * 1000); // 1 hour later
        
        followUpTimeoutsRef.current.set(task.id, followUpTimeout);
      }
      
      timeoutsRef.current.delete(task.id);
    }, timeUntilTask);

    timeoutsRef.current.set(task.id, mainTimeout);
  }, [showTaskReminder]);

  const cancelTaskSchedule = useCallback((taskId: string) => {
    const timeout = timeoutsRef.current.get(taskId);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(taskId);
    }
    
    const followUpTimeout = followUpTimeoutsRef.current.get(taskId);
    if (followUpTimeout) {
      clearTimeout(followUpTimeout);
      followUpTimeoutsRef.current.delete(taskId);
    }
  }, []);

  const clearAllSchedules = useCallback(() => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    followUpTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current.clear();
    followUpTimeoutsRef.current.clear();
  }, []);

  return {
    scheduleTask,
    cancelTaskSchedule,
    clearAllSchedules,
  };
}
