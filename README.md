# Eco-Grid Lithuania — Smart Energy Optimization Platform

The Lithuanian edition of Eco-Grid: a full-stack energy management platform
with peer-to-peer (P2P) energy trading, built for the Lithuanian / EU market.

![Node](https://img.shields.io/badge/Node.js-20-339933)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Express](https://img.shields.io/badge/Express-4-000000)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248)
![License](https://img.shields.io/badge/License-MIT-green)

**Live site:** https://eco-grid.co
**API:** https://eco-grid-lithuania.onrender.com/api · Health: `/api/health`

> This repository is the Lithuania-focused variant of
> [eco-grid](https://github.com/SaEeDX4/eco-grid). It shares the same core
> platform and adds the P2P energy-trading module, Lithuanian-market
> branding/SEO, and the `eco-grid.co` production deployment.

---

## Overview

Eco-Grid helps households and SMEs understand and reduce energy consumption:
register devices, see live usage/cost/CO₂ dashboards, and receive AI-powered
optimization recommendations. The Lithuania edition adds a **peer-to-peer
energy trading** module — offers, trades, wallets, leaderboards, and impact
analytics (with a blockchain simulator service) — reflecting Lithuania's
prosumer and energy-community market.

## Features

- **Dashboard** — daily/monthly consumption, cost, and CO₂ visualizations
- **Device Hub** — register devices and estimate their consumption
- **AI Optimizer** — personalized energy-saving recommendations (Claude adapter)
- **P2P Energy Trading** — offers, trades, wallets, analytics, community
  leaderboard and impact metrics (all behind authentication)
- **Virtual Power Plant (VPP)** — pools, markets, dispatch, and revenue views
- **Energy Hubs** — multi-tenant hubs with policies, tenants, and analytics
- **Pricing & subscriptions** — plan catalog with feature gating
- **Content platform** — articles, testimonials, case studies, pilots, FAQ, roadmap
- **Authentication & authorization** — JWT sessions with role-based access control
- **Internationalization** — English, Farsi (RTL), and French locales

## Architecture

npm-workspaces monorepo:

```
eco-grid-lithuania/
├── apps/
│   ├── web/          # React 18 + Vite + Tailwind CSS frontend
│   └── api/          # Express + MongoDB (Mongoose) REST API
└── packages/
    ├── ai/           # AI provider adapters (Claude) and prompts
    ├── ui/           # Shared UI components
    ├── lib/          # Shared utilities
    └── config/       # Shared configuration
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the system design and
[docs/SECURITY.md](docs/SECURITY.md) for the authentication/authorization model.

## Getting started

### Prerequisites

- Node.js 20+
- A MongoDB connection string (e.g. MongoDB Atlas)

### Install & configure

```bash
npm install
cp apps/api/.env.example apps/api/.env   # MONGODB_URI, JWT_SECRET, AI keys…
cp apps/web/.env.example apps/web/.env   # VITE_API_URL
```

Never commit real secrets — `.env` files are git-ignored.

### Run (development)

```bash
npm run dev        # web (Vite) + api (Express) together
```

- Web: http://localhost:5173
- API: http://localhost:5000/api · health check at `/api/health`

### Build

```bash
npm run build --workspace=apps/web
```

## API overview

| Area | Base path | Access |
|---|---|---|
| Health | `GET /api/health` | Public |
| Auth | `/api/auth` | Public (register/login), token for session |
| Dashboard / Devices / Optimizer / Reports | `/api/dashboard`, `/api/devices`, `/api/optimizer`, `/api/reports` | Authenticated |
| P2P Trading | `/api/p2p` | Authenticated (all routes) |
| VPP / Hubs | `/api/vpp`, `/api/hub` | Authenticated |
| Content | `/api/articles`, `/api/testimonials`, `/api/case-studies`, `/api/pilots`, `/api/faq`, `/api/roadmap` | Public reads, admin/editor writes |
| Admin | `/api/faq/admin`, `/api/ai-writer` | Admin (editor where noted) |

Full route inventory: `GET /api` on a running server.

## Security

- Passwords hashed with **bcrypt**; JWTs signed with a server-only secret
  that **fails fast at startup if missing**
- `authenticate` (401) and role-based `authorize` (403) middleware — see
  [docs/SECURITY.md](docs/SECURITY.md)
- Helmet headers, CORS allow-list (including the `eco-grid.co` domain
  family), per-route rate limiting, Zod validation
- Secrets live only in `.env` / deployment environment variables

## Deployment

Frontend on **eco-grid.co** (Vercel), API on **Render**
(`eco-grid-lithuania.onrender.com`), data in MongoDB Atlas.

## Author

**Saeed Sharifzadeh** — based on the Eco-Grid capstone platform
(Vancouver, BC), adapted for the Lithuanian market.

## License

[MIT](LICENSE)
