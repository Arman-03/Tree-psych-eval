# Production Deployment Guide

Deploy the DSI HTP Interpretation Platform to **Railway** or run locally with Docker.

---

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Local Docker Deployment](#local-docker-deployment)
3. [Railway Cloud Deployment](#railway-cloud-deployment)
4. [Environment Variables](#environment-variables)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

- [ ] `.env` files are in `.gitignore` (verify: `git status` shows no `.env`)
- [ ] Model file exists: `ml-api/models/best_htp_classifier.pth`
- [ ] All credentials are configured (MongoDB, Cloudinary, Gemini)
- [ ] Docker builds work: `docker compose -f docker-compose.prod.yml build`

---

## Local Docker Deployment

### Build & Run

```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Start all services (detached)
docker compose -f docker-compose.prod.yml up -d

# Verify health
docker compose -f docker-compose.prod.yml ps
```

### Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:5001 |
| ML-API | http://localhost:5002 |

### Management Commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# View specific service
docker compose -f docker-compose.prod.yml logs -f ml-api

# Stop all
docker compose -f docker-compose.prod.yml down

# Rebuild single service
docker compose -f docker-compose.prod.yml build ml-api
```

---

## Railway Cloud Deployment

[Railway](https://railway.app) offers $5 free credit monthly - ideal for ML workloads.

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Verify account to receive $5 monthly credit

### Step 2: Create Project
1. Click **New Project** → **Empty Project**
2. Name it `tree-psych-eval`

### Step 3: Deploy ML-API (First)
1. Click **New** → **GitHub Repo** → Select your repo
2. Configure:
   - **Root Directory**: `ml-api`
   - **Dockerfile Path**: `Dockerfile`
3. Add **Variables**:
   - `GOOGLE_API_KEY`: Your Gemini key
   - `FLASK_DEBUG`: `false`
   - `PORT`: `5002`
4. **Settings** → **Networking** → **Generate Domain**
5. Copy the URL (needed for backend)

### Step 4: Deploy Backend
1. Click **New** → **GitHub Repo** (same repo)
2. Configure:
   - **Root Directory**: `backend`
   - **Dockerfile Path**: `Dockerfile.prod`
3. Add **Variables** (see [Environment Variables](#environment-variables))
4. Set `ML_API_ENDPOINT` to: `https://your-ml-api.up.railway.app/ml/analyze-drawing`
5. Generate domain

### Step 5: Deploy Frontend
1. Click **New** → **GitHub Repo** (same repo)
2. Configure:
   - **Root Directory**: `frontend`
   - **Dockerfile Path**: `Dockerfile.prod`
3. Add **Build Variables**:
   - `REACT_APP_API_URL`: `https://your-backend.up.railway.app`
4. Generate domain

---

## Environment Variables

### Backend (Required)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB Atlas connection | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing key (32+ chars) | Generate: `openssl rand -hex 32` |
| `CLOUDINARY_CLOUD_NAME` | Cloud name | `my-cloud` |
| `CLOUDINARY_API_KEY` | API key | `123456789` |
| `CLOUDINARY_API_SECRET` | API secret | `abc123...` |
| `ML_API_ENDPOINT` | Full ML API URL | `https://ml-api.up.railway.app/ml/analyze-drawing` |
| `CORS_ORIGIN` | Frontend URL | `https://frontend.up.railway.app` |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `5001` |

### ML-API (Required)

| Variable | Description |
|----------|-------------|
| `GOOGLE_API_KEY` | Google Gemini API key |
| `FLASK_DEBUG` | `false` (production) |
| `PORT` | `5002` |

### Frontend (Build-time)

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend API URL |

---

## Post-Deployment Verification

### Health Checks

```bash
# Backend
curl https://your-backend.up.railway.app/health
# Expected: {"status":"healthy","timestamp":"..."}

# ML-API
curl https://your-ml-api.up.railway.app/health
# Expected: {"status":"healthy","seer_model_loaded":true,...}
```

### Full Test

1. Open frontend URL in browser
2. Login or register a new user
3. Upload a test drawing
4. Verify ML analysis completes

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| ML-API unhealthy | Check logs: `railway logs` or Docker logs |
| Backend can't reach ML-API | Verify `ML_API_ENDPOINT` includes full path |
| CORS errors in browser | Set `CORS_ORIGIN` to exact frontend URL |
| Frontend shows blank page | Check `REACT_APP_API_URL` was set at build time |
| MongoDB connection failed | Verify IP whitelist in Atlas (add `0.0.0.0/0` for Railway) |

### Railway-Specific

- **Build fails**: Check Railway logs for missing files
- **Service sleeping**: Free tier stays awake; check usage in dashboard
- **Out of resources**: Upgrade or optimize (ML-API uses ~1GB RAM)

---

## Image Sizes

| Image | Size | Notes |
|-------|------|-------|
| Frontend | ~100 MB | Nginx + static files |
| Backend | ~290 MB | Node.js Alpine |
| ML-API | ~2.5 GB | CPU-only PyTorch |

---

## Security Notes

> ⚠️ **Never commit `.env` files** - Always use `.env.example` as template

> 🔒 **Use strong JWT_SECRET** - Generate with `openssl rand -hex 32`

> 🌐 **Set CORS correctly** - Only allow your frontend domain in production
