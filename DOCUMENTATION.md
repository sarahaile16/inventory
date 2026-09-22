# Inventory Management System — Full Documentation

Furniture / house inventory app for warehouse stock, store floor sales, customer orders, payments, and staff roles.

---

## 1. Overview

This system helps a furniture business:

- Buy and track **warehouse** stock (Add Product / Inventory)
- Move stock between **warehouse** and **store** (Stock Movement)
- Sell from the **store** floor
- Record **customer orders** with first payment now + rest on delivery
- Send **email confirmation** when an order is accepted
- Control access with roles: Admin, Management, Staff, User

| Layer | Tech |
|--------|------|
| Frontend | React 19, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express |
| Auth users DB | MongoDB (local or in-memory fallback) |
| Products / sales / customers / movements | In-memory store (`backend/data/store.js` + controllers) |
| Email | Nodemailer (Gmail SMTP or Brevo) |

**Default ports**

| Service | Port |
|---------|------|
| Backend API | `5001` |
| Frontend (Vite) | `5174` |

---

## 2. Project structure

```
inventory/
├── backend/
│   ├── server.js                 # Express app entry
│   ├── .env                      # Secrets & SMTP (do not commit)
│   ├── .env.example              # Template
│   ├── data/store.js             # In-memory products, sales, movements, purchases
│   ├── utils/emailService.js     # Order confirmation emails
│   ├── models/User.js            # Mongo user model
│   ├── controllers/              # Business logic (customers, products, analytics…)
│   └── routes/                   # API routes
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Routes
│   │   ├── auth/roles.js         # RBAC
│   │   ├── components/           # Layout, Sidebar, PrivateRoute…
│   │   └── pages/                # Screens
│   ├── vite.config.js            # Dev server + /api proxy → :5001
│   └── .env                      # VITE_API_URL
└── DOCUMENTATION.md              # This file
```

---

## 3. How to run

### Backend

```bash
cd backend
npm install
# Edit .env (see Email section)
npm run dev
# or: npm start
```

API: `http://localhost:5001`  
Health: `http://localhost:5001/api/health`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5174`

### Important

- Start **backend first**, then frontend.
- If MongoDB is not running, development falls back to **in-memory MongoDB** for users (resets on restart).
- Products, customers, sales, and movements live in **memory** and also reset when the backend restarts unless you later add persistent storage.

---

## 4. Demo login accounts

Seeded when the users collection is empty:

| Username | Password | Role | Home |
|----------|----------|------|------|
| `sari` | `sari123` | Admin | Dashboard |
| `manager` | `manager123` | Management | Store |
| `staff` | `staff123` | Staff | Store |
| `user` | `user123` | User (Pending) | Access status |

**Signup:** new accounts always start as `user` / Pending. They pick a requested role (Staff or Management). **Admin** approves them on **Users**.

---

## 5. Roles & permissions

Defined in `frontend/src/auth/roles.js`.

### Page access

| Page | Admin | Management | Staff | User |
|------|:-----:|:----------:|:-----:|:----:|
| Dashboard | ✓ | | | |
| Users | ✓ | | | |
| Settings | ✓ | | | |
| Store / Sales / Payment | ✓ | ✓ | ✓ | |
| Orders | ✓ | ✓ | ✓ | |
| Customers | ✓ | ✓ | ✓ | |
| Add Product | ✓ | ✓ | | |
| Inventory | ✓ | ✓ | | |
| Analytics / Report | ✓ | ✓ | | |
| Stock Movement | ✓ | ✓ | | |
| Notifications | ✓ | ✓ | ✓ | |
| Access status (Pending) | | | | ✓ |

### Actions

| Action | Who |
|--------|-----|
| Create / edit products | Admin, Management |
| Delete products | Admin |
| Stock transfers / receive / write-off | Admin, Management |
| Create sales | Admin, Management, Staff |
| See money (ETB amounts) | Admin, Management |
| Manage users | Admin |

**Staff** can run the shop (store, orders, customers) but **cannot see money** and cannot manage warehouse inventory or stock movement writes.

---

## 6. Core business concepts

### 6.1 Two kinds of money

| Concept | Where | Meaning |
|---------|--------|---------|
| **Purchase cost** | Add Product / Inventory | What **you paid** the supplier |
| **Selling price** | Add Product / Store | What the **customer pays** |
| **First payment + rest** | Customers / Orders | Customer pays part now; rest on delivery |
| **Dashboard / Analytics** | Admin views | Money **earned** from orders/sales vs stock bought |

### 6.2 Two stock locations

Every product has:

| Field | Meaning |
|-------|---------|
| `stock` | **Warehouse** quantity |
| `storeStock` | **Store / shop floor** quantity |

- **Add Product** puts new stock into the **warehouse** (`stock`).
- **Stock Movement** moves numbers between warehouse and store (it does not create products).

### 6.3 Furniture categories

Used on Add Product / Settings:

- Sofas & Couches  
- Beds & Mattresses  
- Tables  
- Chairs & Seating  
- Cabinets & Wardrobes  
- Shelves & Storage  
- Dining Sets  
- Office Furniture  
- Outdoor Furniture  
- Kids Furniture  
- Decor & Accessories  

Units: `PCS`, `SET`, `UNIT`  
Restock level on Add Product is **optional**.

---

## 7. Feature guide (by screen)

### Dashboard (Admin)

- Warehouse inventory summary  
- Bought ETB (purchase totals)  
- Low stock count  
- Latest customer orders / payments  
- Notifications shortcut  

### Users (Admin)

- See registered users  
- Approve pending users and assign Staff / Management / Admin  

### Store

- View products available on the **store floor** (`storeStock`)  
- Start a new sale → Sales → Payment flow  

### Orders

- List of customer orders / sales with deadlines and payment status  
- First paid vs rest due  

### Add Product (`/management`)

Creates **ready-made warehouse stock** (not a customer order).

Fields include: name, category, stock, selling price, purchase cost, supplier, optional restock level, location, etc.

**This is inventory you own**, not a buyer’s order.

### Inventory

- Full product list with warehouse stock and purchase cost totals  
- Edit / view products  
- Low-stock filter  

### Customers

- Customer list and stats  
- **Add customer + order**: name, phone, email, order details, deadline, photos, whole / first / rest payment  
- If email is filled, system sends **order accepted** confirmation  
- Customer detail page: history, documents, payment proof  

### Analytics / Report

- Revenue, profit, product and customer analytics (Admin / Management)  

### Stock Movement

Writable actions (Admin / Management):

| Action | Effect |
|--------|--------|
| **Transfer to store** | Warehouse → Store |
| **Return to warehouse** | Store → Warehouse |
| **Receive delivery** | Add units into warehouse |
| **Write-off** | Remove damaged/lost stock from warehouse or store |

History shows every change. **Undo** reverses a mistaken movement when safe.

**How to move stock (example)**

1. Add Product: Sofa, stock `10` → Warehouse 10, Store 0  
2. Transfer to store: qty `4` → Warehouse 6, Store 4  
3. Return to warehouse: qty `1` → Warehouse 7, Store 3  
4. Receive delivery: qty `5` → Warehouse 12, Store 3  

### Notifications

- Low stock  
- Orders with deadlines approaching and rest unpaid (admin-oriented alerts)  

### Settings (Admin)

- Company / notification / security / inventory options (mostly UI)  
- Category lists for furniture  

### Access status (Pending User)

- Shown while waiting for Admin approval after signup  

---

## 8. Recommended daily workflows

### A. Receive new furniture into the business

1. **Add Product** (or **Receive delivery** in Stock Movement if product already exists)  
2. Stock sits in **warehouse**  
3. **Transfer to store** when ready to sell on the floor  

### B. Sell on the store floor

1. Ensure items were transferred to store  
2. **Store** → New sale → **Payment**  

### C. Customer order (first + rest)

1. **Customers → Add customer + order**  
2. Enter contact, order description, deadline, whole / first payment  
3. Optional: payment proof + order photos  
4. Optional: customer **email** → confirmation sent  
5. Track rest payment and deadline under **Orders** / customer detail  

---

## 9. Email confirmation

### When it sends

On **POST /api/customers** (Add customer + order), if `email` is present, the backend calls `sendOrderConfirmation()`.

Email includes: order accepted message, reference, order text, deadline, status, whole / first / rest amounts, payment method, phone.

### Configure (`backend/.env`)

**Gmail (App Password)** — currently used successfully in this project:

```env
COMPANY_NAME=Our Company
COMPANY_EMAIL=you@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your sixteen char app password
SMTP_FROM="Our Company <you@gmail.com>"
SMTP_TLS_REJECT_UNAUTHORIZED=false
EMAIL_TEST_MODE=false
```

**Brevo alternative:**

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=you@email.com
SMTP_PASS=your_brevo_smtp_key
```

Notes:

- Gmail needs a Google **App Password** (not the normal login password).  
- Use Gmail host with Gmail app passwords; use Brevo host with Brevo SMTP keys.  
- On some Windows networks, set `SMTP_TLS_REJECT_UNAUTHORIZED=false`.  
- Restart the backend after changing `.env`.

### Test endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/settings/email-status` | Is SMTP configured? (no secrets) |
| POST | `/api/settings/test-email` | Body: `{ "to": "someone@email.com" }` |

---

## 10. API reference (main routes)

Base URL: `http://localhost:5001/api`

### Auth — `/api/auth`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Sign up (starts as pending user) |
| POST | `/login` | Login |
| POST | `/logout` | Logout |
| GET | `/verify` | Verify token |
| GET | `/me` | Current user |
| GET | `/users` | List users |
| PUT | `/users/:id` | Update user / approve role |

### Products — `/api/products`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List products |
| GET | `/meta/purchases` | Purchase totals |
| GET | `/:id` | One product |
| POST | `/` | Create product |
| PUT | `/:id` | Update |
| DELETE | `/:id` | Delete |

### Customers — `/api/customers`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List / search |
| GET | `/:id` | Detail |
| POST | `/` | Create (+ optional email confirmation) |
| PUT | `/:id` | Update |
| DELETE | `/:id` | Delete |
| POST | `/:id/documents` | Add document |
| DELETE | `/:id/documents/:docId` | Remove document |
| … | purchases / stats / search | Supporting endpoints |

### Sales — `/api/sales`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List sales |
| GET | `/total` | Totals |
| GET | `/:id` | One sale |
| POST | `/` | Create sale |
| PUT | `/:id` | Update |

### Movements — `/api/movements`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/?type=` | History (`all`, `transfer`, `receive`, `adjust`, `sale`, `return`) |
| POST | `/` | Write movement (`action`: transfer \| return \| receive \| adjust) |
| DELETE | `/:id` | Undo movement (reverses stock when possible) |

### Other

| Prefix | Purpose |
|--------|---------|
| `/api/settings/*` | Categories, units, general, email-status, test-email |
| `/api/analytics/*` | Dashboard / sales / products / customers / financial / trends |
| `/api/notifications` | Alerts |
| `/api/users` | User CRUD (legacy/alternate) |
| `/api/health` | Health check |
| `/api/test` | Simple ping |

---

## 11. Frontend routes

| Path | Page |
|------|------|
| `/login` | Login |
| `/signup` | Sign up |
| `/dashboard` | Admin dashboard |
| `/users` | User management |
| `/store` | Store floor |
| `/store/sales` | New sale |
| `/store/payment` | Payment |
| `/orders` | Orders |
| `/management` | Add Product |
| `/inventory` | Inventory |
| `/customers` | Customers |
| `/customers/:id` | Customer details |
| `/analytics` / `/report` | Analytics |
| `/stock-movement` | Stock Movement |
| `/notifications` | Notifications |
| `/settings` | Settings |
| `/pending` | Pending access |

---

## 12. Environment variables

### Backend `.env`

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (default 5001) |
| `NODE_ENV` | `development` / `production` |
| `MONGODB_URI` | Mongo connection string |
| `JWT_SECRET` | Auth token secret |
| `JWT_EXPIRE` | Token lifetime |
| `COMPANY_NAME` | Name on emails |
| `COMPANY_EMAIL` | Support / reply address |
| `SMTP_HOST` | Mail server |
| `SMTP_PORT` | Usually 587 |
| `SMTP_USER` | SMTP login |
| `SMTP_PASS` | App password or Brevo key |
| `SMTP_FROM` | From header |
| `SMTP_TLS_REJECT_UNAUTHORIZED` | Set `false` if local TLS intercept breaks SMTP |
| `EMAIL_TEST_MODE` | `true` = Ethereal preview only (not real customers) |

### Frontend `.env`

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | e.g. `http://localhost:5001/api` |

---

## 13. Security notes

- Never commit `.env` (use `.env.example`).  
- Change `JWT_SECRET` for any shared/production deploy.  
- Change demo passwords if the system is exposed beyond local use.  
- Staff role is designed so floor staff cannot see ETB amounts.  
- Email App Passwords / SMTP keys are secrets — rotate if shared accidentally.

---

## 14. Limitations (current)

1. **Products, customers, sales, movements** are largely **in-memory** → restarting the backend clears shop data (users may persist in Mongo).  
2. Settings UI options are partly client-side / not fully persisted.  
3. Production should use a real MongoDB and move store data into the database.  
4. Email only sends when SMTP is correctly configured and the backend has been restarted.  
5. Stock Movement write access is Admin/Management only.

---

## 15. Quick troubleshooting

| Problem | What to try |
|---------|-------------|
| Frontend can’t load data | Is backend on `:5001`? Check `VITE_API_URL` |
| Blank inventory after restart | Expected with in-memory store — re-add products |
| No Stock Movement form | Login as Admin/Management |
| Can’t transfer to store | Product needs warehouse `stock` first (Add Product / Receive) |
| Email not sent | Check `/api/settings/email-status`, SMTP in `.env`, restart backend, check spam |
| SMTP certificate error | Set `SMTP_TLS_REJECT_UNAUTHORIZED=false` |
| Pending forever after signup | Admin must approve on **Users** |

---

## 16. Glossary

| Term | Meaning |
|------|---------|
| Warehouse | Back storage (`stock`) |
| Store | Shop floor (`storeStock`) |
| Transfer | Warehouse → Store |
| Return | Store → Warehouse |
| Receive | New delivery into warehouse |
| Write-off | Remove damaged/lost units |
| First payment | Amount paid when order is placed |
| Rest payment | Amount due on delivery |
| Purchase cost | Supplier cost to your company |
| Selling price | Price charged to customer |

---

*Last updated to match the furniture inventory app with roles, stock movement, customer orders, and Gmail/Brevo order confirmation email.*
