// Shared API call functions
const BASE_URL = "http://127.0.0.1:8000/api";

// Fetch dashboard stats
async function fetchStats() {
    const response = await fetch(`${BASE_URL}/stats`);
    return await response.json();
}

// Fetch logs
async function loadLogs(limit = 100) {
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

//api to fetch logs with filters
async function fetchLogsWithFilters(params) {
    const query = new URLSearchParams(params).toString();

    const response = await fetch(`${BASE_URL}/logs/?${query}`);
    return response.json();
}

// Fetch logs (used by dashboard pie chart)
async function fetchLogs(limit = 100) {
    const response = await fetch(
        `${BASE_URL}/logs?page=1&limit=${limit}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch logs");
    }

    const data = await response.json();
    return data.logs;
}