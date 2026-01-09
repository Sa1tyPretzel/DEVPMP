# 🚛 DriveSense - Smart Fleet Management Platform

Welcome to **DriveSense** — your all-in-one solution for managing trucking fleets, trips, and ELD compliance 📋. Built with **React + Vite** ⚡ for the frontend and **Django REST Framework** 🐍 for the backend, this platform provides intelligent trip tracking, HOS (Hours of Service) compliance monitoring, and route optimization.

---

## 📚 Table of Contents

* ✨ [Features](#-features)
* 🛠️ [Tech Stack](#️-tech-stack)
* 🏗️ [Architecture](#️-architecture)
* 🧰 [Setup Instructions](#-setup-instructions)
  * 🖥️ [Backend Setup](#️-backend-setup)
  * 💻 [Frontend Setup](#-frontend-setup)
* 📡 [API Documentation](#-api-documentation)
  * 🔐 [Authentication](#-authentication)
  * 🚚 [Trips](#-trips)
  * ⏱️ [Duty Statuses](#️-duty-statuses)
  * 📜 [ELD Logs](#-eld-logs)
  * 🗺️ [Route Calculation](#️-route-calculation)
  * 🚗 [Vehicles](#-vehicles)
  * 🏢 [Carriers](#-carriers)
  * 👷 [Drivers](#-drivers)

---

## ✨ Features

* ➕ CRUD operations for trips, vehicles, carriers, and drivers
* 🧑‍✈️ Manage driver duty statuses (e.g., `DRIVING`, `OFF_DUTY`, `SLEEPER_BERTH`, `ON_DUTY_NOT_DRIVING`)
* 📊 Generate and retrieve ELD logs for FMCSA compliance
* 🔐 JWT-based authentication with refresh tokens
* 📍 Interactive maps with Leaflet for route visualization
* 🗺️ HOS-compliant route calculation with mandatory rest stops
* 📈 Dashboard with trip metrics and analytics
* 🚛 Fleet management with vehicle assignment
* ⚡ Real-time updates with React Query

---

## 🛠️ Tech Stack

### Backend
* 🧱 **Framework**: Django 4.2, Django REST Framework 3.15
* 🗃️ **Database**: PostgreSQL (Neon Cloud)
* 🔐 **Auth**: JSON Web Tokens (SimpleJWT)
* ☁️ **Deployment**: Render

### Frontend
* ⚛️ **Framework**: React 18
* ⚡ **Build Tool**: Vite 5.4
* 🎨 **Styling**: Tailwind CSS
* 🗺️ **Maps**: Leaflet + React-Leaflet
* 📊 **Charts**: Recharts
* 🚀 **Deployment**: Vercel

---

## 🏗️ Architecture

DriveSense follows a **3-tier architecture** pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION TIER                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Vercel CDN  │──│ React+Vite  │──│ Leaflet Maps        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ API Calls
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC TIER                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Render    │──│ Django REST │──│ HOS Calculator      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ R/W
┌─────────────────────────────────────────────────────────────┐
│                       DATA TIER                             │
│              ┌─────────────────────────┐                    │
│              │   Neon PostgreSQL       │                    │
│              └─────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

## 🧰 Setup Instructions

### 🧾 Prerequisites

* 🐍 Python 3.11+
* 📦 Node.js 18+
* 🐘 PostgreSQL 15+ (or Neon cloud account)
* ♻️ Redis (optional for Celery)
* 🧬 Git

---

### 🖥️ Backend Setup

#### 1. Navigate to Backend Directory 📁

```bash
cd server
```

#### 2. Create Virtual Environment 🐍

```bash
python -m venv env
source env/bin/activate  # Windows: env\Scripts\activate
```

#### 3. Install Dependencies 📦

```bash
pip install -r requirements.txt
```

#### 4. Configure Environment 🌐

Create a `.env` file in the `server` directory:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/drivesense
ALLOWED_HOSTS=localhost,127.0.0.1
```

#### 5. Apply Migrations 🧬

```bash
python manage.py makemigrations
python manage.py migrate
```

#### 6. Create Superuser 🧑‍💻

```bash
python manage.py createsuperuser
```

#### 7. Run Server 🚀

```bash
python manage.py runserver
```

🌐 Backend API: `http://127.0.0.1:8000/api/`

---

### 💻 Frontend Setup

#### 1. Navigate to Frontend Directory 📁

```bash
cd client
```

#### 2. Install Dependencies 📦

```bash
npm install
```

#### 3. Configure Environment 🌐

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

#### 4. Run Development Server ⚡

```bash
npm run dev
```

🌐 Frontend: `http://localhost:5173`

---

### 🧪 Testing

#### Backend Tests
```bash
cd server
python manage.py test
```

#### Frontend Lint
```bash
cd client
npm run lint
```

---

## 📡 API Documentation

**Base URL:** `http://127.0.0.1:8000/api/`

> ⚠️ All endpoints (except `/auth/login/`, `/auth/register/` & `/auth/refresh/`) require a Bearer token:

```
Authorization: Bearer <access_token>
```

---

### 🔐 Authentication

#### 📝 POST `/auth/register/`

Register a new user.

**Request:**

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "first_name": "string",
  "last_name": "string"
}
```

**Response:**

```json
{
  "id": 1,
  "username": "string",
  "email": "string"
}
```

**Curl Example:**

```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
-H "Content-Type: application/json" \
-d '{"username": "driver1", "email": "driver@example.com", "password": "securepass123"}'
```

---

#### 🔑 POST `/auth/login/`

Login to get access and refresh tokens.

**Request:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "access": "string",
  "refresh": "string"
}
```

**Curl Example:**

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
-H "Content-Type: application/json" \
-d '{"username": "driver1", "password": "securepass123"}'
```

---

#### 🔄 POST `/auth/refresh/`

Refresh your access token.

**Request:**

```json
{
  "refresh": "string"
}
```

**Response:**

```json
{
  "access": "string"
}
```

---

### 🚚 Trips

#### 📋 GET `/trips/`

List all trips for the authenticated user.

**Query Params:**

* `status` (e.g., PLANNED, IN_PROGRESS, COMPLETED)
* `page`, `limit`

**Example:**

```bash
curl -X GET "http://127.0.0.1:8000/api/trips/?status=PLANNED" \
-H "Authorization: Bearer <access_token>"
```

---

#### 🆕 POST `/trips/`

Create a new trip.

**Request Body:**

```json
{
  "vehicle": 1,
  "current_location_input": [72.8692, 19.054],
  "current_location_name": "Mumbai, India",
  "pickup_location_input": [73.8545, 18.5213],
  "pickup_location_name": "Pune, India",
  "dropoff_location_input": [73.7902, 20.0112],
  "dropoff_location_name": "Nashik, India",
  "current_cycle_hours": 6.0,
  "start_time": "2025-06-27T17:16:00Z",
  "status": "PLANNED"
}
```

**Curl Example:**

```bash
curl -X POST http://127.0.0.1:8000/api/trips/ \
-H "Authorization: Bearer <access_token>" \
-H "Content-Type: application/json" \
-d '{"vehicle": 1, "current_location_input": [72.8692, 19.054], "current_location_name": "Mumbai", "pickup_location_input": [73.8545, 18.5213], "pickup_location_name": "Pune", "dropoff_location_input": [73.7902, 20.0112], "dropoff_location_name": "Nashik", "current_cycle_hours": 6.0, "start_time": "2025-06-27T17:16:00Z", "status": "PLANNED"}'
```

---

#### 🔍 GET `/trips/{id}/`

Retrieve trip details.

#### ✏️ PATCH `/trips/{id}/`

Update a trip (e.g., change status).

#### 🗑️ DELETE `/trips/{id}/`

Delete a trip.

---

### 🗺️ Route Calculation

#### 📍 GET `/trips/{trip_id}/route/`

Calculate an HOS-compliant route with mandatory rest stops.

**Response:**

```json
{
  "route_geometry": "encoded_polyline_string",
  "total_distance_miles": 450.5,
  "total_duration_hours": 8.5,
  "rest_stops": [
    {
      "location": [73.5, 19.5],
      "type": "30_MIN_BREAK",
      "after_hours": 8
    }
  ]
}
```

**Curl Example:**

```bash
curl -X GET http://127.0.0.1:8000/api/trips/1/route/ \
-H "Authorization: Bearer <access_token>"
```

---

### ⏱️ Duty Statuses

#### 📋 GET `/trips/{trip_id}/duty-status/`

List duty statuses for a trip.

#### ➕ POST `/trips/{trip_id}/duty-status/`

Add a duty status.

**Request Body:**

```json
{
  "status": "DRIVING",
  "start_time": "2025-06-27T17:16:00Z",
  "end_time": "2025-06-27T18:16:00Z",
  "location_description": "Mumbai to Pune Highway",
  "remarks": "Clear weather conditions"
}
```

**Available Statuses:**
* `OFF_DUTY` - Off Duty
* `SLEEPER_BERTH` - Sleeper Berth
* `DRIVING` - Driving
* `ON_DUTY_NOT_DRIVING` - On Duty Not Driving

---

### 📜 ELD Logs

#### 📖 GET `/trips/{trip_id}/eld-logs/`

List ELD logs for a trip.

#### ⚙️ POST `/trips/{trip_id}/eld-logs/generate/`

Generate ELD logs for a given date.

**Request:**

```json
{
  "date": "2025-06-27"
}
```

**Curl Example:**

```bash
curl -X POST http://127.0.0.1:8000/api/trips/1/eld-logs/generate/ \
-H "Authorization: Bearer <access_token>" \
-H "Content-Type: application/json" \
-d '{"date": "2025-06-27"}'
```

---

### 🚗 Vehicles

#### 📋 GET `/vehicles/`

List all vehicles.

#### 🆕 POST `/vehicles/`

Create a vehicle.

**Request Body:**

```json
{
  "carrier": 1,
  "vehicle_number": "TRK-001",
  "license_plate": "MH-12-AB-1234",
  "state": "MH",
  "assigned_driver": 1
}
```

---

### 🏢 Carriers

#### 📋 GET `/carriers/`

List all carriers.

#### 🆕 POST `/carriers/`

Create a carrier.

**Request Body:**

```json
{
  "name": "Express Logistics",
  "main_office_address": "123 Transport Street, Mumbai"
}
```

---

### 👷 Drivers

#### 📋 GET `/drivers/`

List all drivers.

#### 🆕 POST `/drivers/`

Create a driver profile.

**Request Body:**

```json
{
  "carrier": 1,
  "license_number": "DL-2025-001",
  "role": "DRIVER"
}
```

**Available Roles:**
* `DRIVER` - Driver
* `MANAGER` - Manager
* `ADMIN` - Admin

---

### 👤 User Info

#### 🔍 GET `/user-info/`

Get current authenticated user info.

---

## 🚀 Deployment

### 🌐 Frontend (Vercel)

1. Push your code to GitHub
2. Connect repository to Vercel
3. Set environment variables:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
4. Deploy!

### ☁️ Backend (Render)

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Set environment variables:
   ```
   SECRET_KEY=your-production-secret-key
   DATABASE_URL=your-neon-postgres-url
   DEBUG=False
   ALLOWED_HOSTS=your-backend-url.onrender.com
   ```
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `gunicorn config.wsgi:application`
6. Deploy!

### 🐘 Database (Neon)

1. Create a Neon account
2. Create a new PostgreSQL database
3. Copy the connection string to `DATABASE_URL`

---
