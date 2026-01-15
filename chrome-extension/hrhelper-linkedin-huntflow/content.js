const DEFAULTS = {
  baseUrl: "http://localhost:8000",
};

const MAX_WIDGETS = 2;

const STATE = {
  lastProfileUrl: null,
  buttons: new Map(),
  current: {
    mode: "idle",
    appUrl: null,
    text: "Huntflow",
    title: "",
    color: "#0a66c2",
    disabled: false,
    show: false,
    inputValue: "",
  },
  busy: false,
  suppressObserver: false,
  scheduled: false,
  lastScanAt: 0,
  apiCallsThisProfile: 0,
  statusFetchedFor: null,
  statusInFlight: null,
};

function normalizeLinkedInProfileUrl(url) {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith("linkedin.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("in");
    if (idx === -1 || !parts[idx + 1]) return null;
    return `https://www.linkedin.com/in/${parts[idx + 1]}/`;
  } catch {
    return null;
  }
}

async function getConfig() {
  const cfg = await chrome.storage.sync.get(DEFAULTS);
  return { baseUrl: (cfg.baseUrl || DEFAULTS.baseUrl).replace(/\/+$/, "") };
}

function findAllMoreButtons() {
  const ariaNeedles = ["more", "more actions", "ещё", "еще", "дополнительно", "другие действия"];
  const textNeedles = ["more", "ещё", "еще", "дополнительно"];

  const buttons = Array.from(document.querySelectorAll("button[aria-label], [role='button'][aria-label]"));
  const res = [];
  for (const el of buttons) {
    const aria = (el.getAttribute?.("aria-label") || "").trim().toLowerCase();
    const txt = (el.textContent || "").trim().toLowerCase();
    if ((aria && ariaNeedles.some((n) => aria.includes(n))) || (txt && textNeedles.includes(txt))) {
      res.push(el);
    }
  }
  return Array.from(new Set(res));
}

function looksLikeProfileActionArea(moreBtn) {
  const inTop =
    !!moreBtn.closest('[data-view-name="profile-top-card"]') ||
    !!moreBtn.closest(".pv-top-card") ||
    !!moreBtn.closest(".pv-top-card-v2-ctas") ||
    !!moreBtn.closest(".pv-top-card__actions");

  const inSticky = !!moreBtn.closest(".scaffold-layout__sticky");

  if (inTop || inSticky) return true;

  const root = moreBtn.closest("header") || moreBtn.closest("section");
  if (!root) return false;

  const needles = ["connect", "message", "follow", "connecter", "mensaje", "соедин", "сообщ", "подпис", "inmail"];
  const nearby = Array.from(root.querySelectorAll("button[aria-label]")).slice(0, 40);
  for (const b of nearby) {
    const aria = (b.getAttribute("aria-label") || "").toLowerCase();
    if (needles.some((n) => aria.includes(n))) return true;
  }

  return false;
}

function findActionContainer() {
  const candidates = [
    document.querySelector(".pv-top-card-v2-ctas"),
    document.querySelector(".pv-top-card__actions"),
    document.querySelector('[data-view-name="profile-top-card"]'),
    document.querySelector("main"),
  ].filter(Boolean);

  for (const el of candidates) {
    const btnBar =
      el.querySelector('div[role="group"]') ||
      el.querySelector(".artdeco-button__text")?.closest("div") ||
      el;
    if (btnBar) return btnBar;
  }
  return null;
}

function createWidget(moreBtn, container) {
  const wrapper = document.createElement("span");
  wrapper.dataset.hrhelperHuntflow = "1";
  wrapper.style.cssText = "margin-left:8px; display:inline-flex; align-items:center; gap:6px;";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "hrhelper-action-btn";
  btn.style.cssText = [
    "padding: 8px 12px",
    "border-radius: 999px",
    "border: 1px solid rgba(0,0,0,.15)",
    "color: #fff",
    "font-weight: 600",
    "cursor: pointer",
    "line-height: 1",
  ].join(";");
  btn.addEventListener("click", onButtonClick);
  wrapper.appendChild(btn);

  const inputGroup = document.createElement("div");
  inputGroup.className = "hrhelper-input-group";
  inputGroup.style.cssText = "display:none;";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Ссылка на кандидата в Huntflow";
  input.className = "hrhelper-input";
  input.style.cssText = [
    "width: 260px",
    "max-width: 35vw",
    "padding: 6px 10px",
    "border-radius: 8px",
    "border: 1px solid rgba(0,0,0,.2)",
    "font-size: 12px",
  ].join(";");
  input.addEventListener("input", (e) => {
    STATE.current.inputValue = e.target.value;
    for (const other of document.querySelectorAll(".hrhelper-input")) {
      if (other !== input) other.value = STATE.current.inputValue;
    }
  });

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.textContent = "Сохранить";
  saveBtn.className = "hrhelper-save-btn";
  saveBtn.style.cssText = [
    "padding: 6px 10px",
    "border-radius: 999px",
    "border: 1px solid rgba(0,0,0,.15)",
    "background: #0a66c2",
    "color: #fff",
    "font-weight: 600",
    "cursor: pointer",
    "line-height: 1",
    "font-size: 12px",
  ].join(";");
  saveBtn.addEventListener("click", onSaveLinkClick);

  inputGroup.appendChild(input);
  inputGroup.appendChild(saveBtn);
  wrapper.appendChild(inputGroup);

  container.insertBefore(wrapper, moreBtn.nextSibling);

  return { wrapper, btn, input, inputGroup, saveBtn };
}

function updateWidget(widgets, force = false) {
  if (!widgets) return;

  const { btn, input, inputGroup, saveBtn } = widgets;
  if (!btn || !input || !saveBtn || !inputGroup) return;

  const stateKey = `${STATE.current.mode}|${STATE.current.appUrl || ""}|${STATE.current.disabled}`;
  if (!force && btn.dataset.lastStateKey === stateKey) return;
  btn.dataset.lastStateKey = stateKey;

  if (STATE.current.mode === "open") {
    btn.style.display = "block";
    inputGroup.style.display = "none";
    btn.textContent = STATE.current.text || "Huntflow";
    btn.title = STATE.current.title || "";
    btn.disabled = !!STATE.current.disabled;
    btn.style.background = STATE.current.color || "#0a66c2";
    btn.style.opacity = btn.disabled ? "0.7" : "1";
  } else {
    btn.style.display = "none";
    inputGroup.style.display = "flex";
    input.value = STATE.current.inputValue || "";
    input.placeholder = STATE.current.title || "Ссылка на кандидата в Huntflow";
    saveBtn.disabled = !!STATE.current.disabled;
    saveBtn.style.opacity = saveBtn.disabled ? "0.6" : "1";
  }
}

function ensureButtons() {
  if (!STATE.current.show) return;

  const now = Date.now();
  if (now - STATE.lastScanAt < 3000) {
    return;
  }
  STATE.lastScanAt = now;

  for (const [moreBtn, widgetsData] of Array.from(STATE.buttons.entries())) {
    if (!moreBtn?.isConnected || !widgetsData?.wrapper?.isConnected) {
      STATE.buttons.delete(moreBtn);
    }
  }

  let moreButtons = findAllMoreButtons().filter(looksLikeProfileActionArea);
  if (!moreButtons.length) return;

  moreButtons = moreButtons
    .map((b) => {
      const inTop =
        !!b.closest('[data-view-name="profile-top-card"]') ||
        !!b.closest(".pv-top-card") ||
        !!b.closest(".pv-top-card__actions") ||
        !!b.closest(".pv-top-card-v2-ctas");
      const inSticky = !!b.closest(".scaffold-layout__sticky");
      const weight = inTop ? 0 : inSticky ? 1 : 2;
      return { b, weight };
    })
    .sort((x, y) => x.weight - y.weight)
    .slice(0, MAX_WIDGETS)
    .map((x) => x.b);

  STATE.suppressObserver = true;
  try {
    for (const moreBtn of moreButtons) {
      if (STATE.buttons.has(moreBtn)) {
        const existing = STATE.buttons.get(moreBtn);
        if (existing?.wrapper?.isConnected) {
          updateWidget(existing, true);
          continue;
        }
        STATE.buttons.delete(moreBtn);
      }

      const container = moreBtn?.parentElement || findActionContainer();
      if (!container) continue;

      const widgets = createWidget(moreBtn, container);
      STATE.buttons.set(moreBtn, widgets);
      updateWidget(widgets, true);
    }
  } finally {
    requestAnimationFrame(() => {
      STATE.suppressObserver = false;
    });
  }
}

function setButtonState({ text, disabled, title, color }) {
  if (text != null) STATE.current.text = text;
  if (title != null) STATE.current.title = title;
  if (color != null) STATE.current.color = color;
  if (disabled != null) STATE.current.disabled = !!disabled;
  applyStateToAllButtons();
}

function applyStateToAllButtons() {
  for (const widgets of STATE.buttons.values()) {
    if (!widgets?.wrapper?.isConnected) continue;
    updateWidget(widgets, true);
  }
}

async function apiFetch(path, init = {}) {
  const method = init.method || "GET";
  const body = init.body ? JSON.parse(init.body) : undefined;

  const result = await new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        type: "HRHELPER_API",
        payload: { path, method, body },
      },
      (response) => resolve(response)
    );
  });

  return {
    ok: !!result?.ok,
    status: result?.status ?? 0,
    json: async () => result?.json,
  };
}

async function checkStatus(linkedinUrl) {
  const qp = new URLSearchParams({ linkedin_url: linkedinUrl });
  const res = await apiFetch(`/api/v1/huntflow/linkedin-applicants/status/?${qp.toString()}`, {
    method: "GET",
  });

  if (res.status === 401 || res.status === 403) {
    return { authRequired: true };
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return { error: data?.message || data?.error || `HTTP ${res.status}` };
  }
  return data;
}

async function setLink(linkedinUrl, targetUrl) {
  const res = await apiFetch(`/api/v1/huntflow/linkedin-applicants/set-link/`, {
    method: "POST",
    body: JSON.stringify({ linkedin_url: linkedinUrl, target_url: targetUrl }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) return { error: data?.message || data?.error || `HTTP ${res.status}` };
  return data;
}

function extractFullName() {
  const h1 = document.querySelector("h1");
  const name = (h1?.textContent || "").trim();
  return name || "";
}

async function refreshButtonForCurrentProfile() {
  const canonical = normalizeLinkedInProfileUrl(location.href);
  if (!canonical) return;

  if (STATE.statusFetchedFor === canonical) {
    applyStateToAllButtons();
    return;
  }

  if (STATE.apiCallsThisProfile >= 1) return;

  if (!STATE.statusInFlight) {
    STATE.apiCallsThisProfile += 1;
    STATE.statusInFlight = checkStatus(canonical).finally(() => {
      STATE.statusInFlight = null;
    });
  }

  const status = await STATE.statusInFlight;
  if (status.authRequired || status.error) {
    STATE.current.show = true;
    STATE.current.mode = "input";
    STATE.current.appUrl = null;
    STATE.current.disabled = true;
    STATE.current.title = status.error || "Нужна авторизация (проверь API Token в настройках расширения)";
    ensureButtons();
    STATE.statusFetchedFor = canonical;
    return;
  }

  STATE.current.show = true;
  if (status.exists && status.app_url) {
    STATE.current.mode = "open";
    STATE.current.appUrl = status.app_url;
    STATE.current.disabled = false;
    setButtonState({ text: "Huntflow", disabled: false, title: "Открыть в Huntflow", color: "#0a66c2" });
  } else {
    STATE.current.mode = "input";
    STATE.current.appUrl = null;
    STATE.current.disabled = false;
    setButtonState({ text: "Huntflow", disabled: false, title: "Укажи ссылку на кандидата", color: "#0a66c2" });
  }
  ensureButtons();

  STATE.statusFetchedFor = canonical;
}

async function onSaveLinkClick() {
  if (STATE.busy) return;
  const canonical = normalizeLinkedInProfileUrl(location.href);
  if (!canonical) return;

  if (STATE.apiCallsThisProfile >= 2) return;

  const target = (STATE.current.inputValue || "").trim();
  if (!target) {
    STATE.current.title = "Вставь ссылку на кандидата";
    applyStateToAllButtons();
    return;
  }

  try {
    STATE.busy = true;
    STATE.apiCallsThisProfile += 1;
    const saved = await setLink(canonical, target);
    if (saved?.error) {
      STATE.current.title = saved.error;
      applyStateToAllButtons();
      return;
    }
    if (saved?.app_url) {
      STATE.current.mode = "open";
      STATE.current.appUrl = saved.app_url;
      STATE.current.title = "Открыть в Huntflow";
      applyStateToAllButtons();
    }
  } finally {
    STATE.busy = false;
  }
}

async function onButtonClick() {
  if (STATE.busy) return;
  const canonical = normalizeLinkedInProfileUrl(location.href);
  if (!canonical) return;

  const mode = STATE.current.mode || "idle";

  if (mode === "open" && STATE.current.appUrl) {
    window.open(STATE.current.appUrl, "_blank", "noopener,noreferrer");
    return;
  }
}

function startObserver() {
  const schedule = () => {
    if (STATE.scheduled) return;
    STATE.scheduled = true;
    requestAnimationFrame(() => {
      STATE.scheduled = false;
      const canonical = normalizeLinkedInProfileUrl(location.href);
      if (!canonical) return;

      const changed = STATE.lastProfileUrl !== canonical;
      if (changed) {
        STATE.apiCallsThisProfile = 0;
        STATE.statusFetchedFor = null;
        STATE.statusInFlight = null;
        STATE.current.mode = "idle";
        STATE.current.appUrl = null;
        STATE.current.show = false;
        STATE.current.inputValue = "";
        STATE.lastProfileUrl = canonical;
        refreshButtonForCurrentProfile();
      } else {
        ensureButtons();
      }
    });
  };

  const obs = new MutationObserver(() => {
    if (STATE.suppressObserver) return;
    schedule();
  });

  if (document.body) {
    obs.observe(document.body, { childList: true, subtree: true });
  } else {
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  const canonical = normalizeLinkedInProfileUrl(location.href);
  if (canonical) {
    STATE.lastProfileUrl = canonical;
    refreshButtonForCurrentProfile();
  }
}

startObserver();
