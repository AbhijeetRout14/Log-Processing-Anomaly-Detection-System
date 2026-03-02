// Shared API call functions
const BASE_URL = "http://127.0.0.1:8000/api";

// Fetch dashboard stats
async function fetchStats() {
    const response = await fetch(`${BASE_URL}/stats`);
    return await response.json();
}

// Fetch logs
async function fetchLogs(limit = 100) {
    const response = await fetch(`${BASE_URL}/logs/?limit=${limit}`);
    return await response.json();
}

// Fetch anomalies
async function fetchAnomalies() {
    const response = await fetch(`${BASE_URL}/anomalies`);
    return await response.json();
}

//generate logs
async function generateLogs(count = 100) {
    const response = await fetch(`${BASE_URL}/admin/seed?count=${count}`, {
        method: "POST"
    });
    return await response.json();
}

//fetch anomaly history
async function fetchAnomalyHistory(limit = 10) {
    const response = await fetch(`${BASE_URL}/anomalies/history?limit=${limit}`);
    return await response.json();
}

async function fetchDashboardSummary() {
    const res = await fetch(`${BASE_URL}/dashboard/summary`);
    if (!res.ok) throw new Error("Failed to fetch dashboard summary");
    return await res.json();
}

async function seedLogs(count = 200) {
    const res = await fetch(`${BASE_URL}/seed?count=${count}`, {
        method: "POST"
    });
    if (!res.ok) throw new Error("Failed to seed logs");
    return await res.json();
}

async function runDetection() {
    const res = await fetch(`${BASE_URL}/anomalies/detect`, {
        method: "POST"
    });
    if (!res.ok) throw new Error("Detection failed");
    return await res.json();
}

async function fetchAnomalyHistory(limit = 20) {
    const res = await fetch(`${BASE_URL}/anomalies/history?limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch anomaly history");
    return await res.json();
}