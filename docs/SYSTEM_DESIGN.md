# System Design

## Architecture Overview
RentMate is a full-stack MERN application structured as a monorepo.
- **Client**: Vite + React single-page application (SPA).
- **Server**: Express.js REST API providing data, authentication, AI orchestration, and a Socket.IO server for real-time messaging.
- **Database**: MongoDB (Atlas) for persistent storage.

## Compatibility Scoring
The system calculates a compatibility score (0-100) between a tenant's profile and a listing.
1. When a user requests a match, the `CompatibilityService` checks for an existing unexpired cache.
2. If invalid or missing, it triggers the LLM Service (e.g., Gemini).
3. If the LLM Service fails (timeout, invalid JSON, service down), it automatically executes a deterministic Rule-Based Fallback.

## Real-Time Chat
Implemented using Socket.IO.
- Chat rooms are strictly created using `Conversation` ObjectIds.
- Authentication happens via JWT on socket connection.
- Users can only join rooms if they belong to the `participants` array in the DB.

## Email Notifications
An abstraction layer handles sending emails using `nodemailer` (SMTP) or `resend`.
- Used for high-match notifications and accepted/declined interest updates.

## Security
- `helmet` and `cors` secure the Express app.
- Passwords hashed via `bcryptjs`.
- Strict role-based middleware (`protect`, `authorize`) prevents unauthorized access.
