# Anonymous Confessions

A mini app for anonymous confessions: users can publish a story, share a direct link, edit/delete their own posts, and like other confessions.

## Features

- Create anonymous confessions (title + content)
- Browse a random confessions feed
- Open a single confession page (`/confession/:id`)
- Like/unlike with anti-spam protection
- Edit and delete only by owner (via signed cookie)
- Built-in success/error notifications

## Tech Stack

### Frontend

- Vanilla JavaScript (SPA with a custom router)
- Webpack 5
- SCSS Modules

### Backend

- Node.js + Express 5
- Prisma ORM
- PostgreSQL
- Zod for validation
- Argon2 for token hashing

## Architecture

- `client/` — SPA frontend (screens: feed/add/confession)
- `server/` — REST API and business logic
- `server/prisma/schema.prisma` — database schema

## Quick Start

### 1. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 2. Configure environment variables

Create `server/.env`:

```env
NODE_ENV=development
PORT=4200
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/anon_confessions
CLIENT_URL=http://localhost:3000
COOKIE_SECRET=change-this-to-very-long-secret-at-least-32-chars
VOTER_SECRET=change-this-to-another-very-long-secret-32-chars
```

Create `client/.env`:

```env
NODE_ENV=development
SERVER_URL=http://localhost:4200
```

### 3. Prepare the database

```bash
cd server
npx prisma generate
npx prisma db push
```

### 4. Run the project

Use two terminals:

```bash
# terminal 1
cd server
npm run dev
```

```bash
# terminal 2
cd client
npm run dev
```

After startup:

- Client: `http://localhost:3000`
- Server: `http://localhost:4200`

## API

Base prefix: `/api/confessions`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/random` | Get random confessions (up to 15 items) |
| `POST` | `/` | Create a confession |
| `GET` | `/:id` | Get confession by `id` |
| `PATCH` | `/:id` | Update confession (owner only) |
| `DELETE` | `/:id` | Delete confession (owner only) |
| `PATCH` | `/:id/like` | Like a confession |
| `PATCH` | `/:id/unlike` | Unlike a confession |

## How Anonymity Works

- When a confession is created, the server stores only the hash of an owner token and sets the token itself in a signed `httpOnly` cookie.
- Only a user with that cookie can edit/delete their confession.
- Likes use a separate signed cookie (`anon_voter_id`) and a server-side hash.
- No personal user data is collected.

## Scripts

### `client/package.json`

- `npm run dev` — start webpack dev server (`:3000`)
- `npm run build` — build production client bundle

### `server/package.json`

- `npm run dev` — run API with `nodemon`
- `npm start` — run API with `node`

## Possible Improvements

- Add Prisma migrations (`prisma migrate`) instead of only `db push`
- Add tests (unit/integration/e2e)
- Add Docker Compose for one-command local startup
- Add CI pipeline (lint + tests + build)

## License

ISC
