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

GitHub Pages hosts the frontend only. Deploy the Express API using the included `render.yaml`, then add the deployed API URL as the repository variable `VITE_API_URL` (for example, `https://elc-api.onrender.com/api`). Set the API's `CLIENT_ORIGIN` to `https://prince1-create.github.io`.
