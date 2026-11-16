# Room Booking API

![CI](https://github.com/KrystianRucki/ZTPAI_zadania/actions/workflows/ci.yml/badge.svg)

Room Booking API implemented with Node.js, Express, PostgreSQL and Knex.

## Requirements

- Docker
- Docker Compose
- Git

## Run with Docker Compose

Clone the repository:

```bash
git clone https://github.com/KrystianRucki/ZTPAI_zadania
cd room-booking-api
```

Create the environment configuration:

### Linux / macOS

```bash
cp .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

After copying `.env.example` to `.env`, open the `.env` file and replace the example values with the correct configuration for your environment. Make sure `JWT_SECRET` is at least 32 characters long.

Build and start the application:

```bash
docker compose up --build
```

The API is available at:

```text
http://localhost:3000
```

Swagger UI:

```text
http://localhost:3000/api/docs/
```

## Seed database

To run database seeds inside the API container:

```bash
docker compose exec api npx knex seed:run
```

## Stop application

```bash
docker compose down
```

## Tests

Unit tests:

```bash
npm run test:unit
```

Integration tests:

```bash
npm run test:integration
```

All tests:

```bash
npm test
```
