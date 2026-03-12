#!/bin/bash
# EcoNode Docker: Quick Reference

## 🚀 START
docker compose up --build

## 📊 MONITOR
docker compose ps                    # List services
docker compose logs -f               # Follow all logs
docker compose logs backend -f       # Follow backend
docker compose stats                 # Resource usage

## 🛑 STOP
docker compose down                  # Stop & remove containers
docker compose down -v               # Also remove volumes

## 🔄 RESTART
docker compose restart backend       # Restart backend
docker compose restart frontend      # Restart frontend

## 🗑️ CLEAN
docker compose down --remove-orphans -v
docker system prune -a

## 🐛 TROUBLESHOOT
docker compose exec backend python -c "import requests; requests.get('http://localhost:8000/docs')"
docker compose exec frontend wget -qO- http://backend:8000/docs
docker network inspect econode-network

## 📝 REBUILD (if code changed)
docker compose build --no-cache

## 🔍 INSPECT
docker compose config               # Show resolved config
docker compose images               # Show built images
docker volume ls                     # List volumes

## 🌐 ACCESS
echo "Frontend: http://localhost:5173"
echo "API Docs: http://localhost:8000/docs"
echo "API Base: http://localhost:8000"

## 📦 DEPLOYMENT CHECKLIST
# [ ] docker compose config is valid
# [ ] All services have health checks
# [ ] Environment variables set
# [ ] Volumes properly mounted
# [ ] Ports not conflicting
# [ ] Network created
# [ ] Restart policy configured

echo "✅ EcoNode is ready!"
