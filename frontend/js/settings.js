// js/settings.js

document.addEventListener("DOMContentLoaded", async () => {
  await loadSettings();
});

// ─────────────────────────────────────────────
// LOAD SETTINGS
// ─────────────────────────────────────────────
async function loadSettings() {
  try {
    const data = await apiFetch("/settings");

    document.getElementById("sensitivity").value = data.sensitivity;
    document.getElementById("confidence").value = data.confidence;
    document.getElementById("scan-interval").value = data.interval;
  } catch (err) {
    console.error("Failed to load settings:", err);
  }
}

// ─────────────────────────────────────────────
// SAVE SETTINGS
// ─────────────────────────────────────────────
async function saveDetection() {
  const sensitivity = document.getElementById("sensitivity").value;
  const confidence  = document.getElementById("confidence").value;
  const interval    = document.getElementById("scan-interval").value;

  try {
    await apiFetch("/settings", {
      method: "PUT",
      body: JSON.stringify({
        sensitivity,
        confidence,
        interval
      })
    });

    alert("Settings saved successfully");
  } catch (err) {
    console.error("Save failed:", err);
  }
}