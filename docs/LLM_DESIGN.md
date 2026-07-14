# LLM Design

## Concept
The LLM integration is responsible for generating a compatibility score between 0 and 100 based on a JSON prompt representing the Tenant Profile and Listing Details.

## Fallback Mechanism
If the LLM call times out, returns invalid data, or the provider is unavailable, the orchestrator immediately falls back to a deterministic rule-based calculation defined in `fallbackScorer.js`.

## Prompt Structure
```text
SYSTEM:
You are a room compatibility scoring engine. Return only valid JSON...

USER:
Given this room listing: { ...json }
And this tenant profile: { ...json }
Return: { "score": 0, "explanation": "..." }
```

## Security
No sensitive user PII (emails, passwords, exact addresses) are sent to the LLM. Only anonymized preference data is sent.
