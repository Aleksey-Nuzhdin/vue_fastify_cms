# VFC

## Project Structure

Fullstack monorepo: Vue 3 (client) + Fastify (server) + shared types.

```
├── client/          # Vue 3 SPA (Vite, Pinia, Vue Router)
├── server/          # Fastify REST API (TypeScript, MongoDB, Redis)
├── shared/          # Shared TypeScript types between client and server
├── docker-compose.yml
└── CLAUDE.md
```

### Server (`server/`)

```
server/src/
├── index.ts                  # Entry point → startServer()
├── server.ts                 # Server startup, graceful shutdown
├── app.ts                    # Fastify app builder, plugin registration
├── configs/
│   ├── auth.config.ts        # JWT/token TTL settings
│   └── index.ts              # initEnv() — fail-fast env validation
├── plugins/
│   ├── jwt.ts                # @fastify/jwt setup
│   ├── redis.ts              # @fastify/redis setup
│   ├── seeds.ts              # Content seeding (UPDATE_PAGES_DATA flag)
│   └── mongodb/
│       ├── mongodb.ts        # MongoDB connection plugin
│       └── mongodb.init.ts   # Collections init (users, folders, files)
├── common/
│   ├── middlewares/
│   │   └── authRole.guard.ts # Auth guards: requireAuth, requireAdmin, requireManager, requireVereficator
│   └── errors/               # Custom error factory (validation, unauthorized, etc.)
├── routes/
│   └── index.ts              # Route prefix registration (/api/auth, /api/users, etc.)
├── services/                 # Cross-module services (mailer, etc.)
├── seeds/                    # Seed data (data/content/*.page.ts | *.list.ts)
└── modules/
    ├── auth/
    │   ├── auth.routes.ts    # POST login, registration, refresh, logout, PATCH change-password
    │   ├── auth.controller.ts
    │   ├── auth.service.ts   # JWT generation, bcrypt, Redis token storage
    │   └── auth.types.ts
    ├── users/
    │   ├── users.repository.ts  # MongoDB CRUD (findByEmail, findById, create, update, delete)
    │   ├── users.routes.ts
    │   ├── users.controller.ts
    │   └── users.service.ts
    ├── profile/              # GET /api/profile/me, avatar upload
    ├── storage/              # File/folder management
    ├── content/              # Page content + reference lists (type: 'page' | 'list')
    ├── reports/              # User-generated content
    └── upload/               # Serving uploaded files
```

### Client (`client/`)

```
client/src/
├── main.ts
├── App.vue
├── i18n.ts                   # vue-i18n setup
├── modules/
│   ├── auth/
│   │   ├── auth.store.ts     # Pinia auth store
│   │   ├── auth.api.ts       # API calls to /api/auth
│   │   ├── auth.types.ts
│   │   └── pages/
│   │       ├── LoginPage.vue
│   │       └── Registration.vue
│   ├── profile/
│   │   ├── composables/useProfile.ts
│   │   └── components/ProfileChangePassword.vue
│   ├── admin/                # Admin panel (files, content/pages-data, users)
│   ├── users/
│   ├── public/pages/Home/    # Public HomePage + demo sections
│   └── testPage/
├── shared/                   # Shared components, composables, layouts, utils
├── stores/                   # Pinia stores
├── locales/                  # i18n messages (ru.json, en.json)
└── router/                   # Vue Router config
```

### Shared Types (`shared/`)

```
shared/types/
├── auth.types.shared.ts      # AuthUser, LoginRequest, RegistrationDto, ChangePasswordDto
├── user.types.shared.ts      # UserRole, User types
├── storage.types.shared.ts
└── ...
```

## Tech Stack

| Layer     | Technology                                    |
|-----------|-----------------------------------------------|
| Frontend  | Vue 3, TypeScript, Vite, Pinia, Vue Router    |
| Backend   | Fastify 5, TypeScript, Pino (logging)         |
| Database  | MongoDB (native driver + mongoose)            |
| Cache     | Redis (token/session storage)                 |
| Auth      | JWT (access + refresh tokens), bcrypt         |
| Validation| Zod                                           |

## Auth System

- **Two-token pattern**: short-lived access token + long-lived refresh token
- Access token: in memory + Redis. TTL: 15m (prod) / 30d (dev)
- Refresh token: HTTP-only cookie + Redis. TTL: 7d (prod) / 120d (dev)
- Redis key format: `user:{userId}:token:{type}:{uuid}`
- Password hashing: bcrypt with 12 rounds
- Cookie: httpOnly, secure, sameSite=lax, path=/api/auth

## API Endpoints

```
POST   /api/auth/login
POST   /api/auth/registration
POST   /api/auth/refresh
POST   /api/auth/logout           [auth required]
POST   /api/auth/logoutAll        [auth required]
PATCH  /api/auth/change-password  [auth required]

GET    /api/profile/me          [auth required]

GET    /api/users                 [admin]
...    /api/storage/...             # files & folders
...    /api/content/...             # page content & reference lists
...    /api/reports/...             # user-generated content
GET    /upload/...                  # serving uploaded files
GET    /health
```

## Environment Variables

See `.env.example` in the repo root for the full template.

```
JWT_SECRET, COOKIE_SECRET          # required — fail-fast on start if missing
MONGO_DB_CONNECT=mongodb://localhost:27017/
MONGO_DB_NAME=test
SERVER_PORT=3001
CLIENT_PORT=3002
REDIS_PORT=3003
PRODACTION_PORT=3004
UPDATE_PAGES_DATA=false            # true → reseed content on start
MAILER_IS_ACTIVE, MAILER_HOST, MAILER_PORT, MAILER_FROM   # Nodemailer (SMTP)
```

## Commands

**Package manager**: pnpm (not npm)

```bash
# Server
cd server && pnpm run dev        # Development
cd server && pnpm run build      # Build

# Client
cd client && pnpm run dev        # Development
cd client && pnpm run build      # Build
```
