# Disaster Management Alert System - Milestone 2 Documentation

## 🎯 Milestone 2 Overview

Milestone 2 implements the **Disaster Monitoring Module** — real-time disaster event tracking using **external APIs**, automatic severity classification, admin verification workflows, and a public alert dashboard.

---

## 🌐 Real External API Integration

### USGS Earthquake API (Live Data)
- **API Used**: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson`
- **Data**: Real-time earthquake events worldwide (magnitude 2.5+, last 24 hours)
- **Fetch Frequency**: Every 5 minutes via Spring `@Scheduled`
- **Deduplication**: Events are checked by title + location to prevent duplicates
- **Auto-categorization**: Severity is classified based on earthquake magnitude:

| Magnitude | Severity Level |
|-----------|---------------|
| ≥ 7.0     | CRITICAL      |
| ≥ 5.0     | HIGH          |
| ≥ 3.0     | MEDIUM        |
| < 3.0     | LOW           |

### Data Flow
```
USGS Earthquake API (Real Internet Data)
        ↓
Spring @Scheduled (every 5 min)
        ↓
Parse GeoJSON → Extract: title, magnitude, lat/lng, location, time
        ↓
Auto-Categorize Severity (by magnitude)
        ↓
Deduplicate (skip if title+location already exists)
        ↓
Save to MySQL as PENDING status
        ↓
Admin Reviews in Dashboard → Approve / Reject / Edit
        ↓
Approved events become VERIFIED → Visible on Public Dashboard
```

---

## 🏗️ Backend Implementation

### New Entities

#### DisasterEvent Entity
```java
@Entity
@Table(name = "disaster_events")
public class DisasterEvent {
    private Long id;
    private String title;           // Event name
    private String description;     // Detailed description
    private DisasterType disasterType;  // EARTHQUAKE, FLOOD, CYCLONE, etc.
    private SeverityLevel severity;     // LOW, MEDIUM, HIGH, CRITICAL
    private Double latitude;
    private Double longitude;
    private String locationName;    // Human-readable location
    private String source;          // "USGS_API" or "MANUAL"
    private LocalDateTime eventTime;
    private EventStatus status;     // PENDING, VERIFIED, REJECTED
    private String createdBy;
    private String approvedBy;
    private LocalDateTime approvedAt;
    private LocalDateTime createdAt;
}
```

#### Enums
- **DisasterType**: FLOOD, CYCLONE, EARTHQUAKE, FIRE, STORM, TSUNAMI, LANDSLIDE, DROUGHT, OTHER
- **SeverityLevel**: LOW, MEDIUM, HIGH, CRITICAL
- **EventStatus**: PENDING, VERIFIED, REJECTED

### New Services

#### DisasterApiService — External API Integration
**File:** `service/DisasterApiService.java`

```java
@Scheduled(fixedRate = 300000) // Every 5 minutes
public void fetchAndStoreEarthquakeData() {
    // 1. Call USGS API
    // 2. Parse GeoJSON response
    // 3. Auto-categorize severity by magnitude
    // 4. Deduplicate by title + location
    // 5. Save new events as PENDING
}
```

Key method — auto-severity:
```java
private SeverityLevel categorizeSeverity(double magnitude) {
    if (magnitude >= 7.0) return SeverityLevel.CRITICAL;
    if (magnitude >= 5.0) return SeverityLevel.HIGH;
    if (magnitude >= 3.0) return SeverityLevel.MEDIUM;
    return SeverityLevel.LOW;
}
```

#### DisasterEventService — CRUD + Verification
**File:** `service/DisasterEventService.java`

- `getVerifiedEvents(filters)` — Public: returns only VERIFIED events with optional filters
- `getPendingEvents()` — Admin: returns events awaiting review
- `approveEvent(id, adminEmail)` — Admin: marks event as VERIFIED
- `rejectEvent(id, adminEmail)` — Admin: marks event as REJECTED
- `editEvent(id, data)` — Admin: modify event details
- `createManualEvent(data, email)` — Admin: manually create event
- `deleteEvent(id)` — Admin: remove event
- `getStatistics()` — Returns counts by status, type, severity

### New API Endpoints

#### Public Disaster Endpoints (No Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/disasters` | Get verified events with filters (type, severity, location) |
| GET | `/api/disasters/all` | Get all verified events |
| GET | `/api/disasters/{id}` | Get single event by ID |
| GET | `/api/disasters/statistics` | Get dashboard statistics |

#### Admin Disaster Endpoints (ADMIN role required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/disasters/pending` | Get all pending events for review |
| GET | `/api/admin/disasters/all` | Get all events (any status) |
| PUT | `/api/admin/disasters/{id}/approve` | Approve a pending event |
| PUT | `/api/admin/disasters/{id}/reject` | Reject a pending event |
| PUT | `/api/admin/disasters/{id}/edit` | Edit event details |
| POST | `/api/admin/disasters/create` | Manually create new event |
| DELETE | `/api/admin/disasters/{id}` | Delete an event |
| POST | `/api/admin/disasters/sync` | Manually trigger USGS API sync |
| GET | `/api/admin/disasters/statistics` | Admin statistics |

### Repository — Dynamic Filtering
```java
@Query("SELECT d FROM DisasterEvent d WHERE d.status = :status " +
       "AND (:type IS NULL OR d.disasterType = :type) " +
       "AND (:severity IS NULL OR d.severity = :severity) " +
       "AND (:location IS NULL OR LOWER(d.locationName) LIKE LOWER(CONCAT('%', :location, '%')))")
List<DisasterEvent> findWithFilters(...);
```

---

## 🎨 Frontend Implementation

### New Components

#### DisasterMonitorComponent
- **Route**: `/disaster-monitor`
- **Tabs**:
  1. **Live Dashboard** — Shows verified events as cards with severity colors, stats, and filters
  2. **Pending Review** (Admin) — List of pending events with Approve/Reject/Edit buttons
  3. **All Events** (Admin) — Full table with all statuses
  4. **Create Event** (Admin) — Manual disaster event creation form
  5. **Profile** — User info

#### DisasterService
- Angular service wrapping all disaster API endpoints
- Handles both public and admin operations

### Navigation Integration
- Dashboard sidebar has **📡 Disaster Monitor** link
- Direct access via `/disaster-monitor`
- Protected by AuthGuard (login required)

---

## 🔐 Security

### Endpoint Security
- Public disaster endpoints (`/api/disasters/**`) — accessible to everyone
- Admin disaster endpoints (`/api/admin/disasters/**`) — requires ADMIN role
- JWT token automatically attached via AuthInterceptor
- Audit trail: `createdBy`, `approvedBy`, `approvedAt` fields

### Admin Verification Workflow
All events from external APIs start as **PENDING** — they must be reviewed and approved by an admin before becoming visible on the public dashboard. This prevents false alerts.

---

## 📊 Disaster Severity Classification

### Automatic Classification (Earthquake)
Based on USGS magnitude scale:
- **CRITICAL (≥7.0)**: Major earthquake, widespread damage
- **HIGH (≥5.0)**: Significant earthquake, potential damage
- **MEDIUM (≥3.0)**: Moderate earthquake, felt by people
- **LOW (<3.0)**: Minor earthquake, rarely felt

### Keyword-Based Classification (Other Types)
```java
public static DisasterType categorizeByDescription(String description) {
    String lower = description.toLowerCase();
    if (lower.contains("flood")) return DisasterType.FLOOD;
    if (lower.contains("cyclone") || lower.contains("hurricane")) return DisasterType.CYCLONE;
    if (lower.contains("earthquake") || lower.contains("quake")) return DisasterType.EARTHQUAKE;
    // ... etc
}
```

---

## 🗄️ Database Changes

### New Table: `disaster_events`
```sql
CREATE TABLE disaster_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    disaster_type VARCHAR(50) NOT NULL,    -- EARTHQUAKE, FLOOD, etc.
    severity VARCHAR(50) NOT NULL,         -- LOW, MEDIUM, HIGH, CRITICAL
    latitude DOUBLE,
    longitude DOUBLE,
    location_name VARCHAR(255),
    source VARCHAR(100) NOT NULL,          -- USGS_API, MANUAL
    event_time DATETIME NOT NULL,
    status VARCHAR(50) NOT NULL,           -- PENDING, VERIFIED, REJECTED
    created_by VARCHAR(255),
    approved_by VARCHAR(255),
    approved_at DATETIME,
    created_at DATETIME NOT NULL
);
```

---

## 🧪 How to Test

### 1. Start Backend
```bash
cd backend
./mvnw spring-boot:run
```
Backend starts on port 8443. The USGS scheduler automatically fetches earthquake data.

### 2. Start Frontend
```bash
cd frontend
ng serve --port 4200
```

### 3. Test Flow
1. Open `http://localhost:4200`
2. Login as Admin
3. Go to **📡 Disaster Monitor**
4. See real earthquake data from USGS in **Pending Review** tab
5. Approve events → they appear on **Live Dashboard**
6. Use filters (type, severity, location) to search
7. Click **🔄 Sync USGS API** to manually fetch latest data
8. Create manual events from **Create Event** tab

### 4. Verify Real API Data
```bash
# Check statistics (should show real earthquake count)
curl http://localhost:8443/api/disasters/statistics

# Check verified events (after admin approval)
curl http://localhost:8443/api/disasters
```

---

## 🎯 Milestone 2 Success Criteria

### ✅ All Requirements Met
1. **Real External API Integration**: USGS Earthquake API fetching live data every 5 minutes
2. **Automatic Severity Classification**: Magnitude-based for earthquakes, keyword-based for others
3. **Admin Verification Workflow**: PENDING → VERIFIED/REJECTED with audit trail
4. **Public Alert Dashboard**: Filtered view of verified disaster events
5. **Location-Based Services**: Filter by location name
6. **Real-Time Updates**: Scheduled data sync + manual sync button
7. **CRUD Operations**: Create, read, update, delete disaster events
8. **Security**: Role-based access, JWT protection, audit fields

### 🚀 Ready for Milestone 3
Foundation complete for:
- WebSocket real-time push notifications
- Multi-channel notifications (email, SMS)
- Weather API integration (storms, floods)
- Geofencing and proximity alerts
- Mobile app integration

---

**Milestone 2 Complete — Real-Time Disaster Monitoring with External API Integration** 🎉
