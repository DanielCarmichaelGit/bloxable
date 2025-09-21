-- Update chat_sessions table to rename agent_name to session_name
ALTER TABLE chat_sessions RENAME COLUMN agent_name TO session_name;
