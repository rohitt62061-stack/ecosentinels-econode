# Platform-Specific Setup Notes

## Windows (Docker Desktop)

### Prerequisites
- Docker Desktop 4.0+
- 4GB RAM allocated to Docker
- WSL2 backend enabled

### Webcam Setup
The `/dev/video0` device in docker-compose.yml won't work on Windows. Instead:

**Option 1: Disable camera device mapping (for testing)**
Edit `docker-compose.yml`:
```yaml
backend:
  # Comment out these lines:
  # volumes:
  #   - /dev/video0:/dev/video0
  # devices:
  #   - /dev/video0:/dev/video0
```

**Option 2: Use WSL2 passthrough (if camera detected)**
```bash
# Enable camera in Docker Desktop Settings:
# Settings → Resources → WSL Integration → Enable camera integration
```

**Option 3: Use alternative USB camera approach**
- Install `usbipd-win` for USB device passthrough
- Or use IP camera stream instead

### Build Command
```bash
docker compose up --build
```

### Access
- Frontend: http://localhost:5173
- API: http://localhost:8000

---

## macOS (Docker Desktop)

### Prerequisites
- Docker Desktop for Mac 4.0+
- 4GB RAM allocated

### Camera Support
Docker Desktop on Mac has limited camera access. Options:

**Option 1: Mock camera data (Recommended for testing)**
```bash
# Edit server/main.py
# Comment out: cap = cv2.VideoCapture(0)
# Use mock frame generation instead
```

**Option 2: Use macOS USB forwarding**
Not natively supported in Docker on Mac—requires `docker-mac-net-connect` tool.

### Build & Run
```bash
docker compose up --build
```

### M1/M2 Macs
Images built for ARM64. If issues occur:
```bash
docker compose build --build-arg BUILDPLATFORM=linux/arm64
```

---

## Linux (Native Docker)

### Prerequisites
```bash
# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Webcam Support
Automatic with `/dev/video0`:
```bash
# Verify camera is accessible
ls -la /dev/video0

# If not found, check connected cameras:
v4l2-ctl --list-devices
```

### GPU Support (Optional)
If using NVIDIA GPU for ML inference:
```yaml
# In docker-compose.yml backend service:
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

### Build & Run
```bash
docker compose up --build -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

### File Permissions
If volume mount issues occur:
```bash
# Ensure your user owns the project directory
sudo chown -R $USER:$USER .
```

---

## Handling Network Issues During Build

### Slow/Timeout Downloads
```bash
# Increase timeout
docker build --build-arg BUILDKIT_CONTEXT_KEEP_GIT_DIR=1 \
  -f Dockerfile -t econode-backend:latest . \
  --progress=plain
```

### Docker Hub Rate Limiting
```bash
# Use alternative registries
# Edit Dockerfile FROM lines to use:
# FROM python:3.11-slim
# (already uses official registry, but try adding .mirror if available)

# Or use local cache:
docker build --cache-from econode-backend:latest -f Dockerfile .
```

### No Network Access
Pre-pull images locally:
```bash
# On machine with internet:
docker pull python:3.11-slim
docker pull node:20-alpine

# Save as tar files:
docker save python:3.11-slim -o python311.tar
docker save node:20-alpine -o node20.tar

# Transfer to target machine and load:
docker load -i python311.tar
docker load -i node20.tar

# Then build with --no-cache=false to use cached layers
docker compose build
```

---

## Production Deployment Checklist

- [ ] Use specific image version tags (not `latest`)
- [ ] Set resource limits in docker-compose.yml:
  ```yaml
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 2G
  ```
- [ ] Configure log rotation:
  ```yaml
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
  ```
- [ ] Use environment files:
  ```bash
  docker compose --env-file .env.production up -d
  ```
- [ ] Set up reverse proxy (nginx) for HTTPS
- [ ] Enable Docker container restart policies
- [ ] Monitor with `docker stats`
- [ ] Back up volumes containing ML models

---

## Troubleshooting by Platform

### Windows: "Cannot connect to Docker daemon"
```powershell
# Restart Docker Desktop
# or restart WSL2:
wsl --shutdown
```

### macOS: "permission denied" on volumes
```bash
# Grant Docker Desktop file access:
# Settings → Resources → File Sharing → Add project path
```

### Linux: "permission denied" errors
```bash
# Ensure user in docker group:
groups $USER
sudo usermod -aG docker $USER
# Log out and back in
```

### All platforms: "No space left on device"
```bash
docker system prune -a --volumes
docker system df
```
