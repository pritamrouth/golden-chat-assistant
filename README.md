# Golden Chat Assistant

> Production-grade AI chatbot platform with RAG-powered product discovery, streaming responses, and a multi-artifact content creation system.

## Table of Contents

- [Executive Summary](#executive-summary)
- [Architecture Overview](#architecture-overview)
- [Tech Stack & Design Decisions](#tech-stack--design-decisions)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [CI/CD & Deployment](#cicd--deployment)

---

## Executive Summary

Golden Chat Assistant is a full-stack conversational AI application designed for e-commerce product discovery. It combines a retrieval-augmented generation (RAG) pipeline with a multi-modal chat interface, enabling users to search, compare, and receive recommendations on products through natural language.

**Core capabilities:**

- **RAG Pipeline** — Semantic product search using Gemini embeddings indexed in Pinecone, backed by MongoDB as the product store.
- **Streaming LLM Responses** — Token-by-token streaming via Vercel AI SDK with resumable stream support (Redis-backed).
- **Artifact System** — Side-panel content creation for code, text, spreadsheets, and images with real-time preview.
- **Tiered Access Control** — Guest (20 msg/day) and registered (100 msg/day) user entitlements with NextAuth credentials.
- **Type-Safe Data Layer** — PostgreSQL via Drizzle ORM with versioned schema migrations.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (React 19)                        │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────────┐  │
│  │  Chat UI  │  │  Artifacts   │  │  Sidebar / History (SWR)  │  │
│  └─────┬────┘  └──────┬───────┘  └─────────────┬─────────────┘  │
│        │               │                        │                │
│        └───────────────┼────────────────────────┘                │
│                        │  AI SDK Stream Protocol                 │
└────────────────────────┼────────────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────────────┐
│                   Next.js 15 (App Router)                        │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                     API Routes                              │  │
│  │  /api/chat   /api/document   /api/vote   /api/history     │  │
│  └──────────┬──────────┬────────────┬──────────┬─────────────┘  │
│             │          │            │          │                 │
│  ┌──────────▼───┐  ┌───▼──────┐  ┌─▼──────┐  ┌▼────────────┐  │
│  │  AI SDK      │  │ Drizzle  │  │ Auth.js│  │  Vercel Blob │  │
│  │  Streaming   │  │ ORM      │  │  (JWT) │  │  (Files)     │  │
│  └──────┬───────┘  └────┬─────┘  └───┬────┘  └──────────────┘  │
└─────────┼───────────────┼────────────┼──────────────────────────┘
          │               │            │
┌─────────▼───────┐  ┌────▼─────┐  ┌───▼─────────────────────┐
│   Gemini API    │  │ Postgres │  │  Redis (Resumable       │
│   (LLM + RAG)   │  │ (Supa.) │  │  Streams)               │
└─────────┬───────┘  └──────────┘  └─────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────┐
│              RAG Pipeline                            │
│  ┌──────────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ MongoDB      │  │ Pinecone │  │ Gemini Embed   │  │
│  │ (Products)   │→→│ (Vector) │←←│ (3072-dim)     │  │
│  └──────────────┘  └──────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Request lifecycle:**

1. Client sends message via `useChat` hook (AI SDK).
2. Middleware validates session token; creates guest session if unauthenticated.
3. `/api/chat` enforces rate limits per user type, persists message to Postgres.
4. System prompt is dynamically assembled with RAG context (product embeddings).
5. `streamText` streams tokens back; tool calls (create/update documents) execute server-side.
6. On completion, assistant response is persisted; stream is optionally resumed via Redis.

---

## Tech Stack & Design Decisions

| Layer | Technology | Version | Why |
|---|---|---|---|
| **Framework** | Next.js (App Router) | 15.3.0-canary | RSC + Streaming + Route Handlers in a single runtime. PPR for hybrid rendering. |
| **Language** | TypeScript | 5.6 | Strict mode with path aliases. End-to-end type safety from DB schema → API → UI. |
| **React** | React | 19.0.0-rc | Server Components, `use` hook, concurrent rendering. |
| **AI SDK** | Vercel AI SDK | 4.3.13 | Unified streaming abstraction. Tool calling, structured output, middleware (reasoning extraction). |
| **LLM Provider** | Google Gemini | — | `gemini-2.0-flash-lite` for chat, `gemini-2.0-flash` for reasoning with CoT extraction. |
| **Vector DB** | Pinecone | — | Serverless vector index for semantic product search (3072-dim Gemini embeddings). |
| **Embeddings** | Gemini Embedding | exp-03-07 | 3072-dimensional embeddings. No external embedding model needed. |
| **Product Store** | MongoDB | 6.16 | Flexible document schema for e-commerce product catalog. |
| **Database** | PostgreSQL (Supabase) | — | Relational data: users, chats, messages, documents, suggestions, votes. |
| **ORM** | Drizzle ORM | 0.34 | Type-safe queries, zero runtime overhead, migration tooling. |
| **Auth** | NextAuth (Auth.js) | 5.0.0-beta.25 | Credentials provider + guest sessions. JWT-based. |
| **Styling** | Tailwind CSS + shadcn/ui | 3.4 | Utility-first CSS. Radix UI primitives for accessible components. |
| **File Storage** | Vercel Blob | 0.24 | Serverless blob storage for attachments. |
| **State (Client)** | SWR | 2.2 | Stale-while-revalidate for chat history pagination. Lightweight cache invalidation. |
| **Caching** | Redis | 5.0 | Resumable stream state for connection drop recovery. |
| **Code Execution** | Pyodide | 0.23.4 | Browser-side Python runtime for artifact code blocks. |
| **Rich Text** | ProseMirror | — | Collaborative-capable editor for document artifacts. |
| **Code Editor** | CodeMirror 6 | — | Syntax-highlighted code editing with language support (JS, Python). |
| **Package Manager** | pnpm | 10.10 | Strict dependency resolution, faster installs, monorepo-ready. |
| **Linting** | Biome + ESLint | 1.9.4 / 8.57 | Biome for formatting + fast linting. ESLint for Next.js-specific rules. |
| **E2E Testing** | Playwright | 1.50 | Cross-browser testing. Parallel execution, trace on failure. |
| **Schema Migrations** | Drizzle Kit | 0.25 | Declarative migrations with `db:generate` → `db:migrate` workflow. |

---

## Key Features

### RAG-Powered Product Discovery

- Query embedding via Gemini → Pinecone cosine similarity search → top-K product context injected into system prompt.
- Products stored in MongoDB with dynamic schema; vectorized on index initialization.
- Graceful fallback: if RAG unavailable, chat operates without product context.

### Streaming & Resumable Conversations

- Token-level streaming via `createDataStream` + `smoothStream` (word chunking).
- Resumable streams (Redis-backed): clients reconnect and resume mid-response after network drops.
- `maxDuration: 60s` on chat route for long-running generations.

### Artifact System

| Artifact | Capabilities |
|---|---|
| **Code** | Python execution via Pyodide, syntax highlighting (CodeMirror), live console output. |
| **Text** | ProseMirror rich-text editor with inline suggestions and diff view. |
| **Sheet** | CSV spreadsheet editor with data grid (react-data-grid). |
| **Image** | AI-generated image preview with editor controls. |

### Security & Access Control

- JWT-based authentication with `next-auth/jwt`.
- Guest user auto-provisioning (bcrypt-hashed dummy password for timing-safe comparison).
- Per-user rate limiting: guest (20 msg/day), registered (100 msg/day).
- Middleware guards all routes; redirects unauthenticated users to guest session creation.
- `server-only` import on DB queries to prevent client-side leakage.
- Chat visibility (public/private) enforced at API and UI level.

### Observability

- Structured JSON logging per chat interaction (user messages, model responses, errors).
- Daily log rotation via filesystem (`logs/chat_logs_YYYY-MM-DD.log`).
- AI SDK telemetry enabled in production.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 10
- **PostgreSQL** (Supabase, Neon, or local)
- **MongoDB** instance (for product catalog)
- **Pinecone** account (for vector search)
- **Google AI** API key (Gemini)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd golden-chat-assistant
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Auth
AUTH_SECRET=<generate: openssl rand -base64 32>

# Database
POSTGRES_URL=postgres://user:pass@host:5432/dbname?sslmode=require

# AI
GOOGLE_GENERATIVE_AI_API_KEY=<your-gemini-key>

# Vector Search
PINECONE_API_KEY=<your-pinecone-key>

# Product Database
MONGODB_URI=mongodb+srv://user:pass@cluster/dbname

# Storage
BLOB_READ_WRITE_TOKEN=<vercel-blob-token>

# Redis (optional — enables resumable streams)
REDIS_URL=redis://default:pass@host:6379
```

### 3. Initialize Database

```bash
pnpm db:generate   # Generate migration files from schema
pnpm db:migrate    # Apply migrations to PostgreSQL
```

### 4. Run Development Server

```bash
pnpm dev
```

App is available at [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Run migrations + production build |
| `pnpm start` | Start production server |
| `pnpm lint` | ESLint + Biome lint (auto-fix) |
| `pnpm format` | Biome format |
| `pnpm test` | Run Playwright E2E tests |
| `pnpm db:studio` | Open Drizzle Studio (DB inspector) |
| `pnpm db:push` | Push schema changes directly (skip migrations) |

---

## Testing & Quality Assurance

### E2E Tests (Playwright)

```bash
pnpm test
```

**Test suites:**

| Suite | Location | Coverage |
|---|---|---|
| `e2e` | `tests/e2e/*.test.ts` | Chat flows, artifacts, reasoning, session management |
| `routes` | `tests/routes/*.test.ts` | API route validation (chat, document endpoints) |

**Configuration highlights:**

- Parallel execution (8 workers locally, 2 on CI).
- Chromium-only (Desktop Chrome).
- 120s timeout per test and assertion.
- Trace collection on failure (`trace: 'retain-on-failure'`).
- HTML reporter for CI artifact upload.
- Web server auto-starts via `pnpm dev` with `/ping` health check.

### Linting & Formatting

```bash
pnpm lint        # ESLint + Biome lint (with auto-fix)
pnpm format      # Biome formatter
```

**Biome rules (selected):**

- `recommended` ruleset enabled.
- A11y: `useHtmlLang`, `noHeaderScope`, `useValidAriaRole` as warnings.
- Correctness: `noUnusedImports`, `useArrayLiterals` as warnings.
- Complexity: `noUselessStringConcat` as warning.
- Formatting: 2-space indent, LF line endings, single quotes, trailing commas, semicolons.

**TypeScript:**

- `strict: true` in `tsconfig.json`.
- `noEmit: true` (type-checking only; Next.js handles compilation).
- Path alias: `@/*` → project root.

---

## CI/CD & Deployment

### GitHub Actions

| Workflow | Trigger | What it does |
|---|---|---|
| **Lint** (`.github/workflows/lint.yml`) | Every push | `pnpm install` → `pnpm lint` |
| **Playwright** (`.github/workflows/playwright.yml`) | Push/PR to `main` | Install deps → cache Playwright browsers → `pnpm test` → upload `playwright-report/` artifact |

**Playwright CI specifics:**

- Secrets injected via `${{ secrets.* }}`: `AUTH_SECRET`, `POSTGRES_URL`, `BLOB_READ_WRITE_TOKEN`, `REDIS_URL`.
- pnpm store cached by `pnpm-lock.yaml` hash.
- Playwright browser cache by lockfile hash.
- `--frozen-lockfile` for deterministic installs.
- Report retained for 7 days.

### Production Deployment (Vercel)

1. Push to `main`.
2. Vercel auto-detects Next.js and runs `pnpm build` (which triggers `pnpm db:igrate` first).
3. Environment variables set via Vercel dashboard or CLI.
4. Deploys to edge network with automatic preview deployments on PRs.

**Build pipeline:**

```
pnpm db:migrate → next build → Deploy
```

### Database Migrations in CI

Migrations run automatically during `pnpm build` via `tsx lib/db/migrate`. This ensures schema is always up-to-date on deployment without manual intervention.

---

## License

[MIT](LICENSE)
