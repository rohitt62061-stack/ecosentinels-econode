# Econode — Hyper-Local AQI & Circular Waste Intelligence

**India Innovates 2026 · Urban Solutions · MCD × HN**

Econode is a dual-mode civic intelligence platform for the Municipal Corporation
of Delhi (MCD). It provides ward-level air quality monitoring, AI-powered waste
classification, automated policy recommendations, and a citizen incentive system.

## Live Demo
- **Deployed App**: [Your Vercel URL]
- **MCD Login**: officer@mcdindia.gov.in / password123
- **Citizen Login**: Use any Gmail account (Google OAuth)

## Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Database**: Supabase (PostgreSQL + PostGIS + Auth + Edge Functions)
- **AI**: Claude API (waste classification, policy generation, health advisories)
- **AQI Data**: World Air Quality Index (WAQI) API — real Delhi sensor stations
- **Maps**: Leaflet.js with OpenStreetMap tiles
- **Deployment**: Vercel (frontend) + Supabase (backend, always-on)

## Quick Start
cd eco-sentinels/client
cp .env.example .env   # Fill in your Supabase and API keys
npm install
npm run dev

## Features
### MCD Officer Mode
- Ward-level AQI heatmap (not city averages)
- ML source detection: construction dust, biomass burning, vehicle exhaust
- Automated policy recommendations (AI-generated, officer-approved)
- Ghost Waste Predictor: predicts illegal burning 12 hours early
- 72-hour cascade simulation with rupee health cost estimate
- Fleet route optimization using OSRM

### Citizen Mode
- Real-time AQI gauge for your specific ward
- AI waste classification via camera (Claude Vision API)
- Phone OTP login (no Gmail required)
- Eco score, badges, and monthly credits
- Ward pollution reporting feed

## Team
[Your team member names and roles]

## Built for Viksit Bharat 2047
