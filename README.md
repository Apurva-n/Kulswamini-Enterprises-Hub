# Oil & Vehicle Parts Distribution Platform

A MERN-stack platform for managing bulk oil and spare-parts distribution to village/taluka shops. It replaces manual "khata" ledgers with a digital running account per shop, while letting shopkeepers browse the catalog and place orders themselves.

## Features

- **Admin portal**: Manage shops, products, categories, orders, payments, and per-shop ledgers
- **Shopkeeper portal**: Browse catalog, cart/checkout, order history, outstanding balance
- **Append-only ledger**: Every order debits, every payment credits — full audit trail
- **Stock management**: Auto-deduct on order confirmation, low-stock alerts
- **Analytics dashboard**: Sales trends, top dues, collections, top products
- **PDF invoices**: Order invoices and payment receipts
- **Phase 5 placeholders**: Notification hooks (Twilio/WhatsApp stub), ML microservice skeleton

## Tech stack

- **Frontend**: React (Vite), React Router, Tailwind CSS, Recharts, Axios
- **Backend**: Node.js, Express, JWT, Mongoose
- **Database**: MongoDB (Atlas or local)
- **PDF**: pdfkit
- **ML stub**: FastAPI (optional, separate service)

## Project structure

```
oil-parts-platform/
├── backend/       # Express API
├── frontend/      # React app
├── ml-service/    # FastAPI ML stub (Phase 5)
└── README.md
```

## Local development

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas connection string)
- Python 3.10+ (optional, for ml-service)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET
npm install
npm run seed    # Creates admin + sample categories/products/demo shop
npm run dev     # http://localhost:5000
```

**Default admin credentials** (from seed):
- Email: `admin@example.com`
- Password: `admin123`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
```

The Vite dev server proxies `/api` to the backend.

### 3. ML service (optional)

```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

## Ledger rules

1. **Append-only** — never edit or delete ledger entries; add correcting entries instead
2. **Opening balance** — entered once on shop creation; creates initial debit entry for migration
3. **Order debit** — created when admin confirms order (`pending → confirmed`)
4. **Payment credit** — created when admin records a payment (partial payments supported)
5. **Stock deduction** — happens on confirmation, not on order placement

## API overview

| Method | Route | Role | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | public | Shopkeeper registration (pending approval) |
| POST | `/api/auth/login` | public | Login |
| GET | `/api/auth/me` | auth | Current user |
| GET/PATCH | `/api/users/pending`, `/api/users/:id/approve` | admin | Approval workflow |
| CRUD | `/api/shops` | admin | Shop management |
| CRUD | `/api/categories` | admin read/write | Category management |
| CRUD | `/api/products` | admin write | Product catalog |
| POST/GET | `/api/orders` | both | Place/list orders |
| PATCH | `/api/orders/:id/status` | admin | Update order status |
| GET | `/api/ledger/:shopId` | admin/own shop | Ledger view |
| POST | `/api/payments` | admin | Record payment |
| GET | `/api/dashboard/summary` | admin | Analytics |
| GET | `/api/orders/:id/invoice` | admin/own shop | PDF invoice |

## Environment variables

See `backend/.env.example` for full list. Required:
- `MONGODB_URI`
- `JWT_SECRET`

Optional:
- `CLOUDINARY_*` — product image uploads
- `TWILIO_*` — WhatsApp notifications
- `ML_SERVICE_URL` — ML microservice

## Testing

```bash
cd backend
npm test   # Ledger balance unit tests
```

## Deployment notes

- Use MongoDB Atlas for production database
- Set strong `JWT_SECRET` and admin credentials via env
- Deploy backend and frontend separately; set `CLIENT_URL` for CORS
- ML and notification services can be added later without breaking core flows
