from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.inventory import (
    inventory_router,
    router as stock_movements_router,
)
from app.api.v1.requests import router as requests_router
from app.api.v1.auth import router as auth_router
from app.api.v1.health import router as health_router
from app.api.v1.products import router as products_router
from app.api.v1.users import router as users_router
from app.api.v1.warehouses import router as warehouses_router
from app.core.config import get_settings
from app.api.v1.tasks import router as tasks_router

settings = get_settings()

app = FastAPI(
    title="Opero API",
    version="0.1.0",
    openapi_url="/api/openapi.json",
    docs_url="/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(warehouses_router, prefix="/api/v1")
app.include_router(products_router, prefix="/api/v1")
app.include_router(stock_movements_router, prefix="/api/v1")
app.include_router(inventory_router, prefix="/api/v1")
app.include_router(requests_router, prefix="/api/v1")
app.include_router(tasks_router, prefix="/api/v1")