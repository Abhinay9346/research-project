# Installation & Deployment Guide

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MySQL Server (v8 or higher)

## Local Setup

### 1. Database Setup
1. Open your MySQL client.
2. Create a new database:
   ```sql
   CREATE DATABASE rsms_db;
   ```
3. Import the initial schema and mock data (if provided) into the database.

### 2. Backend Setup
1. Navigate to the `backend` directory.
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your `.env` file (ensure `DB_HOST`, `DB_USER`, `DB_PASS`, and `DB_NAME` match your MySQL setup).
4. Start the backend server:
   ```bash
   npm start
   ```
   The backend should now run on `http://localhost:5000`.

### 3. Frontend Setup
1. Navigate to the project root directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure `.env` contains the correct API URL:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

## Production Deployment

### Frontend
1. Run the build script to generate production-ready static files:
   ```bash
   npm run build
   ```
2. The compiled assets will be in the `dist` folder. Deploy this folder using a static hosting provider (e.g., Nginx, Vercel, Netlify).

### Backend
1. Ensure the Node environment is set to production.
2. Use a process manager like `pm2` to run the backend server:
   ```bash
   pm2 start server.js --name "rsms-api"
   ```
3. Configure a reverse proxy (like Nginx) to forward traffic to the internal Node port.
