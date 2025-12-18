# Inventory Tracking System

Enterprise-grade inventory management with:

- Location directory and item catalog (auto-generated item codes)
- Live stock monitoring with negative-quantity prevention
- Filters, search, pagination, and dashboard analytics
- Low-stock analysis with optional AI summary
- Admin OTP login with JWT (MongoDB-backed or in-memory fallback)

## Tech Stack

- Frontend: React + TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, JWT, bcrypt
- Data:
  - Inventory data persisted in `localStorage` (no DB required to run)
  - Admin and OTP records in MongoDB Atlas (optional; falls back to memory if not configured)
- Email: Nodemailer (optional) for sending OTP codes

## Quick Start

Prerequisites: Node.js 18+ (recommended 20+)

### 1) Backend (Auth API)

```
cd backend
npm install
```

Create `backend/.env` (do not commit secrets). Example:

```
MONGODB_URI=your-atlas-connection-string
MONGODB_DB=inventory_app
JWT_SECRET=strong-secret
OTP_TTL_MS=180000
DEFAULT_ADMIN_EMAIL=your-admin@email.com
# Optional SMTP for emailing OTPs
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email
SMTP_PASS=your-app-password
FROM_EMAIL=your-email
FROM_NAME=Inventory Admin
```

Start the API:

```
npm start
```

If MongoDB is unavailable, the server uses an in-memory admin store and logs OTP codes to the console.

### 2) Frontend (Web App)

```
cd frontend
npm install
npm run dev
```

Optional: create `frontend/.env` and set:

```
GEMINI_API_KEY=your-key
```

Without a key, low-stock analysis falls back to a deterministic summary.

Open the app at `http://localhost:3000/`.

## Admin Login

- Navigate to `/admin/login`
- Enter your admin email and password
- Click “Send OTP” (OTP is emailed if SMTP is configured; otherwise printed to backend logs)
- Enter the OTP to receive a JWT and enable admin actions in the UI

## Core Features

- Locations: add/delete and manage warehouses/stores
- Items: register items with auto-generated codes; set minimum quantities
- Stock: update quantities per location+item; prevents negative values
- Insights: dashboard stats; low-stock analysis with optional AI summary
- Alerts: low-stock email alert stub (logs if SMTP not configured)

## Configuration Files

- Frontend config: `frontend/vite.config.ts`
- Frontend types/services/components: `frontend/src/**`
- Backend server: `backend/src/server.js`
- MongoDB connection: `backend/src/config/db.js`
- Mailer setup: `backend/src/utils/mailer.js`

## API Endpoints (Backend)

- `POST /api/admin/auth/send-otp`
  - Body: `{ "email": "admin@example.com" }`
  - Returns success and (if SMTP disabled) prints OTP in server logs
- `POST /api/admin/auth/login`
  - Body: `{ "email": "...", "password": "...", "otp": "...." }`
  - Returns `{ token, role }` on success
- `GET /api/admin/dashboard` (Bearer token required)
  - Returns a secure dashboard payload for admins

## Development Notes

- Inventory data is stored in browser `localStorage` for simplicity; clearing storage resets inventory
- Admin/OTP data can use MongoDB Atlas when `MONGODB_URI` is set; otherwise memory store is used
- Secrets are not committed; `.gitignore` excludes `.env` files and `node_modules`

## Build & Preview (Frontend)

```
cd frontend
npm run build
npm run preview
```

## Security

- Keep secrets in `.env`, not in source control
- Use a strong `JWT_SECRET`
- Configure SMTP with app passwords (not personal credentials)

## License

MIT
