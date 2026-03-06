const API_BASE_URL = "https://log-processing-anomaly-detection-system.onrender.com/api";

let currentPage = 1;
const limit = 10;
let totalPages = 1;

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
        if (currentPage < totalPages) {
            currentPage++;
            loadLogs();
        }
    });
});

async function loadLogs() {
    const logsTableBody = document.getElementById("logsTableBody");

    logsTableBody.innerHTML =
        `<tr><td colspan="5">Loading...</td></tr>`;

    try {
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

        const url = `${API_BASE_URL}?${params.toString()}`;
        console.log("Fetching:", url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        renderLogs(data.logs || []);
        updatePagination(data.total || 0);

    } catch (error) {
        console.error("Error fetching logs:", error);
        logsTableBody.innerHTML =
            `<tr><td colspan="5">Error loading logs</td></tr>`;
    }
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
            <td>${log.service_name || log.service || "-"}</td>
            <td>${log.message}</td>
            <td>${log.response_time ?? "-"}</td>
        `;

        logsTableBody.appendChild(row);
    });
}

function updatePagination(totalLogs) {
    totalPages = Math.ceil(totalLogs / limit) || 1;

    // Prevent overflow page number
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    document.getElementById("pageInfo").innerText =
        `Page ${currentPage} of ${totalPages}`;

    document.getElementById("prevPageBtn").disabled =
        currentPage <= 1;

    document.getElementById("nextPageBtn").disabled =
        currentPage >= totalPages;
}