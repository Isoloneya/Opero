from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260929_0004"
down_revision: str | None = "20260929_0003"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    stock_movement_type = sa.Enum(
        "receipt",
        "issue",
        name="stockmovementtype",
    )

    op.create_table(
        "inventory_balances",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("warehouse_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column(
            "quantity",
            sa.Numeric(precision=12, scale=3),
            server_default="0",
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "warehouse_id",
            "product_id",
            name="uq_inventory_balances_warehouse_product",
        ),
    )

    op.create_index(
        "ix_inventory_balances_warehouse_id",
        "inventory_balances",
        ["warehouse_id"],
        unique=False,
    )

    op.create_index(
        "ix_inventory_balances_product_id",
        "inventory_balances",
        ["product_id"],
        unique=False,
    )

    op.create_table(
        "stock_movements",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("warehouse_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("type", stock_movement_type, nullable=False),
        sa.Column(
            "quantity",
            sa.Numeric(precision=12, scale=3),
            nullable=False,
        ),
        sa.Column("reference_type", sa.String(length=40), nullable=True),
        sa.Column("reference_id", sa.Integer(), nullable=True),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_stock_movements_warehouse_id",
        "stock_movements",
        ["warehouse_id"],
        unique=False,
    )

    op.create_index(
        "ix_stock_movements_product_id",
        "stock_movements",
        ["product_id"],
        unique=False,
    )

    op.create_index(
        "ix_stock_movements_created_by",
        "stock_movements",
        ["created_by"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_stock_movements_created_by", table_name="stock_movements")
    op.drop_index("ix_stock_movements_product_id", table_name="stock_movements")
    op.drop_index("ix_stock_movements_warehouse_id", table_name="stock_movements")
    op.drop_table("stock_movements")

    op.drop_index("ix_inventory_balances_product_id", table_name="inventory_balances")
    op.drop_index("ix_inventory_balances_warehouse_id", table_name="inventory_balances")
    op.drop_table("inventory_balances")