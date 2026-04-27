# SINAG

**AI-powered thesis and dissertation advising platform** for SESAM (School of Environmental Science and Management), UPLB.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript 5** · **Tailwind CSS v4**
- **MongoDB Atlas** via Mongoose
- **Authentication** — JWT in httpOnly cookies (`jose` + `bcryptjs`)
- **AI service** — keyword-based RAG stub (OpenAI integration planned)

## Getting Started

1. Copy the environment template and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

```
MONGODB_URI=      # MongoDB Atlas connection string
JWT_SECRET=       # JWT signing secret
```

2. Install dependencies and start the dev server:

```bash
npm install
npm run dev       # http://localhost:3000
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run start` | Serve production build |

## Project Structure

```
sinag/
├── app/
│   ├── (auth)/          # /login, /register
│   ├── (dashboard)/     # role-specific dashboards
│   │   ├── admin/
│   │   ├── adviser/
│   │   ├── coordinator/
│   │   ├── student/
│   │   ├── calendar/
│   │   ├── library/
│   │   ├── notifications/
│   │   └── search/
│   ├── (marketing)/     # landing page
│   ├── api/             # REST endpoints
│   └── components/      # shared UI components
├── lib/                 # server utilities, models, auth, AI service
└── docs/                # design docs and SRS
```

## Roles

| Role | Access |
|---|---|
| `student` | AI chat, workflow submission, documents |
| `adviser` | Student management, document reviews, AI chat |
| `coordinator` | Workflow oversight, analytics |
| `admin` | User management, audit logs, system settings |

## Docs

- `docs/DESIGN.md` — DB schema, API spec, component architecture, AI pipeline
- `docs/SRS.md` — Software requirements specification
