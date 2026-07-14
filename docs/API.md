# API Documentation

## Auth
- **POST /api/auth/register**: Register a new user (tenant/owner).
- **POST /api/auth/login**: Authenticate user and return JWT.
- **GET /api/auth/me**: Get current user.

## Listings
- **GET /api/listings**: Search active listings (public/tenant).
- **POST /api/listings**: Create a listing (owner only).
- **GET /api/listings/mine**: Get own listings (owner only).

## Tenant Profile
- **GET /api/tenant-profile/me**: Get own profile.
- **PUT /api/tenant-profile/me**: Create or update profile.

## Compatibility
- **GET /api/compatibility/listing/:listingId**: Fetch AI compatibility score.

## Interests
- **POST /api/interests**: Express interest in a listing (tenant).
- **PATCH /api/interests/:id/accept**: Accept an interest request (owner).
- **PATCH /api/interests/:id/decline**: Decline an interest request (owner).

## Chat
- **GET /api/conversations**: List accepted conversations.
- **GET /api/conversations/:id/messages**: Fetch paginated messages.

## Admin
- **GET /api/admin/dashboard**: Platform statistics.
