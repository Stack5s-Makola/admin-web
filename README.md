# Makola — Admin Web

React admin dashboard for the Makola marketplace. Administrators only: verify sellers,
approve listings, remove bad listings, manage problematic users, handle reports.

Stack: React + TypeScript (Vite), axios, react-router-dom. Deployed to Vercel.
Screens follow Charity's Figma designs (Login, Verify Email, and the dark sidebar shell:
Dashboard, Sellers, Buyers, Map).
The backend is NestJS (see the technical architecture document).

## Run it

```bash
npm install
cp .env.example .env        # then set VITE_API_BASE_URL
npm run dev                 # http://localhost:5173
```

In a Codespace, port 5173 is forwarded automatically — open it from the Ports tab.

### Clicking through the screens without a backend

Set `VITE_DEV_FAKE_AUTH=true` in `.env` and restart `npm run dev`. Any email/password
signs you in as a fake admin, so `/dashboard`, `/sellers`, `/buyers` and `/map` are
reachable. The flag is ignored in production builds. Leave it `false` to test the real
login flow. `/verify-otp` is only reachable through a real login response.

Scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm run typecheck`.

## Structure

```
src/
├── core/            # config, token storage, the shared axios client
├── features/        # one folder per admin area: auth, dashboard, sellers,
│                    # buyers, map
├── layouts/         # AuthLayout (login shell), AdminLayout (sidebar + topbar)
├── routes/          # paths.ts, ProtectedRoute, route table
├── components/      # shared UI
├── types/           # ApiResponse<T>, ApiError, User, Role
├── assets/          # logo-wordmark.png, logo-mark.png, auth-artwork.png
│                    # (extracted from the Figma export - swap for SVGs when shared)
└── styles/          # global.css (design tokens at the top)
```

Rules of thumb:

- A feature never creates its own axios instance — import `http` from `core/axios`.
- A feature never reads `import.meta.env` — import `config` from `core/config`.
- Never hardcode a URL in a component — use `routes/paths.ts`.
- Talk to the API through `features/<area>/services/*.service.ts`, not from components.

## API contract this client assumes

Every response uses the standard envelope (architecture doc §56):

```json
{ "success": true, "message": "...", "data": {} }
{ "success": false, "message": "...", "data": null }
{ "success": false, "message": "Validation failed", "errors": { "email": "..." } }
```

`core/axios.ts` unwraps `data` for callers and turns every failure into an `ApiError`
with `message`, `status` and optional field `errors`.

Auth endpoints used: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`,
`POST /auth/forgot-password`, `POST /auth/reset-password`, `POST /auth/verify-otp`,
`POST /auth/resend-otp`, `GET /users/me`.

Confirmed with the backend:

1. `POST /auth/login` returns tokens only — the account is loaded with `GET /users/me`.
2. Tokens come back in the response body (not an httpOnly cookie).
3. Field names: `accessToken`, `refreshToken`.
4. The OTP runs on **every** admin login, so login is a password check and the session
   starts only after `POST /auth/verify-otp`.
5. Admin accounts are seeded by the backend — there is no admin sign-up screen.

## Auth behaviour

- Login checks the password and always routes to `/verify-otp`; no tokens are stored
  until the code is verified.
- After verification the tokens are stored, `GET /users/me` loads the account, and any
  account whose role is not `ADMIN` is rejected and signed straight back out.
- The access token is attached to every request; a 401 triggers one refresh attempt
  (concurrent requests share it) and the original request is retried once.
- If refresh fails, tokens are cleared and the user lands back on `/login?next=…`.

## Git workflow

Fork the org repo, branch `feat/…` or `fix/…`, commit as `Add: …` / `Fix: …`,
push to your fork, open a PR to the org repo. Never commit `.env`.
