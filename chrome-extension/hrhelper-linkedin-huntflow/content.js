const DEFAULTS = {
  baseUrl: "http://localhost:8000",
};

// Debug mode - установи в false для production
const DEBUG = false;
// Для Google Calendar и Google Meet всегда включаем логирование
const IS_GOOGLE_CALENDAR = location.href.includes('calendar.google.com');
const IS_GOOGLE_MEET = location.href.includes('meet.google.com');
const log = (...args) => (DEBUG || IS_GOOGLE_CALENDAR || IS_GOOGLE_MEET) && console.log('[HRHelper]', ...args);
const warn = (...args) => (DEBUG || IS_GOOGLE_CALENDAR || IS_GOOGLE_MEET) && console.warn('[HRHelper]', ...args);
const logError = (...args) => console.logError('[HRHelper]', ...args);

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
    statusName: null, // Название статуса для отображения в кнопке статуса
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
  try {
    const cfg = await chrome.storage.sync.get(DEFAULTS);
    return { baseUrl: (cfg.baseUrl || DEFAULTS.baseUrl).replace(/\/+$/, "") };
  } catch (err) {
    // Extension context invalidated - используем значения по умолчанию
    if (err.message && err.message.includes('Extension context invalidated')) {
      warn(' Extension context invalidated in getConfig, using defaults');
      return { baseUrl: DEFAULTS.baseUrl.replace(/\/+$/, "") };
    }
    throw err;
  }
}

function extractThreadIdFromMessageButton() {
  // Сначала пробуем извлечь из URL страницы (для страницы messaging)
  const urlMatch = location.href.match(/thread\/([^/?]+)/);
  if (urlMatch) {
    log(' extractThreadIdFromMessageButton: found in URL', urlMatch[1].substring(0, 10) + '...');
    return urlMatch[1];
  }
  
  // Затем ищем в ссылках на странице
  const messageLinks = Array.from(document.querySelectorAll('a[href*="/messaging/thread/"]'));
  for (const messageLink of messageLinks) {
    if (messageLink?.href) {
      const threadMatch = messageLink.href.match(/thread\/([^/?]+)/);
      if (threadMatch) {
        log(' extractThreadIdFromMessageButton: found in link', threadMatch[1].substring(0, 10) + '...');
        return threadMatch[1];
      }
    }
  }

  // Ищем в кнопке Message - пробуем разные селекторы
  const messageBtnSelectors = [
    'button[aria-label*="Message"]',
    'button[aria-label*="message"]',
    'button[aria-label*="Сообщение"]',
    'button[aria-label*="сообщение"]',
    'a[href*="/messaging/"]',
    '[data-control-name="send_inmail"]',
    '[data-control-name="message"]'
  ];
  
  for (const selector of messageBtnSelectors) {
    const elements = Array.from(document.querySelectorAll(selector));
    for (const element of elements) {
      // Ищем ссылку внутри элемента или рядом
      let link = element.querySelector('a[href*="/messaging/"]') || 
                 element.closest('a[href*="/messaging/"]') ||
                 (element.href && element.href.includes('/messaging/') ? element : null);
      
      if (!link && element.href) {
        link = element;
      }
      
      if (link?.href) {
        const threadMatch = link.href.match(/thread\/([^/?]+)/);
        if (threadMatch) {
          log(' extractThreadIdFromMessageButton: found in button/link', threadMatch[1].substring(0, 10) + '...');
          return threadMatch[1];
        }
      }
    }
  }

  log(' extractThreadIdFromMessageButton: not found');
  return null;
}

async function saveThreadMappingToBackend(threadId, profileUrl) {
  if (!threadId || !profileUrl) {
    log(' saveThreadMappingToBackend: missing threadId or profileUrl', { threadId: !!threadId, profileUrl: !!profileUrl });
    return;
  }
  
  log(' saveThreadMappingToBackend: saving mapping', { 
    threadId: threadId.substring(0, 10) + '...', 
    profileUrl 
  });
  
  try {
    const result = await apiFetch('/api/v1/linkedin/thread-mapping/', {
      method: "POST",
      body: JSON.stringify({ 
        thread_id: threadId, 
        profile_url: profileUrl
      })
    });

    log(' saveThreadMappingToBackend: API response', { 
      ok: result.ok, 
      status: result.status 
    });

    if (result.ok) {
      const data = await result.json().catch(() => null);
      log(' Thread mapping saved successfully:', threadId.substring(0, 10) + '...', data);
    } else {
      const data = await result.json().catch(() => null);
      logError(' Failed to save thread mapping:', { 
        status: result.status, 
        data 
      });
    }
  } catch (e) {
    logError(' Exception saving thread mapping:', e);
  }
}

function captureProfileToThreadMapping() {
  if (!IS_PROFILE_PAGE) {
    log(' captureProfileToThreadMapping: not a profile page');
    return;
  }

  const profileUrl = normalizeLinkedInProfileUrl(location.href);
  if (!profileUrl) {
    log(' captureProfileToThreadMapping: could not normalize profile URL');
    return;
  }

  log(' captureProfileToThreadMapping: starting for', profileUrl);

  // Функция для сохранения маппинга
  const saveMapping = (threadId) => {
    if (!threadId) {
      log(' saveMapping: threadId is empty');
      return;
    }
    
    log(' Found thread:', threadId.substring(0, 10) + '...', 'for', profileUrl);
    
    try {
      const mapping = JSON.parse(localStorage.getItem('hrhelper_thread_profile_map') || '{}');
      mapping[threadId] = profileUrl;
      localStorage.setItem('hrhelper_thread_profile_map', JSON.stringify(mapping));
      log(' Saved thread mapping to localStorage');
    } catch (e) {
      logError(' Error saving thread mapping to localStorage:', e);
    }

    saveThreadMappingToBackend(threadId, profileUrl);
  };

  // Пробуем найти thread_id сразу
  let threadId = extractThreadIdFromMessageButton();
  if (threadId) {
    saveMapping(threadId);
  } else {
    log(' captureProfileToThreadMapping: threadId not found immediately, will retry');
  }

  // Также пробуем найти thread_id через небольшие задержки
  // (кнопка Message может появиться позже при динамической загрузке)
  const delays = [500, 1000, 2000, 3000, 5000];
  delays.forEach(delay => {
    setTimeout(() => {
      const delayedThreadId = extractThreadIdFromMessageButton();
      if (delayedThreadId) {
        if (!threadId || delayedThreadId !== threadId) {
          log(' captureProfileToThreadMapping: found threadId after delay', delayedThreadId.substring(0, 10) + '...');
          threadId = delayedThreadId;
          saveMapping(delayedThreadId);
        }
      }
    }, delay);
  });

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
        log(' Saved new thread mapping to localStorage');
      } catch (e) {
        logError(' Error saving thread mapping to localStorage:', e);
      }
      
      saveThreadMappingToBackend(newThreadId, profileUrl);
    }
  };

  const obs = new MutationObserver(trackMessageButtons);
  obs.observe(document.body, { childList: true, subtree: true });
  log(' captureProfileToThreadMapping: MutationObserver started');
}

async function getProfileLinkFromMessaging() {
  // Используем кэш, чтобы не искать профиль повторно
  if (STATE.messagingProfileCache) {
    return STATE.messagingProfileCache;
  }

  // Извлекаем thread_id из URL
  let threadId = null;
  try {
    const currentUrl = location.href;
    const threadMatch = currentUrl.match(/thread\/([^/?]+)/);
    if (threadMatch) {
      threadId = threadMatch[1];
    }
  } catch (e) {
    warn(' Error extracting thread_id from URL:', e);
  }

  // 1. Быстрый путь: ищем в DOM
  const profileLinks = Array.from(document.querySelectorAll('a[href*="/in/"]'));
  for (const link of profileLinks) {
    if (link.href.includes('/me/') || link.href.includes('/jobs/')) continue;
    const normalized = normalizeLinkedInProfileUrl(link.href);
    if (normalized) {
      log(' Profile found in DOM:', normalized);
      STATE.messagingProfileCache = normalized;
      
      // Сохраняем маппинг thread_id -> profile_url если thread_id найден
      if (threadId) {
        try {
          const mapping = JSON.parse(localStorage.getItem('hrhelper_thread_profile_map') || '{}');
          mapping[threadId] = normalized;
          localStorage.setItem('hrhelper_thread_profile_map', JSON.stringify(mapping));
          log(' Saved thread mapping to localStorage:', threadId.substring(0, 10) + '... -> ' + normalized);
          
          // Сохраняем на backend
          saveThreadMappingToBackend(threadId, normalized);
        } catch (e) {
          warn(' Error saving thread mapping to localStorage:', e);
        }
      }
      
      return normalized;
    }
  }

  // 2. Средний путь: localStorage (синхронно, быстро)
  if (threadId) {
    try {
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
    } catch (e) {
      logError(' Error getting profile:', e);
    }
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
  copyBtn.style.cssText = "display:none;width:32px;height:32px;border-radius:50%;border:1px solid rgba(0,0,0,.15);background:#17a2b8;color:#fff;font-size:14px;cursor:pointer;padding:0;line-height:1;";
  copyBtn.addEventListener("click", onCopyClick);
  wrapper.appendChild(copyBtn);
  
  // Кнопка редактирования (только в режиме "open")
  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "hrhelper-edit-btn";
  editBtn.innerHTML = "✏️"; // Иконка карандаша
  editBtn.title = "Редактировать ссылку";
  editBtn.style.cssText = "display:none;width:32px;height:32px;border-radius:50%;border:1px solid rgba(0,0,0,.15);background:#6c757d;color:#fff;font-size:14px;cursor:pointer;padding:0;line-height:1;";
  editBtn.addEventListener("click", onEditClick);
  wrapper.appendChild(editBtn);
  
  // Кнопка изменения статуса (только в режиме "open")
  const statusBtn = document.createElement("button");
  statusBtn.type = "button";
  statusBtn.className = "hrhelper-status-btn";
  statusBtn.title = "Изменить статус";
  statusBtn.style.cssText = "display:none;padding:8px 12px;border-radius:999px;border:1px solid rgba(0,0,0,.15);color:#fff;font-weight:600;cursor:pointer;line-height:1;font-size:12px;white-space:nowrap;";
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

// Функция для определения, является ли статус отказом
function isRejectionStatus(statusName) {
  if (!statusName) return false;
  const statusNameLower = statusName.toLowerCase();
  return statusNameLower.includes('отказ') || 
         statusNameLower.includes('reject') || 
         statusNameLower.includes('rejected') ||
         statusNameLower.includes('отклонен');
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
    
    // Обновляем кнопку изменения статуса (только если есть app_url)
    if (statusBtn) {
      if (STATE.current.appUrl && STATE.current.statusName) {
        statusBtn.style.display = "block";
        statusBtn.textContent = STATE.current.statusName;
        // Определяем цвет: красный для отказа, зеленый для остальных
        const isRejection = isRejectionStatus(STATE.current.statusName);
        statusBtn.style.background = isRejection ? "#dc3545" : "#28a745";
      } else {
        statusBtn.style.display = "none";
      }
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
  if (obj.statusName != null) STATE.current.statusName = obj.statusName;
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

  try {
    const result = await new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(
          {
            type: "HRHELPER_API",
            payload: { path, method, body },
          },
          (response) => {
            // Проверяем ошибку chrome.runtime.lastError
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            resolve(response);
          }
        );
      } catch (err) {
        reject(err);
      }
    });

    return {
      ok: !!result?.ok,
      status: result?.status ?? 0,
      json: async () => result?.json,
    };
  } catch (err) {
    // Extension context invalidated - возвращаем ошибку
    if (err.message && err.message.includes('Extension context invalidated')) {
      warn(' Extension context invalidated in apiFetch');
      return {
        ok: false,
        status: 0,
        json: async () => ({ 
          success: false, 
          message: 'Extension context invalidated. Please reload the page.' 
        }),
      };
    }
    // Другие ошибки
    logError(' Error in apiFetch:', err);
    return {
      ok: false,
      status: 0,
      json: async () => ({ 
        success: false, 
        message: err.message || 'Unknown error' 
      }),
    };
  }
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
    logError(' setLink error:', error);
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
      logError(' Error getting profile from messaging:', e);
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
  
  // Проверяем, есть ли в кэше vacancy_name и status_name
  // Если их нет, делаем принудительное обновление
  if (cached && cached.exists && cached.app_url) {
    const hasVacancyOrStatus = cached.vacancy_name !== undefined || cached.status_name !== undefined;
    if (!hasVacancyOrStatus && !shouldForceRefresh) {
      log(' Cached data missing vacancy_name or status_name, forcing refresh');
      shouldForceRefresh = true;
    }
  }
  
  if (cached && cached.exists !== undefined && !shouldForceRefresh) {
    log(' Using cached status for instant display');
    STATE.current.show = true;
    if (cached.exists && cached.app_url) {
      STATE.current.mode = "open";
      STATE.current.appUrl = cached.app_url;
      STATE.current.disabled = false;
      // Формируем текст кнопки: "Huntflow | Название вакансии" (без статуса)
      let buttonText = "Huntflow";
      if (cached.vacancy_name) {
        buttonText = `Huntflow | ${cached.vacancy_name}`;
      }
      setButtonState({ text: buttonText, disabled: false, title: "Открыть в Huntflow", color: "#0a66c2", statusName: cached.status_name });
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
  log(' Status fields:', { 
    vacancy_name: status?.vacancy_name, 
    status_name: status?.status_name,
    exists: status?.exists,
    app_url: status?.app_url 
  });
  
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
    
    // Формируем текст кнопки: "Huntflow | Название вакансии" (без статуса)
    let buttonText = "Huntflow";
    if (status.vacancy_name) {
      buttonText = `Huntflow | ${status.vacancy_name}`;
    }
    
    log(' Button text:', buttonText);
    setButtonState({ text: buttonText, disabled: false, title: "Открыть в Huntflow", color: "#0a66c2", statusName: status.status_name });
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
      logError(' Error getting profile from messaging:', e);
    }
  }

  if (!canonical) {
    logError(' No canonical URL found');
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
    log(' setLink fields:', { 
      vacancy_name: saved?.vacancy_name, 
      status_name: saved?.status_name,
      app_url: saved?.app_url 
    });
    
    if (saved?.error) {
      logError(' Save error:', saved.error);
      STATE.current.title = saved.error;
      STATE.current.disabled = false;
      applyStateToAllButtons();
      return;
    }
    
    if (!saved || (!saved.app_url && !saved.target_url)) {
      logError(' Save failed: no URL in response', saved);
      STATE.current.title = "Ошибка сохранения: нет ссылки в ответе";
      STATE.current.disabled = false;
      applyStateToAllButtons();
      return;
    }
    
    const finalUrl = saved.app_url || saved.target_url;
    log(' Saved! Final URL:', finalUrl);
    
    // Сохраняем маппинг thread_id -> profile_url, если мы на странице профиля
    if (IS_PROFILE_PAGE && canonical) {
      log(' onSaveLinkClick: attempting to save thread mapping for profile page');
      const saveThreadMapping = (threadId) => {
        if (!threadId) {
          log(' saveThreadMapping: threadId is empty');
          return false;
        }
        
        log(' Saving thread mapping after link save:', threadId.substring(0, 10) + '... -> ' + canonical);
        try {
          const mapping = JSON.parse(localStorage.getItem('hrhelper_thread_profile_map') || '{}');
          mapping[threadId] = canonical;
          localStorage.setItem('hrhelper_thread_profile_map', JSON.stringify(mapping));
          saveThreadMappingToBackend(threadId, canonical);
          return true;
        } catch (e) {
          logError(' Error saving thread mapping after link save:', e);
          return false;
        }
      };
      
      // Пробуем найти thread_id сразу
      let threadId = extractThreadIdFromMessageButton();
      if (threadId) {
        saveThreadMapping(threadId);
      } else {
        log(' Thread ID not found immediately, will retry with delays');
        // Если thread_id не найден сразу, пробуем найти его через задержки
        // (кнопка Message может появиться позже при динамической загрузке)
        const delays = [500, 1000, 2000, 3000, 5000];
        delays.forEach(delay => {
          setTimeout(() => {
            const delayedThreadId = extractThreadIdFromMessageButton();
            if (delayedThreadId) {
              log(' Found thread_id after delay, saving mapping:', delayedThreadId.substring(0, 10) + '... -> ' + canonical);
              saveThreadMapping(delayedThreadId);
            }
          }, delay);
        });
      }
    }
    
    STATE.current.mode = "open";
    STATE.current.appUrl = finalUrl;
    STATE.current.title = "Открыть в Huntflow";
    STATE.current.disabled = false;
    
    // Обновляем текст кнопки с названием вакансии (без статуса)
    let buttonText = "Huntflow";
    if (saved.vacancy_name) {
      buttonText = `Huntflow | ${saved.vacancy_name}`;
    }
    log(' Button text after save:', buttonText);
    setButtonState({ text: buttonText, disabled: false, title: "Открыть в Huntflow", color: "#0a66c2", statusName: saved.status_name });
    
    // Сбрасываем счетчик API вызовов для этого профиля, чтобы можно было обновить статус
    STATE.apiCallsThisProfile = 0;
    STATE.statusFetchedFor = null;
    
    applyStateToAllButtons();
  } catch (e) {
    logError(' Exception in onSaveLinkClick:', e);
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
      logError(' Error getting profile from messaging:', e);
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
    logError(' Failed to copy URL:', err);
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
      logError(' Fallback copy also failed:', fallbackErr);
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
      logError(' Error getting profile from messaging:', e);
    }
  }
  
  if (!canonical) {
    logError(' No canonical URL found');
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
    logError(' Error loading status options:', err);
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
      logError(' Failed to update status:', data?.message || 'Unknown error');
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
      
      // Обновление кнопки статуса произойдет автоматически через refreshButtonForCurrentProfile
    } else {
      logError(' Status update failed:', data);
      alert('Не удалось обновить статус');
    }
  } catch (err) {
    logError(' Exception updating status:', err);
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
  
  // Для messaging страницы также периодически проверяем URL и сохраняем маппинг
  if (IS_MESSAGING_PAGE) {
    // Функция для сохранения маппинга thread_id -> profile_url
    const saveThreadMappingIfFound = async () => {
      try {
        const currentUrl = location.href;
        const threadMatch = currentUrl.match(/thread\/([^/?]+)/);
        if (!threadMatch) return;
        
        const threadId = threadMatch[1];
        
        // Ищем профиль в DOM
        const profileLinks = Array.from(document.querySelectorAll('a[href*="/in/"]'));
        for (const link of profileLinks) {
          if (link.href.includes('/me/') || link.href.includes('/jobs/')) continue;
          const normalized = normalizeLinkedInProfileUrl(link.href);
          if (normalized) {
            // Проверяем, есть ли уже маппинг
            const mapping = JSON.parse(localStorage.getItem('hrhelper_thread_profile_map') || '{}');
            if (mapping[threadId] !== normalized) {
              // Сохраняем новый маппинг
              mapping[threadId] = normalized;
              localStorage.setItem('hrhelper_thread_profile_map', JSON.stringify(mapping));
              log(' Saved thread mapping from messaging page:', threadId.substring(0, 10) + '... -> ' + normalized);
              
              // Сохраняем на backend
              saveThreadMappingToBackend(threadId, normalized);
            }
            break;
          }
        }
      } catch (e) {
        warn(' Error saving thread mapping from messaging page:', e);
      }
    };
    
    // Вызываем сразу и периодически
    saveThreadMappingIfFound();
    setInterval(saveThreadMappingIfFound, 5000); // Каждые 5 секунд
    
    setInterval(() => {
      if (location.href !== currentUrl) {
        log(' URL changed (interval check)');
        currentUrl = location.href;
        STATE.messagingProfileCache = null; // Сбрасываем кэш при смене тредса
        schedule();
        saveThreadMappingIfFound(); // Сохраняем маппинг для нового тредса
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

// Функция для работы с Google Calendar
function initGoogleCalendar() {
  if (!IS_GOOGLE_CALENDAR) return;
  
  log(' Google Calendar detected, initializing...');
  log(' Current URL:', location.href);
  
  // Функция для поиска и обработки текста "Для интервьюеров:"
  function processInterviewerLinks() {
    log(' Processing interviewer links...');
    
    // Ищем все элементы, содержащие текст "Для интервьюеров:"
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let textNode;
    const interviewerNodes = [];
    
    while (textNode = walker.nextNode()) {
      if (textNode.textContent && textNode.textContent.includes('Для интервьюеров:')) {
        interviewerNodes.push(textNode);
      }
    }
    
    log(` Found ${interviewerNodes.length} text nodes with "Для интервьюеров:"`);
    
    // Также ищем через поиск по всему документу
    const allText = document.body.innerText || document.body.textContent || '';
    if (allText.includes('Для интервьюеров:')) {
      log(' Text "Для интервьюеров:" found in document body');
    } else {
      log(' Text "Для интервьюеров:" NOT found in document body');
    }
    
    // Ищем все ссылки на Huntflow
    const allLinks = Array.from(document.querySelectorAll('a[href*="huntflow"]'));
    log(` Found ${allLinks.length} links containing "huntflow"`);
    allLinks.forEach((link, idx) => {
      log(` Link ${idx + 1}: ${link.href}`);
    });
    
    // Обрабатываем каждый найденный узел
    interviewerNodes.forEach((textNode, idx) => {
      log(` Processing text node ${idx + 1}`);
      const parent = textNode.parentElement;
      if (!parent) {
        log('  No parent element');
        return;
      }
      
      // Проверяем, не обработали ли мы уже этот элемент
      if (parent.dataset.hrhelperProcessed === 'true') {
        log('  Already processed');
        return;
      }
      parent.dataset.hrhelperProcessed = 'true';
      
      // Ищем ссылку на Huntflow в том же контейнере или рядом
      let container = parent;
      let huntflowLink = null;
      
      // Функция для извлечения реального URL из Google redirect
      function extractRealUrl(url) {
        if (!url) return null;
        try {
          // Если это Google redirect URL
          if (url.includes('google.com/url') && url.includes('q=')) {
            const urlObj = new URL(url);
            const realUrl = urlObj.searchParams.get('q');
            if (realUrl) {
              return decodeURIComponent(realUrl);
            }
          }
          return url;
        } catch (e) {
          return url;
        }
      }
      
      // Функция для проверки, является ли ссылка ссылкой на Huntflow
      function isHuntflowLink(link) {
        if (!link || !link.href) return false;
        // Проверяем href
        const realUrl = extractRealUrl(link.href);
        if (realUrl && realUrl.includes('huntflow.ru')) {
          return true;
        }
        // Также проверяем текст ссылки (может содержать реальный URL)
        const linkText = link.textContent || link.innerText || '';
        if (linkText.includes('huntflow.ru')) {
          return true;
        }
        return false;
      }
      
      // Пробуем найти в родительских элементах
      for (let i = 0; i < 10 && container; i++) {
        // Ищем все ссылки и проверяем каждую
        const allLinks = Array.from(container.querySelectorAll('a'));
        huntflowLink = allLinks.find(isHuntflowLink);
        if (huntflowLink) {
          log(`  Found Huntflow link in container level ${i}`);
          break;
        }
        container = container.parentElement;
      }
      
      // Если не нашли в контейнере, ищем во всем документе
      if (!huntflowLink) {
        const allLinks = Array.from(document.querySelectorAll('a'));
        huntflowLink = allLinks.find(isHuntflowLink);
        if (huntflowLink) {
          log('  Found Huntflow link in document');
        }
      }
      
      if (!huntflowLink) {
        log('  No Huntflow link found');
        return;
      }
      
      // Извлекаем реальный URL (может быть в Google redirect)
      let huntflowUrl = extractRealUrl(huntflowLink.href);
      log('  Found Huntflow link (original):', huntflowLink.href);
      log('  Found Huntflow link (extracted):', huntflowUrl);
      
      // Извлекаем данные из URL (используем реальный URL, если был Google redirect)
      const ids = extractHuntflowIds(huntflowUrl);
      log('  Extracted IDs:', ids);
      if (!ids.account_name || !ids.applicant_id) {
        log('  Could not extract IDs from Huntflow URL');
        return;
      }
      
      // Используем реальный URL для API запроса
      const realHuntflowUrl = huntflowUrl;
      
      // Определяем контейнер для вставки кнопки (родитель ссылки)
      const buttonContainer = huntflowLink.parentElement;
      if (!buttonContainer) {
        log('  No container for button');
        return;
      }
      
      // Проверяем, есть ли уже кнопка рядом с этой ссылкой
      const existingButton = buttonContainer.querySelector('.hrhelper-communication-btn');
      if (existingButton) {
        log('  Button already exists');
        return;
      }
      
      log('  Creating button...');
      
      // Создаем кнопку-заглушку
      const button = document.createElement('a');
      button.className = 'hrhelper-communication-btn';
      button.textContent = 'Загрузка...';
      button.style.cssText = 'display:inline-block;margin-left:8px;padding:4px 8px;background:#0a66c2;color:#fff;text-decoration:none;border-radius:4px;font-size:12px;white-space:nowrap;';
      button.href = '#';
      button.onclick = (e) => { e.preventDefault(); return false; };
      
      // Вставляем кнопку сразу после ссылки на Huntflow
      // Пробуем вставить после ссылки, если есть nextSibling
      if (huntflowLink.nextSibling) {
        buttonContainer.insertBefore(button, huntflowLink.nextSibling);
      } else {
        // Если нет nextSibling, добавляем в конец контейнера
        buttonContainer.appendChild(button);
      }
      
      log('  Button inserted after Huntflow link');
      
      log('  Button created, fetching communication link...');
      
      // Получаем ссылку на коммуникацию через API (используем реальный URL)
      getCommunicationLink(realHuntflowUrl).then(linkData => {
        log('  Communication link response:', linkData);
        if (linkData && linkData.success && linkData.communication_link) {
          button.href = linkData.communication_link;
          button.target = '_blank';
          button.rel = 'noopener noreferrer';
          
          // Устанавливаем текст и иконку в зависимости от типа
          if (linkData.link_type === 'telegram') {
            button.textContent = '💬 Telegram';
            button.style.background = '#0088cc';
          } else if (linkData.link_type === 'linkedin') {
            button.textContent = '💼 LinkedIn';
            button.style.background = '#0a66c2';
          } else {
            button.textContent = '📧 Связаться';
            button.style.background = '#6c757d';
          }
          
          button.onclick = null; // Убираем preventDefault
          log('  Button updated successfully');
        } else {
          button.textContent = 'Ссылка не найдена';
          button.style.background = '#6c757d';
          button.style.cursor = 'not-allowed';
          log('  Communication link not found');
        }
      }).catch(err => {
        // Не логируем ошибку, если это Extension context invalidated - это нормально при перезагрузке расширения
        if (err.message && !err.message.includes('Extension context invalidated')) {
          logError('  Error getting communication link:', err);
        }
        button.textContent = 'Ошибка';
        button.style.background = '#dc3545';
      });
    });
  }
  
  // Функция для извлечения данных из Huntflow URL
  function extractHuntflowIds(url) {
    const result = { account_name: null, applicant_id: null, vacancy_id: null };
    
    // Формат 1: /my/{account}#/applicants/filter/all/{applicant_id}
    const m1 = url.match(/\/my\/([^/#]+)#\/applicants\/filter\/[^/]+\/(\d+)/);
    if (m1) {
      result.account_name = m1[1];
      result.applicant_id = parseInt(m1[2]);
      return result;
    }
    
    // Формат 2: /my/{account}#/vacancy/{vacancy_id}/filter/{status}/id/{applicant_id}
    const m2 = url.match(/\/my\/([^/#]+)#\/vacancy\/(\d+)\/filter\/[^/]+\/id\/(\d+)/);
    if (m2) {
      result.account_name = m2[1];
      result.vacancy_id = parseInt(m2[2]);
      result.applicant_id = parseInt(m2[3]);
      return result;
    }
    
    return result;
  }
  
  // Функция для получения ссылки на коммуникацию через API
  async function getCommunicationLink(huntflowUrl) {
    try {
      const config = await getConfig();
      const qp = new URLSearchParams({ huntflow_url: huntflowUrl });
      const res = await apiFetch(`/api/v1/huntflow/linkedin-applicants/communication-link/?${qp.toString()}`, {
        method: "GET"
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        // Не логируем ошибку, если это Extension context invalidated - это нормально при перезагрузке расширения
        if (data?.message && !data.message.includes('Extension context invalidated')) {
          logError(' Failed to get communication link:', data.message || 'Unknown error');
        }
        return null;
      }
      
      const data = await res.json().catch(() => null);
      return data;
    } catch (err) {
      // Не логируем ошибку, если это Extension context invalidated - это нормально при перезагрузке расширения
      if (err.message && !err.message.includes('Extension context invalidated')) {
        logError(' Exception getting communication link:', err);
      }
      return null;
    }
  }
  
  // Обрабатываем при загрузке с задержкой (Google Calendar загружается динамически)
  setTimeout(() => {
    log(' Initial processing after delay...');
    processInterviewerLinks();
  }, 1000);
  
  // Также обрабатываем сразу
  processInterviewerLinks();
  
  // Наблюдаем за изменениями DOM с debounce
  let processTimeout = null;
  const observer = new MutationObserver(() => {
    if (processTimeout) clearTimeout(processTimeout);
    processTimeout = setTimeout(() => {
      processInterviewerLinks();
    }, 500);
  });
  
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    log(' MutationObserver started');
  } else {
    log(' document.body not ready, waiting...');
    setTimeout(() => {
      if (document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        log(' MutationObserver started (delayed)');
      }
    }, 1000);
  }
}

// Функция для работы с Google Meet (аналогична Google Calendar)
function initGoogleMeet() {
  if (!IS_GOOGLE_MEET) return;
  
  log(' Google Meet detected, initializing...');
  log(' Current URL:', location.href);
  
  // Функция для получения ссылки на Scorecard через API
  async function getScorecardLink(huntflowUrl) {
    try {
      const config = await getConfig();
      const qp = new URLSearchParams({ huntflow_url: huntflowUrl });
      const res = await apiFetch(`/api/v1/huntflow/linkedin-applicants/scorecard-link/?${qp.toString()}`, {
        method: "GET"
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        // Не логируем ошибку, если это Extension context invalidated - это нормально при перезагрузке расширения
        if (data?.message && !data.message.includes('Extension context invalidated')) {
          log(' Failed to get scorecard link:', data.message || 'Unknown error');
        }
        return null;
      }
      
      const data = await res.json().catch(() => null);
      return data;
    } catch (err) {
      // Не логируем ошибку, если это Extension context invalidated - это нормально при перезагрузке расширения
      if (err.message && !err.message.includes('Extension context invalidated')) {
        logError(' Exception getting scorecard link:', err);
      }
      return null;
    }
  }
  
  // Функция для поиска и обработки текста "Для интервьюеров:"
  function processInterviewerLinks() {
    log(' Processing interviewer links...');
    
    // Ищем все элементы, содержащие текст "Для интервьюеров:"
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let textNode;
    const interviewerNodes = [];
    
    while (textNode = walker.nextNode()) {
      if (textNode.textContent && textNode.textContent.includes('Для интервьюеров:')) {
        interviewerNodes.push(textNode);
      }
    }
    
    log(` Found ${interviewerNodes.length} text nodes with "Для интервьюеров:"`);
    
    // Также ищем через поиск по всему документу
    const allText = document.body.innerText || document.body.textContent || '';
    if (allText.includes('Для интервьюеров:')) {
      log(' Text "Для интервьюеров:" found in document body');
    } else {
      log(' Text "Для интервьюеров:" NOT found in document body');
    }
    
    // Ищем все ссылки на Huntflow
    const allLinks = Array.from(document.querySelectorAll('a[href*="huntflow"]'));
    log(` Found ${allLinks.length} links containing "huntflow"`);
    allLinks.forEach((link, idx) => {
      log(` Link ${idx + 1}: ${link.href}`);
    });
    
    // Обрабатываем каждый найденный узел
    interviewerNodes.forEach((textNode, idx) => {
      log(` Processing text node ${idx + 1}`);
      const parent = textNode.parentElement;
      if (!parent) {
        log('  No parent element');
        return;
      }
      
      // Проверяем, не обработали ли мы уже этот элемент
      if (parent.dataset.hrhelperProcessed === 'true') {
        log('  Already processed');
        return;
      }
      parent.dataset.hrhelperProcessed = 'true';
      
      // Ищем ссылку на Huntflow в том же контейнере или рядом
      let container = parent;
      let huntflowLink = null;
      
      // Функция для извлечения реального URL из Google redirect
      function extractRealUrl(url) {
        if (!url) return null;
        try {
          // Если это Google redirect URL
          if (url.includes('google.com/url') && url.includes('q=')) {
            const urlObj = new URL(url);
            const realUrl = urlObj.searchParams.get('q');
            if (realUrl) {
              return decodeURIComponent(realUrl);
            }
          }
          return url;
        } catch (e) {
          return url;
        }
      }
      
      // Функция для проверки, является ли ссылка ссылкой на Huntflow
      function isHuntflowLink(link) {
        if (!link || !link.href) return false;
        // Проверяем href
        const realUrl = extractRealUrl(link.href);
        if (realUrl && realUrl.includes('huntflow.ru')) {
          return true;
        }
        // Также проверяем текст ссылки (может содержать реальный URL)
        const linkText = link.textContent || link.innerText || '';
        if (linkText.includes('huntflow.ru')) {
          return true;
        }
        return false;
      }
      
      // Пробуем найти в родительских элементах
      for (let i = 0; i < 10 && container; i++) {
        // Ищем все ссылки и проверяем каждую
        const allLinks = Array.from(container.querySelectorAll('a'));
        huntflowLink = allLinks.find(isHuntflowLink);
        if (huntflowLink) {
          log(`  Found Huntflow link in container level ${i}`);
          break;
        }
        container = container.parentElement;
      }
      
      // Если не нашли в контейнере, ищем во всем документе
      if (!huntflowLink) {
        const allLinks = Array.from(document.querySelectorAll('a'));
        huntflowLink = allLinks.find(isHuntflowLink);
        if (huntflowLink) {
          log('  Found Huntflow link in document');
        }
      }
      
      // Если не нашли как ссылку, ищем как текст под "Для интервьюеров:"
      let huntflowUrl = null;
      if (!huntflowLink) {
        log('  No Huntflow link found as <a> tag, searching as text...');
        // Ищем текст, содержащий huntflow.ru или huntflow.dev
        const textWalker = document.createTreeWalker(
          container || document.body,
          NodeFilter.SHOW_TEXT,
          null
        );
        
        let textNodeForUrl;
        while (textNodeForUrl = textWalker.nextNode()) {
          const text = textNodeForUrl.textContent || '';
          // Ищем URL в тексте
          const urlMatch = text.match(/https?:\/\/[^\s]*huntflow\.(ru|dev)[^\s]*/i);
          if (urlMatch) {
            huntflowUrl = urlMatch[0];
            log('  Found Huntflow URL in text:', huntflowUrl);
            // Создаем виртуальную ссылку для дальнейшей обработки
            huntflowLink = {
              href: huntflowUrl,
              parentElement: textNodeForUrl.parentElement || container || document.body
            };
            break;
          }
        }
      }
      
      if (!huntflowLink && !huntflowUrl) {
        log('  No Huntflow link found');
        return;
      }
      
      // Извлекаем реальный URL (может быть в Google redirect или из текста)
      if (!huntflowUrl) {
        huntflowUrl = extractRealUrl(huntflowLink.href);
      }
      log('  Found Huntflow link (original):', huntflowLink?.href || huntflowUrl);
      log('  Found Huntflow link (extracted):', huntflowUrl);
      
      // Извлекаем данные из URL (используем реальный URL, если был Google redirect)
      const ids = extractHuntflowIds(huntflowUrl);
      log('  Extracted IDs:', ids);
      if (!ids.account_name || !ids.applicant_id) {
        log('  Could not extract IDs from Huntflow URL');
        return;
      }
      
      // Используем реальный URL для API запроса
      const realHuntflowUrl = huntflowUrl;
      
      // Определяем контейнер для вставки кнопок - под текстом "Для интервьюеров:"
      // Используем родительский элемент текста "Для интервьюеров:" как контейнер
      let buttonContainer = parent;
      
      // Ищем подходящий контейнер (div, p, span и т.д.) для размещения кнопок
      // Обычно это блок, содержащий текст "Для интервьюеров:" и ссылку
      for (let i = 0; i < 5 && buttonContainer; i++) {
        // Проверяем, является ли контейнер подходящим для размещения кнопок
        const computedStyle = window.getComputedStyle(buttonContainer);
        if (computedStyle.display !== 'none' && 
            (computedStyle.display === 'block' || 
             computedStyle.display === 'flex' || 
             computedStyle.display === 'inline-block')) {
          break;
        }
        buttonContainer = buttonContainer.parentElement;
      }
      
      if (!buttonContainer) {
        log('  No container for buttons');
        return;
      }
      
      // Проверяем, есть ли уже кнопки в этом контейнере
      const existingCommButton = buttonContainer.querySelector('.hrhelper-communication-btn');
      const existingScorecardButton = buttonContainer.querySelector('.hrhelper-scorecard-btn');
      const existingLevelButton = buttonContainer.querySelector('.hrhelper-meet-level-btn');
      if (existingCommButton && existingScorecardButton && existingLevelButton) {
        log('  All buttons already exist');
        return;
      }
      
      log('  Creating buttons container under "Для интервьюеров:"...');
      
      // Создаем контейнер для всех кнопок, если его еще нет
      let buttonsContainer = buttonContainer.querySelector('.hrhelper-buttons-container');
      if (!buttonsContainer) {
        buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'hrhelper-buttons-container';
        buttonsContainer.style.cssText = 'display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;align-items:center;';
        
        // Вставляем контейнер после текста "Для интервьюеров:" и ссылки
        // Ищем место для вставки - после текста или после ссылки
        if (huntflowLink && huntflowLink.nextSibling) {
          buttonContainer.insertBefore(buttonsContainer, huntflowLink.nextSibling);
        } else if (textNode && textNode.nextSibling) {
          buttonContainer.insertBefore(buttonsContainer, textNode.nextSibling);
        } else {
          buttonContainer.appendChild(buttonsContainer);
        }
        log('  Buttons container created');
      }
      
      // Создаем кнопку-заглушку для коммуникации
      let button = null;
      if (!existingCommButton) {
        button = document.createElement('a');
        button.className = 'hrhelper-communication-btn';
        button.setAttribute('data-hrhelper', 'social-button');
        button.textContent = 'Загрузка...';
        button.style.cssText = 'display:inline-block;padding:4px 8px;background:#0a66c2;color:#fff;text-decoration:none;border-radius:4px;font-size:12px;white-space:nowrap;';
        button.href = '#';
        button.onclick = (e) => { e.preventDefault(); return false; };
        
        buttonsContainer.appendChild(button);
        log('  Communication button inserted');
      } else {
        button = existingCommButton;
      }
      
      // Создаем кнопку-заглушку для Scorecard
      let scorecardButton = null;
      if (!existingScorecardButton) {
        scorecardButton = document.createElement('a');
        scorecardButton.className = 'hrhelper-scorecard-btn';
        scorecardButton.textContent = 'Загрузка...';
        scorecardButton.style.cssText = 'display:inline-block;padding:4px 8px;background:#6c757d;color:#fff;text-decoration:none;border-radius:4px;font-size:12px;white-space:nowrap;';
        scorecardButton.href = '#';
        scorecardButton.onclick = (e) => { e.preventDefault(); return false; };
        
        buttonsContainer.appendChild(scorecardButton);
        log('  Scorecard button inserted');
      } else {
        scorecardButton = existingScorecardButton;
      }
      
      log('  Buttons created, fetching links...');
      
      // Получаем ссылку на коммуникацию через API (используем реальный URL)
      if (!existingCommButton) {
        getCommunicationLink(realHuntflowUrl).then(linkData => {
          log('  Communication link response:', linkData);
          if (linkData && linkData.success && linkData.communication_link) {
            button.href = linkData.communication_link;
            button.target = '_blank';
            button.rel = 'noopener noreferrer';
            
            // Устанавливаем текст и иконку в зависимости от типа
            if (linkData.link_type === 'telegram') {
              button.textContent = '💬 Telegram';
              button.style.background = '#0088cc';
            } else if (linkData.link_type === 'linkedin') {
              button.textContent = '💼 LinkedIn';
              button.style.background = '#0a66c2';
            } else {
              button.textContent = '📧 Связаться';
              button.style.background = '#6c757d';
            }
            
            button.onclick = null; // Убираем preventDefault
            log('  Communication button updated successfully');
          } else {
            button.textContent = 'Ссылка не найдена';
            button.style.background = '#6c757d';
            button.style.cursor = 'not-allowed';
            log('  Communication link not found');
          }
        }).catch(err => {
          // Не логируем ошибку, если это Extension context invalidated - это нормально при перезагрузке расширения
          if (err.message && !err.message.includes('Extension context invalidated')) {
            logError('  Error getting communication link:', err);
          }
          button.textContent = 'Ошибка';
          button.style.background = '#dc3545';
        });
      }
      
      // Получаем ссылку на Scorecard через API
      if (!existingScorecardButton) {
        getScorecardLink(realHuntflowUrl).then(scorecardData => {
          log('  Scorecard link response:', scorecardData);
          if (scorecardData && scorecardData.success && scorecardData.scorecard_link) {
            scorecardButton.href = scorecardData.scorecard_link;
            scorecardButton.target = '_blank';
            scorecardButton.rel = 'noopener noreferrer';
            scorecardButton.textContent = '📊 Scorecard';
            scorecardButton.style.background = '#28a745';
            scorecardButton.onclick = null; // Убираем preventDefault
            log('  Scorecard button updated successfully');
          } else {
            scorecardButton.textContent = 'Scorecard не найден';
            scorecardButton.style.background = '#6c757d';
            scorecardButton.style.cursor = 'not-allowed';
            log('  Scorecard link not found');
          }
        }).catch(err => {
          // Не логируем ошибку, если это Extension context invalidated - это нормально при перезагрузке расширения
          if (err.message && !err.message.includes('Extension context invalidated')) {
            logError('  Error getting scorecard link:', err);
          }
          scorecardButton.textContent = 'Ошибка';
          scorecardButton.style.background = '#dc3545';
        });
      }
    });
  }
  
  // Функция для извлечения данных из Huntflow URL
  function extractHuntflowIds(url) {
    const result = { account_name: null, applicant_id: null, vacancy_id: null };
    
    // Формат 1: /my/{account}#/applicants/filter/all/{applicant_id}
    const m1 = url.match(/\/my\/([^/#]+)#\/applicants\/filter\/[^/]+\/(\d+)/);
    if (m1) {
      result.account_name = m1[1];
      result.applicant_id = parseInt(m1[2]);
      return result;
    }
    
    // Формат 2: /my/{account}#/vacancy/{vacancy_id}/filter/{status}/id/{applicant_id}
    const m2 = url.match(/\/my\/([^/#]+)#\/vacancy\/(\d+)\/filter\/[^/]+\/id\/(\d+)/);
    if (m2) {
      result.account_name = m2[1];
      result.vacancy_id = parseInt(m2[2]);
      result.applicant_id = parseInt(m2[3]);
      return result;
    }
    
    return result;
  }
  
  // Функция для получения ссылки на коммуникацию через API
  async function getCommunicationLink(huntflowUrl) {
    try {
      const config = await getConfig();
      const qp = new URLSearchParams({ huntflow_url: huntflowUrl });
      const res = await apiFetch(`/api/v1/huntflow/linkedin-applicants/communication-link/?${qp.toString()}`, {
        method: "GET"
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        // Не логируем ошибку, если это Extension context invalidated - это нормально при перезагрузке расширения
        if (data?.message && !data.message.includes('Extension context invalidated')) {
          logError(' Failed to get communication link:', data.message || 'Unknown error');
        }
        return null;
      }
      
      const data = await res.json().catch(() => null);
      return data;
    } catch (err) {
      // Не логируем ошибку, если это Extension context invalidated - это нормально при перезагрузке расширения
      if (err.message && !err.message.includes('Extension context invalidated')) {
        logError(' Exception getting communication link:', err);
      }
      return null;
    }
  }
  
  // Функция для получения уровня кандидата через API
  async function getCandidateLevel(huntflowUrl) {
    try {
      log(' Getting candidate level for URL:', huntflowUrl);
      const config = await getConfig();
      const qp = new URLSearchParams({ huntflow_url: huntflowUrl });
      const apiUrl = `/api/v1/huntflow/linkedin-applicants/candidate-level/?${qp.toString()}`;
      log(' API URL:', apiUrl);
      
      const res = await apiFetch(apiUrl, {
        method: "GET"
      });
      
      log(' API response status:', res.status, res.ok);
      
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        logError(' Failed to get candidate level:', data?.message || `HTTP ${res.status}`);
        return { success: false, message: data?.message || `HTTP ${res.status}` };
      }
      
      const data = await res.json().catch(() => null);
      log(' API response data:', data);
      return data;
    } catch (err) {
      logError(' Exception getting candidate level:', err);
      return { success: false, message: err.message || 'Unknown error' };
    }
  }
  
  // Функция для поиска кнопок на странице Google Meet и добавления кнопки уровня
  function addLevelButtonToMeetControls() {
    try {
      log(' ===== addLevelButtonToMeetControls START =====');
      log(' Current URL:', location.href);
      log(' Available buttons on page:', document.querySelectorAll('button').length);
      
      // Проверяем, не добавили ли мы уже кнопку
      const existingLevelBtn = document.querySelector('.hrhelper-meet-level-btn');
      if (existingLevelBtn) {
        log(' Level button already exists');
        return true; // Успешно - кнопка уже есть
      }
      
      // Ищем панель с кнопками управления (обычно это нижняя панель)
      // Пробуем разные подходы для поиска контейнера с кнопками
      let buttonContainer = null;
      let infoButton = null;
      
      // Способ 0: Ищем рядом с уже созданной кнопкой соцсети (если она есть)
      const socialButton = document.querySelector('[data-hrhelper="social-button"], .hrhelper-communication-btn');
      if (socialButton) {
        log(' ✅ Found social button, looking for Meet controls nearby...');
        log(' Social button:', socialButton);
        log(' Social button parent:', socialButton.parentElement);
        
        // Ищем контейнер с кнопками управления рядом
        let container = socialButton.parentElement;
        let foundContainer = false;
        
        for (let i = 0; i < 10 && container; i++) {
          const buttons = Array.from(container.querySelectorAll('button'));
          log(` Checking container level ${i}, found ${buttons.length} buttons`);
          
          if (buttons.length >= 2) {
            const rect = container.getBoundingClientRect();
            const isBottom = rect.bottom > window.innerHeight * 0.5;
            const isVisible = rect.width > 0 && rect.height > 0;
            
            log(` Container at level ${i}: bottom=${rect.bottom.toFixed(0)}, visible=${isVisible}, buttons=${buttons.length}`);
            
            if (isBottom && isVisible) {
              log(` ✅ Found container with ${buttons.length} buttons near social button`);
              buttonContainer = container;
              
              // Ищем кнопку инфо
              infoButton = buttons.find(btn => {
                const label = (btn.getAttribute('aria-label') || '').toLowerCase();
                const tooltip = (btn.getAttribute('data-tooltip') || '').toLowerCase();
                return label.includes('info') || label.includes('инфо') || 
                       label.includes('details') || label.includes('детали') ||
                       tooltip.includes('info') || tooltip.includes('инфо');
              });
              
              if (!infoButton && buttons.length > 0) {
                infoButton = buttons[0];
                log(' Using first button as info button');
              }
              
              if (buttonContainer && infoButton) {
                foundContainer = true;
                break;
              }
            }
          }
          container = container.parentElement;
        }
        
        if (foundContainer) {
          log(' ✅ Successfully found Meet controls using social button method');
        } else {
          log(' ⚠️ Could not find Meet controls near social button, will try other methods');
        }
      } else {
        log(' Social button not found, will search using other methods');
      }
      
      // Ищем панель с кнопками управления (обычно это нижняя панель)
      // Пробуем разные подходы для поиска контейнера с кнопками
      if (!buttonContainer || !infoButton) {
        // Способ 1: Ищем контейнер с кнопками по общим селекторам
        log(' Trying method 1: searching by container selectors...');
      const containerSelectors = [
        '[role="toolbar"]',
        'div[data-view-name="meeting-controls"]',
        '.VfPpkd-Bz112c',
        '[jsname="BOHaEe"]',
        'div[aria-label*="meeting"]',
        'div[aria-label*="встреча"]',
      ];
      
      for (const selector of containerSelectors) {
        const containers = Array.from(document.querySelectorAll(selector));
        for (const container of containers) {
          const buttons = Array.from(container.querySelectorAll('button'));
          if (buttons.length >= 2) {
            buttonContainer = container;
            // Ищем кнопку инфо
            for (const btn of buttons) {
              const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
              const tooltip = (btn.getAttribute('data-tooltip') || '').toLowerCase();
              const jsname = (btn.getAttribute('jsname') || '').toLowerCase();
              if (ariaLabel.includes('info') || ariaLabel.includes('инфо') || 
                  tooltip.includes('info') || tooltip.includes('инфо') ||
                  jsname.includes('info')) {
                infoButton = btn;
                log(` Found info button in container (${buttons.length} buttons)`);
                break;
              }
            }
            // Если не нашли кнопку инфо, берем первую кнопку
            if (!infoButton && buttons.length > 0) {
              infoButton = buttons[0];
              log(` Using first button as reference (${buttons.length} buttons)`);
            }
            if (buttonContainer && infoButton) break;
          }
        }
        if (buttonContainer && infoButton) break;
      }
      
      // Способ 2: Если не нашли, ищем кнопку инфо напрямую
      if (!infoButton || !buttonContainer) {
        log(' Trying method 2: searching for info button directly...');
        const infoSelectors = [
          '[data-tooltip*="Info" i]',
          '[data-tooltip*="инфо" i]',
          '[aria-label*="Info" i]',
          '[aria-label*="инфо" i]',
          'button[jsname*="info" i]',
          'button[aria-label*="Meeting details" i]',
          'button[aria-label*="Детали встречи" i]',
        ];
        
        for (const selector of infoSelectors) {
          try {
            const buttons = Array.from(document.querySelectorAll(selector));
            if (buttons.length > 0) {
              infoButton = buttons[0];
              buttonContainer = infoButton.parentElement;
              log(` Found info button directly with selector: ${selector}`);
              break;
            }
          } catch (e) {
            // Игнорируем ошибки селекторов
          }
        }
      }
      
      // Способ 3: Ищем любую панель с кнопками внизу экрана
      if (!infoButton || !buttonContainer) {
        log(' Trying method 3: searching for bottom toolbar...');
        // Ищем все контейнеры с кнопками
        const allContainers = Array.from(document.querySelectorAll('div, section, nav'));
        log(` Checking ${allContainers.length} containers for buttons...`);
        
        for (const container of allContainers) {
          const buttons = Array.from(container.querySelectorAll('button'));
          if (buttons.length >= 2) {
            // Проверяем, находится ли контейнер внизу экрана
            const rect = container.getBoundingClientRect();
            const isBottom = rect.bottom > window.innerHeight * 0.6;
            const isVisible = rect.width > 0 && rect.height > 0;
            
            if (isBottom && isVisible) {
              buttonContainer = container;
              // Пробуем найти кнопку инфо среди кнопок
              for (const btn of buttons) {
                const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
                const tooltip = (btn.getAttribute('data-tooltip') || '').toLowerCase();
                if (ariaLabel.includes('info') || ariaLabel.includes('инфо') || 
                    tooltip.includes('info') || tooltip.includes('инфо') ||
                    ariaLabel.includes('details') || ariaLabel.includes('детали')) {
                  infoButton = btn;
                  log(` Found info button in bottom toolbar (${buttons.length} buttons)`);
                  break;
                }
              }
              // Если не нашли инфо, берем первую кнопку
              if (!infoButton && buttons.length > 0) {
                infoButton = buttons[0];
                log(` Using first button from bottom toolbar (${buttons.length} buttons)`);
              }
              if (buttonContainer && infoButton) break;
            }
          }
        }
      }
      
      // Способ 4: Ищем любые кнопки внизу экрана (последняя попытка)
      if (!infoButton || !buttonContainer) {
        log(' Trying method 4: finding any buttons at bottom of screen...');
        const allButtons = Array.from(document.querySelectorAll('button'));
        const buttonsAtBottom = allButtons.filter(btn => {
          const rect = btn.getBoundingClientRect();
          return rect.bottom > window.innerHeight * 0.7 && 
                 rect.width > 0 && 
                 rect.height > 0 &&
                 rect.top < window.innerHeight;
        });
        
        if (buttonsAtBottom.length >= 2) {
          log(` Found ${buttonsAtBottom.length} buttons at bottom of screen`);
          buttonContainer = buttonsAtBottom[0].parentElement;
          // Ищем кнопку инфо
          for (const btn of buttonsAtBottom) {
            const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
            const tooltip = (btn.getAttribute('data-tooltip') || '').toLowerCase();
            if (ariaLabel.includes('info') || ariaLabel.includes('инфо') || 
                tooltip.includes('info') || tooltip.includes('инфо')) {
              infoButton = btn;
              log(' Found info button at bottom of screen');
              break;
            }
          }
          // Если не нашли, берем первую кнопку
          if (!infoButton && buttonsAtBottom.length > 0) {
            infoButton = buttonsAtBottom[0];
            log(' Using first button at bottom of screen');
          }
        }
      }
      } // Закрываем блок if (!buttonContainer || !infoButton)
      
      if (!infoButton || !buttonContainer) {
        log(' ❌ Info button or container not found after all methods');
        log(' Available buttons on page:', document.querySelectorAll('button').length);
        // Логируем все кнопки для отладки
        const allButtons = Array.from(document.querySelectorAll('button'));
        log(' Sample button attributes (first 10):', allButtons.slice(0, 10).map(btn => {
          const rect = btn.getBoundingClientRect();
          return {
            ariaLabel: btn.getAttribute('aria-label'),
            tooltip: btn.getAttribute('data-tooltip'),
            jsname: btn.getAttribute('jsname'),
            className: btn.className?.substring(0, 50),
            position: `bottom: ${rect.bottom.toFixed(0)}, top: ${rect.top.toFixed(0)}`,
            visible: rect.width > 0 && rect.height > 0
          };
        }));
        
        // Пробуем найти любую кнопку внизу экрана и использовать её родителя
        const buttonsAtBottom = allButtons.filter(btn => {
          const rect = btn.getBoundingClientRect();
          return rect.bottom > window.innerHeight * 0.8 && 
                 rect.width > 20 && 
                 rect.height > 20 &&
                 rect.top < window.innerHeight;
        }).sort((a, b) => {
          const rectA = a.getBoundingClientRect();
          const rectB = b.getBoundingClientRect();
          return rectB.bottom - rectA.bottom; // Сортируем по позиции снизу
        });
        
        if (buttonsAtBottom.length > 0) {
          log(` Found ${buttonsAtBottom.length} buttons at bottom, using first one's container`);
          infoButton = buttonsAtBottom[0];
          buttonContainer = infoButton.parentElement;
          log(' Using fallback: first bottom button container');
        } else {
          log(' ===== addLevelButtonToMeetControls FAILED =====');
          return false; // Не удалось найти кнопки
        }
      }
      
      log(' ✅ Found button container and info button!');
      log(' Container:', buttonContainer);
      log(' Info button:', infoButton);
    
      log(' Creating level button...');
      
      // Сначала проверяем, есть ли контейнер для кнопок под "Для интервьюеров:"
      let targetContainer = document.querySelector('.hrhelper-buttons-container');
      if (targetContainer) {
        log(' ✅ Found existing buttons container under "Для интервьюеров:", will place level button there');
        buttonContainer = targetContainer;
      } else {
        log(' No buttons container found, will place level button next to info button');
      }
      
      // Создаем кнопку уровня
      const levelButton = document.createElement('button');
      levelButton.className = 'hrhelper-meet-level-btn';
      levelButton.textContent = 'Загрузка...';
      levelButton.style.cssText = 'display:inline-flex!important;align-items:center!important;justify-content:center!important;padding:6px 12px!important;background:#6c757d!important;color:#fff!important;border:none!important;border-radius:4px!important;font-size:13px!important;font-weight:500!important;cursor:pointer!important;margin-left:8px!important;min-width:60px!important;z-index:99999!important;position:relative!important;visibility:visible!important;opacity:1!important;';
      levelButton.title = 'Уровень кандидата';
      levelButton.setAttribute('data-hrhelper', 'level-button');
      levelButton.setAttribute('aria-label', 'Уровень кандидата');
      
      log(' Level button created:', levelButton);
      
      // Ищем название встречи (meeting title)
      // Обычно это элемент с текстом названия встречи в верхней части экрана
      let meetingTitleElement = null;
      
      // Пробуем разные селекторы для названия встречи
      const titleSelectors = [
        '[data-meeting-title]',
        '[aria-label*="meeting"]',
        '[aria-label*="встреча"]',
        'div[role="heading"]',
        'h1',
        'h2',
        '.meeting-title',
        '[jsname*="title"]',
      ];
      
      for (const selector of titleSelectors) {
        try {
          const elements = Array.from(document.querySelectorAll(selector));
          for (const el of elements) {
            const text = (el.textContent || '').trim();
            // Название встречи обычно не пустое и не слишком длинное
            if (text && text.length > 0 && text.length < 200 && 
                !text.includes('Google Meet') && !text.includes('meet.google.com')) {
              const rect = el.getBoundingClientRect();
              // Название обычно в верхней части экрана
              if (rect.top < window.innerHeight * 0.3 && rect.width > 0 && rect.height > 0) {
                meetingTitleElement = el;
                log(` ✅ Found meeting title with selector: ${selector}`, text);
                break;
              }
            }
          }
          if (meetingTitleElement) break;
        } catch (e) {
          // Игнорируем ошибки селекторов
        }
      }
      
      // Если не нашли по селекторам, ищем текстовые элементы в верхней части
      if (!meetingTitleElement) {
        const allElements = Array.from(document.querySelectorAll('div, span, p, h1, h2, h3'));
        for (const el of allElements) {
          const text = (el.textContent || '').trim();
          if (text && text.length > 0 && text.length < 200) {
            const rect = el.getBoundingClientRect();
            // Ищем в верхней части экрана
            if (rect.top < window.innerHeight * 0.2 && 
                rect.width > 50 && rect.height > 10 &&
                rect.left < window.innerWidth * 0.5) {
              meetingTitleElement = el;
              log(' ✅ Found meeting title by position:', text);
              break;
            }
          }
        }
      }
      
      // Вставляем кнопку в контейнер под "Для интервьюеров:" (если он существует)
      let inserted = false;
      if (targetContainer) {
        try {
          // Вставляем в контейнер кнопок под "Для интервьюеров:"
          targetContainer.appendChild(levelButton);
          log(' ✅ Level button inserted into buttons container under "Для интервьюеров:"');
          inserted = true;
        } catch (e) {
          log(' ⚠️ Failed to insert into buttons container:', e);
        }
      }
      
      // Если контейнера нет, пробуем вставить после названия встречи
      if (!inserted && meetingTitleElement) {
        try {
          // Ищем родительский контейнер названия
          let container = meetingTitleElement.parentElement;
          if (container) {
            // Вставляем после элемента с названием
            if (meetingTitleElement.nextSibling) {
              container.insertBefore(levelButton, meetingTitleElement.nextSibling);
            } else {
              container.appendChild(levelButton);
            }
            log(' ✅ Level button inserted after meeting title');
            inserted = true;
          }
        } catch (e) {
          log(' ⚠️ Failed to insert after meeting title:', e);
        }
      }
      
      // Если не удалось вставить после названия, пробуем вставить в контейнер кнопок управления
      // ВАЖНО: вставляем сразу ПОСЛЕ кнопки информации
      if (!inserted) {
        try {
          if (buttonContainer && infoButton && infoButton.parentNode === buttonContainer) {
            // Вставляем сразу после кнопки информации
            if (infoButton.nextSibling) {
              buttonContainer.insertBefore(levelButton, infoButton.nextSibling);
            } else {
              buttonContainer.appendChild(levelButton);
            }
            log(' ✅ Level button inserted after info button');
            inserted = true;
          } else if (buttonContainer) {
            buttonContainer.appendChild(levelButton);
            log(' ✅ Level button appended to container (fallback)');
            inserted = true;
          }
        } catch (e) {
          log(' ⚠️ Failed to insert in button container:', e);
        }
      }
      
      // Если все еще не удалось, пробуем вставить в body
      if (!inserted) {
        try {
          document.body.appendChild(levelButton);
          levelButton.style.position = 'fixed';
          levelButton.style.top = '20px';
          levelButton.style.right = '20px';
          levelButton.style.zIndex = '99999';
          log(' ✅ Level button inserted in body as fallback (fixed position)');
          inserted = true;
        } catch (e2) {
          logError(' ❌ Failed to insert level button even in body:', e2);
          return false;
        }
      }
      
      if (!inserted) {
        logError(' ❌ Could not insert level button anywhere!');
        return false;
      }
      
      // Проверяем, что кнопка действительно в DOM
      if (!document.contains(levelButton)) {
        logError(' ❌ Level button was not inserted into DOM!');
        return false;
      }
      
      log(' ✅ Level button successfully inserted into DOM');
      log(' Level button parent:', levelButton.parentElement);
      log(' Level button computed style display:', window.getComputedStyle(levelButton).display);
      log(' Level button offsetParent:', levelButton.offsetParent);
      const rect = levelButton.getBoundingClientRect();
      log(' Level button getBoundingClientRect:', { 
        top: rect.top, 
        left: rect.left, 
        bottom: rect.bottom, 
        right: rect.right, 
        width: rect.width, 
        height: rect.height,
        visible: rect.width > 0 && rect.height > 0
      });
      
      // Проверяем видимость кнопки
      const isVisible = rect.width > 0 && rect.height > 0 && 
                        rect.top >= 0 && rect.left >= 0 &&
                        rect.top < window.innerHeight && rect.left < window.innerWidth;
      
      if (!isVisible) {
        log(' ⚠️ Level button is not visible! Moving it to a visible location...');
        
        // Пробуем найти кнопку соцсети и вставить рядом с ней
        const socialButton = document.querySelector('[data-hrhelper="social-button"], .hrhelper-communication-btn');
        if (socialButton && socialButton.parentElement) {
          try {
            // Удаляем кнопку из текущего места
            if (levelButton.parentElement) {
              levelButton.parentElement.removeChild(levelButton);
            }
            
            // Вставляем после кнопки соцсети
            if (socialButton.nextSibling) {
              socialButton.parentElement.insertBefore(levelButton, socialButton.nextSibling);
            } else {
              socialButton.parentElement.appendChild(levelButton);
            }
            
            log(' ✅ Level button moved next to social button');
          } catch (e) {
            log(' ⚠️ Failed to move button:', e);
          }
        } else {
          // Если кнопки соцсети нет, вставляем в body с фиксированной позицией
          try {
            if (levelButton.parentElement) {
              levelButton.parentElement.removeChild(levelButton);
            }
            document.body.appendChild(levelButton);
            levelButton.style.position = 'fixed';
            levelButton.style.bottom = '80px';
            levelButton.style.right = '20px';
            levelButton.style.zIndex = '99999';
            log(' ✅ Level button moved to fixed position in body');
          } catch (e) {
            log(' ⚠️ Failed to move button to body:', e);
          }
        }
      }
      
      // Принудительно показываем кнопку
      levelButton.style.display = 'inline-flex';
      levelButton.style.visibility = 'visible';
      levelButton.style.opacity = '1';
      
      // Проверяем видимость еще раз после перемещения
      const newRect = levelButton.getBoundingClientRect();
      const nowVisible = newRect.width > 0 && newRect.height > 0;
      log(' Level button visibility after fix:', nowVisible);
      if (nowVisible) {
        log(' ✅ Level button should be visible now!');
      } else {
        log(' ❌ Level button is still not visible');
      }
      
      log(' Level button inserted, will fetch level when Huntflow link appears...');
      
      // Функция для поиска ссылки на Huntflow и обновления кнопки
      const updateLevelFromHuntflowLink = () => {
        // Ищем ссылку на Huntflow
        let huntflowLink = null;
        
        // Сначала ищем в тексте "Для интервьюеров:"
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null
        );
        
        let textNode;
        while (textNode = walker.nextNode()) {
          if (textNode.textContent && textNode.textContent.includes('Для интервьюеров:')) {
            // Ищем ссылку на Huntflow рядом с этим текстом
            let container = textNode.parentElement;
            for (let i = 0; i < 10 && container; i++) {
              const links = Array.from(container.querySelectorAll('a'));
              huntflowLink = links.find(link => {
                const href = link.href || link.textContent || '';
                return href.includes('huntflow.ru') || href.includes('huntflow.dev');
              });
              if (huntflowLink) break;
              container = container.parentElement;
            }
            if (huntflowLink) break;
          }
        }
        
        // Если не нашли, ищем во всем документе
        if (!huntflowLink) {
          huntflowLink = Array.from(document.querySelectorAll('a[href*="huntflow"]')).find(link => {
            const href = link.href || link.textContent || '';
            return href.includes('huntflow.ru') || href.includes('huntflow.dev');
          });
        }
        
        if (!huntflowLink) {
          log(' No Huntflow link found yet, will retry...');
          return false; // Ссылка еще не появилась
        }
        
        log(' ✅ Found Huntflow link:', huntflowLink.href);
      
        // Извлекаем URL Huntflow
        let huntflowUrl = huntflowLink.href;
        if (huntflowUrl.includes('google.com/url')) {
          // Если это Google redirect URL
          try {
            const urlObj = new URL(huntflowUrl);
            const realUrl = urlObj.searchParams.get('q');
            if (realUrl) {
              huntflowUrl = decodeURIComponent(realUrl);
            }
          } catch (e) {
            log(' Error extracting real URL from Google redirect:', e);
          }
        }
        
        // Если не нашли в href, пробуем из текста
        if (!huntflowUrl || !huntflowUrl.includes('huntflow')) {
          const linkText = huntflowLink.textContent || '';
          const urlMatch = linkText.match(/https?:\/\/[^\s]+huntflow[^\s]*/);
          if (urlMatch) {
            huntflowUrl = urlMatch[0];
          }
        }
        
        if (!huntflowUrl || !huntflowUrl.includes('huntflow')) {
          log(' Could not extract Huntflow URL');
          return false;
        }
        
        log(' Extracted Huntflow URL:', huntflowUrl);
        
        // Проверяем, что функция getCandidateLevel доступна
        if (typeof getCandidateLevel !== 'function') {
          logError(' getCandidateLevel is not a function!');
          return false;
        }
        
        log(' Calling getCandidateLevel with URL:', huntflowUrl);
        
        // Получаем уровень через API
        getCandidateLevel(huntflowUrl).then(levelData => {
        log(' Candidate level response:', levelData);
        if (levelData && levelData.success && levelData.level) {
          const level = levelData.level;
          levelButton.textContent = level;
          levelButton.title = `Уровень кандидата: ${level} (нажмите для копирования текста)`;
          levelButton.setAttribute('data-level', level); // Сохраняем уровень для использования при клике
          levelButton.style.opacity = '1';
          levelButton.style.cursor = 'pointer';
          log(' ✅ Level button updated successfully with level:', level);
          
          // Добавляем обработчик клика для копирования текста
          levelButton.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const buttonLevel = this.getAttribute('data-level');
            if (!buttonLevel) {
              log(' ⚠️ No level data found on button');
              return;
            }
            
            log(' Level button clicked, fetching text for level:', buttonLevel);
            
            try {
              // Получаем текст для уровня из API
              const apiUrl = `/api/v1/huntflow/linkedin-applicants/level-text/?level=${encodeURIComponent(buttonLevel)}`;
              log(' Fetching level text from:', apiUrl);
              
              const res = await apiFetch(apiUrl, {
                method: 'GET'
              });
              
              const data = await res.json();
              log(' Level text response:', data);
              
              if (data && data.success && data.text) {
                // Копируем текст в буфер обмена
                await navigator.clipboard.writeText(data.text);
                log(' ✅ Text copied to clipboard');
                
                // Показываем уведомление
                const originalText = this.textContent;
                this.textContent = 'Скопировано!';
                this.style.background = '#28a745';
                setTimeout(() => {
                  this.textContent = originalText;
                  this.style.background = '#6c757d';
                }, 2000);
              } else {
                log(' ⚠️ No text found for level:', buttonLevel);
                const originalText = this.textContent;
                this.textContent = 'Нет текста';
                this.style.background = '#dc3545';
                setTimeout(() => {
                  this.textContent = originalText;
                  this.style.background = '#6c757d';
                }, 2000);
              }
            } catch (err) {
              logError(' Error copying level text:', err);
              const originalText = this.textContent;
              this.textContent = 'Ошибка';
              this.style.background = '#dc3545';
              setTimeout(() => {
                this.textContent = originalText;
                this.style.background = '#6c757d';
              }, 2000);
            }
          });
          
          // Проверяем видимость еще раз после обновления
          const rect = levelButton.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) {
            log(' ⚠️ Button is still not visible after update, trying to move it...');
            // Пробуем переместить кнопку рядом с кнопкой соцсети
            const socialButton = document.querySelector('[data-hrhelper="social-button"], .hrhelper-communication-btn');
            if (socialButton && socialButton.parentElement) {
              try {
                if (levelButton.parentElement) {
                  levelButton.parentElement.removeChild(levelButton);
                }
                if (socialButton.nextSibling) {
                  socialButton.parentElement.insertBefore(levelButton, socialButton.nextSibling);
                } else {
                  socialButton.parentElement.appendChild(levelButton);
                }
                log(' ✅ Level button moved next to social button after update');
              } catch (e) {
                log(' ⚠️ Failed to move button after update:', e);
              }
            }
          }
        } else {
          levelButton.textContent = 'Нет данных';
          levelButton.style.cursor = 'not-allowed';
          levelButton.style.opacity = '0.6';
          log(' Level not found or empty. Response:', levelData);
        }
      }).catch(err => {
          logError(' Error getting candidate level:', err);
          levelButton.textContent = 'Ошибка';
          levelButton.style.cursor = 'not-allowed';
          levelButton.style.opacity = '0.6';
        });
        
        return true; // Успешно обновлено
      };
      
      // Пробуем сразу найти ссылку
      if (!updateLevelFromHuntflowLink()) {
        // Если ссылка не найдена, устанавливаем "Загрузка..." и будем проверять периодически
        levelButton.textContent = 'Загрузка...';
        
        // Проверяем каждые 2 секунды, пока не найдем ссылку
        const checkInterval = setInterval(() => {
          if (updateLevelFromHuntflowLink()) {
            clearInterval(checkInterval);
          }
        }, 2000);
        
        // Останавливаем проверку через 30 секунд
        setTimeout(() => {
          clearInterval(checkInterval);
          if (levelButton.textContent === 'Загрузка...') {
            levelButton.textContent = 'Нет данных';
            levelButton.style.cursor = 'not-allowed';
            levelButton.style.opacity = '0.6';
          }
        }, 30000);
      }
      
      return true; // Успешно создана и вставлена кнопка
    } catch (err) {
      logError(' Error in addLevelButtonToMeetControls:', err);
      return false; // Ошибка при выполнении
    }
  }
  
  // Функция для обработки с повторными попытками
  function processWithRetries() {
    log(' ========== Starting Google Meet processing ==========');
    log(' getCandidateLevel available:', typeof getCandidateLevel === 'function');
    log(' processInterviewerLinks available:', typeof processInterviewerLinks === 'function');
    log(' addLevelButtonToMeetControls available:', typeof addLevelButtonToMeetControls === 'function');
    log(' Current URL:', location.href);
    log(' Document ready state:', document.readyState);
    log(' Body exists:', !!document.body);
    log(' Total buttons on page:', document.querySelectorAll('button').length);
    
    // Пробуем сразу
    log(' === Attempt 1: Immediate ===');
    processInterviewerLinks();
    const result1 = addLevelButtonToMeetControls();
    log(' addLevelButtonToMeetControls result (immediate):', result1);
    
    // Пробуем с разными задержками (Google Meet загружается очень долго)
    const delays = [500, 1000, 2000, 3000, 5000, 8000, 12000, 15000, 20000];
    delays.forEach((delay, index) => {
      setTimeout(() => {
        log(` === Attempt ${index + 2}: After ${delay}ms delay ===`);
        log(' Buttons on page:', document.querySelectorAll('button').length);
        log(' Level button exists:', !!document.querySelector('.hrhelper-meet-level-btn'));
        processInterviewerLinks();
        const result = addLevelButtonToMeetControls();
        log(' addLevelButtonToMeetControls result:', result);
        if (result) {
          log(' ✅ SUCCESS! Level button should be visible now');
        }
      }, delay);
    });
  }
  
  // Обрабатываем с повторными попытками
  processWithRetries();
  
  // Наблюдаем за изменениями DOM с debounce
  let processTimeout = null;
  const observer = new MutationObserver(() => {
    if (processTimeout) clearTimeout(processTimeout);
    processTimeout = setTimeout(() => {
      processInterviewerLinks();
      addLevelButtonToMeetControls();
    }, 1000);
  });
  
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    log(' MutationObserver started');
  } else {
    log(' document.body not ready, waiting...');
    setTimeout(() => {
      if (document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        log(' MutationObserver started (delayed)');
      }
    }, 1000);
  }
}

log(' Content script loaded');

// Инициализируем Google Calendar, если это страница календаря
if (IS_GOOGLE_CALENDAR) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGoogleCalendar);
  } else {
    initGoogleCalendar();
  }
}
// Инициализируем Google Meet, если это страница Meet
if (IS_GOOGLE_MEET) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGoogleMeet);
  } else {
    initGoogleMeet();
  }
}
// Инициализация для LinkedIn (не для Google Calendar и не для Google Meet)
if (!IS_GOOGLE_CALENDAR && !IS_GOOGLE_MEET) {
  log(' Starting initialization...');
  captureProfileToThreadMapping();
  startObserver();
}
