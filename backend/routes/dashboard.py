from fastapi import APIRouter
from backend.database import mongodb

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary")
async def get_dashboard_summary():
    total_logs = mongodb.logs_collection.count_documents({})
    total_errors = mongodb.logs_collection.count_documents({"level": "ERROR"})
    anomaly_count = mongodb.anomalies_collection.count_documents({})

    # Top Service
    pipeline = [
    {
        "$addFields": {
            "normalized_service": {
                "$ifNull": [
                    "$service_name",
                    {
                        "$ifNull": [
                            "$service",
                            "$service-name"
                        ]
                    }
                ]
            }
        }
    },
    {
        "$group": {
            "_id": "$normalized_service",
            "count": {"$sum": 1}
        }
    },
    {"$match": {"_id": {"$ne": None}}},
    {"$sort": {"count": -1}},
    {"$limit": 1}
]

    top = list(mongodb.logs_collection.aggregate(pipeline))
    top_service = top[0]["_id"] if top else None

    error_rate = (total_errors / total_logs * 100) if total_logs else 0

    return {
        "total_logs": total_logs,
        "total_errors": total_errors,
        "error_rate": round(error_rate, 2),
        "anomaly_count": anomaly_count,
        "top_service": top_service
    }
    

@router.get("/errors-by-service")
async def get_errors_by_service():

    pipeline = [
        {
            "$match": {"level": "ERROR"}
        },
        {
            "$addFields": {
                "normalized_service": {
                    "$ifNull": [
                        "$service_name",
                        {
                            "$ifNull": [
                                "$service",
                                "$service-name"
                            ]
                        }
                    ]
                }
            }
        },
        {
            "$group": {
                "_id": "$normalized_service",
                "count": {"$sum": 1}
            }
        },
        {
            "$match": {"_id": {"$ne": None}}
        },
        {"$sort": {"count": -1}}
    ]

    result = list(mongodb.logs_collection.aggregate(pipeline))

    return [
        {"service": item["_id"], "count": item["count"]}
        for item in result
    ]
    

@router.get("/log-volume")
async def get_log_volume():

    pipeline = [
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d %H:%M",
                        "date": "$timestamp"
                    }
                },
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}},
        {"$limit": 50}
    ]

    result = list(mongodb.logs_collection.aggregate(pipeline))

    return [
        {"time": item["_id"], "count": item["count"]}
        for item in result
    ]