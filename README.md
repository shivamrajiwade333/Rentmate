# RentMate

RentMate is an AI-powered Rent and Flatmate Finder platform that matches tenants with optimal room listings using an advanced compatibility engine.

## Features

- **AI Compatibility Engine**: Leverages LLMs (Gemini, Groq, OpenAI) to score tenant profiles against listing details.
- **Rule-Based Fallback**: Ensures uninterrupted service even if the AI provider goes down.
- **Role-Based Access**: Specialized dashboards for Tenants, Owners, and Admins.
- **Real-Time Chat**: Integrated Socket.IO chat unlocks only when an owner accepts a tenant's request.
- **Notifications**: Email (SMTP/Resend) and in-app notifications for critical events.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, React Router, Zod, React Hook Form
- **Backend**: Node.js, Express.js, Socket.IO, Mongoose, JWT Auth
- **Database**: MongoDB Atlas
- **Storage**: Cloudinary
- **AI**: Gemini API / Rule-based Fallback

## Local Setup

### 1. Clone & Install
\`\`\`bash
cd server
npm install
cd ../client
npm install
\`\`\`

### 2. Environment Variables
Copy \`.env.example\` to \`.env\` in both \`server\` and \`client\` directories and fill in the required values (MongoDB URI, JWT secret, Cloudinary keys, Email keys, and LLM API key).

### 3. Start Application
**Server:**
\`\`\`bash
cd server
npm run dev
\`\`\`

**Client:**
\`\`\`bash
cd client
npm run dev
\`\`\`

## Seed Data
To seed initial demo accounts (Admin, Tenant, Owner):
\`\`\`bash
cd server
node utils/seed.js
\`\`\`
*(Passwords are defaulted to \`password123\`)*

## Architecture

Please review the \`docs/\` directory for detailed information:
- \`SYSTEM_DESIGN.md\`
- \`DATABASE_SCHEMA.md\`
- \`LLM_DESIGN.md\`
- \`API.md\`
- \`TESTING.md\`
