# ELC API

Express and MongoDB API for the Excellent Leaders Consortium website.

## Setup

1. Copy `.env.example` to `.env` and set `MONGODB_URI`.
2. Run `npm install`.
3. Run `npm run dev`.

The API starts at `http://localhost:5000`.

## Endpoints

- `GET /api/health` checks API availability.
- `POST /api/contact` stores a website contact form submission. Its JSON body must contain `name`, `email`, and `message`.
- `POST /api/auth/register` creates an account and returns a JWT.
- `POST /api/auth/login` authenticates an account and returns a JWT.
- `POST /api/auth/logout` ends the client session.
- `GET /api/users/me` returns the authenticated user's profile. Send the token as `Authorization: Bearer <token>`.
- `PATCH /api/users/me` updates the authenticated user's name or password.

Set `VITE_API_URL=http://localhost:5000/api` in the frontend application's environment file (already provided in `elc-website/.env.example`).
