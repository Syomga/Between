# Between

Between is a real-time messenger for cross-national communication where users always chat in their native language.  
Messages are translated by AI for the receiver, while cultural references are highlighted with inline explanations.

## Stack

- Client: React + TypeScript + Vite + Tailwind + Zustand + Socket.io client
- Server: Node.js + Express + TypeScript + Prisma + SQLite + JWT (httpOnly cookie)
- Realtime: Socket.io
- AI: AnyModel ([anymodel.org](https://anymodel.org/)) with model `cx/gpt-5.4`

## Features

- Registration with country and native language
- JWT auth with httpOnly cookie
- User search, random match, country preferences
- AI translation and cultural highlights
- File attachments, emoji picker, in-chat search
- Light/dark theme
- Mobile-friendly layout

## Local development

### 1) Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2) Environment

`server/.env`:

```env
ANYMODEL_API_KEY=your_anymodel_key
JWT_SECRET=super-secret
DATABASE_URL="file:./dev.db"
PORT=4000
CLIENT_ORIGIN="http://localhost:5173"
```

`client/.env`:

```env
VITE_API_URL=http://localhost:4000
```

### 3) Database

```bash
cd server
npx prisma migrate dev
npx prisma generate
```

### 4) Run

```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Деплой на Ubuntu (production)

Инструкция для VPS с Ubuntu 22.04/24.04. Предполагается домен `your-domain.com` и пользователь `deploy`.

### 1. Подготовка сервера

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nginx certbot python3-certbot-nginx

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 для автозапуска
sudo npm install -g pm2
```

### 2. Клонирование проекта

```bash
sudo mkdir -p /var/www/between
sudo chown $USER:$USER /var/www/between
git clone https://github.com/Syomga/Between.git /var/www/between
cd /var/www/between
```

### 3. Переменные окружения

```bash
cp server/.env.example server/.env
nano server/.env
```

Пример для production:

```env
ANYMODEL_API_KEY=your_anymodel_key
JWT_SECRET=long-random-secret-string
DATABASE_URL="file:./prod.db"
PORT=4000
CLIENT_ORIGIN="https://your-domain.com"
NODE_ENV=production
```

> `CLIENT_ORIGIN` должен совпадать с URL сайта (с `https` после настройки SSL).

### 4. Сборка

```bash
cd /var/www/between/server
npm ci
npx prisma migrate deploy
npx prisma generate
npm run build

cd /var/www/between/client
npm ci
npm run build
```

Клиент собирается без `VITE_API_URL` — в production запросы идут на тот же домен.

### 5. Запуск через PM2

```bash
cd /var/www/between
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Проверка:

```bash
curl http://127.0.0.1:4000/api/health
```

### 6. Nginx

```bash
sudo cp /var/www/between/deploy/nginx-between.conf /etc/nginx/sites-available/between
sudo nano /etc/nginx/sites-available/between
```

Замените `your-domain.com` на ваш домен.

```bash
sudo ln -s /etc/nginx/sites-available/between /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d your-domain.com
```

После выпуска сертификата обновите `CLIENT_ORIGIN` в `server/.env`:

```env
CLIENT_ORIGIN="https://your-domain.com"
```

Перезапуск:

```bash
pm2 restart between
```

### 8. Обновление после изменений в GitHub

```bash
cd /var/www/between
git pull origin main

cd server
npm ci
npx prisma migrate deploy
npm run build

cd ../client
npm ci
npm run build

cd ..
pm2 restart between
```

### 9. Полезные команды

```bash
pm2 status
pm2 logs between
cd /var/www/between/server && npm run clear-db   # очистить все аккаунты и сообщения
```

### Структура production

```text
Internet → Nginx (80/443) → Node.js :4000
                              ├── /api/*
                              ├── /uploads/*
                              ├── /socket.io/*
                              └── client/dist (React)
```

### Файлы и права

- База SQLite: `server/prod.db` (создаётся автоматически)
- Загрузки: `server/uploads/` — должна быть доступна на запись пользователю PM2
- Секреты только в `server/.env`, не коммитить в git

### Troubleshooting

| Проблема | Решение |
|----------|---------|
| 502 Bad Gateway | `pm2 logs between`, проверить что процесс слушает `:4000` |
| CORS / cookie | `CLIENT_ORIGIN` = точный URL сайта |
| Нет перевода | проверить `ANYMODEL_API_KEY` в `.env` |
| WebSocket не работает | в Nginx должны быть заголовки `Upgrade` для `/socket.io/` |

---

## Repository

[https://github.com/Syomga/Between](https://github.com/Syomga/Between)
