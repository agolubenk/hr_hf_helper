# Проверка подключения Google API (Войти через Google) на https://hr.sftntx.com

На странице входа кнопка **«Войти через Google»** ведёт на `/auth/google/login/` — это **django-allauth**. После авторизации Google перенаправляет пользователя на **callback URL**, который должен совпадать с настройками в Google Cloud и в приложении.

## Возможные причины, почему не работает

### 1. Google Cloud Console — Redirect URI

В [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → ваш OAuth 2.0 Client ID:

- **Authorized redirect URIs** должен содержать:
  - `https://hr.sftntx.com/auth/google/login/callback/`
- **Authorized JavaScript origins** (если нужны):
  - `https://hr.sftntx.com`

Если этого URI нет, Google вернёт ошибку вида `redirect_uri_mismatch`.

### 2. Django Sites (django.contrib.sites)

Allauth строит ссылки с учётом текущего сайта. В админке Django:

- **Sites** → запись с **id = 1** (значение `SITE_ID` в настройках):
  - **Domain name**: `hr.sftntx.com` (без `https://` и без слеша)
  - **Display name**: например, «HR Helper»

Если domain указан как `localhost` или `example.com`, callback может строиться неправильно.

### 3. Social Application (allauth)

В админке Django:

- **Social applications** (или **Sites** → **Social applications**):
  - Добавьте приложение с **Provider** = `Google`
  - **Client id** и **Secret** — из Google Cloud Console (OAuth 2.0 Client ID)
  - **Sites**: выберите сайт с доменом `hr.sftntx.com` (обычно id=1) и перенесите его в «Chosen sites»

Без этой записи allauth не знает, какой client_id использовать для провайдера Google.

### 4. Заголовки прокси (HTTPS)

В продакшене запросы приходят через Nginx (и, возможно, Cloudflare). Django должен понимать, что исходный запрос был по HTTPS.

- В **config/settings_production.py** уже есть:
  - `SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')`
- В **nginx** должно быть:
  - `proxy_set_header X-Forwarded-Proto $scheme;`  
  - или, если перед Nginx стоит Cloudflare: `proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;`
- В **nginx** для домена hr.sftntx.com:
  - `server_name hr.sftntx.com;` (в конфиге не должен оставаться `yourdomain.com`)

Иначе `request.build_absolute_uri(...)` может сгенерировать `http://...` вместо `https://...`, и Google не примет такой redirect_uri.

### 5. Переменные окружения (опционально)

Для кастомного Google OAuth (например, `/google-oauth/...`) в **docker-compose.production.yml** можно передать:

- `GOOGLE_OAUTH2_CLIENT_ID`
- `GOOGLE_OAUTH2_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI` (для кастомного callback, не для allauth)

Для кнопки «Войти через Google» (allauth) client_id/secret берутся из модели **Social Application** в БД, а не из переменных окружения. Redirect URI для allauth строится из текущего хоста и пути `/auth/google/login/callback/`.

## Краткий чеклист

| Проверка | Где | Что сделать |
|----------|-----|-------------|
| Redirect URI | Google Cloud Console | Добавить `https://hr.sftntx.com/auth/google/login/callback/` |
| Site domain | Django Admin → Sites | У сайта id=1 domain = `hr.sftntx.com` |
| Social App | Django Admin → Social applications | Есть Google с правильными Client id/Secret и привязан к сайту hr.sftntx.com |
| HTTPS | nginx + settings_production | X-Forwarded-Proto передаётся, server_name = hr.sftntx.com |

## Как проверить после изменений

1. Открыть https://hr.sftntx.com/accounts/login/
2. Нажать «Войти через Google»
3. Должен открыться Google OAuth и после входа — возврат на сайт. Если видите ошибку `redirect_uri_mismatch` — проверьте п. 1 и 4.
