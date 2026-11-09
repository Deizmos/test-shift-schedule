# График смен сотрудников

Тестовое задание fullstack-разработчика: интерфейс создания рабочего графика по макету в Figma.

- Макет: [Тестовое задание разработчик](https://www.figma.com/design/QVdDSEGTL1bWg7UmuPpoPe)
- Стек: Vue 3, TypeScript, PHP / Laravel 13
- План работ: [PLAN.md](PLAN.md)

## Запуск

Нужны PHP 8.3+, Composer и Node.js.

```bash
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
npm install
npm run dev
```

В другом терминале:

```bash
php artisan serve
```

Страница: http://127.0.0.1:8000/

Проверка сборки и типов:

```bash
npm run typecheck
npm run build
```

## Деплой на alwaysdata

Бесплатный тариф Free: [alwaysdata.com](https://www.alwaysdata.com/). После регистрации имя аккаунта попадает в адрес сайта и в SSH. Ниже оно записано как `[account]` — его нужно подставить в обоих местах команды.

Сайт откроется по адресу `https://[account].alwaysdata.net`. Корень сайта — каталог `public`, не корень проекта: иначе `.env` окажется доступен из браузера.

### 1. База

В панели: **Databases → MariaDB → Add a database**. Имя, например, `schedule`. В списке оно будет с префиксом аккаунта, например `[account]_schedule`.

Хост, пользователь и пароль смотрите в той же панели. Обычно хост такой: `mysql-[account].alwaysdata.net`, порт `3306`.

### 2. Сайт

**Web → Sites → Add a site**:

- тип **PHP**;
- адрес `[account].alwaysdata.net`;
- корневой каталог `/home/[account]/test-shift-schedule/public`;
- версия PHP **8.3** или новее.

### 3. Код на сервере

В панели включите SSH: **Remote access → SSH/SFTP**. Затем с локальной машины:

```bash
ssh [account]@ssh-[account].alwaysdata.net
```

На сервере:

```bash
git clone https://github.com/Deizmos/test-shift-schedule.git ~/test-shift-schedule
cd ~/test-shift-schedule
composer install --no-dev --optimize-autoloader
cp .env.example .env
php artisan key:generate
chmod 600 .env
```

В `.env` замените окружение и базу. Имена базы и пользователя берите из панели, не выдумывайте префикс:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://[account].alwaysdata.net

DB_CONNECTION=mysql
DB_HOST=mysql-[account].alwaysdata.net
DB_PORT=3306
DB_DATABASE=[account]_schedule
DB_USERNAME=[account]
DB_PASSWORD=
```

Дальше:

```bash
php artisan migrate --seed --force
php artisan config:cache
php artisan route:cache
```

`migrate --seed` создаёт таблицы и кладёт сотрудников и шаблоны Утро / День / Вечер.

Фронтенд собирается отдельно. На сервере Node.js уже есть; если `npm` не хватает памяти тарифа Free, выполните `npm run build` на своём компьютере и загрузите каталог `public/build` в то же место на сервере.

```bash
export NODEJS_VERSION=22
npm install
npm run build
rm -rf node_modules
```

После сборки каталог `node_modules` не нужен: страница берёт файлы из `public/build`.

Права на запись:

```bash
chmod -R u+rwx storage bootstrap/cache
```

Обновление после новых коммитов:

```bash
cd ~/test-shift-schedule
git pull
composer install --no-dev --optimize-autoloader
npm install && npm run build && rm -rf node_modules
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```
