#FastAPI app entry point
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import mongodb


def create_app() -> FastAPI:
    app = FastAPI(title="Log Processing & Anomaly Detection System")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def startup_db():
        mongodb.connect()

    @app.get("/api/health")
    def health_check():
        return {"status": "ok"}
    
    @app.get("/api/test-db")
    def test_db():
        count = mongodb.logs_collection.count_documents({})
        return {"log_count": count}
    
    return app


app = create_app()