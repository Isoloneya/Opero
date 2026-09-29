from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.product import Product


class ProductRepository:

    def get_by_id(
        self,
        database_session: Session,
        product_id: int,
    ) -> Product | None:
        return database_session.get(Product, product_id)
    
    def get_by_sku(
        self,
        database_session: Session,
        sku: str,
    ) -> Product | None:
        statement = select(Product).where(Product.sku == sku)
        return database_session.scalar(statement)

    def get_page(
        self,
        database_session: Session,
        page: int,
        page_size: int,
        search: str | None,
    ) -> tuple[list[Product], int]:
        filters = []

        if search:
            pattern = f"%{search.strip()}%"
            filters.append(
                or_(
                    Product.sku.ilike(pattern),
                    Product.name.ilike(pattern),
                )
            )

        total_statement = select(func.count()).select_from(Product)

        if filters:
            total_statement = total_statement.where(*filters)

        total = database_session.scalar(total_statement) or 0

        statement = select(Product).order_by(Product.created_at.desc())

        if filters:
            statement = statement.where(*filters)

        statement = statement.offset((page - 1) * page_size).limit(page_size)

        products = list(database_session.scalars(statement))
        return products, total

    def create(
        self,
        database_session: Session,
        product: Product,
    ) -> Product:
        database_session.add(product)
        database_session.flush()
        database_session.refresh(product)
        return product