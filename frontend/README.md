# BHIV AI Assistant Frontend

A modern React/TypeScript frontend for the BHIV AI Assistant backend system.

## Features

- **Complete API Integration**: All backend endpoints wired with proper TypeScript types
- **Authentication**: API key and JWT Bearer token support
- **Responsive UI**: Dark theme with mobile-friendly design
- **Real-time Updates**: React Query for efficient data fetching
- **Form Validation**: Zod schemas with React Hook Form
- **Testing**: Vitest with React Testing Library
- **Type Safety**: Full TypeScript coverage

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## Environment Setup

Copy `.env.example` to `.env.local` and configure:

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_API_KEY=your_api_key_here
VITE_DEBUG_API=false
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── api/           # API client and types
├── app/           # Application logic
│   ├── auth/      # Authentication
│   └── layout/    # App layout
├── components/    # Reusable UI components
├── pages/         # Page components
├── styles/        # CSS styles
├── test/          # Test utilities
└── utils/         # Utility functions
```

## Backend Integration

This frontend connects to the BHIV backend API with endpoints for:
- Chat and conversation management
- Task management (CRUD operations)
- NLU processing (summarize, intent, task classification)
- Embeddings and similarity search
- Voice processing (STT/TTS)
- External integrations
- Decision hub routing

## Development

The project uses modern React patterns with:
- React Router v6 for routing
- TanStack Query for data fetching
- React Hook Form + Zod for forms
- Tailwind-inspired CSS variables for theming
- ESLint + Prettier for code quality
- Vitest for testing
