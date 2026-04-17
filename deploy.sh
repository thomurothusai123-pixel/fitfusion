#!/bin/bash
# ==========================================
# FitFusion Full-Stack EC2 Deployment Script
# EC2 Public IP: 13.61.2.32
# ==========================================
set -e  # Exit immediately on any error

PUBLIC_IP="13.61.2.32"
APP_DIR="/var/www/fitfusion"

echo "============================================"
echo "  FitFusion EC2 Deployment Starting..."
echo "  Server IP: $PUBLIC_IP"
echo "============================================"

# --- STEP 1: System Update ---
echo "[1/8] Updating system packages..."
sudo apt update && sudo apt upgrade -y

# --- STEP 2: Install Node.js 20 LTS ---
echo "[2/8] Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx build-essential
echo "Node version: $(node --version)"
echo "NPM version:  $(npm --version)"

# --- STEP 3: Install PM2 ---
echo "[3/8] Installing PM2..."
sudo npm install -g pm2

# --- STEP 4: Clone Repository ---
echo "[4/8] Setting up app directory and cloning repo..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER /var/www

# If already cloned, pull latest; otherwise clone fresh
if [ -d "$APP_DIR/.git" ]; then
  echo "Repo already exists — pulling latest changes..."
  cd $APP_DIR && git pull origin main
else
  git clone https://github.com/thomurothusai123-pixel/fitfusion.git $APP_DIR
fi

# --- STEP 5: Backend Setup ---
echo "[5/8] Setting up Backend..."
cd $APP_DIR/backend
npm install

echo "Writing backend .env..."
cat > .env << EOF
PORT=8080

# MongoDB Atlas — direct shard URI (SRV DNS may be blocked on some networks)
mongoURI=mongodb://thomurothusai123_db_user:Kishore123@ac-ad7ifem-shard-00-00.p9cpunq.mongodb.net:27017,ac-ad7ifem-shard-00-01.p9cpunq.mongodb.net:27017,ac-ad7ifem-shard-00-02.p9cpunq.mongodb.net:27017/fitfusion?ssl=true&replicaSet=atlas-uy9qn7-shard-0&authSource=admin&retryWrites=true&w=majority

# Google OAuth (update with real credentials if using Google login)
GOOGLE_CLIENT_ID=dummy_id
GOOGLE_CLIENT_SECRET=dummy_secret

BACKEND_CALLBACK_URL=http://${PUBLIC_IP}:8080
FRONTEND_CALLBACK_URL=http://${PUBLIC_IP}

JWT_SECRET=fitfusion_super_secret_key_2024
EOF

echo "Clearing any process on port 8080..."
sudo fuser -k 8080/tcp 2>/dev/null || true

echo "Starting backend with PM2..."
pm2 delete fitfusion-backend 2>/dev/null || true
pm2 start index.js --name "fitfusion-backend"
pm2 status

# --- STEP 6: Frontend Setup ---
echo "[6/8] Setting up Frontend..."
cd $APP_DIR/frontend

npm install

echo "Writing frontend .env..."
cat > .env << EOF
REACT_APP_BACKEND_API=http://${PUBLIC_IP}
REACT_APP_EXCERCIES_API=https://exercisedb.p.rapidapi.com/exercises
EOF

echo "Building React app (this may take a few minutes)..."
NODE_OPTIONS=--max-old-space-size=1536 npm run build
echo "Frontend build complete!"

# --- STEP 7: Nginx Configuration ---
echo "[7/8] Configuring Nginx..."

NGINX_CONF="/etc/nginx/sites-available/fitfusion"

sudo tee $NGINX_CONF > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name _;

    # Serve React Frontend Build
    root /var/www/fitfusion/frontend/build;
    index index.html index.htm;

    # React Router — serve index.html for all unmatched frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Reverse Proxy — forward API routes to Node.js backend (port 8080)
    location ~ ^/(posts|notifications|user|auth|getuser) {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

sudo ln -sfn $NGINX_CONF /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t && sudo systemctl restart nginx
echo "Nginx configured and restarted successfully."

# --- STEP 8: PM2 Auto-Start on Reboot ---
echo "[8/8] Setting up PM2 startup on reboot..."
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu | tail -1 | sudo bash

sudo systemctl enable nginx

echo ""
echo "============================================"
echo "  ✅ DEPLOYMENT COMPLETE!"
echo "  🌐 App URL: http://${PUBLIC_IP}"
echo "  🔧 API URL: http://${PUBLIC_IP}:8080"
echo "============================================"
echo ""
echo "Quick checks:"
echo "  pm2 status                      → View backend process"
echo "  pm2 logs fitfusion-backend      → View backend logs"
echo "  sudo systemctl status nginx     → Check Nginx"
echo "  curl http://localhost:8080/     → Test backend directly"
