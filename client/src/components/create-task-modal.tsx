import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskApiSchema, type InsertTaskApi } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TimePickerModal } from "@/components/time-picker-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X, Circle } from "lucide-react";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  followUpEnabled: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTaskModal({ isOpen, onClose }: CreateTaskModalProps) {
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      date: new Date().toISOString().split('T')[0],
      time: "",
      priority: "medium",
      followUpEnabled: true,
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: InsertTaskApi) => {
      const response = await apiRequest("POST", "/api/tasks", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task created successfully!",
        description: "Your reminder has been scheduled.",
      });
      onClose();
      form.reset();
      setSelectedTime("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const scheduledTime = new Date(`${data.date}T${data.time}`);
    
    if (scheduledTime <= new Date()) {
      toast({
        title: "Invalid time",
        description: "Please select a future date and time.",
        variant: "destructive",
      });
      return;
    }

    const taskData: InsertTaskApi = {
      title: data.title,
      scheduledTime: scheduledTime.toISOString(),
      priority: data.priority,
      followUpEnabled: data.followUpEnabled,
    };

    createTaskMutation.mutate(taskData);
  };

  const setPriority = (priority: "low" | "medium" | "high") => {
    form.setValue("priority", priority);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    form.setValue("time", time);
    setIsTimePickerOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl slide-up">
          <div className="p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
                data-testid="button-close-modal"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Task Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Task Title */}
              <div>
                <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Task Description
                </Label>
                <Input
                  id="title"
                  placeholder="What do you need to do?"
                  maxLength={100}
                  {...form.register("title")}
                  data-testid="input-task-title"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 outline-none transition-colors"
                />
                <div className="text-xs text-gray-500 mt-1">100 characters max</div>
                {form.formState.errors.title && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    {...form.register("date")}
                    data-testid="input-task-date"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 outline-none"
                  />
                  {form.formState.errors.date && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.date.message}</p>
                  )}
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </Label>
                  <button
                    type="button"
                    onClick={() => setIsTimePickerOpen(true)}
                    className="w-full p-4 border border-gray-300 rounded-xl text-left hover:border-primary transition-colors"
                    data-testid="button-select-time"
                  >
                    <span className={selectedTime ? "text-gray-900" : "text-gray-500"}>
                      {selectedTime || "Select time"}
                    </span>
                  </button>
                  {form.formState.errors.time && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.time.message}</p>
                  )}
                </div>
              </div>

              {/* Priority */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-3">
                  Priority Level
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {(["low", "medium", "high"] as const).map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setPriority(priority)}
                      className={`p-3 border-2 rounded-xl text-center transition-colors ${
                        form.watch("priority") === priority
                          ? priority === "low"
                            ? "border-green-300 bg-green-50"
                            : priority === "medium"
                            ? "border-warning bg-orange-50"
                            : "border-red-300 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      data-testid={`button-priority-${priority}`}
                    >
                      <Circle className={`w-4 h-4 mx-auto mb-1 ${
                        priority === "low" ? "text-green-500" :
                        priority === "medium" ? "text-warning" : "text-red-500"
                      }`} />
                      <div className="text-sm font-medium capitalize">{priority}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Follow-up Settings */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Follow-up Reminder
                  </Label>
                  <Switch
                    checked={form.watch("followUpEnabled")}
                    onCheckedChange={(checked) => form.setValue("followUpEnabled", checked)}
                    data-testid="switch-follow-up"
                  />
                </div>
                <p className="text-xs text-gray-600">
                  Send another reminder if task isn't completed within 1 hour
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 py-3 px-6 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createTaskMutation.isPending}
                  className="flex-1 py-3 px-6 bg-primary text-white rounded-xl font-medium ripple disabled:opacity-50"
                  data-testid="button-create-task"
                >
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <TimePickerModal
        isOpen={isTimePickerOpen}
        onClose={() => setIsTimePickerOpen(false)}
        onTimeSelect={handleTimeSelect}
      />
    </>
  );
}
