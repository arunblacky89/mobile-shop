## Mobile Shop E‑Commerce Platform

This project is an **Amazon‑style mobile e‑commerce platform** built with:

- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS (`frontend`)
- **Backend**: Django 6 + Django REST Framework (`backend`)
- **DB**: PostgreSQL (SQLite used only for initial local dev)
- **Extras (planned)**: Redis, Meilisearch, S3/R2, Razorpay, Stripe, Shiprocket, Sentry, GitHub Actions.

### Structure

- `frontend/` – customer + admin web app
- `backend/` – API server (`config` project, `api` app)
- `venv/` – Python virtualenv (local only)

### Getting started (local)

1. **Backend**
   - Open a terminal in `backend` and run:
     - `..\venv\Scripts\python.exe -m pip install -r requirements.txt`
     - `..\venv\Scripts\python.exe manage.py migrate`
     - `..\venv\Scripts\python.exe manage.py runserver 8000`
2. **Frontend**
   - Open another terminal in `frontend` and run:
     - `npm install` (first time only)
     - `npm run dev`
3. Visit `http://localhost:3000` for the shop UI and `http://localhost:8000/api/health/` (to be added) for a basic API health check.

Next steps:

- Add product/auth/cart/order APIs in `backend/api`.
- Replace the default `frontend/app/page.tsx` with the Mobile Shop home page and wire it to the backend APIs.
