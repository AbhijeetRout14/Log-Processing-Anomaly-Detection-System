document.addEventListener("DOMContentLoaded", async () => {
    await loadDashboard();
    setInterval(loadDashboard, 10000); // refresh every 10 sec
});

let logTrendChartInstance = null;
let errorServiceChartInstance = null;


//
// ================= LOAD DASHBOARD =================
//
async function loadDashboard() {
    try {
        showLoadingState();

        const summary = await fetchDashboardSummary();
        const anomalyHistory = await fetchAnomalyHistory(10);

        // ===== KPI VALUES =====
        document.getElementById("totalLogs").innerText =
            summary.total_logs || 0;

        document.getElementById("errorRate").innerText =
            (summary.error_rate || 0) + "%";

        document.getElementById("topServices").innerText =
            summary.top_service || "N/A";

        document.getElementById("anomalyCount").innerText =
            summary.anomaly_count || 0;

        // ===== STATUS BADGE =====
        const systemStatus = document.getElementById("systemStatus");

        if (summary.anomaly_count > 0) {
            systemStatus.innerText = "● Anomaly Detected";
            systemStatus.style.color = "red";
        } else {
            systemStatus.innerText = "● System Normal";
            systemStatus.style.color = "green";
        }

        // ===== CHARTS =====
        renderLogTrendChart(summary);
        await renderErrorsByServiceChart();

        // ===== ANOMALY TABLE =====
        renderAnomalyTable(anomalyHistory);

    } catch (error) {
        console.error("Dashboard load error:", error);
        showError("Failed to load dashboard data");
    }
}

//
// ================= API CALLS =================
//
async function fetchDashboardSummary() {
    const res = await fetch(`${BASE_URL}/dashboard/summary`);
    if (!res.ok) throw new Error("Summary fetch failed");
    return await res.json();
}

async function fetchAnomalyHistory(limit = 10) {
    const res = await fetch(`${BASE_URL}/anomalies/history?limit=${limit}`);
    if (!res.ok) throw new Error("Anomaly history fetch failed");
    return await res.json();
}

async function seedLogs(count = 200) {
    const res = await fetch(`${BASE_URL}/seed?count=${count}`, {
        method: "POST"
    });
    if (!res.ok) throw new Error("Seeding failed");
    return await res.json();
}

async function runDetection() {
    const res = await fetch(`${BASE_URL}/anomalies/detect`, {
        method: "POST"
    });
    if (!res.ok) throw new Error("Detection failed");
    return await res.json();
}

async function fetchLogs(limit = 500) {
    const res = await fetch(`${BASE_URL}/logs?limit=${limit}`);
    if (!res.ok) throw new Error("Logs fetch failed");
    return await res.json();
}

//
// ================= LOG TREND CHART =================
//
async function renderLogTrendChart() {

    const volumeRes = await fetch(`${BASE_URL}/dashboard/log-volume`);
    const anomalyRes = await fetch(`${BASE_URL}/anomalies/history?limit=20`);

    const volume = await volumeRes.json();
    const anomalies = await anomalyRes.json();

    const anomalyTimes = anomalies.map(a =>
        new Date(a.detected_at).toISOString().slice(0, 16)
    );

    const labels = volume.map(item => item.time);
    const values = volume.map(item => item.count);

    const backgroundColors = labels.map(label =>
        anomalyTimes.includes(label)
            ? "red"
            : "rgba(54, 162, 235, 0.6)"
    );

    const ctx = document.getElementById("logsTrendChart").getContext("2d");

    if (logTrendChartInstance) {
        logTrendChartInstance.destroy();
    }

    logTrendChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Log Volume",
                data: values,
                backgroundColor: backgroundColors
            }]
        }
    });
}

//
// ================= ERRORS BY SERVICE PIE =================
//
async function renderErrorsByServiceChart() {

    const res = await fetch(`${BASE_URL}/dashboard/errors-by-service`);
    if (!res.ok) throw new Error("Failed to fetch error distribution");

    const data = await res.json();

    const labels = data.map(item => item.service);
    const values = data.map(item => item.count);

    const ctx = document
        .getElementById("errorsByServiceChart")
        .getContext("2d");

    if (errorServiceChartInstance) {
        errorServiceChartInstance.destroy();
    }

    errorServiceChartInstance = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: values
            }]
        }
    });
}
//
// ================= ANOMALY TABLE =================
//
function renderAnomalyTable(history) {
    const tableBody = document.getElementById("anomalyHistoryTable");
    tableBody.innerHTML = "";

    if (!history || history.length === 0) {
        tableBody.innerHTML =
            `<tr><td colspan="4">No anomalies detected</td></tr>`;
        return;
    }

    history.forEach(item => {
        let severityClass = "severity-low";
        if (item.severity === "HIGH") severityClass = "severity-high";
        if (item.severity === "MEDIUM") severityClass = "severity-medium";

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

//
// ================= BUTTON HANDLERS =================
//
document.getElementById("seedBtn").addEventListener("click", async () => {
    try {
        setButtonLoading("seedBtn", true);
        await seedLogs(200);
        await loadDashboard();
    } catch (e) {
        showError(e.message);
    } finally {
        setButtonLoading("seedBtn", false);
    }
});

document.getElementById("detectBtn").addEventListener("click", async () => {
    try {
        setButtonLoading("detectBtn", true);
        await runDetection();
        await loadDashboard();
    } catch (e) {
        showError(e.message);
    } finally {
        setButtonLoading("detectBtn", false);
    }
});

//
// ================= HELPERS =================
//
function showLoadingState() {
    document.getElementById("totalLogs").innerText = "...";
}

function setButtonLoading(id, state) {
    const btn = document.getElementById(id);
    if (!btn) return;

    btn.disabled = state;

    if (!btn.dataset.original) {
        btn.dataset.original = btn.innerText;
    }

    btn.innerText = state ? "Processing..." : btn.dataset.original;
}

function showError(message) {
    console.error(message);
    alert(message);
}