# Warraich Motors Gujrat — Car Rental & Fleet Management System

A production-minded, full-stack car rental booking platform and management portal built with **Next.js (App Router)**, **TypeScript**, **PostgreSQL**, **Prisma ORM**, and **Tailwind CSS**.

---

## 🌟 Key Features

### 1. Public Marketing & Booking Website
- **Hero Search**: Filter fleet by pickup date/time, return date/time, pickup hub (Gujrat Hub, Sialkot Airport, Islamabad Airport, Lahore Airport), and vehicle category.
- **Fleet Inventory (`/cars`)**: Real-time database availability checks distinguishing vehicles that are available versus reserved for the requested dates.
- **Car Detail Page (`/cars/[slug]`)**: Photo gallery, mechanical specifications (transmission, fuel, seats, bags), and custom packages / add-ons (Chauffeur, Full Insurance, Child Seat, Airport Meet & Greet).
- **Live Dynamic Pricing Engine**: Billable days calculated strictly with 24-hour intervals, tiered weekly discounts (7–29 days), and monthly rates (30+ days).
- **Manual Staff Review Workflow**: Submitting an order creates a `PENDING` booking with a cryptographically non-guessable reference code (e.g., `WM-DEMO01`).
- **Customer Status Portal (`/booking/[reference]`)**: Real-time reservation status tracking, agreed pricing snapshots, balance remaining, and dispatch contacts.
- **Informational Pages**: About Us (`/about`), Rental Policies & Rules (`/terms`), Privacy Policy (`/privacy`), Contact & Location (`/contact`).

### 2. Internal Management Portal (`/admin`)
- **Protected Access**: Role-based authentication (`ADMIN` and `STAFF`) with secure HTTP-only session cookies and bcrypt password hashing.
- **Executive Operations Dashboard (`/admin`)**:
  - Live KPI cards: Total Fleet, Available Now, Active Rentals, Pending Reviews, Due Returns Today, Outstanding Receivables.
  - Recent pending requests table with quick review actions.
- **Fleet Management (`/admin/cars`)**:
  - Add & edit vehicles with Zod schema validation.
  - Toggle published/draft website visibility.
  - Switch operational status: `AVAILABLE`, `RENTED`, `MAINTENANCE`, `INACTIVE`.
- **Booking Administration (`/admin/bookings`)**:
  - Search by reference, customer name, car registration plate, or phone.
  - Status transition state machine (`PENDING` &rarr; `CONFIRMED` &rarr; `ACTIVE` &rarr; `COMPLETED` / `CANCELLED`).
  - Immutable agreed price snapshots.
  - Audit trail logging every action and user ID.
- **Interactive Reservation Timeline (`/admin/calendar`)**:
  - Day-by-day fleet reservation and maintenance view across any selected month.
- **Customer CRM (`/admin/customers`)**:
  - Customer directory with booking counts, lifetime spend, and staff-only confidential notes.
- **Payment & Deposit Ledger (`/admin/payments`)**:
  - Record manual transactions (Cash, Bank Transfer, POS/Card, Cheque).
  - Categorized by Rental, Security Deposit, Refund, or Damage Charge.
- **Maintenance Scheduler (`/admin/maintenance`)**:
  - Schedule vehicle service and repairs.
  - Automatically blocks overlapping customer reservations during maintenance.
- **Business & Policy Settings (`/admin/settings` - Admin Only)**:
  - Turnaround buffer hours (default 2 hours).
  - Statuses that block availability.
  - Contact information and policy disclosures.

---

## 🛡️ Double-Booking Prevention & Concurrency Architecture

The platform prevents double bookings at both the application layer and the storage engine:
1. **Interactive PostgreSQL Transaction with Row Locks (`SELECT ... FOR UPDATE`)**:
   - Acquires an exclusive row lock on the target vehicle row.
   - Re-checks overlapping bookings and turnaround buffer windows before committing.
2. **PostgreSQL Database Exclusion Constraint**:
   - Utilizes `btree_gist` and an immutable `tsrange("pickupDateTime", "returnDateTime")` exclusion constraint on the `Booking` table:
   ```sql
   ALTER TABLE "Booking"
   ADD CONSTRAINT "no_overlapping_bookings"
   EXCLUDE USING gist (
     "carId" WITH =,
     tsrange("pickupDateTime", "returnDateTime") WITH &&
   )
   WHERE ("status" IN ('PENDING', 'CONFIRMED', 'ACTIVE'));
   ```
   This guarantees that two overlapping reservations cannot be committed simultaneously, even under high concurrency.

---

## 🚀 Quick Start Guide

### 1. Requirements
- Node.js 18+ (tested on Node v24.11)
- PostgreSQL 14+ (tested on PostgreSQL 17.10)

### 2. Environment Setup
```bash
cp .env.example .env
```
Ensure your `DATABASE_URL` in `.env` points to your PostgreSQL database.

### 3. Database Migration & Exclusion Constraint
```bash
npx prisma db push
psql -U postgres -p 5433 -h 127.0.0.1 -d warraich_motors -f prisma/apply-exclusion-constraint.sql
```

### 4. Seed Fleet & Demo Accounts
```bash
npm run db:seed
```

### 5. Run Automated Tests
```bash
npm test
```

### 6. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the customer website.
Open [http://localhost:3000/admin](http://localhost:3000/admin) to view the staff portal.

---

## 🔑 Demo Staff Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@warraichmotors.pk` | `Admin@12345` |
| **Staff** | `staff@warraichmotors.pk` | `Staff@12345` |
