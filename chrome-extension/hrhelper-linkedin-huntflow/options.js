async function loadOptions() {
  const { baseUrl, apiToken } = await chrome.storage.sync.get({
    baseUrl: "http://localhost:8000",
    apiToken: "",
  });
  document.getElementById("baseUrl").value = baseUrl;
  document.getElementById("apiToken").value = apiToken;
}

async function saveOptions() {
  const baseUrl = (document.getElementById("baseUrl").value || "")
    .trim()
    .replace(/\/+$/, "");
  const apiToken = (document.getElementById("apiToken").value || "").trim();
  const status = document.getElementById("status");

  if (!baseUrl) {
    status.textContent = "Укажите base URL.";
    status.className = "hint err";
    return;
  }

  if (!apiToken) {
    status.textContent = "Укажите API Token.";
    status.className = "hint err";
    return;
  }

  await chrome.storage.sync.set({ baseUrl, apiToken });
  status.textContent = "Сохранено.";
  status.className = "hint ok";
  setTimeout(() => (status.textContent = ""), 1500);
}

document.getElementById("save").addEventListener("click", saveOptions);
loadOptions();