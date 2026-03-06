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

    // auto refresh logs
    setInterval(loadLogs, 5000);
});

async function loadLogs() {

    const logsTableBody = document.getElementById("logsTableBody");

    logsTableBody.innerHTML =
        `<tr>
            <td colspan="5" class="text-center text-gray-400 py-4">
                Loading logs...
            </td>
        </tr>`;

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

        const url = `${API_BASE_URL}/logs?${params.toString()}`;

        console.log("Fetching:", url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        const logs = data.logs || data || [];
        const total = data.total || logs.length;

        renderLogs(logs);
        updatePagination(total);

    } catch (error) {

        console.error("Error fetching logs:", error);

        logsTableBody.innerHTML =
            `<tr>
                <td colspan="5" class="text-center text-red-400 py-4">
                    Failed to load logs
                </td>
            </tr>`;
    }
}

function renderLogs(logs) {

    const logsTableBody = document.getElementById("logsTableBody");
    logsTableBody.innerHTML = "";

    if (!logs || logs.length === 0) {

        logsTableBody.innerHTML =
            `<tr>
                <td colspan="5" class="text-center text-gray-400 py-4">
                    No logs found
                </td>
            </tr>`;

        return;
    }

    logs.forEach(log => {

        const row = document.createElement("tr");

        row.classList.add("border-b", "border-slate-700", "hover:bg-slate-700");

        const levelColor = getLevelColor(log.level);

        row.innerHTML = `
            <td class="py-2">${new Date(log.timestamp).toLocaleString()}</td>

            <td class="py-2">
                <span class="px-2 py-1 rounded text-xs font-semibold ${levelColor}">
                    ${log.level}
                </span>
            </td>

            <td class="py-2">${log.service_name || log.service || "-"}</td>

            <td class="py-2">${log.message}</td>

            <td class="py-2">${log.response_time ?? "-"}</td>
        `;

        logsTableBody.appendChild(row);

    });
}

function getLevelColor(level) {

    switch (level) {

        case "ERROR":
            return "bg-red-500 text-white";

        case "WARN":
            return "bg-yellow-500 text-black";

        case "CRITICAL":
            return "bg-purple-600 text-white";

        case "INFO":
            return "bg-blue-500 text-white";

        default:
            return "bg-gray-500 text-white";
    }
}

function updatePagination(totalLogs) {

    totalPages = Math.ceil(totalLogs / limit) || 1;

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