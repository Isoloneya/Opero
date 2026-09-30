from collections.abc import Sequence

from alembic import op


revision: str = "20260930_0005"
down_revision: str | None = "1d02f6746c8c"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    if op.get_bind().dialect.name != "postgresql":
        return

    op.execute("ALTER TYPE userrole RENAME VALUE 'admin' TO 'ADMIN'")
    op.execute("ALTER TYPE userrole RENAME VALUE 'manager' TO 'MANAGER'")
    op.execute(
        "ALTER TYPE userrole RENAME VALUE 'warehouse_keeper' TO 'WAREHOUSE_KEEPER'"
    )
    op.execute("ALTER TYPE userrole RENAME VALUE 'employee' TO 'EMPLOYEE'")
    op.execute("ALTER TYPE stockmovementtype RENAME VALUE 'receipt' TO 'RECEIPT'")
    op.execute("ALTER TYPE stockmovementtype RENAME VALUE 'issue' TO 'ISSUE'")


def downgrade() -> None:
    if op.get_bind().dialect.name != "postgresql":
        return

    op.execute("ALTER TYPE userrole RENAME VALUE 'ADMIN' TO 'admin'")
    op.execute("ALTER TYPE userrole RENAME VALUE 'MANAGER' TO 'manager'")
    op.execute(
        "ALTER TYPE userrole RENAME VALUE 'WAREHOUSE_KEEPER' TO 'warehouse_keeper'"
    )
    op.execute("ALTER TYPE userrole RENAME VALUE 'EMPLOYEE' TO 'employee'")
    op.execute("ALTER TYPE stockmovementtype RENAME VALUE 'RECEIPT' TO 'receipt'")
    op.execute("ALTER TYPE stockmovementtype RENAME VALUE 'ISSUE' TO 'issue'")
