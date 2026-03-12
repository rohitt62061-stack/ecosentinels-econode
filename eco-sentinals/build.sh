#!/bin/bash
# EcoNode Docker Setup Script

echo "Building EcoNode containers..."

# Build backend
echo "Building backend service..."
docker build -f Dockerfile -t econode-backend:latest .

# Build frontend
echo "Building frontend service..."
docker build -f Dockerfile.client -t econode-frontend:latest .

echo "Build complete!"
echo ""
echo "To start the services, run:"
echo "  docker compose up -d"
echo ""
echo "Access the application at:"
echo "  Frontend: http://localhost:5173"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "To stop services:"
echo "  docker compose down"
