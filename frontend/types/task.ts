export type TaskStatus = "todo" | "in_progress" | "done";

export type TaskPriority = "low" | "normal" | "high";

export type TaskData = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assigned_to: number;
  created_by: number;
  request_id: number | null;
  completed_at: string | null;
  created_at: string;
};

export type TasksPage = {
  items: TaskData[];
  total: number;
  page: number;
  page_size: number;
};

export type CreateTaskPayload = {
  title: string;
  description?: string | null;
  priority: TaskPriority;
  due_date?: string | null;
  assigned_to: number;
};

export type UpdateTaskStatusPayload = {
  status: TaskStatus;
};