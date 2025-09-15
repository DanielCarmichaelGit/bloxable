# Webhook Integration

This document describes the webhook integration that sends chat messages to your n8n workflow.

## Webhook Endpoint

**URL**: `https://daniel-testing.app.n8n.cloud/webhook/chat`  
**Method**: `POST`  
**Content-Type**: `application/json`

## Request Payload

Every user message is sent to the webhook with the following structure:

```json
{
  "user_id": "uuid-string",
  "session_id": "uuid-string",
  "message": "user's message content",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "userEmail": "user@example.com"
}
```

### Field Descriptions

- **`user_id`**: The Supabase user ID of the person sending the message
- **`session_id`**: The Supabase chat session ID (matches `chat_sessions.id`)
- **`message`**: The actual message content from the user
- **`timestamp`**: ISO 8601 timestamp of when the message was sent
- **`userEmail`**: The email address of the user sending the message (null if not available)

## Integration Flow

1. **User sends message** → Message appears in chat immediately
2. **Message saved to Supabase** → Stored in `chat_messages` table
3. **Webhook called** → Sent to n8n with user_id, session_id, and message
4. **AI responds** → Response also saved to Supabase

## Session Tracking

The `session_id` allows you to:

- **Track conversations**: Link messages to specific chat sessions
- **User context**: Understand which conversation a message belongs to
- **Analytics**: Analyze conversation patterns and user behavior
- **Agent routing**: Route messages to specific agents based on session

## Database Relationship

```
chat_sessions.id (UUID) → session_id in webhook
├── user_id (UUID)
├── agent_id (UUID, optional)
├── agent_name (TEXT)
└── created_at, updated_at (TIMESTAMP)

chat_messages
├── session_id (UUID) → References chat_sessions.id
├── role (user/assistant)
├── content (TEXT)
└── created_at (TIMESTAMP)
```

## Error Handling

- **Webhook failures** are logged but don't interrupt the chat experience
- **Users can continue chatting** even if the webhook is temporarily unavailable
- **All messages are still saved** to Supabase regardless of webhook status

## Usage in n8n

You can use the webhook data in your n8n workflow to:

1. **Process messages** based on session context
2. **Route to different agents** based on session_id
3. **Track conversation state** across multiple messages
4. **Generate responses** that are contextually aware
5. **Store additional data** linked to specific sessions

## Example n8n Workflow

```javascript
// Access webhook data in n8n
const userId = $json.user_id;
const sessionId = $json.session_id;
const message = $json.message;
const timestamp = $json.timestamp;

// Use sessionId to look up session details
// Use userId to look up user details
// Process message with full context
```

The webhook integration provides complete context for every message, enabling sophisticated conversation management and agent routing in your n8n workflows.
