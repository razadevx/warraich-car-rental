# Production Deployment & Operations Checklist

Use this checklist before and during deployment to production (e.g. Vercel, Railway, AWS, or Docker).

---

## 1. Environment Variables Configuration

- [ ] `DATABASE_URL`: Production PostgreSQL connection string (with SSL enabled, e.g. `?sslmode=require`).
- [ ] `JWT_SECRET`: High-entropy 32-byte secret (generate with `openssl rand -base64 32`).
- [ ] `NEXT_PUBLIC_APP_URL`: Canonical public domain (e.g., `https://warraichmotors.pk`).
- [ ] `NEXT_PUBLIC_APP_NAME`: `Warraich Motors Gujrat`.
- [ ] `DEFAULT_CURRENCY`: `PKR` (or `USD`).
- [ ] `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`: If using Cloudinary for direct image uploads.
- [ ] `RESEND_API_KEY`: Production transactional email provider API key.
- [ ] `EMAIL_FROM`: `bookings@warraichmotors.pk` (with verified SPF/DKIM records).

---

## 2. Database Preparation

- [ ] Enable the `btree_gist` extension on the production PostgreSQL database:
  ```sql
  CREATE EXTENSION IF NOT EXISTS btree_gist;
  ```
- [ ] Run Prisma migrations:
  ```bash
  npx prisma migrate deploy # or npx prisma db push
  ```
- [ ] Apply the database exclusion constraint:
  ```bash
  psql $DATABASE_URL -f prisma/apply-exclusion-constraint.sql
  ```
- [ ] Seed base settings, packages, and administrator user:
  ```bash
  npm run db:seed
  ```
- [ ] Change the default administrator password immediately after first login.

---

## 3. Security & Access Verification

- [ ] Ensure all cookies have `Secure`, `HttpOnly`, and `SameSite=Lax` enabled in production.
- [ ] Verify that customer driving licence details and internal staff notes are never exposed on public endpoints (`/api` or `/booking/[reference]`).
- [ ] Verify rate limiting on `/admin/login` and public booking submission.
- [ ] Confirm that non-admin staff users cannot access `/admin/settings`.

---

## 4. Backups & Disaster Recovery

- [ ] Set up daily automated PostgreSQL backups (WAL archiving or daily snapshots).
- [ ] Test restoring from a database backup to a staging environment.
- [ ] Ensure point-in-time recovery (PITR) is activated if hosted on managed PostgreSQL (AWS RDS, Neon, or Supabase).
