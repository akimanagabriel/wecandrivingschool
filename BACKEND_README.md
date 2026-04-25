# WeCanDrivingSchool — Backend Delivery

## What's included

```
app/
  Http/Controllers/
    PaymentController.php           ← Student: list plans, initiate MoMo, success page, webhook
    Admin/
      PricingPlanController.php     ← Admin: CRUD + toggle for pricing plans
      PaymentController.php         ← Admin: list payments, refund
      DashboardController.php
      QuestionController.php
      UserController.php
  Models/
    Payment.php
    PricingPlan.php
    User.php
    Question.php  QuizAttempt.php  Answer.php  Option.php  Category.php
  Services/
    ItecPayment.php                 ← Improved: uses extractTransactionId() / extractErrorMessage()
  Http/Middleware/
    HandleInertiaRequests.php
  Providers/
    AppServiceProvider.php

routes/
  web.php
  wecan.php                         ← All student + admin + webhook routes

database/
  migrations/
    2024_01_01_000001_create_users_table.php
    2024_01_01_000002_create_categories_table.php
    2024_01_01_000003_create_questions_table.php
    2024_01_01_000004_create_quiz_attempts_table.php
    2024_01_01_000005_create_payments_table.php
    2026_04_24_000001_create_pricing_plans_table.php   ← Seeds all 6 plans
  seeders/
    DatabaseSeeder.php
    RolesAndPermissionsSeeder.php
    AdminUserSeeder.php
```

---

## Setup

### 1. Copy files into your Laravel project root

```bash
cp -r app routes database /your/laravel/project/
```

### 2. Add ITEC credentials to `.env`

```env
ITEC_API_KEY=your_key_here
ITEC_API_URL=https://api.itec.rw
```

### 3. Run migrations and seeders

```bash
php artisan migrate
php artisan db:seed
```

This creates all tables and seeds:
- Roles: `admin`, `student`
- Admin user: `admin@wecandriving.rw` / `Admin@12345`
- Demo students
- **6 pricing plans** (Starter 1000, Basic 2200, Standard 3000, Premium 4500, Full Month 5000, Practical Driving 200000)

---

## Pricing Plans

| Plan             | Amount (RWF) | Duration  | Badge           |
|------------------|-------------|-----------|-----------------|
| Starter          | 1,000       | 3 Days    | —               |
| Basic            | 2,200       | 1 Week    | —               |
| Standard         | 3,000       | 15 Days   | —               |
| Premium          | 4,500       | 25 Days   | Best Value      |
| Full Month       | 5,000       | 1 Month   | Most Popular ★  |
| Practical Driving| 200,000     | 1 Month   | Includes Practical |

Admins can create, edit, delete, and toggle plans at `/admin/pricing-plans`.

---

## Payment Flow

1. Student visits `/student/payment` → sees active plans
2. Selects a plan + enters phone → POST `/student/payment/momo`
3. `PaymentController::initiateMomo()` calls `ItecPayment::pay(amount, phone)`
4. **Success** (`status: 200`, `transID` present): payment stays `pending`, redirect to success page
5. **Failure** (`status: 400`, `message` present): payment set to `failed`, error shown to student
6. ITEC sends webhook to `POST /webhooks/itec/payment` → `confirmPayment()` sets `completed` + `access_expires_at`

### ITEC Response shapes

```json
// Success
{ "status": 200, "data": { "amount": 10, "transID": "d3a98870-22c7-4ffe-b60a-c3c48721c408" } }

// Failure
{ "status": 400, "data": { "message": "Unauthorized" } }
```

`ItecPayment::extractTransactionId()` and `extractErrorMessage()` handle both shapes.

---

## Admin Sidebar Link (add to your nav)

```tsx
{ title: 'Pricing Plans', href: '/admin/pricing-plans', icon: Tag }
```
