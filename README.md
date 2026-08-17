# CertChain — Digital Certificate Platform

Issue and verify digital certificates.

- **Students** open the website and land directly on the **public verification page** — no account needed. They type a Certificate ID (or scan a QR code) to check authenticity.
- **Organisers** register/log in to issue certificates, view stats, revoke certificates, and generate QR codes.

## Structure

| Folder | Stack |
|---|---|
| `digital-certificate-frontend` | Next.js 16, React 19, Tailwind CSS 4 |
| `digital-certificate-backend` | Express 5, Prisma 7, Supabase Postgres, JWT auth |

## Setup

### 1. Backend

```bash
cd digital-certificate-backend
npm install
```

Open `.env` and replace `YOUR_DB_PASSWORD` with your Supabase database password
(Supabase Dashboard → Project Settings → Database). The connection string uses the
**Session Pooler** host (`aws-0-ap-northeast-1.pooler.supabase.com`) because the
direct `db.*.supabase.co` host is IPv6-only.

Then create the tables and seed demo data:

```bash
npm run db:push   # creates tables in Supabase
npm run seed      # demo organiser + 3 sample certificates
npm run dev       # API on http://localhost:4000
```

Seeded demo data:

- Organiser login: `admin@techacademy.io` / `password123`
- `CERT-2026-0001` (valid), `CERT-2026-0002` (expired), `CERT-2026-0003` (revoked)

### 2. Frontend

```bash
cd digital-certificate-frontend
npm install
npm run dev       # app on http://localhost:3000
```

## API overview

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/verify/:certId` | public | Verify a certificate |
| POST | `/api/auth/register` | public | Register an organisation |
| POST | `/api/auth/login` | public | Organiser login |
| GET | `/api/auth/me` | token | Current organisation |
| GET | `/api/certificates` | token | List own certificates |
| POST | `/api/certificates` | token | Issue a certificate |
| GET | `/api/certificates/stats` | token | Dashboard counters |
| POST | `/api/certificates/:id/revoke` | token | Revoke a certificate |
| GET | `/api/certificates/:id/qr` | token | QR code linking to public verify page |
