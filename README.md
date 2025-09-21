# Bloxable - AI Agent Marketplace

A modern marketplace for AI-powered workflow automation and agent creation.

## Project Structure

```
bloxable/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts
│   ├── lib/               # Utility libraries
│   └── store/             # Redux store
├── public/                 # Static assets
├── dist/                   # Build output
├── md/                     # Documentation files
├── database/               # SQL schema files
├── tests/                  # Test files
├── email-templates/        # Email templates
└── docs/                   # Additional documentation
```

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start development server:

   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Documentation

- **Setup Guide**: `md/setup-database.md`
- **Authentication**: `md/DUAL_AUTHENTICATION_IMPLEMENTATION.md`
- **Deployment**: `md/DEPLOYMENT_GUIDE.md`
- **Design System**: `md/DESIGN_SYSTEM.md`

## Database

All SQL schema files are located in the `database/` directory.

## Testing

Test files are organized in the `tests/` directory.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Backend**: Supabase
- **Animations**: Framer Motion
- **UI Components**: Radix UI
