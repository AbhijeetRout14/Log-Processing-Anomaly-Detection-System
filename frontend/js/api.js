// Shared API call functions

// Production backend URL (Render)
const BASE_URL = "https://log-processing-anomaly-detection-system.onrender.com/api";


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

// Generate logs
async function generateLogs(count = 100) {
    const response = await fetch(`${BASE_URL}/admin/seed?count=${count}`, {
        method: "POST"
    });
    return await response.json();
}

// Fetch anomaly history
async function fetchAnomalyHistory(limit = 20) {
    const res = await fetch(`${BASE_URL}/anomalies/history?limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch anomaly history");
    return await res.json();
}

// Dashboard summary
async function fetchDashboardSummary() {
    const res = await fetch(`${BASE_URL}/dashboard/summary`);
    if (!res.ok) throw new Error("Failed to fetch dashboard summary");
    return await res.json();
}

// Seed logs
async function seedLogs(count = 200) {
    const res = await fetch(`${BASE_URL}/seed?count=${count}`, {
        method: "POST"
    });
    if (!res.ok) throw new Error("Failed to seed logs");
    return await res.json();
}

// Run anomaly detection
async function runDetection() {
    const res = await fetch(`${BASE_URL}/anomalies/detect`, {
        method: "POST"
    });
    if (!res.ok) throw new Error("Detection failed");
    return await res.json();
}