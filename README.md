# Expense Voucher Management System

A web-based **Expense Voucher Management System** built for **ABC Company** to digitize the complete voucher creation, approval, and reimbursement workflow. Replaces manual paper voucher routing with a role-based system featuring electronic signature authorization, live audit logging, and reporting.

---

## 🌟 Key Highlights & Features

- **Role-Based Access Control (RBAC)**: Distinct permissions for **Employee**, **Director (Admin)**, and **Accounts Team**.
- **Digital Signatures**: Dual electronic signatures (Employee signature required for submission; Director signature required for approval) with both **interactive canvas drawing** and **image upload (PNG/JPG/SVG)** support.
- **Strict Business & Validation Rules**:
  - Auto-generated sequential Voucher Numbers (`EV-YYYYMM-XXXX`).
  - New vouchers always start in `Draft` status.
  - Employees can edit and delete only while in `Draft` status; once submitted, vouchers become strictly read-only.
  - Only the Director can approve (mandatory signature) or reject (mandatory reason).
  - Approved vouchers become immutable and immediately accessible by the Accounts Team for disbursement processing.
- **Search & Multi-Filter Engine (Bonus Feature)**:
  - Search by voucher number, title, employee, or keyword.
  - Filter by Department, Category, Status, Expense Date Range, and Amount Range.
  - Multi-column sorting (Date, Amount, Status, Voucher Number).
- **Executive Dashboards**:
  - **Employee**: Total claims, drafts, pending approval, approved, rejected, and total claimed amount.
  - **Director**: Real-time pending count, approved today, rejected today, total pending amount, and actionable queue.
  - **Accounts Team**: Total organizational expenses, pending review count, approved voucher count, total approved reimbursement payout amount, and exportable views.
- **Printable / PDF Voucher Slip (Bonus Feature)**:
  - Official ABC Company printable invoice voucher format featuring dual authorized signatory boxes, expense breakdown, and print-to-PDF layout (`window.print()`).

---

## 🏗️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 19 + Vite | Component-driven architecture, Vanilla CSS Design System, Lucide Icons |
| **Backend** | Node.js + Express.js | Modular RESTful architecture, JWT Authentication, Multer upload engine |
| **Database** | SQLite + SQL Migration DDL | Zero-friction local setup, with PostgreSQL migration schema included |
| **Security** | JWT + bcryptjs | Protected routes, Bearer token authorization, role-based middleware guards |

---

## 🚀 Quick Setup & Installation

### Prerequisites
- **Node.js** (v18.x or newer recommended)
- **npm** (v9.x or newer)

### Step 1: Install Dependencies
You can install all dependencies across root, backend, and frontend with a single command from the project root:

```bash
npm run install:all
```

*Or manually in each folder:*
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### Step 2: Seed the Database
Initialize tables and pre-populate realistic demo accounts and sample vouchers:

```bash
npm run seed
```

### Step 3: Run the Application
Start both the Backend API server (Port 5000) and Frontend Vite dev server (Port 3000) concurrently:

```bash
npm run dev
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 👥 Demo User Accounts

The login screen features **one-click demo login buttons** for instant evaluation, or you can log in manually using the credentials below:

| Role | Name | Email | Password | Department |
|---|---|---|---|---|
| **Employee** | Sarah Connor | `employee@abccompany.com` | `password123` | Engineering |
| **Employee** | Alex Morgan | `alex@abccompany.com` | `password123` | Marketing |
| **Director** | David Vance | `director@abccompany.com` | `password123` | Executive |
| **Accounts** | Rachel Green | `accounts@abccompany.com` | `password123` | Finance & Accounts |

---

## 🗄️ Database Schema Explanation

The database design uses relational integrity with foreign keys and cascade rules. Schema files are provided for both SQLite (`backend/database/schema.sql`) and PostgreSQL (`backend/database/schema_postgres.sql`).

```
                    ┌─────────────────────────┐
                    │          USERS          │
                    ├─────────────────────────┤
                    │ id (PK)                 │
                    │ name                    │
                    │ email (UNIQUE)          │
                    │ password_hash           │
                    │ role                    │
                    │ department              │
                    │ employee_id_code        │
                    │ signature_url           │
                    │ created_at              │
                    └───────────┬─────────────┘
                                │ 1
                                │
                                │ N
                    ┌───────────▼─────────────┐
                    │        VOUCHERS         │
                    ├─────────────────────────┤
                    │ id (PK)                 │
                    │ voucher_number (UNIQUE) │
                    │ voucher_date            │
                    │ expense_date            │
                    │ department_name         │
                    │ expense_title           │
                    │ expense_category        │
                    │ expense_description     │
                    │ amount                  │
                    │ user_id (FK -> users)   │
                    │ employee_name           │
                    │ employee_id             │
                    │ employee_signature_url  │
                    │ status                  │
                    │ director_id (FK->users) │
                    │ director_name           │
                    │ director_signature_url  │
                    │ approval_date           │
                    │ rejection_reason        │
                    │ created_at, updated_at  │
                    └───────────┬─────────────┘
                                │ 1
                                │
                                │ N
                    ┌───────────▼─────────────┐
                    │   VOUCHER_AUDIT_LOGS    │
                    ├─────────────────────────┤
                    │ id (PK)                 │
                    │ voucher_id (FK CASCADE) │
                    │ action                  │
                    │ performed_by_id (FK)    │
                    │ performed_by_name       │
                    │ performed_by_role       │
                    │ notes                   │
                    │ timestamp               │
                    └─────────────────────────┘
```

### Table Details:
1. **`users`**: Stores system users, encrypted passwords (bcrypt), assigned roles (`employee`, `director`, `accounts`), departments, and optional default signatures.
2. **`vouchers`**: Core entity storing voucher numbers, line item details, amount, approval lifecycle statuses (`Draft`, `Submitted`, `Approved`, `Rejected`), employee signatures, director signatures, and rejection remarks.
3. **`voucher_audit_logs`**: Immutable audit log tracing every lifecycle change (`CREATED`, `UPDATED`, `SUBMITTED`, `APPROVED`, `REJECTED`, `DELETED`) with author identity and timestamp.

---

## 🔐 User Roles & Permission Matrix

| Feature / Action | Employee | Director | Accounts Team |
|---|:---:|:---:|:---:|
| **Create Voucher** | ✅ (Saved as Draft) | ❌ | ❌ |
| **Edit Voucher Details** | ✅ (Draft only) | ❌ | ❌ |
| **Delete Voucher** | ✅ (Draft only) | ❌ | ❌ |
| **Submit for Approval** | ✅ (Req. Signature) | ❌ | ❌ |
| **View Vouchers** | Own vouchers only | All organization vouchers | All organization vouchers |
| **Approve Voucher** | ❌ | ✅ (Req. Signature) | ❌ |
| **Reject Voucher** | ❌ | ✅ (Req. Reason) | ❌ |
| **View Audit Trail** | ✅ (Own vouchers) | ✅ (All vouchers) | ✅ (All vouchers) |
| **Download / Print Voucher** | ✅ | ✅ | ✅ |

---

## 📡 RESTful API Documentation

All protected endpoints require the HTTP header:  
`Authorization: Bearer <JWT_TOKEN>`

### Authentication Endpoints
- **`POST /api/auth/login`**
  - **Body**: `{ "email": "employee@abccompany.com", "password": "password123" }`
  - **Response**: `{ "success": true, "token": "...", "user": { ... } }`
- **`GET /api/auth/me`**
  - Returns authenticated user profile.
- **`GET /api/auth/demo-accounts`**
  - Public endpoint listing available demo accounts for convenience.

### Dashboard Endpoints
- **`GET /api/dashboard/stats`**
  - Returns role-customized metrics:
    - *Employee*: Total vouchers, drafts, pending approval, approved, rejected, total amount claimed.
    - *Director*: Pending approval count, approved today, rejected today, total pending amount, recent activity.
    - *Accounts*: Total vouchers, pending approval, approved, rejected, total approved expense amount.

### Voucher Endpoints
- **`GET /api/vouchers`**
  - **Query Params**: `search`, `voucher_number`, `employee_name`, `department`, `expense_category`, `status`, `date_from`, `date_to`, `min_amount`, `max_amount`, `sortBy`, `order`, `page`, `limit`
  - Returns filtered list of vouchers (scoped to claimant if employee; global if director/accounts).
- **`GET /api/vouchers/:id`**
  - Returns voucher details and audit logs.
- **`POST /api/vouchers`** (Employee only)
  - Creates a new voucher initially in `Draft` status with auto-generated voucher number.
  - **Body**: `{ "voucher_date", "expense_date", "department_name", "expense_title", "expense_category", "expense_description", "amount" }`
- **`PUT /api/vouchers/:id`** (Employee only)
  - Updates a voucher in `Draft` status. Fails with 400 if voucher is already submitted, approved, or rejected.
- **`DELETE /api/vouchers/:id`** (Employee only)
  - Deletes a voucher in `Draft` status.
- **`POST /api/vouchers/:id/submit`** (Employee only)
  - Submits draft voucher for Director approval.
  - **Body**: `{ "signature_url": "...", "signatureData": "..." }`
  - Validates that an employee signature is provided.
- **`POST /api/vouchers/:id/approve`** (Director only)
  - Approves submitted voucher.
  - **Body**: `{ "signature_url": "...", "signatureData": "..." }`
  - Validates that a Director signature is provided. Sets `status = 'Approved'`.
- **`POST /api/vouchers/:id/reject`** (Director only)
  - Rejects submitted voucher.
  - **Body**: `{ "rejection_reason": "Missing tax invoice receipts." }`
  - Validates that `rejection_reason` is provided. Sets `status = 'Rejected'`.
- **`POST /api/vouchers/upload-signature`**
  - Uploads a signature file (`multipart/form-data`) or accepts a canvas base64 image data URL, saving it to disk and returning the URL.

---

## 💡 Assumptions Made During Development

1. **Voucher Number Sequence**:
   - Formatted as `EV-YYYYMM-XXXX` (e.g., `EV-202610-0001`). The sequence counter increments automatically with uniqueness constraints in the database.
2. **Signature Storage**:
   - Both signature drawing (interactive HTML5 canvas) and file upload (PNG/JPG/SVG via Multer) are supported. Signatures are stored locally under `backend/uploads/signatures/` and served via static URL paths.
3. **Database Portability**:
   - SQLite is used by default for zero-configuration, instant execution without requiring local PostgreSQL/MySQL server installations. A full PostgreSQL DDL file (`backend/database/schema_postgres.sql`) is provided for production database deployment.
4. **Draft Immutability Boundary**:
   - Once a voucher is submitted by an employee, it transitions to `Submitted` (Pending Approval) and becomes read-only to prevent tampering. If rejected, the employee reviews the director's rejection remarks and can submit a revised claim.
5. **Print View**:
   - A dedicated printable voucher slip with print CSS styling (`@media print`) and `window.print()` triggers was implemented to satisfy the Accounts Team voucher printing bonus requirement.
