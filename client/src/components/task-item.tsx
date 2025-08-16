import { Task } from "@shared/schema";
import { formatDistanceToNow, format, isToday, isPast } from "date-fns";
import { Clock, Calendar, TriangleAlert, MoreVertical, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskItemProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskItem({ task, onToggleComplete, onDelete }: TaskItemProps) {
  const taskDate = new Date(task.scheduledTime);
  const isOverdue = isPast(taskDate) && !task.completed;
  const isTaskToday = isToday(taskDate);

  const getStatusBadge = () => {
    if (task.completed) {
      return <span className="text-xs bg-success text-white px-2 py-1 rounded-full">Completed</span>;
    }
    if (isOverdue) {
      return <span className="text-xs bg-secondary text-white px-2 py-1 rounded-full">Overdue</span>;
    }
    if (isTaskToday && taskDate > new Date()) {
      const timeUntil = formatDistanceToNow(taskDate);
      return <span className="text-xs bg-warning text-white px-2 py-1 rounded-full">In {timeUntil}</span>;
    }
    return null;
  };

  const getBorderColor = () => {
    if (task.completed) return "border-success";
    if (isOverdue) return "border-secondary";
    if (isTaskToday) return "border-warning";
    return "border-gray-200";
  };

  const getCompleteButtonStyle = () => {
    if (task.completed) {
      return "w-6 h-6 rounded-full bg-success flex items-center justify-center ripple";
    }
    if (isOverdue) {
      return "w-6 h-6 rounded-full border-2 border-secondary hover:bg-secondary hover:border-secondary transition-colors ripple";
    }
    if (isTaskToday) {
      return "w-6 h-6 rounded-full border-2 border-gray-300 hover:border-warning transition-colors ripple";
    }
    return "w-6 h-6 rounded-full border-2 border-gray-300 hover:border-primary transition-colors ripple";
  };

  return (
    <div className={`task-item bg-white rounded-xl p-4 card-shadow flex items-center space-x-4 border-l-4 ${getBorderColor()}`} data-testid={`task-item-${task.id}`}>
      <button 
        className={getCompleteButtonStyle()}
        onClick={() => onToggleComplete(task)}
        data-testid={`button-toggle-complete-${task.id}`}
      >
        {task.completed && <Check className="text-white w-3 h-3" />}
      </button>
      
      <div className="flex-1">
        <h3 className={`font-medium ${task.completed ? 'text-gray-900 line-through opacity-60' : 'text-gray-900'}`} data-testid={`text-task-title-${task.id}`}>
          {task.title}
        </h3>
        <div className="flex items-center space-x-2 mt-1">
          {isOverdue ? (
            <TriangleAlert className="w-3 h-3 text-secondary" />
          ) : isTaskToday ? (
            <Clock className="w-3 h-3 text-gray-400" />
          ) : (
            <Calendar className="w-3 h-3 text-gray-400" />
          )}
          <span className="text-sm text-gray-500" data-testid={`text-task-time-${task.id}`}>
            {isTaskToday 
              ? format(taskDate, 'h:mm a')
              : format(taskDate, 'MMM d, h:mm a')
            }
          </span>
          {getStatusBadge()}
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="p-2 text-gray-400 hover:text-gray-600"
            data-testid={`button-task-menu-${task.id}`}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => onToggleComplete(task)}
            data-testid={`menu-toggle-complete-${task.id}`}
          >
            {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onDelete(task.id)}
            className="text-red-600"
            data-testid={`menu-delete-${task.id}`}
          >
            Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
