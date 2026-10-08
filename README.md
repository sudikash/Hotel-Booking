# 🏨 StayLuxe Home — Luxury Hotel Booking Platform

[![React](https://img.shields.io/badge/React-19-blue?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![ImageKit](https://img.shields.io/badge/ImageKit-Media_CDN-0570EB)](https://imagekit.io/)
[![License](https://img.shields.io/badge/License-ISC-informational)](LICENSE)

A full-stack, responsive luxury hotel reservation and property host management platform built with **React 19**, **Tailwind CSS v4**, **Node.js**, **Express 5**, and **MongoDB**. The platform provides guests with seamless search, discovery, and instant booking reservation workflows, while offering hosts a full dashboard to list properties, manage availability, process guest bookings, and upload photos via **ImageKit**.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
  - [Guest Experience](#1-guest-experience)
  - [Host & Property Management](#2-host--property-management)
  - [Security & Architecture](#3-security--architecture)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Database Seeding](#database-seeding)
  - [Running Locally](#running-locally)
- [API Reference](#-api-reference)
  - [Authentication (`/api/auth`)](#authentication-apiauth)
  - [Properties (`/api/properties`)](#properties-apiproperties)
  - [Bookings (`/api/bookings`)](#bookings-apibookings)
  - [Uploads (`/api/uploads`)](#uploads-apiuploads)
  - [System Health (`/api/health`)](#system-health-apihealth)
- [Data Models](#-data-models)
- [Deployment](#-deployment)
- [License](#-license)

---

## ✨ Key Features

### 1. Guest Experience
- **Interactive Search & Discovery**: Filter properties by destination city, guest count, and date ranges directly from the hero search bar.
- **Showcase & Featured Stays**: Browse curated collections of luxury villas, penthouses, chalets, and boutique ryokans.
- **Detailed Room Showcase**: Dedicated property pages with rich image galleries, thumbnail navigation, bedroom counts, square meters, pricing breakdown, and FontAwesome amenity badges.
- **Seamless Booking Flow**: Real-time date calculation with check-in/check-out validation, dynamic price computation, and instant reservation submissions.
- **Reservation Center**: Guest booking dashboard to monitor stay statuses (`pending`, `confirmed`, `denied`, `cancelled`) with instant cancellation capabilities.

### 2. Host & Property Management
- **Dedicated Host Dashboard**: View and monitor all listings owned by the logged-in user in real time (`GET /api/properties/mine`).
- **Drag-and-Drop Image Uploader**: Multi-image drag-and-drop selector with thumbnail preview and direct cloud uploads to ImageKit with base64 fallback.
- **Listing Creation & Modification**: Publish properties with custom amenities, nightly rates, location metadata, guest limits, and room specifications.
- **Guest Booking Decisions**: Accept or decline incoming guest reservation requests with a single click (`PATCH /api/bookings/:id/decision`).
- **Listing Lifecycle Management**: Edit existing listing details or archive/delete listings.

### 3. Security & Architecture
- **Dual-Token Auth Pipeline**: Secure HTTP-only cookies accompanied by Bearer authorization header fallback in localStorage for cross-origin resilience.
- **Bcrypt Password Encryption**: Industry-standard cryptographic hashing for user credentials.
- **Input Sanitization & Validation**: Express Validator middleware enforcing strict types, ISO 8601 date ranges, and MongoDB ObjectID formats.
- **Production Hardened**: Integrated Helmet security headers, CORS origin resolution, unified centralized error handlers, and unhandled exception guards.

---

## 🛠️ Tech Stack

### Frontend (`client/`)
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite`
- **Icons**: [FontAwesome](https://fontawesome.com/) (`@fortawesome/react-fontawesome`, `@fortawesome/free-solid-svg-icons`)
- **Routing**: Lightweight, high-performance HTML5 History API & popstate routing

### Backend (`server/`)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express 5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose 9](https://mongoosejs.com/)
- **Authentication**: [JSON Web Tokens (jsonwebtoken)](https://github.com/auth0/node-jsonwebtoken) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **File Uploads**: [Multer](https://github.com/expressjs/multer) & [ImageKit Node SDK](https://github.com/imagekit-developer/imagekit-nodejs)
- **Security**: [Helmet](https://helmetjs.github.io/), [CORS](https://github.com/expressjs/cors), [cookie-parser](https://github.com/expressjs/cookie-parser)

---

## 📂 Project Architecture

```text
hotelBooking/
├── client/                     # Frontend Application (React + Vite)
│   ├── public/
│   │   └── images/             # Static showcase assets & room photography
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, Footer, Icons)
│   │   ├── hooks/              # Custom React hooks (AuthContext)
│   │   ├── pages/              # Application views & route handlers
│   │   │   ├── Booking/        # Booking form & user reservations list
│   │   │   ├── Dashboard/      # Host property & reservation management
│   │   │   ├── Home/           # Hero search & hotel discovery grid
│   │   │   ├── Hotels/         # Hotel details view & List Property form
│   │   │   ├── Profile/        # User authentication (Login / Register)
│   │   │   └── Rooms/          # Detailed room showcase & gallery
│   │   ├── services/           # Fetch API client wrapper & SPA navigation
│   │   ├── App.jsx             # Top-level routing & layout shell
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Tailwind CSS imports & global design tokens
│   ├── index.html              # HTML5 entry point
│   ├── package.json            # Client dependencies and scripts
│   └── vite.config.js          # Vite config & API reverse proxy (/api -> :8080)
│
├── server/                     # Backend API (Express + Node.js)
│   ├── src/
│   │   ├── config/             # Database connection & Atlas DNS resolution
│   │   ├── controllers/        # Request controllers (auth, booking, property, upload)
│   │   ├── middlewares/        # JWT auth verification & express-validator chains
│   │   ├── models/             # Mongoose schemas (User, Property, Booking)
│   │   ├── routes/             # REST API route declarations
│   │   ├── services/           # Third-party integrations (ImageKit storage)
│   │   ├── utils/              # API helpers, pagination utils, and seed scripts
│   │   └── app.js              # Express app setup, CORS, and middleware pipeline
│   ├── server.js               # Server entry point & process lifecycle handlers
│   └── package.json            # Server dependencies and scripts
│
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure the following tools are installed on your workstation:
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)
- **MongoDB** (Local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) connection string)
- *(Optional)* **ImageKit.io account** for cloud photo uploads

---

### Installation

Clone the repository and install dependencies for both the client and server:

```bash
# 1. Clone repository
git clone https://github.com/your-username/hotelBooking.git
cd hotelBooking

# 2. Install backend dependencies
cd server
npm install

# 3. Install frontend dependencies
cd ../client
npm install
```

---

### Environment Configuration

#### 1. Backend Environment Setup (`server/.env`)
Create a `.env` file inside the `server/` directory:

```env
PORT=8080
NODE_ENV=development

# MongoDB Connection String (Atlas or Local)
DATABASE_KEY=mongodb+srv://<username>:<password>@cluster.mongodb.net/hotelbooking?retryWrites=true&w=majority

# JWT Authentication Secret
JWT_PRIVATE=your_super_secret_jwt_key_here

# Allowed CORS Origins (comma-separated for multiple origins)
CORS_ORIGIN=http://localhost:5173

# Cookie Security
COOKIE_SECURE=false

# ImageKit Cloud Storage (Optional for property photo uploads)
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

#### 2. Frontend Environment Setup (`client/.env`)
Create a `.env` file inside the `client/` directory:

```env
VITE_API_URL=/api
```

*(Note: During development, Vite automatically proxies `/api` requests to `http://localhost:8080` via `vite.config.js`)*.

---

### Database Seeding

Populate your database with rich demo properties, suites, and chalets across Switzerland, Greece, Japan, France, and more:

```bash
cd server
npm run seed
```

This script will connect to your MongoDB database, create a demo host account if needed, and populate ready-to-book properties with photos, pricing, and coordinates.

---

### Running Locally

Run both backend and frontend development servers concurrently:

```bash
# Terminal 1: Launch Backend (Port 8080 with nodemon auto-reload)
cd server
npm run dev

# Terminal 2: Launch Frontend (Port 5173 with Vite HMR)
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 📡 API Reference

### Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user (`userName`, `email`, `passWord`) |
| `POST` | `/api/auth/loginuser` | Public | Authenticate user & issue JWT cookie/token |
| `POST` | `/api/auth/logout` | Public | Clear authentication cookie |
| `GET` | `/api/auth/me` | Authenticated | Fetch current user session profile |

---

### Properties (`/api/properties`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/properties` | Public | List published properties (filters: `city`, `search`, `guests`, `page`, `limit`) |
| `GET` | `/api/properties/featured` | Public | Retrieve curated featured properties |
| `GET` | `/api/properties/mine` | Authenticated | List all properties owned by the authenticated user |
| `GET` | `/api/properties/:id` | Public | Get single property details by ID |
| `POST` | `/api/properties` | Authenticated | Create a new property listing |
| `PATCH` | `/api/properties/:id` | Host / Admin | Update an existing property listing |
| `DELETE`| `/api/properties/:id` | Host / Admin | Archive/delete a property listing |

---

### Bookings (`/api/bookings`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings` | Authenticated | Create a booking reservation (`propertyId`, `checkIn`, `checkOut`, `guests`) |
| `GET` | `/api/bookings` | Authenticated | Get current user's booking history |
| `GET` | `/api/bookings/owner` | Host / Admin | List incoming booking requests for host's properties |
| `GET` | `/api/bookings/:id` | Authenticated | Retrieve specific booking details |
| `PATCH` | `/api/bookings/:id/decision` | Host / Admin | Approve or deny booking request (`decision`: `accept` \| `deny`) |
| `PATCH` | `/api/bookings/:id/cancel` | Authenticated | Cancel a pending or confirmed booking |

---

### Uploads (`/api/uploads`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/uploads/images` | Authenticated | Upload up to 10 property photos via `multipart/form-data` |

---

### System Health (`/api/health`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Returns service uptime, database connection status, and API health |

---

## 🗄️ Data Models

### User Schema (`users`)
```json
{
  "_id": "ObjectId",
  "userName": "string (unique, required)",
  "email": "string (required, indexed)",
  "passWord": "string (hashed)",
  "role": "string (enum: ['user', 'admin'], default: 'user')"
}
```

### Property Schema (`properties`)
```json
{
  "_id": "ObjectId",
  "owner": "ObjectId (ref: users)",
  "name": "string (required)",
  "description": "string",
  "location": {
    "address": "string",
    "city": "string (required)",
    "country": "string (required)",
    "postalCode": "string"
  },
  "amenities": ["string"],
  "imageUrls": ["string"],
  "nightlyRateCents": "number (required, integer)",
  "maxGuests": "number (required, integer)",
  "currency": "string (ISO 4217, default: 'USD')",
  "status": "string (enum: ['draft', 'published', 'archived'], default: 'draft')",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Booking Schema (`bookings`)
```json
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: users)",
  "property": "ObjectId (ref: properties)",
  "checkIn": "Date (required)",
  "checkOut": "Date (required, > checkIn)",
  "guests": "number (required)",
  "nightlyRateCents": "number (required)",
  "totalAmountCents": "number (required)",
  "currency": "string (default: 'USD')",
  "status": "string (enum: ['pending', 'confirmed', 'denied', 'cancelled', 'completed'])",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## 🚢 Deployment

### Production Build
Build the client application into static assets:

```bash
cd client
npm run build
```

The generated files in `client/dist` are automatically served as static files by Express (`server/src/app.js`) with Single Page Application (SPA) HTML5 fallback routing when deployed as a combined service.

### Hosting Suggestions
- **Backend & Full-Stack Deployment**: [Render](https://render.com/), [Railway](https://railway.app/), or [AWS Elastic Beanstalk]
- **Frontend Only** *(if hosting separately)*: [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Media CDN**: [ImageKit.io](https://imagekit.io/)

---

## 📄 License

This project is licensed under the **ISC License**.#   H o t e l - B o o k i n g 
 
 #   H o t e l - B o o k i n g  
 