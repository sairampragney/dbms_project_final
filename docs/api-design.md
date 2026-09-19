# REST API Design Specification

## Project: Disaster Alert and Community Response App
**Supported API Prefixes**: `/api` and `/api/v1`

---

## 1. Global API Conventions

### 1.1 Request Headers
* `Content-Type: application/json`
* `Authorization: Bearer <JWT_TOKEN>` (Required for protected endpoints)

### 1.2 Pagination, Sorting & Filtering
Standard query parameters supported across list endpoints:
* `page`: Page number (default: `1`)
* `limit`: Page size limit (default: `20`, max: `100`)
* `search`: Keyword string for text fields (title, location, name, description)
* `status`: Exact filter for status enum
* `sortBy`: Field name to sort by (e.g. `createdAt`, `severity`, `priority`, `capacity`)
* `order`: `ASC` or `DESC` (default: `DESC`)

### 1.3 Standard Response Envelope
```json
{
  "success": true,
  "message": "Resource operation completed successfully",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

## 2. API Endpoints Matrix

| Module | Method | Route / Aliases | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/api/health` | Public | System health status & DB pool check |
| **Auth** | `POST` | `/api/auth/register` | Public | Register user account |
| **Auth** | `POST` | `/api/auth/login` | Public | Login & receive JWT |
| **Auth** | `GET` | `/api/auth/me` | Authenticated | Current user profile |
| **Dashboard**| `GET` | `/api/dashboard/stats` | Public | Real-time aggregate DB metrics |
| **Alerts** | `GET` | `/api/alerts` | Public | List disaster alerts (paginated/filtered) |
| **Alerts** | `GET` | `/api/alerts/:id` | Public | Single alert details |
| **Alerts** | `POST` | `/api/alerts` | ADMIN | Create disaster alert |
| **Alerts** | `PUT` | `/api/alerts/:id` | ADMIN | Update disaster alert |
| **Alerts** | `DELETE`| `/api/alerts/:id` | ADMIN | Remove/Cancel disaster alert |
| **Incidents**| `GET` | `/api/incidents` | Public | List reported incidents |
| **Incidents**| `GET` | `/api/incidents/:id` | Public | Single incident details |
| **Incidents**| `POST` | `/api/incidents` | Public/Auth | Report new disaster incident |
| **Incidents**| `PUT` | `/api/incidents/:id` | ADMIN/VOLUNTEER | Full update incident |
| **Incidents**| `DELETE`| `/api/incidents/:id` | ADMIN | Delete incident record |
| **Requests** | `GET` | `/api/emergency-requests` (or `/api/requests`) | Public | List emergency assistance requests |
| **Requests** | `GET` | `/api/emergency-requests/:id` | Public | Single request details |
| **Requests** | `POST` | `/api/emergency-requests` | Public/Auth | Submit emergency request |
| **Requests** | `PUT` | `/api/emergency-requests/:id` | ADMIN/VOLUNTEER | Update emergency request |
| **Requests** | `DELETE`| `/api/emergency-requests/:id` | ADMIN | Delete emergency request |
| **Locations**| `GET` | `/api/safe-locations` (or `/api/locations`) | Public | List safe location shelters |
| **Locations**| `GET` | `/api/safe-locations/:id` | Public | Single shelter details |
| **Locations**| `POST` | `/api/safe-locations` | ADMIN | Create safe location shelter |
| **Locations**| `PUT` | `/api/safe-locations/:id` | ADMIN | Update shelter details/occupancy |
| **Locations**| `DELETE`| `/api/safe-locations/:id` | ADMIN | Delete safe location shelter |
| **Volunteers**| `GET` | `/api/volunteers` | Public | List registered volunteers |
| **Volunteers**| `GET` | `/api/volunteers/:id` | Public | Single volunteer details |
| **Volunteers**| `POST` | `/api/volunteers` | Authenticated | Register current user as volunteer |
| **Volunteers**| `PUT` | `/api/volunteers/:id` | Authenticated/ADMIN | Update volunteer profile/status |
| **Volunteers**| `DELETE`| `/api/volunteers/:id` | ADMIN | Remove volunteer profile |
| **Responses** | `GET` | `/api/response-records` (or `/api/responses`) | ADMIN/VOLUNTEER | List response activities |
| **Responses** | `GET` | `/api/response-records/:id` | ADMIN/VOLUNTEER | Single response record details |
| **Responses** | `POST` | `/api/response-records` | ADMIN/VOLUNTEER | Assign volunteer / Record response |
| **Responses** | `PUT` | `/api/response-records/:id` | ADMIN/VOLUNTEER | Update response record |
| **Responses** | `DELETE`| `/api/response-records/:id` | ADMIN | Delete response record |
