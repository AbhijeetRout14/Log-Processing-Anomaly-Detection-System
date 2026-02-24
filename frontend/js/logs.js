// Log viewer logic & filters
// ===============================
// CONFIGURATION
// ===============================
const API_BASE_URL = "http://localhost:8000/api/logs";

let currentPage = 1;
const limit = 10;

// ===============================
// DOM ELEMENTS
// ===============================
const logsTableBody = document.getElementById("logsTableBody");
const levelFilter = document.getElementById("levelFilter");
const serviceFilter = document.getElementById("serviceFilter");
const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");
const applyFiltersBtn = document.getElementById("applyFiltersBtn");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageInfo = document.getElementById("pageInfo");

// ===============================
// BUILD QUERY STRING
// ===============================
const buildQueryParams = () => {
    const params = new URLSearchParams();

    if (levelFilter.value) {
        params.append("level", levelFilter.value);
    }

    if (serviceFilter.value.trim()) {
        params.append("service", serviceFilter.value.trim());
    }

    if (startDate.value) {
        params.append("start", startDate.value);
    }

    if (endDate.value) {
        params.append("end", endDate.value);
    }

    params.append("page", currentPage);
    params.append("limit", limit);

    return params.toString();
};

// ===============================
// FETCH LOGS FROM API
// ===============================
const fetchLogs = async () => {
    try {
        logsTableBody.innerHTML = `<tr><td colspan="5">Loading logs...</td></tr>`;

        const query = buildQueryParams();
        const response = await fetch(`${API_BASE_URL}?${query}`);

        if (!response.ok) {
            throw new Error("Failed to fetch logs");
        }

        const data = await response.json();

        renderLogs(data.logs);
        updatePagination(data.total);

    } catch (error) {
        logsTableBody.innerHTML = `
            <tr>
                <td colspan="5">Error loading logs. Please try again.</td>
            </tr>
        `;
        console.error("Error fetching logs:", error);
    }
};

// ===============================
// RENDER LOGS INTO TABLE
// ===============================
const renderLogs = (logs) => {
    if (!logs || logs.length === 0) {
        logsTableBody.innerHTML = `
            <tr>
                <td colspan="5">No logs found.</td>
            </tr>
        `;
        return;
    }

    logsTableBody.innerHTML = "";

    logs.forEach(log => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${formatDate(log.timestamp)}</td>
            <td class="${getLevelClass(log.level)}">${log.level}</td>
            <td>${log.service_name}</td>
            <td>${log.message}</td>
            <td>${log.response_time ?? "-"}</td>
        `;

        logsTableBody.appendChild(row);
    });
};

// ===============================
// FORMAT DATE
// ===============================
const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
};

// ===============================
// LEVEL COLOR CLASS
// ===============================
const getLevelClass = (level) => {
    switch (level) {
        case "INFO":
            return "level-info";
        case "WARN":
            return "level-warn";
        case "ERROR":
            return "level-error";
        case "CRITICAL":
            return "level-critical";
        default:
            return "";
    }
};

// ===============================
// PAGINATION LOGIC
// ===============================
const updatePagination = (totalLogs) => {
    const totalPages = Math.ceil(totalLogs / limit);

    pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;

    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
};

// ===============================
// EVENT LISTENERS
// ===============================

// Apply Filters
applyFiltersBtn.addEventListener("click", () => {
    currentPage = 1;
    fetchLogs();
});

// Previous Page
prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        fetchLogs();
    }
});

// Next Page
nextPageBtn.addEventListener("click", () => {
    currentPage++;
    fetchLogs();
});

// ===============================
// INITIAL LOAD
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    fetchLogs();
});