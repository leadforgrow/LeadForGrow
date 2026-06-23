# Docker Deployment

## Quick Start (Local)

```bash
cp .env.example .env.local
# Edit .env.local with your secrets

docker compose up --build
```

Services:
- **app** — Next.js on port 3000
- **worker** — BullMQ automation worker
- **redis** — Queue + rate limiting
- **mongo** — Local MongoDB (dev only; use Atlas in production)

## Production

1. Set `MONGODB_URI` to Atlas connection string (not local mongo)
2. Set `REDIS_URL` to managed Redis
3. Set `JWT_SECRET`, `CRON_SECRET`, `LFG_ADMIN_PASSWORD`, `ENCRYPTION_KEY`
4. Deploy `app` and `worker` as separate containers
5. Run migrations: `docker compose exec app node scripts/migrate.js`
6. Run indexes: `docker compose exec app node scripts/ensure-indexes.js`

## Health Check

```
GET /api/health
```

Returns MongoDB + Redis status. Used by Docker `HEALTHCHECK`.

## Graceful Shutdown

The worker handles `SIGTERM`/`SIGINT` by closing the BullMQ queue before exit.
