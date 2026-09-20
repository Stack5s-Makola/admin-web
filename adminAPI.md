# Admin API

## Authentication

Sign in with `POST /api/admin/login`. Send the returned access token on every
request:

```http
Authorization: Bearer <token>
```

Every response has this envelope:

```json
{ "success": true, "message": "...", "data": {} }
```

`401` means the session has expired or the token is invalid; sign in again.
`403` means the account is authenticated but is not an administrator.

## Read-only endpoints

There is no pagination, filtering, sorting, detail endpoint, or action endpoint.
Each list returns every row in `data`.

| Tab | Endpoint | `data` fields |
| --- | --- | --- |
| Dashboard | `GET /api/admin/dashboard` | `totalUsers`, `totalSellers`, `totalBuyers`, `totalListings`, `recentActivities[]` |
| Sellers | `GET /api/admin/sellers` | `name`, `email`, `profilePicture`, `businessName`, `location`, `status` |
| Buyers | `GET /api/admin/buyers` | `name`, `email`, `phone`, `profilePicture`, `joined`, `status` |
| Listings | `GET /api/admin/listings` | `product`, `seller`, `location`, `date`, `status`, `image` |

## Nullable media

`name`, `profilePicture`, and listing `image` are currently always `null` where
applicable. The UI must retain its fallback treatment (initials, email, or a
placeholder tile) rather than assuming media exists.

## Listing status

Listings may be `pending`, `approved`, `rejected`, or `removed`. The UI must
render `removed` as a distinct status.
