"""create tasks table"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "8635195b9af8"
down_revision: Union[str, Sequence[str], None] = "706b57ac3f48"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "tasks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "status",
            sa.Enum("TODO", "IN_PROGRESS", "DONE", name="taskstatus"),
            nullable=False,
        ),
        sa.Column(
            "priority",
            sa.Enum("LOW", "NORMAL", "HIGH", name="taskpriority"),
            nullable=False,
        ),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("assigned_to", sa.Integer(), nullable=False),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column("request_id", sa.Integer(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["assigned_to"], ["users.id"]),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["request_id"], ["requests.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_tasks_assigned_to"),
        "tasks",
        ["assigned_to"],
        unique=False,
    )
    op.create_index(
        op.f("ix_tasks_created_by"),
        "tasks",
        ["created_by"],
        unique=False,
    )
    op.create_index(
        op.f("ix_tasks_due_date"),
        "tasks",
        ["due_date"],
        unique=False,
    )
    op.create_index(
        op.f("ix_tasks_request_id"),
        "tasks",
        ["request_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_tasks_status"),
        "tasks",
        ["status"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_tasks_status"), table_name="tasks")
    op.drop_index(op.f("ix_tasks_request_id"), table_name="tasks")
    op.drop_index(op.f("ix_tasks_due_date"), table_name="tasks")
    op.drop_index(op.f("ix_tasks_created_by"), table_name="tasks")
    op.drop_index(op.f("ix_tasks_assigned_to"), table_name="tasks")
    op.drop_table("tasks")