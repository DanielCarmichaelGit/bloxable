# Session Flow Implementation

This document explains the exact session flow implementation as requested.

## Flow Overview

The session management now follows this exact flow:

1. **User clicks on a session** → Set global active session ID → Navigate to chat screen → Pull chat name and logs
2. **User clicks create new session/chat** → Navigate to chat page → Check for active session ID → Create new session if none exists

## Database Changes

### Column Rename

- **Changed**: `agent_name` → `session_name` in `chat_sessions` table
- **SQL**: `ALTER TABLE chat_sessions RENAME COLUMN agent_name TO session_name;`
- **Updated**: All TypeScript interfaces and API calls

## Implementation Details

### 🎯 Dashboard Flow

#### Resume Existing Session

```typescript
const handleResumeSession = (session: ChatSession) => {
  // Set the global active session ID to this session ID
  dispatch(setCurrentSession(session));
  dispatch(setInitialized(true));
  // Navigate to chat screen - it will pull chat name and logs
  window.location.href = "/agent";
};
```

#### Start New Chat

```typescript
const handleStartNewChat = () => {
  // Clear current session to start fresh
  dispatch(clearSession());
  // Navigate to chat page - it will check for active session ID and create one if needed
  window.location.href = "/agent";
};
```

### 🎯 AgentBuilder Flow

#### Session Check Logic

```typescript
useEffect(() => {
  if (user && !isInitialized) {
    if (currentSession) {
      // Active session ID exists - pull chat name and logs
      loadSessionData();
    } else {
      // No active session ID - create new session with random name
      createNewSession();
    }
  }
}, [user, isInitialized, currentSession]);
```

#### Load Existing Session Data

```typescript
const loadSessionData = async () => {
  if (!currentSession) return;

  dispatch(setIsLoading(true));
  try {
    // Pull chat name and logs for existing session
    dispatch(setSessionName(currentSession.session_name));

    const dbMessages = await chatApi.getMessages(currentSession.id);
    const formattedMessages: Message[] = dbMessages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.created_at),
    }));
    dispatch(setMessages(formattedMessages));
    dispatch(setInitialized(true));
  } catch (error) {
    console.error("Error loading session data:", error);
  } finally {
    dispatch(setIsLoading(false));
  }
};
```

#### Create New Session

```typescript
const createNewSession = async () => {
  if (!user || isInitialized) return;

  dispatch(setIsLoading(true));
  try {
    const randomName = generateRandomAgentName();
    const session = await chatApi.createSession(user.id, randomName);
    if (session) {
      dispatch(setCurrentSession(session));
      dispatch(setSessionName(session.session_name));
      dispatch(setInitialized(true));
    }
  } catch (error) {
    console.error("Error creating new session:", error);
  } finally {
    dispatch(setIsLoading(false));
  }
};
```

## Redux State Management

### Updated State Structure

```typescript
interface SessionState {
  currentSession: ChatSession | null; // Global active session ID
  messages: Message[];
  sessionName: string; // Updated from agentName
  isLoading: boolean;
  isTyping: boolean;
  isInitialized: boolean; // Prevents duplicate initialization
}
```

### Key Actions

- **`setCurrentSession`**: Sets the global active session ID
- **`setSessionName`**: Updates session name (renamed from setAgentName)
- **`setInitialized`**: Prevents duplicate session creation
- **`clearSession`**: Resets all state for new session

## Flow Examples

### Example 1: Resume Existing Session

1. **User clicks "Resume" on session "My Chat"**
2. **Dashboard**: `dispatch(setCurrentSession(session))` + `dispatch(setInitialized(true))`
3. **Navigate to `/agent`**
4. **AgentBuilder**: Checks `currentSession` exists → calls `loadSessionData()`
5. **Result**: Session name "My Chat" loaded, all messages displayed

### Example 2: Create New Session

1. **User clicks "Start New Chat"**
2. **Dashboard**: `dispatch(clearSession())` (clears active session ID)
3. **Navigate to `/agent`**
4. **AgentBuilder**: Checks `!currentSession` → calls `createNewSession()`
5. **Result**: New session created with random name, empty chat

### Example 3: Direct Navigation to AgentBuilder

1. **User navigates directly to `/agent`**
2. **AgentBuilder**: Checks `!currentSession` → calls `createNewSession()`
3. **Result**: New session created with random name

## Benefits

### ✅ Exact Flow Implementation

- **Session Resume**: Global session ID → Pull data → Display
- **New Session**: Clear state → Check for session ID → Create if needed
- **No Duplicates**: Single source of truth prevents duplicate sessions
- **Proper State**: Redux manages all session state globally

### 🚀 Performance

- **No Unnecessary API Calls**: Only creates sessions when needed
- **Fast Resume**: Existing sessions load immediately
- **Efficient State**: Redux prevents redundant operations

### 🔧 Developer Experience

- **Clear Logic**: Easy to understand session flow
- **Predictable Behavior**: Consistent session management
- **Easy Debugging**: Redux DevTools show all state changes

## Database Schema

### Updated chat_sessions Table

```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  agent_id UUID REFERENCES agents(id),
  session_name TEXT NOT NULL,  -- Renamed from agent_name
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

The session flow now works exactly as requested - no duplicate sessions, proper state management, and clear separation between resuming existing sessions and creating new ones!
