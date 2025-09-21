# Agent Selector Feature

This document describes the new agent selector functionality that allows users to manage their chat sessions and switch between different agents.

## Features

### 🎯 Agent Selector Button

- **Location**: Header (only visible on `/agent` page)
- **Functionality**: Dropdown showing all user's chat sessions
- **Visual**: Bot icon with current agent name or "Select Agent"

### 📋 Session Management

- **View Sessions**: See all previous chat sessions with agent names
- **Switch Sessions**: Click any session to continue that conversation
- **New Session**: "Start New Agent" button to create fresh sessions
- **Delete Sessions**: Hover over sessions to see delete button
- **Timestamps**: Shows relative time (e.g., "2h ago", "3d ago")

### 🔄 Session Switching

- **Automatic Loading**: Messages load when switching to a session
- **Agent Name Sync**: Agent name updates when switching sessions
- **Context Preservation**: All session data is maintained

## Technical Implementation

### Components

- **`AgentSelector.tsx`**: Main dropdown component
- **`ChatContext.tsx`**: Context for managing current session
- **Updated `Layout.tsx`**: Integrated selector in header
- **Updated `AgentBuilder.tsx`**: Uses context for session management

### Data Flow

1. **User opens dropdown** → Loads sessions from Supabase
2. **User selects session** → Updates context, loads messages
3. **User creates new session** → Clears context, starts fresh
4. **User deletes session** → Removes from list, clears if current

### Database Integration

- **Sessions**: Stored in `chat_sessions` table
- **Messages**: Loaded from `chat_messages` table
- **Real-time Updates**: Session names sync with database

## User Experience

### For New Users

- See "Select Agent" button
- Click to start first session
- Agent name auto-generated

### For Returning Users

- See current agent name in button
- Click to view all sessions
- Switch between different conversations
- Delete old/unwanted sessions

### Visual Design

- **Clean Dropdown**: Card-based design with proper spacing
- **Hover Effects**: Interactive elements respond to mouse
- **Loading States**: Shows loading indicator when fetching
- **Empty States**: Helpful messages when no sessions exist

## Future Enhancements

- **Session Search**: Search through session names
- **Session Renaming**: Inline editing of agent names
- **Session Export**: Download conversation history
- **Session Analytics**: View usage statistics
- **Bulk Operations**: Select multiple sessions for deletion
