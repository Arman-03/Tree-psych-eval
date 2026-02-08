# DSI Platform - HTP Interpretation System

A full-stack ML-assisted platform for psychological interpretation of House-Tree-Person (HTP) drawings. Built with React, Node.js/Express, and Python/Flask with PyTorch.

## Quick Start

### Development
```bash
# Clone and configure
cp .env.example .env  # Edit with your credentials

# Start all services
docker compose up --build
```

### Production
```bash
# Build and run production stack
docker compose -f docker-compose.prod.yml up --build -d

# Check health
curl http://localhost:5001/health  # Backend
curl http://localhost:5002/health  # ML-API
```

**Services:**
| Service | Dev Port | Prod Port |
|---------|----------|-----------|
| Frontend | 3000 | 80 |
| Backend | 5001 | 5001 |
| ML-API | 5002 | 5002 |

---

## Table of Contents
1. [Architecture](#architecture)
2. [Prerequisites](#prerequisites)
3. [Configuration](#configuration)
4. [Development](#development)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend   │────▶│   ML-API    │
│   (React)   │     │  (Express)  │     │   (Flask)   │
│   Nginx     │     │   Node.js   │     │   PyTorch   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │  MongoDB    │
                    │  Cloudinary │
                    └─────────────┘
```

- **Frontend**: React SPA served by Nginx
- **Backend**: Express API with JWT auth, connects to MongoDB Atlas and Cloudinary
- **ML-API**: Flask API running Seer (EfficientNet) model + Gemini for report generation

---

## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose v2.x
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- [Cloudinary](https://cloudinary.com/) account
- [Google AI Studio](https://aistudio.google.com/) API key (for Gemini)

---

## Configuration

### 1. Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

**Required Variables:**

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for JWT tokens (min 32 chars) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `GOOGLE_API_KEY` | Google Gemini API key |

### 2. ML Model

Ensure the trained model exists at:
```
ml-api/models/best_htp_classifier.pth
```

---

## Development

### Starting the Dev Environment

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5001
- ML-API: http://localhost:5002

### Hot Reloading

Code changes in `frontend/` and `backend/` directories automatically reload.

### Adding Dependencies

```bash
# After modifying package.json
docker compose up --build
```

---

## Production Deployment

### Local Production Build

```bash
# Build all production images
docker compose -f docker-compose.prod.yml build

# Start in detached mode
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop
docker compose -f docker-compose.prod.yml down
```

### Cloud Deployment (Railway)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Railway deployment instructions.

**Image Sizes:**
| Image | Size |
|-------|------|
| Frontend | ~100 MB |
| Backend | ~290 MB |
| ML-API | ~2.5 GB |

### Health Endpoints

All services expose `/health` endpoints:

```bash
# Backend
curl http://localhost:5001/health
# {"status":"healthy","timestamp":"..."}

# ML-API
curl http://localhost:5002/health
# {"status":"healthy","seer_model_loaded":true,...}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Permission denied` on docker.sock | Add user to docker group: `sudo usermod -aG docker $USER` then logout/login |
| Container name conflict | Run `docker compose down` before starting again |
| ML-API unhealthy | Check logs: `docker logs tree-psych-ml-api-prod` |
| Backend connection refused | Verify `MONGO_URI` is correct |
| Frontend can't reach backend | Check `REACT_APP_API_URL` in build args |

### Viewing Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f ml-api
```