# FarmFax

Agricultural credit and supplier marketplace for fish farmers in Nigeria and West Africa. Farmers order feed and inputs on credit; admins approve; suppliers fulfill; loan balances update after confirmed delivery.

## Stack

- **Next.js 16** (App Router) · **React 19** · **Prisma** · **PostgreSQL** (Neon)
- CSS Modules + design tokens (light / dark mode)

## Local development

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Set `DATABASE_URL` to your [Neon](https://neon.tech) PostgreSQL connection string.

3. Install and set up the database:

```bash
npm install
npm run db:setup
```

4. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts (after seed)

| Role | Login | Email | Password |
|------|-------|-------|----------|
| Farmer | `/farmer/login` | `farmer.demo@famfax.ng` | `Demo1234!` |
| Supplier | `/supplier/login` | `supplier.demo@famfax.ng` | `Demo1234!` |
| Admin | `/admin/login` | `admin.demo@famfax.ng` | `Demo1234!` |

Create additional admins:

```bash
npm run admin:create -- email@example.com "Full Name" "SecurePassword"
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server + Prisma generate |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed demo data |

## Deploy to Vercel + GitHub

1. Push this repository to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Add environment variable:
   - `DATABASE_URL` — Neon **pooled** connection string (`?sslmode=require`)
4. Deploy. Vercel runs `npm run build` (includes `prisma generate` via `postinstall`).

**First deploy:** run migrations/seed against production once from your machine:

```bash
DATABASE_URL="your-production-url" npm run db:setup
```

### File uploads on Vercel

Profile photos and product images are stored under `public/uploads/` locally. On Vercel, the filesystem is ephemeral. For production uploads, use [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) or S3 and point `imageUrl` fields to those URLs. Demo seed data uses Unsplash URLs and works without upload storage.

## Project structure

- `app/` — routes (marketing, auth, dashboards, API)
- `components/` — UI by domain (landing, dashboard, auth)
- `lib/` — business logic (orders, auth, workflows)
- `prisma/` — schema and seed
- `styles/` — global tokens + CSS modules

## License

Private — FarmFax platform.
