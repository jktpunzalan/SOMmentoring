# Mentoring System — Deployment Guide

## Local Development

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.x (XAMPP)

### Setup
```bash
# Install PHP dependencies
composer install

# Install Node dependencies
npm install

# Copy environment file (already configured)
cp .env.example .env

# Generate application key
php artisan key:generate

# Create MySQL database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS mentoring CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations and seed
php artisan migrate --seed

# Create storage symlink
php artisan storage:link

# Start development servers
php artisan serve &
npm run dev
```

### Default Accounts (after seeding)
| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@mentoring.test | password |
| Mentor | mentor@mentoring.test | password |
| Mentor | mentor2@mentoring.test | password |

---

## Hostinger Shared Hosting Deployment

### 1. Build Frontend
```bash
npm run build
```

### 2. Upload Files
Upload the **entire Laravel project** to your Hostinger home directory (e.g., `/home/u123456789/mentoring/`).

### 3. Point Document Root
In Hostinger hPanel, set your domain's document root to:
```
/home/u123456789/mentoring/public
```

**Alternative:** If you cannot change document root, upload everything to `public_html/` and copy `public/.htaccess` and `public/index.php` to `public_html/`, then update the paths in `index.php`:
```php
require __DIR__.'/../mentoring/vendor/autoload.php';
$app = require_once __DIR__.'/../mentoring/bootstrap/app.php';
```

### 4. Configure Environment
Edit `.env` on the server:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_HOST=localhost
DB_DATABASE=your_hostinger_db
DB_USERNAME=your_hostinger_user
DB_PASSWORD=your_hostinger_password

SANCTUM_STATEFUL_DOMAINS=yourdomain.com
SESSION_DOMAIN=.yourdomain.com
```

### 5. Run Migrations
Via Hostinger SSH or terminal:
```bash
cd /home/u123456789/mentoring
php artisan migrate --seed --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 6. Cron Job (Optional)
Add in Hostinger cron jobs:
```
* * * * * cd /home/u123456789/mentoring && php artisan schedule:run >> /dev/null 2>&1
```

### 7. File Permissions
```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

---

## Important Notes
- **Photos** are stored in `storage/app/private/session-photos/` and served via authenticated controller route — never publicly accessible.
- **Queue driver** is `sync` — jobs run immediately. No queue worker needed.
- **Cache driver** is `database` — no Redis required.
- **Session driver** is `file` — sessions stored in `storage/framework/sessions/`.
