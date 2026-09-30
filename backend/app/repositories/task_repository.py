from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.task import Task


class TaskRepository:
    def create(
        self,
        database_session: Session,
        task: Task,
    ) -> Task:
        database_session.add(task)
        database_session.flush()
        database_session.refresh(task)
        return task

    def get_by_id(
        self,
        database_session: Session,
        task_id: int,
    ) -> Task | None:
        statement = select(Task).where(Task.id == task_id)

        return database_session.scalar(statement)

    def get_page(
        self,
        database_session: Session,
        page: int,
        page_size: int,
        assigned_to: int | None = None,
    ) -> tuple[list[Task], int]:
        statement = select(Task).order_by(
            Task.status.asc(),
            Task.due_date.asc(),
            Task.created_at.desc(),
        )
        count_statement = select(func.count(Task.id))

        if assigned_to is not None:
            statement = statement.where(Task.assigned_to == assigned_to)
            count_statement = count_statement.where(Task.assigned_to == assigned_to)

        statement = statement.offset((page - 1) * page_size).limit(page_size)

        tasks = list(database_session.scalars(statement))
        total = database_session.scalar(count_statement) or 0

        return tasks, total