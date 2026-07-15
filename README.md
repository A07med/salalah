This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Global leaderboard database

The leaderboard uses server-only Next.js API routes, Drizzle ORM, `postgres-js`,
and Supabase PostgreSQL. Copy `.env.example` to `.env.local`, then copy both
connection strings from **Supabase Dashboard → Connect**:

- `DATABASE_URL`: Transaction Pooler URL (normally port `6543`) for the app.
- `DATABASE_MIGRATION_URL`: Direct or Session Pooler URL (normally port `5432`)
  for migrations.

Never prefix these values with `NEXT_PUBLIC_`. Apply committed migrations with:

```bash
npm run db:check
npm run db:migrate
```

The runtime client disables prepared statements for transaction-pooler
compatibility and limits each serverless instance to one connection.

Score submissions have strict server validation and an atomic unique session
insert. The included in-memory rate limit is process-local and is not globally
authoritative across Vercel instances; use a managed distributed rate limiter
for stronger abuse controls.

Gameplay scoring remains client-authoritative. The API rejects malformed and
obviously impossible telemetry, but this is not cheat-proof. Fully
authoritative anti-cheat requires server-verified or signed gameplay events.

Repository integration tests are opt-in and destructive to leaderboard rows in
the supplied database. Run them only against a dedicated migrated test database:

```bash
TEST_DATABASE_URL="postgres://..." RUN_DB_INTEGRATION_TESTS=1 npm run test
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
