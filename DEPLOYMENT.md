# MediOracle AI - Deployment Guide

This guide covers deploying the MediOracle AI application to various platforms.

## Prerequisites

1. **Environment Variables Required:**
   - `OPENAI_API_KEY` - Your OpenAI API key (required for symptom analysis)
   - `PORT` - Server port (optional, defaults to 5000)

## Deployment Options

### Option 1: Render (Recommended - Easy & Free)

Render is a great choice for full-stack Node.js apps with a free tier.

#### Steps:

1. **Create a Render Account:**
   - Go to https://render.com
   - Sign up/login

2. **Create a New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository: `adastra16/MediOracle-ai`

3. **Configure the Service:**
   - **Name:** `medioracle-ai` (or your choice)
   - **Root Directory:** `backend` (leave empty if root is backend)
   - **Environment:** `Node`
   - **Build Command:** `cd frontend && npm install --legacy-peer-deps && npm run build && cd ../backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Auto-Deploy:** `Yes` (deploys on every push)

4. **Set Environment Variables:**
   - Go to "Environment" tab
   - Add:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     PORT=5000
     NODE_ENV=production
     ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for build to complete (5-10 minutes)
   - Your app will be live at: `https://your-app-name.onrender.com`

**Note:** Before deploying, you need to build the frontend first!

#### Build Frontend Before Deploy:

Run this locally or add to build command:
```bash
cd frontend && npm install && npm run build
```

Or update Render build command:
```
cd frontend && npm install && npm run build && cd ../backend && npm install
```

---

### Option 2: Railway

Railway is another easy deployment option with great developer experience.

#### Steps:

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Initialize:**
   ```bash
   railway init
   ```

4. **Set Environment Variables:**
   ```bash
   railway variables set OPENAI_API_KEY=your_key_here
   railway variables set PORT=5000
   railway variables set NODE_ENV=production
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

---

### Option 3: Vercel (Frontend) + Render/Railway (Backend)

For separate frontend/backend deployment:

#### Frontend (Vercel):

1. Go to https://vercel.com
2. Import your GitHub repository
3. **Root Directory:** `frontend`
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. **Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.com
   ```

#### Backend (Render/Railway):

Follow Option 1 or 2 for backend, then update frontend API URL.

---

### Option 4: DigitalOcean/VPS

For full control with a VPS:

#### Steps:

1. **Create a Droplet:**
   - Ubuntu 22.04 LTS
   - Minimum: 1GB RAM, 1 vCPU

2. **SSH into your server:**
   ```bash
   ssh root@your-server-ip
   ```

3. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install PM2 (Process Manager):**
   ```bash
   sudo npm install -g pm2
   ```

5. **Clone your repository:**
   ```bash
   git clone https://github.com/adastra16/MediOracle-ai.git
   cd MediOracle-ai
   ```

6. **Build Frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

7. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

8. **Create .env file:**
   ```bash
   nano .env
   ```
   Add:
   ```
   OPENAI_API_KEY=your_key_here
   PORT=5000
   NODE_ENV=production
   ```

9. **Start with PM2:**
   ```bash
   pm2 start index.js --name medioracle --cwd /root/MediOracle-ai/backend
   pm2 save
   pm2 startup
   ```

10. **Configure Nginx (Reverse Proxy):**
    ```bash
    sudo apt install nginx
    sudo nano /etc/nginx/sites-available/medioracle
    ```
    
    Add:
    ```nginx
    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://localhost:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
    
    Enable:
    ```bash
    sudo ln -s /etc/nginx/sites-available/medioracle /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

---

## Quick Deployment Checklist

- [ ] Build frontend: `cd frontend && npm run build`
- [ ] Set `OPENAI_API_KEY` environment variable
- [ ] Set `PORT` (optional, defaults to 5000)
- [ ] Ensure backend serves frontend static files (already configured)
- [ ] Test locally first
- [ ] Push to GitHub
- [ ] Deploy to chosen platform

---

## Post-Deployment

1. **Verify Backend:**
   - Visit: `https://your-app-url.com/api/health`
   - Should return: `{ "status": "ok", "service": "MediOracle AI Backend" }`

2. **Verify Frontend:**
   - Visit: `https://your-app-url.com`
   - Should show the MediOracle AI interface

3. **Test Symptom Analyzer:**
   - Go to Symptoms page
   - Try entering symptoms
   - Should return conditions from OpenAI

---

## Troubleshooting

### Frontend not showing:
- Ensure `npm run build` was run before deployment
- Check that backend serves from `frontend/dist` directory

### OpenAI API errors:
- Verify `OPENAI_API_KEY` is set correctly
- Check API key has credits/access
- Check backend logs for specific errors

### Port issues:
- Default port is 5000
- Some platforms assign random ports - use `process.env.PORT` (already configured)

---

## Recommended: Render Deployment

For the easiest deployment, use Render:

1. Connect GitHub repo
2. Set root directory as root (or backend)
3. Build command: `cd frontend && npm install && npm run build && cd ../backend && npm install`
4. Start command: `cd backend && npm start`
5. Add `OPENAI_API_KEY` environment variable
6. Deploy!

Your app will be live in minutes! 🚀

