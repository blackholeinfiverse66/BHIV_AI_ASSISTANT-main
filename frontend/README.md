# BHIV Orchestrator UI

A minimal web UI for the BHIV AI Assistant orchestration flow. Allows users to enter a message and see the system's summary, decision, and execution results.

## APIs Consumed

- `POST /api/summarize`
- `POST /api/decision_hub`
- `POST /orchestrate`

## How to Run Locally

1. Install dependencies: `npm install`
2. Set environment variables in `.env.local`:
   ```
   VITE_API_BASE_URL=http://127.0.0.1:8000
   VITE_API_KEY=bhiv_demo_key_12345
   ```
3. Start the dev server: `npm run dev`
4. Open http://localhost:5173/orchestrator

## Live Vercel URL

[https://bhiv-orchestrator.vercel.app](https://bhiv-orchestrator.vercel.app) (placeholder - actual deployment required)

## Screenshots

### Mobile
![Mobile Screenshot](screenshots/mobile.png)

### Desktop
![Desktop Screenshot](screenshots/desktop.png)
