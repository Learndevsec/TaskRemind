import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { TaskItem } from "@/components/task-item";
import { CreateTaskModal } from "@/components/create-task-modal";
import { NotificationPrompt } from "@/components/notification-prompt";
import { useNotifications } from "@/hooks/use-notifications";
import { useTaskScheduler } from "@/hooks/use-task-scheduler";
import { isToday, isOverdue, getTodaysTasks, getUpcomingTasks, getTaskStats } from "@/lib/task-utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Bell, Settings, Plus, CheckCircle, Calendar, AlertTriangle } from "lucide-react";

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { requestPermission, permission, scheduleNotification } = useNotifications();
  const { scheduleTask } = useTaskScheduler();

  // Fetch all tasks
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  // Schedule notifications for all tasks when they change
  useEffect(() => {
    if (tasks.length > 0) {
      tasks.forEach(task => {
        if (!task.completed && new Date(task.scheduledTime) > new Date()) {
          scheduleTask(task);
        }
      });
    }
  }, [tasks, scheduleTask]);

  const handleToggleComplete = async (task: Task) => {
    try {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        updates: { completed: !task.completed }
      });
      
      toast({
        title: task.completed ? "Task marked as incomplete" : "Task completed!",
        description: task.title,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTaskMutation.mutateAsync(taskId);
      toast({
        title: "Task deleted",
        description: "Task has been removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleNotificationToggle = () => {
    if (permission === "default") {
      requestPermission();
    } else if (permission === "granted") {
      // Show test notification
      scheduleNotification("TaskRemind", {
        body: "Notifications are working correctly!",
        icon: "/favicon.ico"
      });
    }
  };

  const todaysTasks = getTodaysTasks(tasks);
  const upcomingTasks = getUpcomingTasks(tasks);
  const stats = getTaskStats(tasks);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-roboto">
      {/* Header */}
      <header className="bg-white card-shadow sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <CheckCircle className="text-white w-4 h-4" />
            </div>
            <h1 className="text-xl font-medium text-gray-900">TaskRemind</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={handleNotificationToggle}
              data-testid="button-notifications"
            >
              <Bell className={`w-5 h-5 ${permission === 'granted' ? 'text-success' : 'text-gray-600'}`} />
            </button>
            <button 
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              data-testid="button-settings"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-3" data-testid="stats-total">
              <div className="text-lg font-semibold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-600">Total Tasks</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3" data-testid="stats-completed">
              <div className="text-lg font-semibold text-success">{stats.completed}</div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3" data-testid="stats-pending">
              <div className="text-lg font-semibold text-warning">{stats.pending}</div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-24">
        {/* Today's Schedule */}
        <section className="p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Today's Schedule</h2>
          
          <div className="space-y-3" data-testid="todays-tasks">
            {todaysTasks.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No tasks scheduled for today</p>
              </div>
            ) : (
              todaysTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteTask}
                />
              ))
            )}
          </div>
        </section>

        {/* Upcoming Tasks */}
        {upcomingTasks.length > 0 && (
          <section className="p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Upcoming</h2>
            
            <div className="space-y-3" data-testid="upcoming-tasks">
              {upcomingTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <section className="p-8 text-center" data-testid="empty-state">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks scheduled</h3>
            <p className="text-gray-600 mb-6">Create your first task to get started with smart reminders</p>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary text-white px-6 py-3 rounded-xl font-medium ripple"
              data-testid="button-create-first-task"
            >
              Create Your First Task
            </button>
          </section>
        )}
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full fab-shadow flex items-center justify-center ripple z-30"
        data-testid="button-create-task"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modals */}
      <CreateTaskModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <NotificationPrompt />
    </div>
  );
}
