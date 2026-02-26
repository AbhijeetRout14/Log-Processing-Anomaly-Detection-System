document.addEventListener("DOMContentLoaded", async () => {
    await loadDashboard();
    setInterval(loadDashboard, 5000); // auto refresh every 5 sec
});

let logTrendChartInstance = null;
let errorServiceChartInstance = null;

async function loadDashboard() {
    try {
        const stats = await fetchStats();
        const anomaly = await fetchAnomalies();

        // ===== KPI VALUES =====
        document.getElementById("totalLogs").innerText = stats.total_logs;

        const errorRate = stats.total_logs > 0
            ? ((stats.error_logs / stats.total_logs) * 100).toFixed(2)
            : 0;

        document.getElementById("errorRate").innerText = errorRate + "%";
        document.getElementById("topServices").innerText =
            stats.top_service || "N/A";

        document.getElementById("anomalyCount").innerText =
            anomaly.status;

        // ===== SYSTEM STATUS BADGE =====
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
        await renderErrorsByServiceChart();

        // ===== ANOMALY HISTORY =====
        await loadAnomalyHistory();

    } catch (error) {
        console.error("Dashboard load error:", error);
    }
}

//
// ================= LOG TREND CHART =================
//
function renderLogTrendChart(stats) {
    const ctx = document.getElementById("logsTrendChart").getContext("2d");

    if (logTrendChartInstance) {
        logTrendChartInstance.destroy();
    }

    logTrendChartInstance = new Chart(ctx, {
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

//
// ================= ERRORS BY SERVICE CHART =================
//
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

    if (errorServiceChartInstance) {
        errorServiceChartInstance.destroy();
    }

    errorServiceChartInstance = new Chart(ctx, {
        type: "pie",
        data: {
            labels: Object.keys(errorCounts),
            datasets: [{
                data: Object.values(errorCounts)
            }]
        }
    });
}

//
// ================= BUTTONS =================
//
document.getElementById("seedBtn").addEventListener("click", async () => {
    const result = await generateLogs(1000);
    alert(result.message);
    await loadDashboard();
});

document.getElementById("detectBtn").addEventListener("click", async () => {
    const anomaly = await fetchAnomalies();
    alert("Anomaly Status: " + anomaly.status);
    await loadDashboard();
});

//
// ================= ANOMALY HISTORY =================
//
async function loadAnomalyHistory() {
    const history = await fetchAnomalyHistory(10);

    const tableBody = document.getElementById("anomalyHistoryTable");
    tableBody.innerHTML = "";

    if (!history || history.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4">No anomalies detected</td>
            </tr>
        `;
        return;
    }

    history.forEach(item => {
        let severityClass = "severity-low";
        if (item.severity === "HIGH") {
            severityClass = "severity-high";
        } else if (item.severity === "MEDIUM") {
            severityClass = "severity-medium";
        }

        const row = `
        <tr>
            <td>${item.type}</td>
            <td>${item.error_count}</td>
            <td>
                <span class="severity-badge ${severityClass}">
                    ${item.severity}
                </span>
            </td>
            <td>${new Date(item.detected_at).toLocaleString()}</td>
        </tr>
        `;

        tableBody.innerHTML += row;
    });
}