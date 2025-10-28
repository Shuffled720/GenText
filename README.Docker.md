# Docker notes for GenText

This file documents how to build and run the GenText demo with Docker and docker-compose.

> These instructions assume the repo includes `dev.Dockerfile` (present in the project root). Adjust image names and paths if you changed them.

## Environment

The app needs an API key (e.g. `OPENAI_API_KEY`). For Docker you can supply env vars in a `.env` file used by docker-compose or pass them at runtime.

Example `.env` (project root):

```
OPENAI_API_KEY=sk-...your-key-here
PORT=3000
```

### Option A — Build and run with Docker (single container)

Build an image and run it (PowerShell):

```powershell
docker build -f dev.Dockerfile -t gentext:dev .
docker run --rm -p 3000:3000 -e OPENAI_API_KEY="${env:OPENAI_API_KEY}" gentext:dev
```

Replace the `-e` value with your key or use `--env-file ./.env` to load from a file.

### Option B — Use docker-compose (recommended for local dev)

Create a `docker-compose.yml` (example below) and run `docker-compose up --build`.

Example `docker-compose.yml`:

```yaml
version: "3.8"
services:
  web:
    build:
      context: .
      dockerfile: dev.Dockerfile
    image: gentext:dev
    ports:
      - "3000:3000"
    env_file:
      - ./.env
    restart: unless-stopped
```

Then:

```powershell
docker-compose up --build
```

This exposes the app on http://localhost:3000.

## Notes & troubleshooting

- If ports are in use, change `PORT` and mapping in `docker run` / `docker-compose.yml`.
- Ensure the API key is valid and has quota. The backend routes will log errors to the Next.js server console if the upstream API rejects requests.
- For streaming to work, confirm the API route returns a streamed response (Readables). If you see no streamed chunks, test the API route with `curl -N`.

## Security

- Do not commit `.env` or keys to source control. Use secrets management for production.
- For production deployments, consider building a proper server image and using managed secrets (e.g., Docker secrets, cloud provider secrets).
