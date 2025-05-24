from fastapi import APIRouter
from app.api import routes
from app.api import auth_routes

api_router = APIRouter()
api_router.include_router(routes.router)
api_router.include_router(auth_routes.router) 