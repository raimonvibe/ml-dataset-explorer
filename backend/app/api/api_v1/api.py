from fastapi import APIRouter
from app.api.api_v1.endpoints import datasets, uploads, images

api_router = APIRouter()
api_router.include_router(datasets.router, prefix="/datasets", tags=["datasets"])
api_router.include_router(uploads.router, prefix="/upload", tags=["uploads"])
api_router.include_router(images.router, prefix="/images", tags=["images"])
