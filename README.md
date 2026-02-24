# 🚀 Log Processing & Anomaly Detection System

A full-stack log monitoring system that ingests application logs via APIs, stores them efficiently in MongoDB, detects anomalies (error spikes & unusual behavior), and visualizes everything on a web dashboard.

This project serves as a **lightweight alternative** to enterprise tools like ELK Stack, Datadog, and Splunk — built using HTML, CSS, JavaScript, FastAPI, and MongoDB.

---

## 📌 Problem Statement
Modern cloud-based applications generate millions of logs per day. Traditional logging systems often fall short because they:

* **Store logs as plain text files**, making debugging slow and inefficient.
* **Provide no structured storage**, preventing deep data analysis.
* **Lack intelligent error detection**, missing critical spikes.
* **Offer no visualization**, forcing manual log scanning.

**The Result:** Slow root cause analysis, hard-to-detect error spikes, and poor monitoring visibility. This project solves these challenges by building a real-time log monitoring and anomaly detection system.

---

## 🎯 Project Objective
The system is designed to:
1.  **Ingest Logs via REST API:** Support for single and batch JSON log ingestion.
2.  **Store Logs Efficiently:** Structured document storage in MongoDB with indexing on `timestamp`, `level`, and `service`.
3.  **Detect Anomalies:** Automated identification of unusual log patterns and error rate spikes.
4.  **Provide a Web Dashboard:** Visualize trends, summary metrics, and anomaly results in real-time.

---

## 🏗️ System Architecture

### 🔹 Backend – FastAPI
* **API Management:** Accepts log data and provides filtered queries.
* **Processing:** Performs anomaly detection logic and generates dashboard summaries.

### 🔹 Database – MongoDB
Logs are stored as structured JSON documents for fast filtering and aggregation.

```json
{
  "timestamp": "2026-02-24T10:30:00",
  "level": "ERROR",
  "service": "auth-service",
  "message": "Database connection failed"
}

### 🔹 Project Structure

log-anomaly-system/
│
├── backend/
│   ├── main.py          # Entry point
│   ├── routes/          # API Endpoints
│   ├── models/          # Data schemas
│   ├── services/        # Anomaly logic
│   └── database.py      # MongoDB connection
│
├── frontend/
│   ├── index.html       # Dashboard
│   ├── logs.html        # Log Explorer
│   ├── css/             # Styles
│   └── js/              # Logic & Charts
│
└── README.md


## 🔌 API Endpoints

The system follows a RESTful architecture for log ingestion and data retrieval.

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Log Ingestion** | `POST` | `/api/logs` | Insert a single structured JSON log |
| **Log Ingestion** | `POST` | `/api/logs/batch` | Bulk insert multiple logs for high-throughput |
| **Log Retrieval** | `GET` | `/api/logs` | Fetch logs with support for level, service, and date filters |
| **Analytics** | `GET` | `/api/dashboard/summary` | Retrieve aggregated metrics for the dashboard |
| **Anomalies** | `GET` | `/api/anomalies` | Fetch results from the anomaly detection engine |
| **Utilities** | `POST` | `/api/seed` | Trigger the generator to insert synthetic sample logs |



### 🛠️ Tech Stack
Frontend: HTML5, CSS3, JavaScript, Chart.js

Backend: FastAPI (Python 3.x), Pydantic

Database: MongoDB (Motor driver for async support)

### 🏁 Final Outcome
This project delivers a Real-time Log Monitoring and Anomaly Detection System. Instead of manually scanning text logs, users can instantly filter logs, visualize system behavior, and identify error spikes before they impact users.