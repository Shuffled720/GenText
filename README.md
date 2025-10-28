# GenText — My first app using generative AI APIs

A small demo Next.js app that shows a simple chat UI which calls backend endpoints that proxy to generative AI APIs. This repository is a learning / demo project and demonstrates:

- A client-side chat component (`components/ChatComponent.tsx`) that POSTs user input to the API and displays streamed or completed responses.
- Two API routes under `app/api/chat/`: `complete-response` (non-streaming JSON response) and `stream-response` (streaming response chunks).

This README covers how to run the app locally and what environment variables you need. For Docker-specific instructions see `readme.docker`.

## Prerequisites

- Node.js 18+ (recommended)
- npm (comes with Node) or pnpm/yarn if preferred
- An API key for the generative AI service you intend to use (e.g. OpenAI). The project expects the key in an environment variable — see "Environment variables" below.

## Environment variables

Create a `.env.local` file in the project root (this file should not be committed) and add at least:

```
OPENAI_API_KEY=sk-...your-key-here
PORT=3000
```

If your API wrapper uses a different variable name, adapt accordingly. The backend routes in `app/api/chat/*` read env vars to authenticate with the third-party API.

## Run locally (development)

Install dependencies and start the Next.js dev server (PowerShell):

```powershell
npm install
npm run dev
```

Open http://localhost:3000 in your browser. The main UI includes a textarea and two buttons:

- "Get Response" — POSTs to `/api/chat/complete-response` and expects a JSON body like `{ "message": "..." }` and a JSON response with `{ "response": "..." }`.
- "Get Stream Response" — POSTs to `/api/chat/stream-response` and reads a streaming response. The component appends chunks as they arrive.

Notes on payloads:

- Request: JSON body `{ "message": "your prompt here" }`.
- Streaming: the component expects the API to return a readable stream. The code currently sends the request as JSON.

## Quick API examples

Non-streaming (curl):

```powershell
curl -X POST http://localhost:3000/api/chat/complete-response -H "Content-Type: application/json" -d '{"message":"Hello world"}'
```

Streaming (simple test):

```powershell
curl -N -X POST http://localhost:3000/api/chat/stream-response -H "Content-Type: application/json" -d '{"message":"Stream test"}'
```

Note: `curl -N` disables buffering so you can see streaming chunks if the API returns them.

## Files of interest

- `components/ChatComponent.tsx` — the client chat UI. It has two functions: `getResponse` (non-streaming) and `getStreamResponse` (streaming). The component appends whatever the API stream sends directly into the response box.
- `app/api/chat/complete-response/route.ts` — non-streaming proxy route (POST).
- `app/api/chat/stream-response/route.ts` — streaming proxy route (POST).

## Docker / Compose

This repo includes `dev.Dockerfile` and you may have `docker-compose` configs locally. See `readme.docker` for Docker instructions.

## Contributing and notes

This is a learning project. If you change request/response formats, update `components/ChatComponent.tsx` and the API routes so they match. If you want additional features (markdown rendering, progressive tokens, user sessions), I can add them.

## License

MIT-style (add a LICENSE file if you want to be explicit).
