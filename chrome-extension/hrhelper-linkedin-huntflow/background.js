const DEFAULTS = {
  baseUrl: "http://localhost:8000",
  apiToken: "",
};

const CACHE_TTL_MS = 30_000;
const cache = new Map();
const inflight = new Map();

async function getConfig() {
  const cfg = await chrome.storage.sync.get(DEFAULTS);
  return {
    baseUrl: (cfg.baseUrl || DEFAULTS.baseUrl).replace(/\/+$/, ""),
    apiToken: (cfg.apiToken || "").trim(),
  };
}

function cacheKey({ path, method, body }) {
  let bodyKey = "";
  try {
    bodyKey = body ? JSON.stringify(body) : "";
  } catch {
    bodyKey = "";
  }
  return `${method || "GET"} ${path} ${bodyKey}`;
}

async function doRequest({ path, method, body }) {
  const key = cacheKey({ path, method, body });

  if (inflight.has(key)) {
    return await inflight.get(key);
  }

  const isStatus =
    (method || "GET").toUpperCase() === "GET" &&
    String(path || "").includes("/linkedin-applicants/status/");

  if (isStatus) {
    const hit = cache.get(key);
    if (hit && Date.now() - hit.ts < CACHE_TTL_MS) {
      return hit.value;
    }
  }

  const p = (async () => {
    const { baseUrl, apiToken } = await getConfig();
    const url = `${baseUrl}${path}`;

    if (!apiToken) {
      return {
        ok: false,
        status: 0,
        json: { message: "Нет API токена. Укажите его в настройках расширения." },
      };
    }

    const res = await fetch(url, {
      method: method || "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${apiToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await res.json().catch(() => null);
    const value = { ok: res.ok, status: res.status, json };

    if (isStatus && res.ok) {
      cache.set(key, { ts: Date.now(), value });
    }

    return value;
  })();

  inflight.set(key, p);
  try {
    return await p;
  } finally {
    inflight.delete(key);
  }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || msg.type !== "HRHELPER_API") return;

  doRequest(msg.payload)
    .then((result) => sendResponse(result))
    .catch((e) =>
      sendResponse({ ok: false, status: 0, json: { message: String(e) } })
    );

  return true;
});