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