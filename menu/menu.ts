const api = window.browser || window.chrome; // safety

const toggleBtn = document.getElementById("toggle");

const updateButton = function(isRunning) {
  if (isRunning) {
    toggleBtn.textContent = "Stop";
    toggleBtn.classList.add("running");
  } else {
    toggleBtn.textContent = "Start";
    toggleBtn.classList.remove("running");
  }
}

// Load initial state
api.runtime.sendMessage({ action: "getState" }, res => {
  if (api.runtime.lastError) {
    console.error("getState error:", api.runtime.lastError);
    toggleBtn.textContent = "Start";
    return;
  }
  updateButton(res && res.running);
});

// Handle click
toggleBtn.addEventListener("click", () => {
  api.runtime.sendMessage({ action: "toggle" }, res => {
    if (api.runtime.lastError) {
      console.error("toggle error:", api.runtime.lastError);
      return;
    }
    updateButton(res && res.running);
  });
});

