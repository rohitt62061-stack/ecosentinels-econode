# ADR-001: Persistence Layer for Telemetry Data

## Status
**Proposed**

## Context
The **EcoNode** backend state (`latest_aqi`, `firebase_state`) currently executes entirely in the memory stack on the FastAPI instance. The dashboard telemetry requires historic data representation; current setups lose states upon node reloads/restarts in production.

## Decision
We propose adding a **Persistence Layer** using **SQLite** mediated by **SQLModel** (or SQLAlchemy) to store historical ingestion frames. 

## Rationale
- **Constraint Fit**: Fits edge laptop deployment with no explicit heavy database server (fits cost limits).
- **Scalability Layout**: Decouples active sensors streams effectively so restarting the server can re-index baseline telemetry data sets without losing Ward alert streams.

## Trade-offs
- **Costs**: Adds disk writing overhead (mitigated easily by SQLite light framing).
- **Complexity**: Marginal addition of orm model references index.

## Consequences
- **Positive**: Resilient state data trackers, easier reporting diagnostics.
- **Negative**: Adds SQL dependencies.
- **Mitigation**: Standard lightweight direct setup mapping.

---
*Created using @architecture Guidelines*
