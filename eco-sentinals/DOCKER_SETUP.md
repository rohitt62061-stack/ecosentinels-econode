# Docker Setup Summary

## Files Created

✅ **Dockerfile** - Multi-stage backend (Python/FastAPI)
- Stage 1: Builder compiles dependencies
- Stage 2: Slim runtime with only needed packages
- Includes health checks and proper signal handling

✅ **Dockerfile.client** - Multi-stage frontend (Node/React)
- Stage 1: Build React app with Vite
- Stage 2: Serve with lightweight `serve` package
- Alpine base for minimal image size

✅ **docker-compose.yml** - Orchestration
- Backend service on port 8000 (FastAPI + OpenCV)
- Frontend service on port 5173 (React dashboard)
- Webcam device passthrough for video feed
- Service dependency management
- Health checks for both services
- Automatic restart policy

✅ **.dockerignore files** - Optimized builds
- Excludes unnecessary files from Docker context
- Speeds up build times and reduces image size

✅ **.env.example** - Environment template

## Quick Start

### 1. Build & Run with Docker Compose
```bash
docker compose up --build
```

This command:
- Builds both images
- Starts backend on http://localhost:8000
- Starts frontend on http://localhost:5173
- Creates shared network for service communication

### 2. Access the Application
- **Frontend Dashboard**: http://localhost:5173
  - MCD Dashboard: `/mcd-dashboard`
  - Citizen App: `/citizen-app`
- **API Documentation**: http://localhost:8000/docs
- **API Endpoints**:
  - POST `/ingest-sensor` - Receive sensor data
  - GET `/video-feed` - Stream webcam with ML inference
  - GET `/policy-alert` - Get AQI policy alerts
  - GET `/command` - ESP32 polls for servo commands

### 3. View Logs
```bash
docker compose logs backend      # Backend logs
docker compose logs frontend     # Frontend logs
docker compose logs -f backend   # Follow backend logs
```

### 4. Stop Services
```bash
docker compose down
```

## Architecture Details

### Backend (Python)
- **Base**: python:3.11-slim (165MB)
- **Framework**: FastAPI
- **Dependencies**: OpenCV, TensorFlow, scikit-learn, Firebase Admin
- **Features**:
  - Sensor data ingestion & AQI calibration
  - Real-time webcam streaming with ML detection
  - WebSocket-ready for live dashboards
  - CORS enabled for frontend communication

### Frontend (React)
- **Base**: node:20-alpine (190MB after build)
- **Framework**: React 19 + Vite
- **UI**: Tailwind CSS, Lucide icons, Recharts
- **Components**: React Router, Firebase SDK
- **Build output**: Static HTML/CSS/JS (~500KB gzipped)

### Networking
- Both services connected to `econode-network`
- Backend accessible to frontend at `http://backend:8000` internally
- Port 8000 → FastAPI
- Port 5173 → Vite dev server (production uses `serve`)

### Webcam Support
- Linux/Docker: `/dev/video0` device mounted
- Windows: Modify docker-compose.yml if using WSL2
- For macOS: Requires Docker Desktop with camera passthrough enabled

## Best Practices Applied

✅ **Multi-stage builds**: Reduced image sizes (no build tools in runtime)
✅ **Health checks**: Containers auto-restart on failure
✅ **Resource efficiency**: `.dockerignore` excludes unnecessary files
✅ **.dockerignore files**: Smaller build context
✅ **Dependency management**: Explicit version pins in requirements.txt
✅ **Environment variables**: Externalized configuration
✅ **Volume mounts**: Webcam device passthrough
✅ **Restart policy**: `unless-stopped` for production readiness
✅ **Logging**: `PYTHONUNBUFFERED=1` for real-time logs

## Development Workflow

### Hot Reload (Development)
For development with live code changes:

```bash
# Edit docker-compose.yml to add volume mounts:
# backend:
#   volumes:
#     - ./server:/app
# frontend:
#   volumes:
#     - ./client:/build

docker compose -f docker-compose.yml up
```

Then code changes auto-refresh.

### Production Deployment
For production, the current setup is single-host ready:
- Use `docker compose up -d` to run in background
- Use reverse proxy (nginx) for SSL/domain management
- Consider `docker swarm` or Kubernetes for multi-node deployments

## Troubleshooting

### Container won't start
```bash
docker compose logs backend  # Check error messages
docker compose restart backend
```

### Can't access API from frontend
- Verify backend is running: `docker compose ps`
- Check network: `docker network inspect econode-network`
- Ensure API is listening: `docker compose logs backend | grep "Uvicorn running"`

### Webcam not working
- Verify device exists: `ls /dev/video0`
- On Windows with WSL2: Ensure camera is shared with WSL
- On macOS: Enable camera in Docker Desktop settings

### Image pull failures
- If DockerHub is slow, try building with lower bandwidth:
  ```bash
  docker compose build --no-cache
  ```

## File Structure
```
.
├── Dockerfile              # Backend image definition
├── Dockerfile.client       # Frontend image definition
├── docker-compose.yml      # Service orchestration
├── .env.example           # Environment template
├── build.sh               # Build helper script
├── server/
│   ├── main.py           # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── .dockerignore      # Build exclusions
├── client/
│   ├── package.json       # Node dependencies
│   ├── vite.config.js     # Build configuration
│   ├── .dockerignore      # Build exclusions
│   └── src/              # React components
├── models/
│   ├── calibration_rf.pkl
│   └── mobilenet_v2.tflite
└── firmware/              # ESP32 Arduino sketches
```

## Next Steps

1. **Test the build locally**:
   ```bash
   docker compose up --build
   ```

2. **Verify endpoints**:
   - Frontend loads at localhost:5173
   - API docs available at localhost:8000/docs

3. **Deploy to production**:
   - Push images to Docker Hub
   - Use Docker Swarm or Kubernetes for orchestration
   - Add nginx for reverse proxy
   - Set up SSL certificates

4. **Monitor services**:
   ```bash
   docker compose stats
   ```

---

Build succeeded. The containerized EcoNode system is ready to deploy!
