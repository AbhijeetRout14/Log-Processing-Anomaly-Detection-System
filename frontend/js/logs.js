const API_BASE_URL = "http://127.0.0.1:8000/api/logs";

let currentPage = 1;
const limit = 10;

document.addEventListener("DOMContentLoaded", () => {
    loadLogs();

    document.getElementById("applyFiltersBtn").addEventListener("click", () => {
        currentPage = 1;
        loadLogs();
    });

    document.getElementById("prevPageBtn").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            loadLogs();
        }
    });

    document.getElementById("nextPageBtn").addEventListener("click", () => {
        currentPage++;
        loadLogs();
    });
});

async function loadLogs() {
    const logsTableBody = document.getElementById("logsTableBody");

    logsTableBody.innerHTML =
        `<tr><td colspan="5">Loading...</td></tr>`;

    const params = new URLSearchParams();

    const level = document.getElementById("levelFilter").value;
    const service = document.getElementById("serviceFilter").value.trim();
    const start = document.getElementById("startDate").value;
    const end = document.getElementById("endDate").value;

    if (level) params.append("level", level);
    if (service) params.append("service", service);
    if (start) params.append("start_date", new Date(start).toISOString());
    if (end) params.append("end_date", new Date(end).toISOString());

    params.append("page", currentPage);
    params.append("limit", limit);

    const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
    const data = await response.json();

    renderLogs(data.logs);
    updatePagination(data.total);
}

function renderLogs(logs) {
    const logsTableBody = document.getElementById("logsTableBody");
    logsTableBody.innerHTML = "";

    if (!logs || logs.length === 0) {
        logsTableBody.innerHTML =
            `<tr><td colspan="5">No logs found</td></tr>`;
        return;
    }

    logs.forEach(log => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${new Date(log.timestamp).toLocaleString()}</td>
            <td>${log.level}</td>
            <td>${log.service}</td>
            <td>${log.message}</td>
            <td>${log.response_time ?? "-"}</td>
        `;

        logsTableBody.appendChild(row);
    });
}

function updatePagination(totalLogs) {
    const totalPages = Math.ceil(totalLogs / limit) || 1;

    document.getElementById("pageInfo").innerText =
        `Page ${currentPage} of ${totalPages}`;

    document.getElementById("prevPageBtn").disabled =
        currentPage <= 1;

    document.getElementById("nextPageBtn").disabled =
        currentPage >= totalPages;
}