from datetime import datetime

from sqlalchemy.orm import Session

from app.models.task import Task, TaskStatus
from app.models.user import User, UserRole
from app.repositories.task_repository import TaskRepository
from app.schemas.task import (
    TaskCreate,
    TaskResponse,
    TaskStatusUpdate,
    TasksPageResponse,
)


class TaskService:
    def __init__(
        self,
        task_repository: TaskRepository | None = None,
    ) -> None:
        self.task_repository = task_repository or TaskRepository()

    def create_task(
        self,
        database_session: Session,
        payload: TaskCreate,
        current_user: User,
    ) -> TaskResponse:
        assigned_user = database_session.get(User, payload.assigned_to)

        if not assigned_user or not assigned_user.is_active:
            raise ValueError("Виконавця не знайдено або його обліковий запис деактивований")

        task = Task(
            title=payload.title,
            description=payload.description,
            priority=payload.priority,
            due_date=payload.due_date,
            assigned_to=payload.assigned_to,
            created_by=current_user.id,
            request_id=payload.request_id,
            status=TaskStatus.TODO,
        )

        created_task = self.task_repository.create(database_session, task)

        database_session.commit()

        return TaskResponse.model_validate(created_task)

    def get_tasks(
        self,
        database_session: Session,
        current_user: User,
        page: int,
        page_size: int,
    ) -> TasksPageResponse:
        assigned_to = (
            current_user.id
            if current_user.role not in {UserRole.ADMIN, UserRole.MANAGER}
            else None
        )

        tasks, total = self.task_repository.get_page(
            database_session,
            page,
            page_size,
            assigned_to,
        )

        return TasksPageResponse(
            items=[TaskResponse.model_validate(task) for task in tasks],
            total=total,
            page=page,
            page_size=page_size,
        )

    def update_status(
        self,
        database_session: Session,
        task_id: int,
        payload: TaskStatusUpdate,
        current_user: User,
    ) -> TaskResponse:
        task = self.task_repository.get_by_id(database_session, task_id)

        if not task:
            raise ValueError("Задачу не знайдено")

        is_manager = current_user.role in {UserRole.ADMIN, UserRole.MANAGER}

        if task.assigned_to != current_user.id and not is_manager:
            raise ValueError("Змінювати статус може лише виконавець задачі")

        task.status = payload.status
        task.completed_at = (
            datetime.now() if payload.status == TaskStatus.DONE else None
        )

        database_session.commit()

        return TaskResponse.model_validate(task)