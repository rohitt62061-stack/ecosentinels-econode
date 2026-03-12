# 🐳 EcoNode Docker Containerization - Complete Package

## 📂 File Structure

### Docker Configuration Files
```
Dockerfile              - Backend service (FastAPI/Python)
Dockerfile.client       - Frontend service (React/Node)
docker-compose.yml      - Service orchestration & networking
server/.dockerignore    - Backend build optimization
client/.dockerignore    - Frontend build optimization
```

### Environment & Configuration
```
.env.example            - Template for environment variables
```

### Documentation
```
DOCKER_SETUP.md                   - Complete setup guide & architecture
PLATFORM_SETUP.md                 - OS-specific instructions (Windows/Mac/Linux)
CONTAINERIZATION_SUMMARY.md       - Full overview, best practices, scaling
COMPLETION_REPORT.txt             - Project completion checklist
```

### Helper Scripts
```
build.sh                - Build automation script
quick-reference.sh      - Quick command reference
```

---

## 🚀 Getting Started (60 seconds)

### 1. Build Everything
```bash
docker compose up --build
```

### 2. Wait for services to start
The output will show:
```
backend  | INFO:     Uvicorn running on http://0.0.0.0:8000
frontend | Accepting connections at http://localhost:5173
```

### 3. Access the application
- **Frontend Dashboard**: http://localhost:5173
- **API Documentation**: http://localhost:8000/docs

### 4. Stop services
```bash
docker compose down
```

---

## 📖 Documentation Guide

**New to Docker?** Start here:
→ Read `DOCKER_SETUP.md` for architecture overview

**OS-specific questions?** 
→ Check `PLATFORM_SETUP.md` for your operating system

**Want full details?**
→ See `CONTAINERIZATION_SUMMARY.md` for comprehensive guide

**Need commands quick?**
→ Use `quick-reference.sh` for common operations

---

## ✅ What's Included

### Backend (Dockerfile)
✅ FastAPI REST API on port 8000
✅ OpenCV video streaming
✅ TensorFlow ML inference
✅ Sensor data processing & calibration
✅ Health checks every 30 seconds
✅ Multi-stage build (no build tools in runtime)

### Frontend (Dockerfile.client)
✅ React 19 dashboard on port 5173
✅ Real-time data visualization
✅ MCD Dashboard for administrators
✅ Citizen App for users
✅ Multi-stage build (optimized bundle)

### Orchestration (docker-compose.yml)
✅ Service networking (econode-network)
✅ Dependency management (frontend waits for backend)
✅ Environment variables
✅ Restart policies (unless-stopped)
✅ Port mappings (8000, 5173)
✅ Webcam device passthrough

### Optimization
✅ .dockerignore files (faster builds)
✅ Alpine/slim base images (smaller size)
✅ Cached dependencies
✅ Health checks
✅ Proper logging configuration

---

## 🎯 Common Tasks

### View Logs
```bash
docker compose logs -f backend    # Backend logs
docker compose logs -f frontend   # Frontend logs
docker compose logs -f            # All services
```

### Check Service Status
```bash
docker compose ps                 # Running containers
docker compose stats              # Resource usage
```

### Rebuild Services
```bash
docker compose build --no-cache   # Full rebuild
docker compose up --build         # Build & start
```

### Test API Endpoint
```bash
curl http://localhost:8000/docs   # API docs
curl http://localhost:8000/policy-alert  # Test endpoint
```

### Access Container Shell
```bash
docker compose exec backend bash  # Backend shell
docker compose exec frontend sh   # Frontend shell
```

---

## 🔍 Architecture Overview

```
┌─────────────────────────────────────────┐
│        Docker Host (Your Machine)       │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  econode-network (Bridge)       │   │
│  │                                 │   │
│  │  Backend                Frontend │   │
│  │  :8000                  :5173   │   │
│  │  ▲                       ▲       │   │
│  │  │ (Port mapping)        │       │   │
│  │  │ from host :8000       │       │   │
│  │  │                 (Port mapping)   │
│  │  │                 from host:5173   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘

Services communicate via DNS:
  frontend → http://backend:8000
  backend → http://frontend:5173 (internal)
```

---

## 📊 Expected Performance

### Build Times
- Backend: ~5-10 minutes (first time, depends on network)
- Frontend: ~2-3 minutes (first time)
- Subsequent builds: ~30 seconds (cached)

### Image Sizes
- Backend: ~600 MB uncompressed, ~200 MB compressed
- Frontend: ~200 MB uncompressed, ~80 MB compressed

### Runtime Memory
- Backend: ~150-300 MB (depends on load)
- Frontend: ~50-100 MB
- Total: ~200-400 MB

---

## 🛠️ Troubleshooting

### "Cannot connect to API from frontend"
→ Check `docker compose logs backend` for errors
→ Verify network: `docker network inspect econode-network`

### "Webcam not working"
→ Read `PLATFORM_SETUP.md` for device passthrough
→ Linux: Check `ls -la /dev/video0`

### "Port already in use"
→ Edit `docker-compose.yml` ports section
→ Or stop other services: `docker ps` then `docker stop <id>`

### "Slow builds or timeouts"
→ See PLATFORM_SETUP.md section "Handling Network Issues"
→ Pre-pull images or use local cache

→ **More help**: See `DOCKER_SETUP.md` troubleshooting section

---

## 🚀 Deployment Options

### Single Host (Development/Testing)
```bash
docker compose up -d
```
Use for: Local development, testing, small deployments

### Docker Swarm (Small Production)
```bash
docker swarm init
docker stack deploy -c docker-compose.yml econode
```
Use for: High availability, scaling across servers

### Kubernetes (Enterprise)
- Convert: `kompose convert`
- Deploy: `kubectl apply -f *.yaml`
Use for: Complex deployments, auto-scaling, rolling updates

---

## 📋 File Checklist

| File | Status | Purpose |
|------|--------|---------|
| Dockerfile | ✅ | Backend image definition |
| Dockerfile.client | ✅ | Frontend image definition |
| docker-compose.yml | ✅ | Service orchestration |
| server/.dockerignore | ✅ | Backend build optimization |
| client/.dockerignore | ✅ | Frontend build optimization |
| .env.example | ✅ | Configuration template |
| DOCKER_SETUP.md | ✅ | Setup guide |
| PLATFORM_SETUP.md | ✅ | OS-specific instructions |
| CONTAINERIZATION_SUMMARY.md | ✅ | Full overview |
| COMPLETION_REPORT.txt | ✅ | Project status |
| build.sh | ✅ | Build script |
| quick-reference.sh | ✅ | Command reference |

---

## 🎓 Learning Resources

- Docker: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Best Practices: https://docs.docker.com/develop/dev-best-practices/
- Multi-stage builds: https://docs.docker.com/build/building/multi-stage/

---

## ✨ Summary

Your **EcoNode** project is fully containerized with:
- ✅ Production-ready Dockerfiles
- ✅ Optimized multi-stage builds
- ✅ Complete service orchestration
- ✅ Health checks & restart policies
- ✅ Comprehensive documentation
- ✅ Platform-specific guides

**Everything is ready to deploy!**

Questions? See the documentation files or run:
```bash
docker compose up --build
```

Let me know if you need any modifications!
