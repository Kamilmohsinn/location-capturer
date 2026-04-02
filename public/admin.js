const formEl = document.getElementById("adminForm");
const keyEl = document.getElementById("adminKey");
const statusEl = document.getElementById("status");
const rowsEl = document.getElementById("rows");

const API_BASE_URL = window.API_BASE_URL || "";

function setStatus(message) {
  statusEl.textContent = message;
}

function renderRows(locations) {
  rowsEl.innerHTML = "";

  locations.forEach((location) => {
    const tr = document.createElement("tr");

    const values = [
      location.latitude,
      location.longitude,
      location.accuracy ?? "-",
      new Date(location.timestamp).toLocaleString(),
      new Date(location.receivedAt).toLocaleString()
    ];

    values.forEach((value) => {
      const td = document.createElement("td");
      td.textContent = String(value);
      tr.appendChild(td);
    });

    rowsEl.appendChild(tr);
  });
}

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("Loading locations...");

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/locations`, {
      headers: {
        "X-Admin-Key": keyEl.value.trim()
      }
    });

    if (!response.ok) {
      throw new Error("Invalid admin key or server error");
    }

    const data = await response.json();
    renderRows(data.locations || []);
    setStatus(`Loaded ${data.total || 0} locations.`);
  } catch (error) {
    rowsEl.innerHTML = "";
    setStatus(error.message);
  }
});
