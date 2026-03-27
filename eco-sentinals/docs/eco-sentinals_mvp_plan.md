# Eco-Sentinels MVP Plan

## 📊 Vision
Build a dual-mode sentinel system dashboard and Citizen PWA with multi-tenant isolation, real-time AQI monitoring, and an automated alerting system, styled with the "Stitch" design system.

## 🛠️ Tech Stack
- **Frontend**: Vite + React + TailwindCSS (integrating Stitch UI)
- **Backend**: FastAPI (Python)
- **Firmware**: ESP32 (Telemetry)
- **Storage**: Multi-tenant data structure (Ward isolation)

## 🎯 Scope

### ✅ In-Scope
- **FastAPI Multi-tenancy**: Ward level isolation.
- **Secure API endpoints**: For ESP32 telemetry.
- **Citizen PWA**: Auth, 4-step Reporting Flow (Photo/Location), Offline caching.
- **MCD Dashboard**: Live Telemetry Map, Alerts Management.
- **Stitch UI**: Design System integration.

### 🚫 Out-of-Scope
- **Multi-node hardware scaling**: Focus on 1 prototype.
- **Real Blockchain integration**: Use mock token logic.
- **Advanced Analytics**: Focus on real-time data first.

---

## 📍 Milestones

### 🟢 M1: Core Infrastructure & Edge Security
- [ ] **Backend**: Implement multi-tenant schema for Ward isolation in FastAPI
- [ ] **Security**: Setup JWT/Token Authentication for ESP32 API endpoints
- [ ] **MCD**: Build initial live-map grid view for telemetry updates

### 🟡 M2: Citizen Engagement & Reporting
- [ ] **Citizen App**: Build Profile and Authentication views
- [ ] **Reporting Flow**: Implement 4-step flow (Category -> Details -> Location -> Submit)
- [ ] **Offline Resilience**: Enable IndexedDB/LocalStorage caching for offline reports.
  - *Behavior*: **Auto-sync on reconnect** with high-level notification to the user.

### 🔵 M3: Governance Automation & Stitch UI
- [ ] **Alerts Management**: Create table with status toggles.
- [ ] **Automation**: Setup background triggers for AQI > 300 alert creation.
- [ ] **UI Review**: Migrate all views to "Stitch" typography & color palette.

---

## ✅ Validation & Acceptance Criteria

### 🖥️ MCD Dashboard
- **Real-time Updates**: Verify telemetry updates on map within **< 3 seconds** of API post.
- **Data Isolation**: Verify Ward isolation (User A cannot view Ward B reports).

### 📱 Citizen PWA
- **Performance**: Verify page load speed is **< 2 seconds** on simulated 3G.
- **Offline Resilience**: Verify report creation works successfully when offline.

### ⚙️ Backend / API
- **Load Capacity**: Verify endpoints support **10 requests/sec** with latency < 200ms.
