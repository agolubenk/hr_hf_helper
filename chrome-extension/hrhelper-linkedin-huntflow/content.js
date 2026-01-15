const DEFAULTS = {
  baseUrl: "http://localhost:8000",
};

const MAX_WIDGETS = 2;
const IS_MESSAGING_PAGE = location.href.includes('/messaging/');
const IS_PROFILE_PAGE = location.href.includes('/in/') && !location.href.includes('/search/');

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

function extractThreadIdFromMessageButton() {
  const messageLink = document.querySelector('a[href*="/messaging/thread/"]');
  if (messageLink?.href) {
    const threadMatch = messageLink.href.match(/thread\/([^/?]+)/);
    if (threadMatch) return threadMatch[1];
  }

  const messageBtn = document.querySelector('button[aria-label*="Message"], button[aria-label*="message"]');
  if (messageBtn) {
    const link = messageBtn.querySelector('a[href*="/messaging/"]') || 
                 messageBtn.closest('a[href*="/messaging/"]');
    if (link?.href) {
      const threadMatch = link.href.match(/thread\/([^/?]+)/);
      if (threadMatch) return threadMatch[1];
    }
  }

  return null;
}

async function saveThreadMappingToBackend(threadId, profileUrl) {
  if (!threadId || !profileUrl) return;
  
  try {
    const result = await apiFetch('/api/v1/linkedin/thread-mapping/', {
      method: "POST",
      body: JSON.stringify({ 
        thread_id: threadId, 
        profile_url: profileUrl
      })
    });

    if (result.ok) {
      console.log('[HRHelper] Thread mapping saved:', threadId.substring(0, 10) + '...');
    }
  } catch (e) {
    console.warn('[HRHelper] Failed to save thread mapping:', e);
  }
}

function captureProfileToThreadMapping() {
  if (!IS_PROFILE_PAGE) return;

  const profileUrl = normalizeLinkedInProfileUrl(location.href);
  if (!profileUrl) return;

  const threadId = extractThreadIdFromMessageButton();
  if (threadId) {
    console.log('[HRHelper] Found thread:', threadId.substring(0, 10) + '...', 'for', profileUrl);
    
    try {
      const mapping = JSON.parse(localStorage.getItem('hrhelper_thread_profile_map') || '{}');
      mapping[threadId] = profileUrl;
      localStorage.setItem('hrhelper_thread_profile_map', JSON.stringify(mapping));
    } catch (e) {}

    saveThreadMappingToBackend(threadId, profileUrl);
  }

  let lastThreadId = threadId;
  const trackMessageButtons = () => {
    const newThreadId = extractThreadIdFromMessageButton();
    if (newThreadId && newThreadId !== lastThreadId) {
      lastThreadId = newThreadId;
      console.log('[HRHelper] New thread detected:', newThreadId.substring(0, 10) + '...');
      
      try {
        const mapping = JSON.parse(localStorage.getItem('hrhelper_thread_profile_map') || '{}');
        mapping[newThreadId] = profileUrl;
        localStorage.setItem('hrhelper_thread_profile_map', JSON.stringify(mapping));
      } catch (e) {}
      
      saveThreadMappingToBackend(newThreadId, profileUrl);
    }
  };

  const obs = new MutationObserver(trackMessageButtons);
  obs.observe(document.body, { childList: true, subtree: true });
}

async function getProfileLinkFromMessaging() {
  const profileLinks = Array.from(document.querySelectorAll('a[href*="/in/"]'));
  
  for (const link of profileLinks) {
    if (link.href.includes('/me/') || link.href.includes('/jobs/')) continue;
    const normalized = normalizeLinkedInProfileUrl(link.href);
    if (normalized) {
      console.log('[HRHelper] Profile found in DOM:', normalized);
      return normalized;
    }
  }

  try {
    const currentUrl = location.href;
    const threadMatch = currentUrl.match(/thread\/([^/?]+)/);
    if (threadMatch) {
      const threadId = threadMatch[1];
      
      const mapping = JSON.parse(localStorage.getItem('hrhelper_thread_profile_map') || '{}');
      if (mapping[threadId]) {
        console.log('[HRHelper] Profile from cache:', mapping[threadId]);
        return mapping[threadId];
      }
      
      const result = await apiFetch('/api/v1/linkedin/thread-mapping/?thread_id=' + threadId, { method: "GET" });
      if (result.ok) {
        const data = await result.json().catch(() => null);
        if (data?.profile_url) {
          console.log('[HRHelper] Profile from backend:', data.profile_url);
          return data.profile_url;
        }
      }
      
      console.warn('[HRHelper] Thread not mapped:', threadId);
    }
  } catch (e) {
    console.error('[HRHelper] Error getting profile:', e);
  }

  return null;
}

function findMessagingComposer() {
  // Ищем форму ввода сообщения на странице /messaging/
  const selectors = [
    '.msg-form__contenteditable',
    '.msg-form__composer',
    '[data-view-name="msg-form"]',
    'form.msg-form',
    '.msg-form__msg-content-container',
    '[role="textbox"][contenteditable="true"]'
  ];
  
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) {
      // Ищем родительский контейнер формы
      const form = el.closest('form') || el.closest('.msg-form') || el.closest('[data-view-name="msg-form"]');
      return form || el.parentElement;
    }
  }
  
  return null;
}

function findAllMoreButtons() {
  const ariaNeedles = ["more", "more actions", "ещё", "еще", "дополнительно"];
  const buttons = Array.from(document.querySelectorAll("button[aria-label], [role='button'][aria-label]"));
  const res = [];
  for (const el of buttons) {
    const aria = (el.getAttribute("aria-label") || "").trim().toLowerCase();
    const txt = (el.textContent || "").trim().toLowerCase();
    if ((aria && ariaNeedles.some(n => aria.includes(n))) || ariaNeedles.some(n => txt.includes(n))) {
      res.push(el);
    }
  }
  return Array.from(new Set(res));
}

function looksLikeProfileActionArea(moreBtn) {
  const inTop = !!moreBtn.closest('[data-view-name="profile-top-card"]') ||
                !!moreBtn.closest(".pv-top-card") ||
                !!moreBtn.closest(".pv-top-card-v2-ctas") ||
                !!moreBtn.closest(".pv-top-card__actions");
  const inSticky = !!moreBtn.closest(".scaffold-layout__sticky");
  if (inTop || inSticky) return true;

  const root = moreBtn.closest("header") || moreBtn.closest("section");
  if (!root) return false;

  const needles = ["connect", "message", "follow", "соедин", "сообщ"];
  const nearby = Array.from(root.querySelectorAll("button[aria-label]")).slice(0, 40);
  for (const b of nearby) {
    const aria = (b.getAttribute("aria-label") || "").toLowerCase();
    if (needles.some(n => aria.includes(n))) return true;
  }
  return false;
}

function findActionContainer() {
  const candidates = [
    document.querySelector(".pv-top-card-v2-ctas"),
    document.querySelector(".pv-top-card__actions"),
    document.querySelector('[data-view-name="profile-top-card"]'),
    document.querySelector("main")
  ].filter(Boolean);

  for (const el of candidates) {
    const btnBar = el.querySelector('div[role="group"]') ||
                   el.querySelector(".artdeco-button__text")?.closest("div") || el;
    if (btnBar) return btnBar;
  }
  return null;
}

function createWidget(anchorEl, container, isMessaging = false) {
  const wrapper = document.createElement("div");
  wrapper.dataset.hrhelperHuntflow = "1";
  
  if (isMessaging) {
    // На странице messaging — блок над формой ввода
    wrapper.style.cssText = "padding:12px 16px;border-bottom:1px solid rgba(0,0,0,.08);background:#f3f6f8;display:flex;align-items:center;gap:8px;";
  } else {
    // На странице профиля — inline рядом с кнопкой More
    wrapper.style.cssText = "margin-left:8px;display:inline-flex;align-items:center;gap:6px;";
  }

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "hrhelper-action-btn";
  btn.style.cssText = "padding:8px 12px;border-radius:999px;border:1px solid rgba(0,0,0,.15);color:#fff;font-weight:600;cursor:pointer;line-height:1;";
  btn.addEventListener("click", onButtonClick);
  wrapper.appendChild(btn);

  const inputGroup = document.createElement("div");
  inputGroup.className = "hrhelper-input-group";
  inputGroup.style.cssText = "display:none;align-items:center;gap:8px;flex:1;";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Ссылка на кандидата в Huntflow";
  input.className = "hrhelper-input";
  input.style.cssText = isMessaging 
    ? "flex:1;padding:8px 12px;border-radius:8px;border:1px solid rgba(0,0,0,.2);font-size:13px;"
    : "width:260px;max-width:35vw;padding:6px 10px;border-radius:8px;border:1px solid rgba(0,0,0,.2);font-size:12px;";
  input.addEventListener("input", (e) => {
    STATE.current.inputValue = e.target.value;
    document.querySelectorAll(".hrhelper-input").forEach(other => {
      if (other !== input) other.value = STATE.current.inputValue;
    });
  });

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.textContent = "Сохранить";
  saveBtn.className = "hrhelper-save-btn";
  saveBtn.style.cssText = "padding:8px 16px;border-radius:999px;border:1px solid rgba(0,0,0,.15);background:#0a66c2;color:#fff;font-weight:600;cursor:pointer;line-height:1;font-size:13px;";
  saveBtn.addEventListener("click", onSaveLinkClick);

  inputGroup.appendChild(input);
  inputGroup.appendChild(saveBtn);
  wrapper.appendChild(inputGroup);
  
  if (isMessaging) {
    // Вставляем ПЕРЕД формой ввода
    container.insertBefore(wrapper, container.firstChild);
  } else {
    // Вставляем после кнопки More
    container.insertBefore(wrapper, anchorEl.nextSibling);
  }

  return { wrapper, btn, input, inputGroup, saveBtn };
}

function updateWidget(widgets, force) {
  if (!widgets) return;
  const { btn, input, inputGroup, saveBtn } = widgets;
  if (!btn || !input || !saveBtn || !inputGroup) return;

  const stateKey = STATE.current.mode + '|' + (STATE.current.appUrl || '') + STATE.current.disabled;
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
  if (now - STATE.lastScanAt < 3000) return;
  STATE.lastScanAt = now;

  Array.from(STATE.buttons.entries()).forEach(([anchorEl, widgetsData]) => {
    if (!anchorEl?.isConnected || !widgetsData?.wrapper?.isConnected) {
      STATE.buttons.delete(anchorEl);
    }
  });

  STATE.suppressObserver = true;
  try {
    if (IS_MESSAGING_PAGE) {
      // На странице messaging — вставляем виджет над формой ввода
      const composer = findMessagingComposer();
      if (composer) {
        // Используем composer как anchor (ключ в Map)
        if (STATE.buttons.has(composer)) {
          const existing = STATE.buttons.get(composer);
          if (existing?.wrapper?.isConnected) {
            updateWidget(existing, true);
            return;
          }
          STATE.buttons.delete(composer);
        }

        const widgets = createWidget(null, composer, true);
        STATE.buttons.set(composer, widgets);
        updateWidget(widgets, true);
      }
    } else {
      // На странице профиля — вставляем рядом с кнопками More
      let moreButtons = findAllMoreButtons().filter(looksLikeProfileActionArea);
      if (!moreButtons.length) return;

      moreButtons = moreButtons.map(b => {
        const inTop = !!b.closest('[data-view-name="profile-top-card"]') ||
                      !!b.closest(".pv-top-card") ||
                      !!b.closest(".pv-top-card__actions") ||
                      !!b.closest(".pv-top-card-v2-ctas");
        const inSticky = !!b.closest(".scaffold-layout__sticky");
        return { b, weight: inTop ? 0 : inSticky ? 1 : 2 };
      }).sort((x, y) => x.weight - y.weight).slice(0, MAX_WIDGETS).map(x => x.b);

      moreButtons.forEach(moreBtn => {
        if (STATE.buttons.has(moreBtn)) {
          const existing = STATE.buttons.get(moreBtn);
          if (existing?.wrapper?.isConnected) {
            updateWidget(existing, true);
            return;
          }
          STATE.buttons.delete(moreBtn);
        }

        const container = moreBtn?.parentElement || findActionContainer();
        if (!container) return;

        const widgets = createWidget(moreBtn, container, false);
        STATE.buttons.set(moreBtn, widgets);
        updateWidget(widgets, true);
      });
    }
  } finally {
    requestAnimationFrame(() => {
      STATE.suppressObserver = false;
    });
  }
}

function setButtonState(obj) {
  if (obj.text != null) STATE.current.text = obj.text;
  if (obj.title != null) STATE.current.title = obj.title;
  if (obj.color != null) STATE.current.color = obj.color;
  if (obj.disabled != null) STATE.current.disabled = !!obj.disabled;
  applyStateToAllButtons();
}

function applyStateToAllButtons() {
  STATE.buttons.forEach(widgets => {
    if (!widgets?.wrapper?.isConnected) return;
    updateWidget(widgets, true);
  });
}

async function apiFetch(path, init) {
  init = init || {};
  const method = init.method || "GET";
  const body = init.body ? JSON.parse(init.body) : undefined;

  const result = await new Promise(resolve => {
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
  const res = await apiFetch('/api/v1/huntflow/linkedin-applicants/status/?' + qp.toString(), { method: "GET" });

  if (res.status === 401 || res.status === 403) {
    return { authRequired: true };
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return { error: data?.message || data?.error || 'HTTP ' + res.status };
  }
  return data;
}

async function setLink(linkedinUrl, targetUrl) {
  const res = await apiFetch('/api/v1/huntflow/linkedin-applicants/set-link/', {
    method: "POST",
    body: JSON.stringify({ linkedin_url: linkedinUrl, target_url: targetUrl })
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) return { error: data?.message || data?.error || 'HTTP ' + res.status };
  return data;
}

async function refreshButtonForCurrentProfile() {
  let canonical = normalizeLinkedInProfileUrl(location.href);
  
  if (!canonical && IS_MESSAGING_PAGE) {
    try {
      canonical = await getProfileLinkFromMessaging();
    } catch (e) {
      console.error('[HRHelper] Error getting profile from messaging:', e);
    }
  }

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
  let canonical = normalizeLinkedInProfileUrl(location.href);
  
  if (!canonical && IS_MESSAGING_PAGE) {
    try {
      canonical = await getProfileLinkFromMessaging();
    } catch (e) {
      console.error('[HRHelper] Error getting profile from messaging:', e);
    }
  }

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
  let canonical = normalizeLinkedInProfileUrl(location.href);
  
  if (!canonical && IS_MESSAGING_PAGE) {
    try {
      canonical = await getProfileLinkFromMessaging();
    } catch (e) {
      console.error('[HRHelper] Error getting profile from messaging:', e);
    }
  }

  if (!canonical) return;
  const mode = STATE.current.mode || "idle";
  if (mode === "open" && STATE.current.appUrl) {
    window.open(STATE.current.appUrl, "_blank", "noopener,noreferrer");
  }
}

function startObserver() {
  const schedule = () => {
    if (STATE.scheduled) return;
    STATE.scheduled = true;
    requestAnimationFrame(() => {
      STATE.scheduled = false;
      let canonical = normalizeLinkedInProfileUrl(location.href);
      
      if (!canonical && IS_MESSAGING_PAGE) {
        // На messaging-странице запускаем проверку профиля
        if (!STATE.statusFetchedFor) {
          refreshButtonForCurrentProfile();
        } else {
          ensureButtons();
        }
        return;
      }
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
  } else if (IS_MESSAGING_PAGE) {
    console.log('[HRHelper] Messaging page detected, waiting for profile resolution...');
    // Запускаем проверку профиля через небольшую задержку (чтобы DOM успел загрузиться)
    setTimeout(() => refreshButtonForCurrentProfile(), 1000);
  } else if (IS_PROFILE_PAGE) {
    console.log('[HRHelper] Profile page detected');
  }
}

captureProfileToThreadMapping();
startObserver();
