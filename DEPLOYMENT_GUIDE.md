# 🌐 VPS & Cloud Deployment Guide for https://instafeed.cloud

This guide explains how to deploy the public Landing Showcase, Digital Catalogue, and Demo on your VPS (DigitalOcean, Hetzner, Linode, AWS, or Hostinger) with domain **https://instafeed.cloud**.

---

## ⚡ Option 1: Quick Deployment using PM2 + Nginx (Recommended)

### 1. Connect to your VPS & Install Node.js:
```bash
ssh root@YOUR_SERVER_IP

# Install Node.js 20 & Git
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs git nginx certbot python3-certbot-nginx
```

### 2. Clone / Upload the Codebase to `/var/www/instafeed`:
```bash
mkdir -p /var/www/instafeed
cd /var/www/instafeed

# Upload or pull your project here
# Install dependencies & build client:
cd client && npm install && npm run build
cd ../server && npm install
```

### 3. Start Backend with PM2:
```bash
npm install -g pm2
cd /var/www/instafeed/server
pm2 start server.js --name "qrmate-instafeed"
pm2 save
pm2 startup
```

### 4. Configure Nginx Reverse Proxy for `instafeed.cloud`:
Copy the provided config:
```bash
cp /var/www/instafeed/deploy/nginx-instafeed.conf /etc/nginx/sites-available/instafeed.cloud
ln -s /etc/nginx/sites-available/instafeed.cloud /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 5. Issue Free SSL Certificate with Let's Encrypt / Certbot:
```bash
certbot --nginx -d instafeed.cloud -d www.instafeed.cloud
```
Done! Your website is now live with HTTPS on **https://instafeed.cloud**.

---

## 🐳 Option 2: 1-Command Docker Deployment

```bash
cd /var/www/instafeed
docker compose up -d --build
```
The application will run containerized on port `3001` with auto-restart and persistent database in `./server/data`.

---

## 📞 Branding & Contact Info Configured:
- **Phone**: `01018815050`
- **WhatsApp**: `https://wa.me/201018815050`
- **Developer**: Recode Developments (Osama Kamel)
- **LinkedIn**: `https://www.linkedin.com/in/osama-kamel-dev`
- **Domain**: `https://instafeed.cloud`
