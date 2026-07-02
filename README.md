# Scribe

A Bible study web app: multi-version reader with historical context, an interactive map of biblical places and journeys, verse-anchored notes, an Obsidian-style knowledge graph, study plans, Hebrew/Greek word study, and an AI study companion.

## Stack

- **Client** — React 18 + Vite + TypeScript, TailwindCSS, React Router, Zustand, TanStack Query
- **Server** — Node + Express (TypeScript), REST API
- **Database** — Supabase (PostgreSQL), accessed server-side with the service-role key
- **Auth** — Firebase Authentication (email/password + Google); the server verifies ID tokens with `firebase-admin`

## Setup

### 1. Install

```sh
npm install
```

### 2. Firebase project

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication → Sign-in method**: enable **Email/Password** and **Google**.
3. **Project settings → General → Your apps**: add a **Web app**, copy the config into the `VITE_FIREBASE_*` vars.
4. **Project settings → Service accounts**: generate a private key; copy `project_id`, `client_email`, and `private_key` into the `FIREBASE_*` vars (keep the `\n` escapes and wrap the key in quotes).

### 3. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. **Project settings → API**: copy the project URL and the **service_role** key into `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`.
3. Apply the migration — either paste `supabase/migrations/001_init.sql` into the SQL editor, or with the CLI:

   ```sh
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

### 4. Environment

```sh
cp .env.example .env
# fill in the values
```

One `.env` at the repo root serves both apps (Vite reads it via `envDir`).

### 5. Run

```sh
npm run dev
```

- Client: http://localhost:5173 (proxies `/api` to the server)
- Server: http://localhost:4000

The app degrades gracefully before configuration: without `VITE_FIREBASE_*` the client shows a setup notice; without server credentials, authenticated routes return 503.

## Scripts

| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Run client + server concurrently      |
| `npm run build`     | Build both workspaces                 |
| `npm run typecheck` | Typecheck both workspaces             |
| `npm run lint`      | ESLint over the repo                  |

## API keys for later phases

- `API_BIBLE_KEY` — [scripture.api.bible](https://scripture.api.bible) (multi-translation scripture; dev falls back to bible-api.com)
- `ANTHROPIC_API_KEY` — [console.anthropic.com](https://console.anthropic.com) (study chatbot)
