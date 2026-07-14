# Testing & Verification

## Automated Testing
No full e2e test suite is provided in the hackathon scope, but the application is designed to be easily testable using tools like Jest and Supertest.

## Manual Checklist
1. **Auth**: Register a tenant and owner successfully. Admin registration block works.
2. **Profile & Listing**: Owner can create listings; Tenant can create profiles.
3. **Compatibility Engine**: 
    - Set `LLM_PROVIDER=gemini` and provide a valid API key. Ensure LLM scores are returned.
    - Remove the API key to simulate a failure and ensure the system falls back to rule-based scoring cleanly.
4. **Interests**: Express an interest and verify owner dashboard shows it. Accept the interest.
5. **Chat**: Using two browser windows, chat via Socket.IO. Refresh page to verify DB persistence.
