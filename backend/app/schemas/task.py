from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.task import TaskPriority, TaskStatus


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=3000)
    priority: TaskPriority = TaskPriority.NORMAL
    due_date: date | None = None
    assigned_to: int = Field(gt=0)
    request_id: int | None = Field(default=None, gt=0)


class TaskStatusUpdate(BaseModel):
    status: TaskStatus


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    status: TaskStatus
    priority: TaskPriority
    due_date: date | None
    assigned_to: int
    created_by: int
    request_id: int | None
    completed_at: datetime | None
    created_at: datetime


class TasksPageResponse(BaseModel):
    items: list[TaskResponse]
    total: int
    page: int
    page_size: int