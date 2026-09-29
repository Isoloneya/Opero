from sqlalchemy.orm import Session

from app.models.product import Product
from app.repositories.product_repository import ProductRepository
from app.schemas.product import ProductCreate


class ProductService:
    def __init__(
        self,
        product_repository: ProductRepository | None = None,
    ) -> None:
        self.product_repository = product_repository or ProductRepository()

    def create_product(
        self,
        database_session: Session,
        payload: ProductCreate,
    ) -> Product:
        sku = payload.sku.strip().upper()

        if self.product_repository.get_by_sku(database_session, sku):
            raise ValueError("Товар із таким SKU вже існує")

        product = Product(
            sku=sku,
            name=payload.name.strip(),
            unit=payload.unit.strip(),
            minimum_stock=payload.minimum_stock,
        )

        created_product = self.product_repository.create(
            database_session,
            product,
        )

        database_session.commit()
        return created_product