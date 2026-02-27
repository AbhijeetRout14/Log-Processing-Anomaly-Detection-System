// js/logs.js
// Real backend-connected Log Viewer

const API_URL = "http://127.0.0.1:8000/api";

let allLogs = [];
let anomalies = [];
let paused = false;

// ---------------------------------------------
// INIT
// ---------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  await fetchLogs();
  await fetchAnomalies();
  renderLogTable();
  renderAnomalyTable();
  renderLogFeed();
  renderSeverityCounts();
  updatePauseButton();

  // poll for new logs every 3 seconds unless paused
  setInterval(async () => {
    if (!paused) {
      await fetchLogs();
      renderLogTable();
      renderLogFeed();
    }
  }, 3000);
});

// ---------------------------------------------
// FETCH LOGS
// ---------------------------------------------
async function fetchLogs() {
  try {
    const data = await logsAPI.getLogs();
    allLogs = data.logs || [];
  } catch (err) {
    console.error("Error fetching logs:", err);
  }
}

// ---------------------------------------------
// FETCH ANOMALIES
// ---------------------------------------------
async function fetchAnomalies() {
  try {
    const data = await anomalyAPI.getHistory();
    anomalies = data.anomalies || [];
  } catch (err) {
    console.error("Error fetching anomalies:", err);
  }
}

// ---------------------------------------------
// RENDER LOG TABLE
// ---------------------------------------------
function renderLogTable() {
  const tbody = document.getElementById("log-table-body");
  if (!tbody) return;

  tbody.innerHTML = allLogs.map((log, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${new Date(log.timestamp).toLocaleTimeString()}</td>
      <td>${log.level}</td>
      <td>${log.service_name}</td>
      <td>${log.message}</td>
    </tr>
  `).join("");
}

// ---------------------------------------------
// RENDER ANOMALY TABLE
// ---------------------------------------------
function renderAnomalyTable() {
  const tbody = document.getElementById("anomaly-table-body");
  if (!tbody) return;

  tbody.innerHTML = anomalies.map(a => `
    <tr>
      <td>${a.id}</td>
      <td>${a.type || a.status || ''}</td>
      <td>${a.severity || ''}</td>
      <td>${a.error_count || a.error_count_last_5_min || ''}</td>
    </tr>
  `).join("");
}

// ---------------------------------------------
// RESOLVE ANOMALY
// ---------------------------------------------
async function resolveAnomaly(id) {
  try {
    const url = `${API_URL}/anomalies/${id}`;
    await fetch(url, { method: "DELETE" });
    await fetchAnomalies();
    renderAnomalyTable();
    renderSeverityCounts();
  } catch (err) {
    console.error("Resolve failed:", err);
  }
}

// ---------------------------------------------
// ANOMALY FILTERING & STATS
// ---------------------------------------------
function filterAnomalies() {
  const search = document.getElementById("anomaly-search")?.value.toLowerCase() || "";
  const sev = document.getElementById("anomaly-sev-filter")?.value;

  const filtered = anomalies.filter(a => {
    if (sev && a.severity !== sev) return false;
    if (search && !(
      (a.type && a.type.toLowerCase().includes(search)) ||
      (a.status && a.status.toLowerCase().includes(search))
    )) return false;
    return true;
  });

  const tbody = document.getElementById("anomaly-table-body");
  if (!tbody) return;

  tbody.innerHTML = filtered.map(a => `
    <tr>
      <td>${a.id}</td>
      <td>${a.type || a.status || ''}</td>
      <td>${a.severity || ''}</td>
      <td>${a.error_count || a.error_count_last_5_min || ''}</td>
      <td><button class="btn btn-ghost" onclick="resolveAnomaly('${a.id}')">✔️</button></td>
    </tr>
  `).join("");
}

function renderSeverityCounts() {
  const counts = {critical:0, high:0, medium:0, low:0};
  anomalies.forEach(a => {
    if (a.severity && counts[a.severity] !== undefined) counts[a.severity]++;
  });
  document.getElementById('sev-critical').textContent = counts.critical;
  document.getElementById('sev-high').textContent = counts.high;
  document.getElementById('sev-medium').textContent = counts.medium;
  document.getElementById('sev-low').textContent = counts.low;
}


// ---------------------------------------------
// FILE UPLOAD
// ---------------------------------------------
async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const url = `${API_URL}/logs/upload`;
    await fetch(url, {
      method: "POST",
      body: formData
    });

    await fetchLogs();
    renderLogTable();
    alert("Upload successful");
  } catch (err) {
    console.error("Upload failed:", err);
  }
}

window.resolveAnomaly = resolveAnomaly;
window.uploadFile = uploadFile;
window.filterLogs = filterLogs;
window.togglePause = togglePause;
window.clearLogs = clearLogs;
window.filterAnomalies = filterAnomalies;
window.renderSeverityCounts = renderSeverityCounts;

// simple scan stub for anomalies button
async function runAnomalyScan() {
  try {
    await fetchAnomalies();
    renderAnomalyTable();
    renderSeverityCounts();
    alert(`Scan complete: ${anomalies.length} anomalies found`);
  } catch (e) {
    console.error('Scan failed', e);
  }
}
window.runAnomalyScan = runAnomalyScan;
