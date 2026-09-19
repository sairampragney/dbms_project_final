# REST API Design Specification

## Project: Disaster Alert and Community Response App
**Base API URL**: `/api/v1`

---

## 1. Global API Conventions

### 1.1 Request Headers
* `Content-Type: application/json`
* `Authorization: Bearer <JWT_TOKEN>` (Required for protected endpoints)

### 1.2 Standard Response Format
#### Success Response (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "message": "Resource fetched/created successfully",
  "data": { ... }
}
```

#### Error Response (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Server Error`)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid location or disaster type specified",
    "details": [
      {
        "field": "severity",
        "issue": "Must be one of LOW, MEDIUM, HIGH, CRITICAL"
      }
    ]
  }
}
```

---

## 2. API Endpoints Overview

| Module | Method | Route | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/health` | Public | System health status & database ping |
| **Auth** | `POST` | `/auth/register` | Public | Register new user account |
| **Auth** | `POST` | `/auth/login` | Public | Login & obtain JWT token |
| **Auth** | `GET` | `/auth/me` | Authenticated | Get current authenticated user profile |
| **Dashboard**| `GET` | `/dashboard/stats` | Public | Aggregate database stats |
| **Alerts** | `GET` | `/alerts` | Public | List disaster alerts (filtered) |
| **Alerts** | `GET` | `/alerts/:id` | Public | Get single disaster alert details |
| **Alerts** | `POST` | `/alerts` | ADMIN | Create new disaster alert |
| **Alerts** | `PUT` | `/alerts/:id` | ADMIN | Update disaster alert |
| **Alerts** | `DELETE`| `/alerts/:id` | ADMIN | Cancel/Remove disaster alert |
| **Incidents**| `GET` | `/incidents` | Public | List reported incidents |
| **Incidents**| `GET` | `/incidents/:id` | Public | Get incident details |
| **Incidents**| `POST` | `/incidents` | Public/Auth | Report a new disaster incident |
| **Incidents**| `PATCH`| `/incidents/:id/status` | ADMIN/VOLUNTEER | Update incident status |
| **Requests** | `GET` | `/requests` | Public | List emergency assistance requests |
| **Requests** | `GET` | `/requests/:id` | Public | Get emergency request details |
| **Requests** | `POST` | `/requests` | Public/Auth | Submit emergency assistance request |
| **Requests** | `PATCH`| `/requests/:id/status` | ADMIN | Update request priority/status |
| **Locations**| `GET` | `/locations` | Public | List safe locations & shelters |
| **Locations**| `GET` | `/locations/:id` | Public | Get single shelter details |
| **Locations**| `POST` | `/locations` | ADMIN | Add new safe location |
| **Locations**| `PATCH`| `/locations/:id/occupancy`| ADMIN | Update shelter current occupancy |
| **Volunteers**| `GET` | `/volunteers` | Public | List registered community responders |
| **Volunteers**| `POST` | `/volunteers` | Authenticated | Register current user as volunteer |
| **Volunteers**| `PATCH`| `/volunteers/:id/status` | Authenticated | Update availability status |
| **Responses** | `GET` | `/responses` | ADMIN/VOLUNTEER | List response activities |
| **Responses** | `POST` | `/responses` | ADMIN/VOLUNTEER | Assign volunteer / Record response action |
| **Responses** | `PATCH`| `/responses/:id` | ADMIN/VOLUNTEER | Update response action status |

---

## 3. Detailed Endpoint Specifications

### 3.1 Health Check
* **Route**: `GET /api/v1/health`
* **Response**:
  ```json
  {
    "success": true,
    "data": {
      "status": "UP",
      "timestamp": "2025-02-17T12:00:00Z",
      "database": "CONNECTED"
    }
  }
  ```

### 3.2 Real-Time Dashboard Statistics
* **Route**: `GET /api/v1/dashboard/stats`
* **Response**:
  ```json
  {
    "success": true,
    "data": {
      "activeAlerts": 3,
      "openIncidents": 12,
      "pendingRequests": 5,
      "openShelters": 8,
      "remainingShelterCapacity": 450,
      "availableVolunteers": 24
    }
  }
  ```

### 3.3 Disaster Alerts API
#### `GET /api/v1/alerts`
* **Query Parameters**:
  * `status`: `ACTIVE` \| `RESOLVED` \| `CANCELLED` (default: `ACTIVE`)
  * `severity`: `LOW` \| `MEDIUM` \| `HIGH` \| `CRITICAL`
  * `disasterType`: `FLOOD` \| `FIRE` \| `EARTHQUAKE` \| `STORM` \| `CHEMICAL` \| `OTHER`
* **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "title": "Severe Flash Flood Warning",
        "disasterType": "FLOOD",
        "severity": "CRITICAL",
        "affectedLocation": "Downtown River District",
        "description": "Rising water levels along main riverbank. Seek higher ground immediately.",
        "status": "ACTIVE",
        "createdAt": "2025-02-17T10:00:00Z"
      }
    ]
  }
  ```

#### `POST /api/v1/alerts` (ADMIN only)
* **Request Body**:
  ```json
  {
    "title": "Severe Flash Flood Warning",
    "disasterType": "FLOOD",
    "severity": "CRITICAL",
    "affectedLocation": "Downtown River District",
    "description": "Rising water levels along main riverbank. Seek higher ground immediately."
  }
  ```
* **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Disaster alert published successfully",
    "data": { "id": 1, "title": "Severe Flash Flood Warning", "status": "ACTIVE" }
  }
  ```

### 3.4 Incident Reporting API
#### `POST /api/v1/incidents`
* **Request Body**:
  ```json
  {
    "disasterType": "FIRE",
    "location": "123 Main Street, Sector 4",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "severity": "HIGH",
    "description": "Transformer burst caused small structural fire near apartment building."
  }
  ```
* **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Incident reported successfully",
    "data": { "id": 4, "status": "REPORTED" }
  }
  ```

### 3.5 Emergency Assistance Requests API
#### `POST /api/v1/requests`
* **Request Body**:
  ```json
  {
    "requestType": "RESCUE",
    "priority": "CRITICAL",
    "location": "Block B, Apartment 302, River Road",
    "peopleAffected": 4,
    "contactPhone": "+15550192834",
    "description": "Trapped on 2nd floor balcony due to flood water."
  }
  ```
* **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Emergency request submitted successfully",
    "data": { "id": 2, "status": "PENDING" }
  }
  ```

### 3.6 Safe Locations API
#### `GET /api/v1/locations`
* **Query Parameters**:
  * `status`: `OPEN` \| `FULL` \| `CLOSED`
* **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "Central High School Gym Shelter",
        "address": "500 Education Way",
        "capacity": 200,
        "currentOccupancy": 45,
        "facilities": "Medical Aid, Generator Power, Food Supply, Pet Friendly",
        "status": "OPEN",
        "contactPhone": "+15559876543"
      }
    ]
  }
  ```

#### `PATCH /api/v1/locations/:id/occupancy` (ADMIN)
* **Request Body**:
  ```json
  {
    "currentOccupancy": 50
  }
  ```
* **Response**:
  ```json
  {
    "success": true,
    "message": "Shelter occupancy updated",
    "data": { "id": 1, "currentOccupancy": 50, "status": "OPEN" }
  }
  ```
