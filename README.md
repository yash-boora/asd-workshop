# Express.js Products Application with Layered Architecture & Custom TTL Cache

A production-ready Node.js Express application showcasing a strict **layered architecture** and a custom **in-memory read-through TTL cache middleware** built using native JavaScript `Map` without external caching dependencies (no Redis, no node-cache).

---

## Architecture & Request Flow

Every request follows a strict unidirectional flow:
`Client -> Route -> Middleware -> Controller -> Service -> Database`

```
  +-----------------------------------------------------------------------+
  |                             Client Request                            |
  +-----------------------------------------------------------------------+
                                      |
                                      v
  +-----------------------------------------------------------------------+
  |                        routes/productRoutes.js                        |
  +-----------------------------------------------------------------------+
                     /                                \
        (GET Requests)                              (POST / PUT / PATCH / DELETE)
               |                                                  |
               v                                                  v
  +--------------------------+                      +--------------------------+
  | middleware/              |                      | middleware/              |
  | cacheMiddleware.js       |                      | invalidateCacheMiddleware|
  +--------------------------+                      +--------------------------+
         /           \                                            |
    Cache HIT     Cache MISS                                      |
       /               \                                          v
      v                 v                           +--------------------------+
[Return 200]    +-----------------------+           | controllers/             |
 (X-Cache: HIT) | controllers/          |           | productController.js     |
                | productController.js  |           +--------------------------+
                +-----------------------+                         |
                            |                                     v
                            v                       +--------------------------+
                +-----------------------+           | services/                |
                | services/             |           | productService.js        |
                | productService.js     |           +--------------------------+
                +-----------------------+                         |
                            |                                     v
                            v                       +--------------------------+
                +-----------------------+           | database/                |
                | database/db.js        |           | db.js                    |
                +-----------------------+           +--------------------------+
```

### Layer Descriptions

1. **Routes (`routes/productRoutes.js`)**: Defines URL paths and attaches middleware and controller handlers.
2. **Middleware (`middleware/`)**:
   - `cacheMiddleware.js`: Intercepts GET requests. On HIT, returns cached data with header `X-Cache: HIT`. On MISS, wraps `res.json` to store successful 200 responses in `cacheStore` with `X-Cache: MISS`.
   - `invalidateCacheMiddleware.js`: Listens to `res.on('finish')` on write routes and invalidates the cache store when status code is 2xx.
3. **Controllers (`controllers/productController.js`)**: Handles HTTP request parsing and response formatting. Interacts only with services.
4. **Services (`services/productService.js`)**: Encapsulates business logic, data validation, and rules. Interacts only with the database layer.
5. **Database (`database/db.js`)**: Manages in-memory product data storage and async CRUD operations.
6. **Cache Store (`cache/cacheStore.js`)**: Native JavaScript `Map` encapsulation with a 60-second TTL (Time-To-Live) expiration policy.

---

## How to Run

### Prerequisites
- Node.js (v14+ recommended)
- npm

### Installation & Execution

```bash
# 1. Install dependencies
npm install

# 2. Start in production mode
npm start

# 3. Or start in development mode (with nodemon auto-reload)
npm run dev
```

The server runs on **`http://localhost:3000`**.

---

## API Endpoints

| Method | Endpoint | Description | Cache Behavior |
|--------|----------|-------------|----------------|
| `GET` | `/products` | List all products | Read-through cached (60s TTL) |
| `GET` | `/products/:id` | Get single product by ID | Read-through cached (60s TTL) |
| `POST` | `/products` | Create a new product | Invalidates cache on 2xx |
| `PUT` | `/products/:id` | Full replace of product | Invalidates cache on 2xx |
| `PATCH` | `/products/:id` | Partial update of product | Invalidates cache on 2xx |
| `DELETE` | `/products/:id` | Delete product | Invalidates cache on 2xx |

---

## Verification Test Checklist & Curl Commands

Run these `curl` commands in a terminal to verify cache behaviour:

### Test 1: GET Cache MISS then Cache HIT

```bash
# First GET request -> Cache MISS
curl -i http://localhost:3000/products
# Expected Header: X-Cache: MISS

# Second GET request -> Cache HIT
curl -i http://localhost:3000/products
# Expected Header: X-Cache: HIT

# Single product GET -> Cache MISS
curl -i http://localhost:3000/products/1
# Expected Header: X-Cache: MISS

# Second GET single product -> Cache HIT
curl -i http://localhost:3000/products/1
# Expected Header: X-Cache: HIT
```

---

### Test 2: Invalidation after Successful Write (POST / PUT / PATCH / DELETE)

```bash
# Ensure cache is HIT
curl -i http://localhost:3000/products
# Header: X-Cache: HIT

# Create new product (Successful Write)
curl -i -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name": "USB-C Hub", "price": 34.99, "category": "Electronics"}'
# Status: 201 Created
# Console Log: [CACHE] INVALIDATED...

# Subsequent GET -> Cache MISS (Fresh data fetched)
curl -i http://localhost:3000/products
# Header: X-Cache: MISS
```

---

### Test 3: Failed Write Does NOT Invalidate Cache

```bash
# Ensure cache is populated (HIT)
curl -i http://localhost:3000/products
curl -i http://localhost:3000/products
# Header: X-Cache: HIT

# Attempt to update a non-existent product ID (404 Not Found)
curl -i -X PUT http://localhost:3000/products/9999 \
  -H "Content-Type: application/json" \
  -d '{"name": "Non-existent", "price": 99.99}'
# Status: 404 Not Found

# Subsequent GET -> Still Cache HIT (Cache was NOT cleared)
curl -i http://localhost:3000/products
# Header: X-Cache: HIT
```

---

### Test 4: TTL Expiry (60 Seconds)

```bash
# Fetch product -> MISS, then HIT
curl -i http://localhost:3000/products/2
curl -i http://localhost:3000/products/2
# Header: X-Cache: HIT

# Wait 61 seconds...
sleep 61

# Request product again -> Expired entry deleted & refreshed (MISS)
curl -i http://localhost:3000/products/2
# Console Log: [CACHE] EXPIRED /products/2
# Header: X-Cache: MISS
```
