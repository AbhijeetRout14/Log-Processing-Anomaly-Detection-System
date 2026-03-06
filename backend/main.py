# FastAPI app entry point

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi import HTTPException
from backend.database import mongodb
from backend.routes.logs import router as logs_router

from backend.routes.stats import router as stats_router
from backend.routes.anomalies import router as anomalies_router
from backend.routes.admin import router as admin_router
from backend.routes.seed import router as seed_router
from backend.routes.dashboard import router as dashboard_router


# ✅ Use lifespan instead of deprecated @app.on_event("startup")
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up application...")
    mongodb.connect()
    yield
    print("Shutting down application...")


def create_app() -> FastAPI:
    app = FastAPI(
        title="Log Processing & Anomaly Detection System",
        version="1.0.0",
        lifespan=lifespan
    )

    # ✅ Enable CORS (Development Mode)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Change to specific frontend URL in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ✅ Register Routes
    app.include_router(logs_router)
    
    app.include_router(stats_router)
    
    app.include_router(anomalies_router)
    
    app.include_router(admin_router)
    
    app.include_router(seed_router)
    
    app.include_router(dashboard_router)

    # ✅ Health Check
    @app.get("/api/health")
    async def health_check():
        return {"status": "ok"}

    # ✅ Test MongoDB Connection
    @app.get("/api/test-db")
    async def test_db():
        if mongodb.logs_collection is None:
            return {"error": "Database not connected"}
        count = mongodb.logs_collection.count_documents({})
        return {"log_count": count}
    
    @app.get("/")
    def root():
        return {"message": "Log Processing & Anomaly Detection API is running"}

    return app


app = create_app()