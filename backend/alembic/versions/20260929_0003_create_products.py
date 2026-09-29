from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260929_0003"
down_revision: str | None = "20260929_0002"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("sku", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("unit", sa.String(length=20), nullable=False),
        sa.Column(
            "minimum_stock",
            sa.Numeric(precision=12, scale=3),
            server_default="0",
            nullable=False,
        ),
        sa.Column(
            "is_active",
            sa.Boolean(),
            server_default=sa.true(),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("sku"),
    )
    op.create_index("ix_products_sku", "products", ["sku"], unique=False)
    op.create_index("ix_products_name", "products", ["name"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_products_name", table_name="products")
    op.drop_index("ix_products_sku", table_name="products")
    op.drop_table("products")