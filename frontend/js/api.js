// ================= BASE API =================

// Production backend URL
const BASE_URL = "https://log-processing-anomaly-detection-system.onrender.com/api";


// ================= HELPER =================

async function handleResponse(res, errorMessage) {

    if (!res.ok) {
        console.error("API Error:", res.status, res.statusText);
        throw new Error(errorMessage || "API request failed");
    }

    return await res.json();
}


// ================= DASHBOARD =================

// Fetch dashboard stats
async function fetchStats() {
    const res = await fetch(`${BASE_URL}/stats`);
    return handleResponse(res, "Failed to fetch stats");
}


// Dashboard summary
async function fetchDashboardSummary() {
    const res = await fetch(`${BASE_URL}/dashboard/summary`);
    return handleResponse(res, "Failed to fetch dashboard summary");
}


// ================= LOGS =================

// Fetch logs
async function fetchLogs(limit = 100) {
    const res = await fetch(`${BASE_URL}/logs/?limit=${limit}`);
    return handleResponse(res, "Failed to fetch logs");
}


// Generate sample logs
async function generateLogs(count = 100) {
    const res = await fetch(`${BASE_URL}/admin/seed?count=${count}`, {
        method: "POST"
    });

    return handleResponse(res, "Failed to generate logs");
}


// Seed logs
async function seedLogs(count = 200) {
    const res = await fetch(`${BASE_URL}/seed?count=${count}`, {
        method: "POST"
    });

    return handleResponse(res, "Failed to seed logs");
}


// ================= ANOMALIES =================

// Fetch anomalies
async function fetchAnomalies() {
    const res = await fetch(`${BASE_URL}/anomalies`);
    return handleResponse(res, "Failed to fetch anomalies");
}


// Fetch anomaly history
async function fetchAnomalyHistory(limit = 20) {
    const res = await fetch(`${BASE_URL}/anomalies/history?limit=${limit}`);
    return handleResponse(res, "Failed to fetch anomaly history");
}


// Run anomaly detection
async function runDetection() {
    const res = await fetch(`${BASE_URL}/anomalies/detect`, {
        method: "POST"
    });

    return handleResponse(res, "Anomaly detection failed");
}