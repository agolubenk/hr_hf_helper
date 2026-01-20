const DEFAULTS = {
  baseUrl: "http://localhost:8000",
};

// Debug mode - установи в false для production
const DEBUG = false;
const log = (...args) => DEBUG && console.log('[HRHelper]', ...args);
const warn = (...args) => DEBUG && console.warn('[HRHelper]', ...args);
const error = (...args) => console.error('[HRHelper]', ...args);

const MAX_WIDGETS = 2;
const IS_MESSAGING_PAGE = location.href.includes('/messaging/');
const IS_PROFILE_PAGE = location.href.includes('/in/') && !location.href.includes('/search/');
const THROTTLE_MS = IS_MESSAGING_PAGE ? 500 : 1500; // Messaging быстрее, профиль медленнее

const STATE = {
  lastProfileUrl: null,
  lastThreadId: null, // Отслеживаем thread ID для messaging страницы
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
    originalAppUrl: null, // Сохраняем оригинальный URL перед редактированием
  },
  busy: false,
  suppressObserver: false,
  scheduled: false,
  lastScanAt: 0,
  apiCallsThisProfile: 0,
  statusFetchedFor: null,
  statusInFlight: null,
  messagingProfileCache: null, // Кэш для профиля на messaging-странице
  statusCache: new Map(), // Кэш статусов профилей (linkedin_url -> {status, timestamp})
  CACHE_TTL: 2 * 60 * 1000, // 2 минуты (уменьшено для более частого обновления статуса)
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
      log(' Thread mapping saved:', threadId.substring(0, 10) + '...');
    }
  } catch (e) {
    warn(' Failed to save thread mapping:', e);
  }
}

function captureProfileToThreadMapping() {
  if (!IS_PROFILE_PAGE) return;

  const profileUrl = normalizeLinkedInProfileUrl(location.href);
  if (!profileUrl) return;

  const threadId = extractThreadIdFromMessageButton();
  if (threadId) {
    log(' Found thread:', threadId.substring(0, 10) + '...', 'for', profileUrl);
    
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
      log(' New thread detected:', newThreadId.substring(0, 10) + '...');
      
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
  // Используем кэш, чтобы не искать профиль повторно
  if (STATE.messagingProfileCache) {
    return STATE.messagingProfileCache;
  }

  // 1. Быстрый путь: ищем в DOM
  const profileLinks = Array.from(document.querySelectorAll('a[href*="/in/"]'));
  for (const link of profileLinks) {
    if (link.href.includes('/me/') || link.href.includes('/jobs/')) continue;
    const normalized = normalizeLinkedInProfileUrl(link.href);
    if (normalized) {
      log(' Profile found in DOM:', normalized);
      STATE.messagingProfileCache = normalized;
      return normalized;
    }
  }

  // 2. Средний путь: localStorage (синхронно, быстро)
  try {
    const currentUrl = location.href;
    const threadMatch = currentUrl.match(/thread\/([^/?]+)/);
    if (threadMatch) {
      const threadId = threadMatch[1];
      
      const mapping = JSON.parse(localStorage.getItem('hrhelper_thread_profile_map') || '{}');
      if (mapping[threadId]) {
        log(' Profile from localStorage:', mapping[threadId]);
        STATE.messagingProfileCache = mapping[threadId];
        return mapping[threadId];
      }
      
      // 3. Медленный путь: backend API (асинхронно)
      const result = await apiFetch('/api/v1/linkedin/thread-mapping/?thread_id=' + threadId, { method: "GET" });
      if (result.ok) {
        const data = await result.json().catch(() => null);
        if (data?.profile_url) {
          log(' Profile from backend:', data.profile_url);
          STATE.messagingProfileCache = data.profile_url;
          // Сохраняем в localStorage для следующего раза
          try {
            const mapping = JSON.parse(localStorage.getItem('hrhelper_thread_profile_map') || '{}');
            mapping[threadId] = data.profile_url;
            localStorage.setItem('hrhelper_thread_profile_map', JSON.stringify(mapping));
          } catch (e) {}
          return data.profile_url;
        }
      }
      
      warn(' Thread not mapped:', threadId);
    }
  } catch (e) {
    error(' Error getting profile:', e);
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
    wrapper.style.cssText = "padding:12px 16px;border-bottom:1px solid rgba(0,0,0,.08);background:#f3f6f8;display:flex;align-items:center;gap:8px;position:relative;";
  } else {
    // На странице профиля — inline рядом с кнопкой More
    wrapper.style.cssText = "margin-left:8px;display:inline-flex;align-items:center;gap:6px;position:relative;";
  }

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "hrhelper-action-btn";
  btn.style.cssText = "padding:8px 12px;border-radius:999px;border:1px solid rgba(0,0,0,.15);color:#fff;font-weight:600;cursor:pointer;line-height:1;";
  btn.addEventListener("click", onButtonClick);
  wrapper.appendChild(btn);
  
  // Кнопка копирования ссылки (только в режиме "open")
  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.className = "hrhelper-copy-btn";
  copyBtn.innerHTML = "📋"; // Иконка копирования
  copyBtn.title = "Копировать ссылку на Huntflow";
  copyBtn.style.cssText = "display:none;width:32px;height:32px;border-radius:50%;border:1px solid rgba(0,0,0,.15);background:#28a745;color:#fff;font-size:14px;cursor:pointer;padding:0;line-height:1;";
  copyBtn.addEventListener("click", onCopyClick);
  wrapper.appendChild(copyBtn);
  
  // Кнопка редактирования (только в режиме "open")
  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "hrhelper-edit-btn";
  editBtn.innerHTML = "✏️"; // Иконка карандаша
  editBtn.title = "Редактировать ссылку";
  editBtn.style.cssText = "display:none;width:32px;height:32px;border-radius:50%;border:1px solid rgba(0,0,0,.15);background:#dc3545;color:#fff;font-size:14px;cursor:pointer;padding:0;line-height:1;";
  editBtn.addEventListener("click", onEditClick);
  wrapper.appendChild(editBtn);
  
  // Кнопка изменения статуса (только в режиме "open")
  const statusBtn = document.createElement("button");
  statusBtn.type = "button";
  statusBtn.className = "hrhelper-status-btn";
  statusBtn.innerHTML = "🔄"; // Иконка обновления
  statusBtn.title = "Изменить статус";
  statusBtn.style.cssText = "display:none;width:32px;height:32px;border-radius:50%;border:1px solid rgba(0,0,0,.15);background:#17a2b8;color:#fff;font-size:14px;cursor:pointer;padding:0;line-height:1;";
  statusBtn.addEventListener("click", onStatusClick);
  wrapper.appendChild(statusBtn);
  
  // Контейнер для выпадающих списков статуса
  const statusDropdown = document.createElement("div");
  statusDropdown.className = "hrhelper-status-dropdown";
  statusDropdown.style.cssText = "display:none;position:absolute;background:#fff;border:1px solid rgba(0,0,0,.2);border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.15);z-index:10000;min-width:200px;max-width:300px;margin-top:4px;";
  wrapper.appendChild(statusDropdown);

  const inputGroup = document.createElement("div");
  inputGroup.className = "hrhelper-input-group";
  inputGroup.style.cssText = "display:none;align-items:center;gap:8px;flex:1;";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Ссылка на кандидата (Huntflow или HRHelper)";
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
  saveBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    log(' Save button clicked');
    onSaveLinkClick();
  });

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.textContent = "Отмена";
  cancelBtn.className = "hrhelper-cancel-btn";
  cancelBtn.style.cssText = "padding:8px 16px;border-radius:999px;border:1px solid rgba(0,0,0,.15);background:#6c757d;color:#fff;font-weight:600;cursor:pointer;line-height:1;font-size:13px;";
  cancelBtn.addEventListener("click", onCancelClick);

  inputGroup.appendChild(input);
  inputGroup.appendChild(saveBtn);
  inputGroup.appendChild(cancelBtn);
  wrapper.appendChild(inputGroup);
  
  if (isMessaging) {
    // Вставляем ПЕРЕД формой ввода
    container.insertBefore(wrapper, container.firstChild);
  } else {
    // Вставляем после кнопки More
    container.insertBefore(wrapper, anchorEl.nextSibling);
  }

  return { wrapper, btn, input, inputGroup, saveBtn, cancelBtn, editBtn, copyBtn, statusBtn, statusDropdown };
}

function updateWidget(widgets, force) {
  if (!widgets) return;
  const { btn, input, inputGroup, saveBtn, cancelBtn, editBtn, copyBtn, statusBtn, statusDropdown } = widgets;
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
    
    // Показываем кнопку копирования
    if (copyBtn) {
      copyBtn.style.display = STATE.current.appUrl ? "block" : "none";
    }
    
    // Показываем кнопку редактирования
    if (editBtn) {
      editBtn.style.display = "block";
    }
    
    // Показываем кнопку изменения статуса (только если есть app_url)
    if (statusBtn) {
      statusBtn.style.display = STATE.current.appUrl ? "block" : "none";
    }
    
    // Скрываем выпадающий список статуса
    if (statusDropdown) {
      statusDropdown.style.display = "none";
    }
  } else {
    btn.style.display = "none";
    inputGroup.style.display = "flex";
    input.value = STATE.current.inputValue || "";
    input.placeholder = STATE.current.title || "Ссылка на кандидата (Huntflow или HRHelper)";
    saveBtn.disabled = !!STATE.current.disabled;
    saveBtn.style.opacity = saveBtn.disabled ? "0.6" : "1";
    
    // Показываем/скрываем кнопку отмены в зависимости от того, редактируем ли мы существующую ссылку
    if (cancelBtn) {
      // Показываем "Отмена" только если это редактирование (есть сохранённый app_url)
      cancelBtn.style.display = STATE.current.appUrl ? "block" : "none";
    }
    
    // Скрываем кнопку редактирования
    if (editBtn) {
      editBtn.style.display = "none";
    }
    
    // Скрываем кнопку копирования
    if (copyBtn) {
      copyBtn.style.display = "none";
    }
    
    // Скрываем кнопку изменения статуса
    if (statusBtn) {
      statusBtn.style.display = "none";
    }
    
    // Скрываем выпадающий список статуса
    if (statusDropdown) {
      statusDropdown.style.display = "none";
    }
  }
}

function ensureButtons() {
  log(' ensureButtons called, show:', STATE.current.show);
  
  // Всегда показываем кнопки, даже если show=false, чтобы форма была доступна сразу
  // if (!STATE.current.show) {
  //   log(' STATE.current.show is false, not showing buttons');
  //   return;
  // }
  
  const now = Date.now();
  if (now - STATE.lastScanAt < THROTTLE_MS) {
    log(' Throttled, skipping');
    return;
  }
  STATE.lastScanAt = now;
  
  log(' Creating/updating buttons...');

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
            updateWidget(existing, false); // false = не force, только если изменилось
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
            updateWidget(existing, false); // false = не force, только если изменилось
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

// Быстрая проверка: есть ли уже виджет на странице
function hasExistingWidget() {
  return STATE.buttons.size > 0 && Array.from(STATE.buttons.values()).some(w => w?.wrapper?.isConnected);
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

// Кэш статусов в localStorage
function getCachedStatus(linkedinUrl) {
  try {
    const cacheKey = `hrhelper_status_${linkedinUrl}`;
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;
    
    const { status, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;
    
    // Кэш валиден 5 минут
    if (age < STATE.CACHE_TTL) {
      return status;
    }
    
    // Устаревший кэш — удаляем
    localStorage.removeItem(cacheKey);
    return null;
  } catch (e) {
    return null;
  }
}

function setCachedStatus(linkedinUrl, status) {
  try {
    const cacheKey = `hrhelper_status_${linkedinUrl}`;
    localStorage.setItem(cacheKey, JSON.stringify({
      status,
      timestamp: Date.now()
    }));
  } catch (e) {
    // Игнорируем ошибки localStorage
  }
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

async function checkStatus(linkedinUrl, forceRefresh = false) {
  // Проверяем кэш только если не требуется принудительное обновление
  if (!forceRefresh) {
    const cached = getCachedStatus(linkedinUrl);
    if (cached) {
      return cached;
    }
  } else {
    // При принудительном обновлении очищаем кэш
    try {
      const cacheKey = `hrhelper_status_${linkedinUrl}`;
      localStorage.removeItem(cacheKey);
      log(' Cache cleared for force refresh');
    } catch (e) {
      // Игнорируем ошибки
    }
  }
  
  // Запрашиваем с сервера
  const qp = new URLSearchParams({ linkedin_url: linkedinUrl });
  if (forceRefresh) {
    qp.append('force_refresh', 'true');
  }
  const res = await apiFetch('/api/v1/huntflow/linkedin-applicants/status/?' + qp.toString(), { method: "GET" });

  if (res.status === 401 || res.status === 403) {
    return { authRequired: true };
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return { error: data?.message || data?.error || 'HTTP ' + res.status };
  }
  
  // Сохраняем в кэш
  setCachedStatus(linkedinUrl, data);
  
  return data;
}

async function setLink(linkedinUrl, targetUrl) {
  log(' setLink called:', { linkedinUrl, targetUrl });
  const res = await apiFetch('/api/v1/huntflow/linkedin-applicants/set-link/', {
    method: "POST",
    body: JSON.stringify({ linkedin_url: linkedinUrl, target_url: targetUrl })
  });
  log(' setLink response:', { ok: res.ok, status: res.status });
  const data = await res.json().catch(() => null);
  log(' setLink data:', data);
  if (!res.ok) {
    const error = data?.message || data?.error || 'HTTP ' + res.status;
    error(' setLink error:', error);
    return { error };
  }
  
  // Обновляем кэш после сохранения
  // Сохраняем данные, но с пометкой времени, чтобы при следующей проверке
  // (если прошло больше 30 секунд) было принудительное обновление
  if (data && data.success) {
    setCachedStatus(linkedinUrl, data);
    log(' Cache updated after saving link');
  }
  
  return data;
}

async function refreshButtonForCurrentProfile() {
  log(' refreshButtonForCurrentProfile called');
  
  let canonical = normalizeLinkedInProfileUrl(location.href);
  log(' Canonical URL:', canonical);

  // Сначала показываем кнопки в режиме загрузки для мгновенного отображения
  const showLoadingState = () => {
    STATE.current.show = true;
    STATE.current.mode = "input";
    STATE.current.appUrl = null;
    STATE.current.disabled = false;
    STATE.current.title = "Загрузка...";
    STATE.current.text = "Huntflow";
    ensureButtons();
  };

  // Показываем кнопки сразу, если еще не показаны
  if (!STATE.current.show) {
    showLoadingState();
  }

  if (!canonical && IS_MESSAGING_PAGE) {
    log(' Messaging page, trying to get profile...');
    try {
      canonical = await getProfileLinkFromMessaging();
      log(' Profile from messaging:', canonical);
    } catch (e) {
      error(' Error getting profile from messaging:', e);
    }
  }

  if (!canonical) {
    warn(' No canonical URL, showing input form');
    STATE.current.show = true;
    STATE.current.mode = "input";
    STATE.current.appUrl = null;
    STATE.current.disabled = false;
    STATE.current.title = "Укажи ссылку на кандидата";
    ensureButtons();
    return;
  }
  
  // Проверяем кэш для мгновенного отображения
  // При перезагрузке страницы делаем принудительное обновление, если кэш старше 30 секунд
  const cached = getCachedStatus(canonical);
  let shouldForceRefresh = false;
  if (cached) {
    try {
      const cacheKey = `hrhelper_status_${canonical}`;
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const { timestamp } = JSON.parse(cachedData);
        const age = Date.now() - timestamp;
        // Если кэш старше 30 секунд, делаем принудительное обновление при перезагрузке
        if (age > 30 * 1000) {
          shouldForceRefresh = true;
          log(' Cache is older than 30 seconds, forcing refresh');
        }
      }
    } catch (e) {
      // Игнорируем ошибки
    }
  }
  
  if (cached && cached.exists !== undefined && !shouldForceRefresh) {
    log(' Using cached status for instant display');
    STATE.current.show = true;
    if (cached.exists && cached.app_url) {
      STATE.current.mode = "open";
      STATE.current.appUrl = cached.app_url;
      STATE.current.disabled = false;
      // Формируем текст кнопки: "Huntflow | Название вакансии | Статус"
      let buttonText = "Huntflow";
      if (cached.vacancy_name) {
        buttonText = `Huntflow | ${cached.vacancy_name}`;
        if (cached.status_name) {
          buttonText += ` | ${cached.status_name}`;
        }
      }
      setButtonState({ text: buttonText, disabled: false, title: "Открыть в Huntflow", color: "#0a66c2" });
    } else {
      STATE.current.mode = "input";
      STATE.current.appUrl = null;
      STATE.current.disabled = false;
      setButtonState({ text: "Huntflow", disabled: false, title: "Укажи ссылку на кандидата", color: "#0a66c2" });
    }
    ensureButtons();
    // Продолжаем обновление в фоне
  }
  
  if (STATE.statusFetchedFor === canonical) {
    log(' Status already fetched, applying state');
    applyStateToAllButtons();
    return;
  }
  
  if (STATE.apiCallsThisProfile >= 1) {
    log(' API call limit reached');
    return;
  }

  log(' Fetching status from API...');
  
  if (!STATE.statusInFlight) {
    STATE.apiCallsThisProfile += 1;
    // Используем принудительное обновление, если кэш устарел
    STATE.statusInFlight = checkStatus(canonical, shouldForceRefresh).finally(() => {
      STATE.statusInFlight = null;
    });
  }

  const status = await STATE.statusInFlight;
  
  log(' Status received:', status);
  
  if (status.authRequired || status.error) {
    warn(' Auth required or error:', status.error || 'No token');
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
    log(' Candidate exists, showing button');
    log(' Status data:', { vacancy_name: status.vacancy_name, status_name: status.status_name, app_url: status.app_url });
    STATE.current.mode = "open";
    STATE.current.appUrl = status.app_url;
    STATE.current.disabled = false;
    
    // Формируем текст кнопки: "Huntflow | Название вакансии | Статус"
    let buttonText = "Huntflow";
    if (status.vacancy_name) {
      buttonText = `Huntflow | ${status.vacancy_name}`;
      if (status.status_name) {
        buttonText += ` | ${status.status_name}`;
      }
    }
    
    log(' Button text:', buttonText);
    setButtonState({ text: buttonText, disabled: false, title: "Открыть в Huntflow", color: "#0a66c2" });
  } else {
    log(' Candidate not found, showing input');
    STATE.current.mode = "input";
    STATE.current.appUrl = null;
    STATE.current.disabled = false;
    setButtonState({ text: "Huntflow", disabled: false, title: "Укажи ссылку на кандидата", color: "#0a66c2" });
  }
  ensureButtons();
  STATE.statusFetchedFor = canonical;
}

async function onSaveLinkClick() {
  log(' onSaveLinkClick called');
  
  if (STATE.busy) {
    log(' Already busy, ignoring click');
    return;
  }
  
  let canonical = normalizeLinkedInProfileUrl(location.href);
  log(' Canonical URL:', canonical);
  
  if (!canonical && IS_MESSAGING_PAGE) {
    try {
      canonical = await getProfileLinkFromMessaging();
      log(' Profile from messaging:', canonical);
    } catch (e) {
      error(' Error getting profile from messaging:', e);
    }
  }

  if (!canonical) {
    error(' No canonical URL found');
    STATE.current.title = "Не удалось определить профиль LinkedIn";
    applyStateToAllButtons();
    return;
  }
  
  if (STATE.apiCallsThisProfile >= 2) {
    warn(' API call limit reached');
    return;
  }

  const target = (STATE.current.inputValue || "").trim();
  log(' Target URL:', target);
  
  if (!target) {
    log(' No target URL provided');
    STATE.current.title = "Вставь ссылку на кандидата";
    applyStateToAllButtons();
    return;
  }

  try {
    STATE.busy = true;
    
    // Показываем индикатор загрузки
    STATE.current.title = "Сохранение...";
    STATE.current.disabled = true;
    applyStateToAllButtons();
    
    STATE.apiCallsThisProfile += 1;
    log(' Calling setLink...');
    const saved = await setLink(canonical, target);
    log(' setLink result:', saved);
    
    if (saved?.error) {
      error(' Save error:', saved.error);
      STATE.current.title = saved.error;
      STATE.current.disabled = false;
      applyStateToAllButtons();
      return;
    }
    
    if (!saved || (!saved.app_url && !saved.target_url)) {
      error(' Save failed: no URL in response', saved);
      STATE.current.title = "Ошибка сохранения: нет ссылки в ответе";
      STATE.current.disabled = false;
      applyStateToAllButtons();
      return;
    }
    
    const finalUrl = saved.app_url || saved.target_url;
    log(' Saved! Final URL:', finalUrl);
    
    STATE.current.mode = "open";
    STATE.current.appUrl = finalUrl;
    STATE.current.title = "Открыть в Huntflow";
    STATE.current.disabled = false;
    
    // Обновляем текст кнопки с названием вакансии и статусом, если есть
    let buttonText = "Huntflow";
    if (saved.vacancy_name) {
      buttonText = `Huntflow | ${saved.vacancy_name}`;
      if (saved.status_name) {
        buttonText += ` | ${saved.status_name}`;
      }
    }
    log(' Button text after save:', buttonText);
    setButtonState({ text: buttonText, disabled: false, title: "Открыть в Huntflow", color: "#0a66c2" });
    
    // Сбрасываем счетчик API вызовов для этого профиля, чтобы можно было обновить статус
    STATE.apiCallsThisProfile = 0;
    STATE.statusFetchedFor = null;
    
    applyStateToAllButtons();
  } catch (e) {
    error(' Exception in onSaveLinkClick:', e);
    STATE.current.title = "Ошибка: " + (e.message || String(e));
    STATE.current.disabled = false;
    applyStateToAllButtons();
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
      error(' Error getting profile from messaging:', e);
    }
  }

  if (!canonical) return;
  const mode = STATE.current.mode || "idle";
  if (mode === "open" && STATE.current.appUrl) {
    window.open(STATE.current.appUrl, "_blank", "noopener,noreferrer");
  }
}

async function onEditClick(e) {
  e.stopPropagation();

  log(' Edit button clicked');

  // Сохраняем оригинальный URL перед редактированием
  STATE.current.originalAppUrl = STATE.current.appUrl;

  // Переключаемся в режим редактирования
  STATE.current.mode = "input";
  STATE.current.inputValue = STATE.current.appUrl || "";
  STATE.current.disabled = false;
  STATE.current.title = "Редактировать ссылку";

  applyStateToAllButtons();
}

async function onCancelClick(e) {
  e.stopPropagation();

  log(' Cancel button clicked');

  // Возвращаемся в режим просмотра с оригинальным URL
  STATE.current.mode = "open";
  STATE.current.appUrl = STATE.current.originalAppUrl;
  STATE.current.inputValue = "";
  STATE.current.disabled = false;
  STATE.current.title = "Открыть в Huntflow";
  STATE.current.originalAppUrl = null; // Очищаем сохранённый URL

  applyStateToAllButtons();
}

async function onCopyClick(e) {
  e.stopPropagation();

  log(' Copy button clicked');

  if (!STATE.current.appUrl) {
    log(' No URL to copy');
    return;
  }

  try {
    await navigator.clipboard.writeText(STATE.current.appUrl);
    log(' URL copied to clipboard:', STATE.current.appUrl);
    
    // Визуальная обратная связь - временно меняем иконку
    const copyBtn = e.target.closest('.hrhelper-copy-btn');
    if (copyBtn) {
      const originalHTML = copyBtn.innerHTML;
      copyBtn.innerHTML = "✓";
      copyBtn.style.background = "#28a745";
      setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
      }, 1000);
    }
  } catch (err) {
    error(' Failed to copy URL:', err);
    // Fallback для старых браузеров
    const textArea = document.createElement("textarea");
    textArea.value = STATE.current.appUrl;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      log(' URL copied using fallback method');
    } catch (fallbackErr) {
      error(' Fallback copy also failed:', fallbackErr);
    }
    document.body.removeChild(textArea);
  }
}

async function onStatusClick(e) {
  e.stopPropagation();
  
  log(' Status button clicked');
  
  let canonical = normalizeLinkedInProfileUrl(location.href);
  if (!canonical && IS_MESSAGING_PAGE) {
    try {
      canonical = await getProfileLinkFromMessaging();
    } catch (e) {
      error(' Error getting profile from messaging:', e);
    }
  }
  
  if (!canonical) {
    error(' No canonical URL found');
    return;
  }
  
  // Находим выпадающий список для этого виджета
  const statusBtn = e.target.closest('.hrhelper-status-btn');
  if (!statusBtn) return;
  
  const wrapper = statusBtn.closest('[data-hrhelper-huntflow="1"]');
  if (!wrapper) return;
  
  const statusDropdown = wrapper.querySelector('.hrhelper-status-dropdown');
  if (!statusDropdown) return;
  
  // Переключаем видимость выпадающего списка
  const isVisible = statusDropdown.style.display !== 'none';
  if (isVisible) {
    statusDropdown.style.display = 'none';
    return;
  }
  
  // Показываем загрузку
  statusDropdown.innerHTML = '<div style="padding:12px;text-align:center;color:#666;">Загрузка...</div>';
  statusDropdown.style.display = 'block';
  
  // Позиционируем выпадающий список
  const rect = statusBtn.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  let left = rect.left + window.scrollX;
  let top = rect.bottom + window.scrollY + 4;
  
  // Проверяем, не выходит ли список за правую границу экрана
  if (left + 300 > viewportWidth) {
    left = viewportWidth - 300 - 10;
  }
  
  // Проверяем, не выходит ли список за нижнюю границу экрана
  if (top + 300 > viewportHeight + window.scrollY) {
    top = rect.top + window.scrollY - 300 - 4;
  }
  
  statusDropdown.style.position = 'fixed';
  statusDropdown.style.top = `${top}px`;
  statusDropdown.style.left = `${left}px`;
  
  try {
    // Получаем список статусов и причин отказа
    const qp = new URLSearchParams({ linkedin_url: canonical });
    const res = await apiFetch('/api/v1/huntflow/linkedin-applicants/status-options/?' + qp.toString(), { method: "GET" });
    
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      statusDropdown.innerHTML = `<div style="padding:12px;color:#dc3545;">Ошибка: ${data?.message || 'Не удалось загрузить статусы'}</div>`;
      return;
    }
    
    const data = await res.json().catch(() => null);
    if (!data || !data.success) {
      statusDropdown.innerHTML = '<div style="padding:12px;color:#dc3545;">Ошибка загрузки статусов</div>';
      return;
    }
    
    const statuses = data.statuses || [];
    const rejectionReasons = data.rejection_reasons || [];
    
    // Создаем выпадающий список
    createStatusDropdown(statusDropdown, statuses, rejectionReasons, canonical);
    
    // Закрываем выпадающий список при клике вне его
    setTimeout(() => {
      const closeHandler = (event) => {
        if (!statusDropdown.contains(event.target) && !statusBtn.contains(event.target)) {
          statusDropdown.style.display = 'none';
          document.removeEventListener('click', closeHandler);
        }
      };
      document.addEventListener('click', closeHandler);
    }, 100);
    
  } catch (err) {
    error(' Error loading status options:', err);
    statusDropdown.innerHTML = '<div style="padding:12px;color:#dc3545;">Ошибка загрузки</div>';
  }
}

function createStatusDropdown(container, statuses, rejectionReasons, linkedinUrl) {
  // Сохраняем данные в контейнере для возможности возврата
  container.dataset.statuses = JSON.stringify(statuses);
  container.dataset.rejectionReasons = JSON.stringify(rejectionReasons);
  container.dataset.linkedinUrl = linkedinUrl;
  container.dataset.currentView = 'statuses';
  
  showStatusesList(container, statuses, rejectionReasons, linkedinUrl);
}

function showStatusesList(container, statuses, rejectionReasons, linkedinUrl) {
  container.innerHTML = '';
  container.dataset.currentView = 'statuses';
  
  if (statuses.length === 0) {
    container.innerHTML = '<div style="padding:12px;color:#666;">Нет доступных статусов</div>';
    return;
  }
  
  // Создаем список статусов
  const statusList = document.createElement('div');
  statusList.style.cssText = "max-height:300px;overflow-y:auto;";
  
  statuses.forEach(status => {
    const statusItem = document.createElement('div');
    statusItem.className = 'hrhelper-status-item';
    statusItem.dataset.statusId = status.id;
    statusItem.dataset.statusName = status.name || '';
    statusItem.style.cssText = "padding:8px 12px;cursor:pointer;border-bottom:1px solid rgba(0,0,0,.05);";
    statusItem.textContent = status.name || `Статус #${status.id}`;
    
    // Определяем, является ли статус отказом
    // Проверяем тип статуса и название
    const statusType = status.type || '';
    const statusName = (status.name || '').toLowerCase();
    const isRejection = statusType === 'rejected' || 
                       statusType === 'rejection' ||
                       statusName.includes('отказ') || 
                       statusName.includes('reject') ||
                       statusName.includes('rejected') ||
                       statusName.includes('отклонен');
    
    if (isRejection && rejectionReasons.length > 0) {
      // Для статуса отказа при клике показываем список причин отказа
      statusItem.addEventListener('click', (e) => {
        e.stopPropagation();
        showRejectionReasonsList(container, rejectionReasons, status.id, linkedinUrl);
      });
    } else {
      // Для обычных статусов добавляем обработчик клика
      statusItem.addEventListener('click', async (e) => {
        e.stopPropagation();
        await updateStatus(linkedinUrl, status.id, null);
        container.style.display = 'none';
      });
    }
    
    statusItem.addEventListener('mouseenter', () => {
      statusItem.style.background = '#f0f0f0';
    });
    
    statusItem.addEventListener('mouseleave', () => {
      statusItem.style.background = '';
    });
    
    statusList.appendChild(statusItem);
  });
  
  container.appendChild(statusList);
}

function showRejectionReasonsList(container, rejectionReasons, statusId, linkedinUrl) {
  container.innerHTML = '';
  container.dataset.currentView = 'rejection_reasons';
  container.dataset.selectedStatusId = statusId;
  
  if (rejectionReasons.length === 0) {
    container.innerHTML = '<div style="padding:12px;color:#666;">Нет доступных причин отказа</div>';
    return;
  }
  
  // Кнопка "Назад"
  const backButton = document.createElement('div');
  backButton.className = 'hrhelper-back-button';
  backButton.style.cssText = "padding:8px 12px;cursor:pointer;border-bottom:2px solid rgba(0,0,0,.1);background:#f8f9fa;font-weight:600;display:flex;align-items:center;gap:8px;";
  backButton.innerHTML = '← Назад';
  
  backButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const statuses = JSON.parse(container.dataset.statuses || '[]');
    const rejectionReasonsData = JSON.parse(container.dataset.rejectionReasons || '[]');
    const linkedinUrlData = container.dataset.linkedinUrl;
    showStatusesList(container, statuses, rejectionReasonsData, linkedinUrlData);
  });
  
  backButton.addEventListener('mouseenter', () => {
    backButton.style.background = '#e9ecef';
  });
  
  backButton.addEventListener('mouseleave', () => {
    backButton.style.background = '#f8f9fa';
  });
  
  container.appendChild(backButton);
  
  // Создаем список причин отказа
  const reasonsList = document.createElement('div');
  reasonsList.style.cssText = "max-height:300px;overflow-y:auto;";
  
  rejectionReasons.forEach(reason => {
    const reasonItem = document.createElement('div');
    reasonItem.className = 'hrhelper-rejection-reason-item';
    reasonItem.dataset.reasonId = reason.id;
    reasonItem.style.cssText = "padding:8px 12px;cursor:pointer;border-bottom:1px solid rgba(0,0,0,.05);";
    reasonItem.textContent = reason.name || `Причина #${reason.id}`;
    
    reasonItem.addEventListener('click', async (e) => {
      e.stopPropagation();
      await updateStatus(linkedinUrl, statusId, reason.id);
      container.style.display = 'none';
    });
    
    reasonItem.addEventListener('mouseenter', () => {
      reasonItem.style.background = '#f0f0f0';
    });
    
    reasonItem.addEventListener('mouseleave', () => {
      reasonItem.style.background = '';
    });
    
    reasonsList.appendChild(reasonItem);
  });
  
  container.appendChild(reasonsList);
}


async function updateStatus(linkedinUrl, statusId, rejectionReasonId) {
  log(' Updating status:', { linkedinUrl, statusId, rejectionReasonId });
  
  try {
    const res = await apiFetch('/api/v1/huntflow/linkedin-applicants/update-status/', {
      method: "POST",
      body: JSON.stringify({
        linkedin_url: linkedinUrl,
        status_id: statusId,
        rejection_reason_id: rejectionReasonId || null
      })
    });
    
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      error(' Failed to update status:', data?.message || 'Unknown error');
      alert(`Ошибка обновления статуса: ${data?.message || 'Неизвестная ошибка'}`);
      return;
    }
    
    const data = await res.json().catch(() => null);
    if (data && data.success) {
      log(' Status updated successfully');
      
      // Очищаем кэш и обновляем статус
      try {
        const cacheKey = `hrhelper_status_${linkedinUrl}`;
        localStorage.removeItem(cacheKey);
      } catch (e) {
        // Игнорируем ошибки
      }
      
      // Обновляем кнопку с новым статусом
      STATE.statusFetchedFor = null;
      STATE.apiCallsThisProfile = 0;
      await refreshButtonForCurrentProfile();
      
      // Показываем уведомление об успехе
      const statusBtn = document.querySelector('.hrhelper-status-btn');
      if (statusBtn) {
        const originalHTML = statusBtn.innerHTML;
        statusBtn.innerHTML = "✓";
        statusBtn.style.background = "#28a745";
        setTimeout(() => {
          statusBtn.innerHTML = originalHTML;
          statusBtn.style.background = "#17a2b8";
        }, 2000);
      }
    } else {
      error(' Status update failed:', data);
      alert('Не удалось обновить статус');
    }
  } catch (err) {
    error(' Exception updating status:', err);
    alert(`Ошибка: ${err.message || String(err)}`);
  }
}

function startObserver() {
  // Отслеживаем текущий URL
  let currentUrl = location.href;
  
  const resetState = () => {
    log(' Resetting state due to URL change');
    STATE.apiCallsThisProfile = 0;
    STATE.statusFetchedFor = null;
    STATE.statusInFlight = null;
    STATE.current.mode = "idle";
    STATE.current.appUrl = null;
    STATE.current.show = false;
    STATE.current.inputValue = "";
    STATE.messagingProfileCache = null;
    STATE.lastProfileUrl = null;
    STATE.lastThreadId = null;
    
    // Удаляем старые виджеты
    STATE.buttons.forEach((widgets) => {
      if (widgets?.wrapper?.parentNode) {
        widgets.wrapper.parentNode.removeChild(widgets.wrapper);
      }
    });
    STATE.buttons.clear();
  };
  
  const schedule = () => {
    if (STATE.scheduled) return;
    STATE.scheduled = true;
    requestAnimationFrame(() => {
      STATE.scheduled = false;
      
      // Проверяем изменение URL
      const urlChanged = location.href !== currentUrl;
      if (urlChanged) {
        log(' URL changed detected:', location.href);
        currentUrl = location.href;
        resetState();
      }
      
      let canonical = normalizeLinkedInProfileUrl(location.href);
      
      if (!canonical && IS_MESSAGING_PAGE) {
        // На messaging-странице проверяем изменение thread ID
        const currentThreadId = extractThreadIdFromMessageButton();
        const threadChanged = currentThreadId && currentThreadId !== STATE.lastThreadId;
        
        if (threadChanged || urlChanged) {
          log(' Thread changed or URL changed, resetting state');
          resetState();
          STATE.lastThreadId = currentThreadId;
          
          // Показываем кнопки сразу
          STATE.current.show = true;
          STATE.current.mode = "input";
          STATE.current.title = "Загрузка...";
          ensureButtons();
          
          // Запускаем проверку профиля для нового чата в фоне
          refreshButtonForCurrentProfile();
          return;
        }
        
        // Если thread не изменился, но профиль еще не определен
        if (!STATE.statusFetchedFor) {
          // Показываем кнопки сразу
          if (!STATE.current.show) {
            STATE.current.show = true;
            STATE.current.mode = "input";
            STATE.current.title = "Загрузка...";
            ensureButtons();
          }
          refreshButtonForCurrentProfile();
        } else {
          ensureButtons();
        }
        return;
      }
      
      // Для профилей показываем кнопки сразу
      if (!canonical) {
        STATE.current.show = true;
        STATE.current.mode = "input";
        STATE.current.title = "Укажи ссылку на кандидата";
        ensureButtons();
        return;
      }

      const changed = STATE.lastProfileUrl !== canonical || urlChanged;
      if (changed) {
        resetState();
        STATE.lastProfileUrl = canonical;
        
        // Показываем кнопки сразу
        STATE.current.show = true;
        STATE.current.mode = "input";
        STATE.current.title = "Загрузка...";
        ensureButtons();
        
        // Загружаем данные в фоне
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
  

  // Наблюдаем только за конкретными контейнерами, а не за всем body
  const observeTargets = IS_MESSAGING_PAGE
    ? [
        document.querySelector('.msg-form'),
        document.querySelector('.msg-s-message-list-container'),
        document.querySelector('main')
      ].filter(Boolean)
    : [
        document.querySelector('[data-view-name="profile-top-card"]'),
        document.querySelector('.scaffold-layout__sticky'),
        document.querySelector('main')
      ].filter(Boolean);

  if (observeTargets.length > 0) {
    observeTargets.forEach(target => {
      obs.observe(target, { childList: true, subtree: true });
    });
  } else if (document.body) {
    obs.observe(document.body, { childList: true, subtree: true });
  } else {
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  // Отслеживаем изменения URL для всех страниц
  // Отслеживаем изменения через popstate (назад/вперед в истории)
  window.addEventListener('popstate', () => {
    log(' URL changed (popstate)');
    currentUrl = location.href;
    schedule();
  });
  
  // Отслеживаем изменения через pushState/replaceState (SPA навигация)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    originalPushState.apply(history, args);
    log(' URL changed (pushState)');
    currentUrl = location.href;
    schedule();
  };
  
  history.replaceState = function(...args) {
    originalReplaceState.apply(history, args);
    log(' URL changed (replaceState)');
    currentUrl = location.href;
    schedule();
  };
  
  // Для messaging страницы также периодически проверяем URL
  if (IS_MESSAGING_PAGE) {
    setInterval(() => {
      if (location.href !== currentUrl) {
        log(' URL changed (interval check)');
        currentUrl = location.href;
        schedule();
      } else {
        // Даже если URL не изменился, проверяем thread ID
        const currentThreadId = extractThreadIdFromMessageButton();
        if (currentThreadId && currentThreadId !== STATE.lastThreadId) {
          log(' Thread ID changed (interval check)');
          schedule();
        }
      }
    }, 300); // Проверяем каждые 300мс для более быстрой реакции
  }

  log(' Observer started');
  log(' IS_MESSAGING_PAGE:', IS_MESSAGING_PAGE);
  log(' IS_PROFILE_PAGE:', IS_PROFILE_PAGE);
  log(' Location:', location.href);
  
  // Показываем кнопки сразу при загрузке страницы
  STATE.current.show = true;
  STATE.current.mode = "input";
  STATE.current.title = "Загрузка...";
  ensureButtons();
  
  const canonical = normalizeLinkedInProfileUrl(location.href);
  if (canonical) {
    log(' Found canonical URL on init:', canonical);
    STATE.lastProfileUrl = canonical;
    // Загружаем данные в фоне
    refreshButtonForCurrentProfile();
  } else if (IS_MESSAGING_PAGE) {
    log(' Messaging page detected, resolving profile...');
    STATE.lastThreadId = extractThreadIdFromMessageButton();
    // Загружаем данные в фоне
    refreshButtonForCurrentProfile();
  } else if (IS_PROFILE_PAGE) {
    log(' Profile page detected');
    STATE.current.title = "Укажи ссылку на кандидата";
    ensureButtons();
  } else {
    warn(' Unknown page type');
    STATE.current.title = "Укажи ссылку на кандидата";
    ensureButtons();
  }
}

log(' Content script loaded');
log(' Starting initialization...');

captureProfileToThreadMapping();
startObserver();
