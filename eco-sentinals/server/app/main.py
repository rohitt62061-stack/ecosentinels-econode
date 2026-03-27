from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import sensor, auth

app = FastAPI(title=settings.PROJECT_NAME)

# Allow React app to talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(sensor.router, prefix=settings.API_V1_STR, tags=["sensor"])

# Root endpoint for healthcheck
@app.get("/")
async def root():
    return {
        "message": "Welcome to EcoNode Server (Layered Architecture)",
        "docs": "/docs",
        "version": "v1 (Milestone 1)"
    }

if __name__ == "__main__":
    import uvicorn
    # Run the server on all interfaces so the ESP32 can reach it on the local network
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
