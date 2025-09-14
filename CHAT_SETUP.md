# Chat Storage Setup

This document explains how to set up the chat storage functionality with Supabase.

## Database Setup

1. **Run the SQL Script**: Execute the `supabase-setup.sql` file in your Supabase SQL editor to create the necessary tables and policies.

2. **Tables Created**:

   - `chat_sessions`: Stores chat session information (user_id, agent_name, timestamps)
   - `chat_messages`: Stores individual messages within sessions (session_id, role, content, timestamp)

3. **Security**: Row Level Security (RLS) is enabled to ensure users can only access their own chat data.

## Features Implemented

### Chat Session Management

- **Auto-creation**: New chat sessions are automatically created when users start chatting
- **Session naming**: Agent names are stored and can be updated in real-time
- **Session persistence**: Sessions are linked to authenticated users

### Message Storage

- **Real-time saving**: All messages (user and AI) are automatically saved to the database
- **Message history**: Previous conversations are loaded when users return
- **Message metadata**: Includes timestamps, role (user/assistant), and content

### API Functions

- `createSession()`: Creates a new chat session
- `getSessions()`: Retrieves all sessions for a user
- `getMessages()`: Loads messages for a specific session
- `saveMessage()`: Saves individual messages
- `updateSessionName()`: Updates the agent name for a session
- `deleteSession()`: Removes a session and all its messages

## Usage

The chat functionality is automatically integrated into the AgentBuilder component:

1. **User Authentication**: Users must be logged in to use chat features
2. **Session Creation**: A new session is created automatically when a user starts chatting
3. **Message Persistence**: All messages are saved and will be available on future visits
4. **Agent Naming**: Users can edit the agent name, which is saved to the database

## Future Enhancements

- **Chat History UI**: Display previous conversations in a sidebar
- **Session Management**: Allow users to create multiple named sessions
- **Message Search**: Search through previous conversations
- **Export Functionality**: Export chat history as files
