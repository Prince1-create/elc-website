# ELC API

Express and MongoDB API for the Excellent Leaders Consortium website.

## Setup

1. Copy `server/.env.example` to `.env` and set `MONGODB_URI` and `JWT_SECRET`.
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

`JWT_SECRET` must be a unique random value with at least 32 characters. Do not commit `.env` or share its MongoDB credentials.

## Production API

The frontend is hosted separately from the Express API. Deploy the API using the included `render.yaml`, then set the frontend's `VITE_API_URL` to the deployed API URL (currently `https://excellent-leaders-consortium.onrender.com/api`). Set the API's `CLIENT_ORIGIN` on Render to the frontend's production origin. The Vercel deployment URL currently in use is allowed in the API's CORS configuration.
