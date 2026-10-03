# FLS School - Backend (NestJS + MongoDB Atlas)

Backend API for FLS School management system built with NestJS, TypeScript (strict mode), and MongoDB Atlas via Mongoose.

---

## 1. MongoDB Atlas Setup

Follow these steps to configure your MongoDB Atlas database:

1. **Create an Atlas Cluster**:
   - Sign up or log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Create a new free cluster (M0 sandbox).
2. **Configure Database Access**:
   - Under **Security** > **Database Access**, click **Add New Database User**.
   - Choose password authentication, enter a username and strong password.
   - Assign the `readWriteAnyDatabase` or `readWrite` role on the `fls_school` database.
3. **Configure Network Access**:
   - Under **Security** > **Network Access**, click **Add IP Address**.
   - Add your current IP address (or `0.0.0.0/0` for development/testing).
4. **Obtain Connection String**:
   - Under **Deployment** > **Database**, click **Connect** on your cluster.
   - Select **Drivers** (Node.js).
   - Copy the connection URI and append the database name `fls_school`:
     ```text
     mongodb+srv://<user>:<password>@<cluster>.mongodb.net/fls_school?retryWrites=true&w=majority
     ```

---

## 2. Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```dotenv
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/fls_school?retryWrites=true&w=majority"
JWT_SECRET="change-me-to-a-secure-secret-key"
JWT_EXPIRES_IN="1d"
ADMIN_EMAIL="admin@fls.school"
ADMIN_PASSWORD="ChangeMe123!"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

> **Default Admin Credentials**:
> - Email: `admin@fls.school`
> - Password: `ChangeMe123!`

---

## 3. Installation & Building

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run build
```

---

## 4. Database Seeding & Reset

```bash
# Seed initial data (idempotent: safe to run multiple times without duplicating records)
npm run db:seed

# Drop all collections and re-seed clean dataset
npm run db:reset
```

The seed script creates:
- The default administrator account (`admin@fls.school`)
- 3 Academic Levels: Primaire, College, Lycee (positions 1-3)
- 6 School Classes: CP, CE1, 6eme, 5eme, 2nde, 1ere
- 6 Subjects: Mathematiques, Francais, Anglais, Physique-Chimie, SVT
- 3 Teachers: Ahmed Alami, Fatima Zahra, Karim Bennani
- 3 Study Groups
- 10 Students distributed across classes
- Group Enrollments
- Sessions (both past sessions and upcoming future sessions)
- Attendance records for past sessions
- Student payments
- Initial dashboard activity logs

---

## 5. Running the Application

```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run start:prod
```

Once running:
- **API Base URL**: `http://localhost:3000/api`
- **Swagger Documentation**: `http://localhost:3000/api/docs`

---

## 6. Testing

```bash
# Run unit tests (MongoExceptionFilter error mapping, enrollment class matching)
npm test

# Run end-to-end (E2E) full flow tests
npm run test:e2e

# Run live API test suite across all 78 endpoints against a running server
npm run test:routes
```

The E2E test runs an automated flow:
`login -> level -> class -> subject -> teacher -> group -> student -> enrollment -> session -> absence -> payment -> dashboard stats`.

The `npm run test:routes` script executes an end-to-end live HTTP audit verifying every single endpoint, parameter filter, pagination, error boundary, and cascade protection on the running NestJS server.

---

## 7. API Architecture & Rules

- **Authentication**: JWT Bearer token on all endpoints except `@Public()` routes (`POST /api/auth/login`).
- **Validation**: Global `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.
- **Error Handling**: `MongoExceptionFilter` automatically converts MongoDB 11000 duplicate keys to `409 Conflict`, CastErrors to `400 Bad Request`, and ValidationErrors to `400 Bad Request`.
- **ObjectId Validation**: `ParseObjectIdPipe` validates all route parameters. Query and body IDs are validated with `@IsMongoId()`.
- **Data Integrity**: Foreign key and cascading constraints are enforced manually in the service layer (e.g. deleting entities in use returns `409 Conflict`).
- **Response Format**: All identifiers are exposed as string field `id` (with `_id` and `__v` stripped). Paginated lists return `{ data, meta: { total, page, limit, totalPages } }`.
