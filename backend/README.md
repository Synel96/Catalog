# Catalog backend

Django REST + Channels API for the Catalog frontend (`frontend/catalog`).

## Setup

```sh
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cd catalog
cp .env.example .env   # then fill in DATABASE_URL, or delete the line for SQLite
python manage.py migrate
python manage.py runserver
python manage.py test
```

## Database

The database comes from `DATABASE_URL` (environment variable or
`catalog/.env`). Without it, the app uses the local SQLite file
`catalog/db.sqlite3`.

### Neon Postgres

1. In the Neon console, create a project and a database (e.g. `catalog`).
2. **Connect** → turn on **Connection pooling** → copy the connection string.
   The pooled host has `-pooler` in its name. Keep `?sslmode=require`.
3. Set it as `DATABASE_URL` (in `catalog/.env` locally, or in the hosting
   provider's environment variables).
4. Run `python manage.py migrate` once to create the tables.

Settings that matter for Neon (see `catalog/settings.py`):

- `CONN_MAX_AGE` defaults to 0 (`DB_CONN_MAX_AGE`): the app runs under ASGI,
  where Django's persistent connections aren't reused safely, so pooling is
  left to Neon's pooler.
- Server-side cursors are off for Postgres, as PgBouncer's transaction mode
  (Neon's pooler) requires.

### Moving existing SQLite data to Neon

```sh
cd backend/catalog
# 1. Export from SQLite (no DATABASE_URL set)
python manage.py dumpdata --natural-foreign --natural-primary \
  -e contenttypes -e auth.permission -e admin.logentry -e sessions \
  --indent 2 -o data.json
# 2. Create the tables in Neon and import
DATABASE_URL="postgresql://…-pooler…/catalog?sslmode=require" python manage.py migrate
DATABASE_URL="postgresql://…-pooler…/catalog?sslmode=require" python manage.py loaddata data.json
```

`loaddata` also resets Postgres' id sequences, so new rows don't collide
with the imported ones. Uploaded images (`media/`) aren't in the database
and need to be copied separately.
