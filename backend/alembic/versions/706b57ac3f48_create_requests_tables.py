"""create requests tables"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "706b57ac3f48"
down_revision: Union[str, Sequence[str], None] = "20260929_0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "requests",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("request_number", sa.String(length=24), nullable=False),
        sa.Column(
            "type",
            sa.Enum("ISSUE", "PURCHASE", name="requesttype"),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.Enum(
                "PENDING",
                "APPROVED",
                "REJECTED",
                "COMPLETED",
                name="requeststatus",
            ),
            nullable=False,
        ),
        sa.Column("warehouse_id", sa.Integer(), nullable=False),
        sa.Column("requested_by", sa.Integer(), nullable=False),
        sa.Column("decided_by", sa.Integer(), nullable=True),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("decision_comment", sa.Text(), nullable=True),
        sa.Column("decided_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["decided_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["requested_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_requests_request_number"),
        "requests",
        ["request_number"],
        unique=True,
    )
    op.create_index(
        op.f("ix_requests_requested_by"),
        "requests",
        ["requested_by"],
        unique=False,
    )
    op.create_index(
        op.f("ix_requests_status"),
        "requests",
        ["status"],
        unique=False,
    )
    op.create_index(
        op.f("ix_requests_warehouse_id"),
        "requests",
        ["warehouse_id"],
        unique=False,
    )
    op.create_table(
        "request_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("request_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Numeric(precision=12, scale=3), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.ForeignKeyConstraint(["request_id"], ["requests.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_request_items_product_id"),
        "request_items",
        ["product_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_request_items_request_id"),
        "request_items",
        ["request_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_request_items_request_id"), table_name="request_items")
    op.drop_index(op.f("ix_request_items_product_id"), table_name="request_items")
    op.drop_table("request_items")
    op.drop_index(op.f("ix_requests_warehouse_id"), table_name="requests")
    op.drop_index(op.f("ix_requests_status"), table_name="requests")
    op.drop_index(op.f("ix_requests_requested_by"), table_name="requests")
    op.drop_index(op.f("ix_requests_request_number"), table_name="requests")
    op.drop_table("requests")