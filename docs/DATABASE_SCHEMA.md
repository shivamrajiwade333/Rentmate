# Database Schema

## User
- **name**: String
- **email**: String (Unique)
- **password**: String (Hashed)
- **role**: String (tenant, owner, admin)
- **isActive**: Boolean

## TenantProfile
- **tenant**: ObjectId (User)
- **preferredLocations**: Array[String]
- **minBudget / maxBudget**: Number
- **moveInDate**: Date
- **preferredRoomTypes**: Array[String]
- **furnishingPreference**: String
- **lifestyle**: Object

## Listing
- **owner**: ObjectId (User)
- **title / description**: String
- **location**: Object (city, locality, address)
- **rent / deposit**: Number
- **roomType / furnishingStatus**: String
- **photos**: Array[Object]
- **status**: String (active, filled, hidden)

## CompatibilityScore
- **tenant**: ObjectId (User)
- **listing**: ObjectId (Listing)
- **score**: Number (0-100)
- **explanation**: String
- **method**: String (llm, rule-based)

## InterestRequest
- **tenant**: ObjectId (User)
- **owner**: ObjectId (User)
- **listing**: ObjectId (Listing)
- **status**: String (pending, accepted, declined, withdrawn)

## Conversation & Message
- **Conversation**: links an `InterestRequest` to participants.
- **Message**: links text to a conversation and sender.

## Notification & ActivityLog
- General models for keeping track of system alerts and actions.
