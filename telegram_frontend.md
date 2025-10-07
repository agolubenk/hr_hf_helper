# Интеграция Telegram-клиента с Django (Frontend)

## Структура шаблонов

- `templates/telegram_app/base.html`
- `templates/telegram_app/login.html`
- `templates/telegram_app/main.html`

### 1. `base.html`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Telegram Client</title>
  <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
</head>
<body>
  {% block content %}{% endblock %}
  <script>
    async function init() {
      const res = await axios.get('{% url "session_status" %}');
      if (res.data.active) {
        window.location.href = "{% url 'telegram_index' %}?view=main";
      } else {
        window.location.href = "{% url 'telegram_index' %}?view=login";
      }
    }
    init();
  </script>
</body>
</html>
```

### 2. `login.html`

```html
{% extends "telegram_app/base.html" %}
{% block content %}
<div>
  <h2>Авторизация в Telegram</h2>
  <button onclick="showPhone()">Телефон</button>
  <button onclick="showQR()">QR-код</button>

  <div id="phone-form" style="display:none;">
    <input id="phone" placeholder="+7..." />
    <button onclick="sendCode()">Отправить код</button>
    <div id="verify" style="display:none;">
      <input id="code" placeholder="Код" />
      <input id="password" placeholder="Пароль 2FA (если есть)" />
      <button onclick="verify()">Войти</button>
    </div>
  </div>

  <div id="qr-form" style="display:none;">
    <button onclick="getQR()">Получить QR</button>
    <div id="qr-code"></div>
  </div>
</div>

<script>
  function showPhone() { document.getElementById('phone-form').style.display='block'; }
  function showQR() { document.getElementById('qr-form').style.display='block'; }

  async function sendCode() {
    const phone = document.getElementById('phone').value;
    await axios.post('{% url "auth_phone" %}', { phone });
    document.getElementById('verify').style.display='block';
  }

  async function verify() {
    const phone = document.getElementById('phone').value;
    const code = document.getElementById('code').value;
    const password = document.getElementById('password').value;
    const res = await axios.post('{% url "auth_verify" %}', { phone, code, password });
    if (res.data.authorized) location.reload();
  }

  async function getQR() {
    const res = await axios.get('{% url "auth_qr" %}');
    document.getElementById('qr-code').innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(res.data.url)}&size=200x200" />`;
    pollQR();
  }

  async function pollQR() {
    const res = await axios.get('{% url "auth_qr_status" %}');
    if (res.data.authorized) location.reload();
    else setTimeout(pollQR, 2000);
  }
</script>
{% endblock %}
```

### 3. `main.html`

```html
{% extends "telegram_app/base.html" %}
{% block content %}
<h1>Telegram-чат</h1>
<div style="display:flex;">
  <ul id="chat-list" style="width:30%; list-style:none; padding:0;"></ul>
  <div id="messages" style="width:70%; border-left:1px solid #ccc; padding-left:10px;">
    <ul id="msg-list" style="list-style:none; padding:0;"></ul>
  </div>
</div>
<script>
  async function loadChats() {
    const res = await axios.get('{% url "list_chats" %}');
    const ul = document.getElementById('chat-list');
    ul.innerHTML = '';
    res.data.forEach(c => {
      const li = document.createElement('li');
      li.textContent = c.title;
      li.style.cursor = 'pointer';
      li.onclick = () => loadMessages(c.id);
      ul.appendChild(li);
    });
  }

  async function loadMessages(chatId) {
    const res = await axios.get(`/telegram_app/chats/${chatId}/messages/`);
    const ul = document.getElementById('msg-list');
    ul.innerHTML = '';
    res.data.reverse().forEach(m => {
      const li = document.createElement('li');
      li.textContent = `[${new Date(m.date).toLocaleString()}] ${m.sender}: ${m.text}`;
      ul.appendChild(li);
    });
  }

  loadChats();
</script>
{% endblock %}
```