document.addEventListener("DOMContentLoaded", async () => {
    await loadDashboard();
});

async function loadDashboard() {
    try {
        const stats = await fetchStats();
        const anomaly = await fetchAnomalies();

        // ===== KPI VALUES =====
        document.getElementById("totalLogs").innerText = stats.total_logs;

        // Calculate error rate
        const errorRate = (
            (stats.error_logs / stats.total_logs) * 100
        ).toFixed(2);

        document.getElementById("errorRate").innerText = errorRate + "%";

        document.getElementById("topServices").innerText =
            stats.top_service || "N/A";

        document.getElementById("anomalyCount").innerText =
            anomaly.status;

        // ===== UPDATE SYSTEM STATUS BADGE =====
        const systemStatus = document.getElementById("systemStatus");

        if (anomaly.status === "ANOMALY DETECTED") {
            systemStatus.innerText = "● Anomaly Detected";
            systemStatus.style.color = "red";
        } else {
            systemStatus.innerText = "● System Normal";
            systemStatus.style.color = "green";
        }

        // ===== CHARTS =====
        renderLogTrendChart(stats);
        renderErrorsByServiceChart();

    } catch (error) {
        console.error("Dashboard load error:", error);
    }
}


// ================= LOG TREND CHART =================
function renderLogTrendChart(stats) {
    const ctx = document.getElementById("logsTrendChart").getContext("2d");

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["INFO", "WARNING", "ERROR"],
            datasets: [{
                label: "Log Distribution",
                data: [
                    stats.info_logs,
                    stats.warning_logs,
                    stats.error_logs
                ]
            }]
        }
    });
}


// ================= ERRORS BY SERVICE CHART =================
async function renderErrorsByServiceChart() {
    const logs = await fetchLogs(500);

    const errorCounts = {};

    logs.forEach(log => {
        if (log.level === "ERROR") {
            errorCounts[log.service_name] =
                (errorCounts[log.service_name] || 0) + 1;
        }
    });

    const ctx = document.getElementById("errorsByServiceChart").getContext("2d");

    new Chart(ctx, {
        type: "pie",
        data: {
            labels: Object.keys(errorCounts),
            datasets: [{
                data: Object.values(errorCounts)
            }]
        }
    });
}


// ================= BUTTONS =================
document.getElementById("detectBtn").addEventListener("click", async () => {
    const anomaly = await fetchAnomalies();
    alert("Anomaly Status: " + anomaly.status);
});

document.getElementById("seedBtn").addEventListener("click", () => {
    alert("Use backend seed script to generate logs.");
});

// Generate Logs Button
document.getElementById("seedBtn").addEventListener("click", async () => {
    const result = await generateLogs(1000);
    alert(result.message);
    await loadDashboard(); // refresh dashboard
});

// Run Anomaly Detection Button
document.getElementById("detectBtn").addEventListener("click", async () => {
    const anomaly = await fetchAnomalies();
    alert("Anomaly Status: " + anomaly.status);
    await loadDashboard(); // refresh UI
});