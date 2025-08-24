# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build            # Build frontend (Vite) and backend (ESBuild)
npm run start            # Start production server
npm run check            # Run TypeScript type checking

# Database
npm run db:push          # Push schema changes to database
npm run db:init          # Initialize database schema
npm run db:seed          # Seed database with test data
```

## Architecture Overview

This is a scaffolding system with dual-interface architecture:
- **User frontend**: `http://localhost:3000` (voting, project submission)
- **Admin frontend**: `http://localhost:3000/admin` (management, statistics)
- **User API**: `/api/` prefix
- **Admin API**: `/api/admin/` prefix

### Tech Stack
- **Frontend**: React 18 + TypeScript + Zustand + React Router + Tailwind CSS + shadcn/ui
- **Backend**: Express + TypeScript + Drizzle ORM + PostgreSQL
- **Build**: Vite (frontend) + ESBuild (backend)
- **Auth**: JWT tokens with separate user/admin authentication systems

### Key Architecture Patterns

#### State Management
- **MANDATORY**: All frontend pages must use Zustand stores for data management
- **FORBIDDEN**: Direct API calls from page components
- All HTTP requests must go through `client/src/lib/api.ts` which handles auth automatically
- Consolidate business logic into minimal number of stores per domain

#### API Structure  
- All API routes registered in `server/routers/index.ts`
- Auth middleware applied globally after public routes
- Route structure:
  ```
  /api/auth              # User auth (public)
  /api/categories        # Public data
  /api/projects          # User projects (auth required)
  /api/votes            # User voting (auth required) 
  /api/admin/auth       # Admin auth (public)
  /api/admin/*          # Admin management (auth required)
  ```

#### Database Schema
Key entities: users, adminUsers, projects, votes, scores, scoreDimensions, categories, votingSessions
- Users submit projects with team members, categories, attachments
- Multi-dimensional scoring system (5 dimensions: innovation, utility, completion, UX, presentation)
- Vote limits: 3 votes per user, no self-voting, mandatory comments
- Weighted scoring with real-time ranking

#### Authentication
- Separate user and admin auth systems
- User tokens stored in `auth-storage` localStorage key
- Admin tokens stored in `admin-auth-storage` localStorage key
- JWT tokens auto-included in API requests via `api.ts`

### Project Structure

```
client/src/
├── components/         # Reusable UI components
│   ├── admin/         # Admin-specific components
│   ├── providers/     # Auth providers
│   └── ui/           # shadcn/ui components
├── pages/
│   ├── admin/        # Admin interface pages
│   └── users/        # User interface pages
├── stores/           # Zustand state management
│   ├── admin/        # Admin stores
│   └── users/        # User stores
├── lib/api.ts        # Centralized API client
└── router/           # Route configuration

server/
├── db/
│   └── schema.ts     # Drizzle schema definitions
├── routers/          # API route handlers
│   ├── admin/        # Admin API routes
│   └── users/        # User API routes
└── middleware/       # Auth middleware
```

### Development Guidelines

1. **Database Changes**: Use Drizzle migrations via `npm run db:push`
2. **API Development**: Register new routes in `server/routers/index.ts`
3. **Frontend Data**: Use Zustand stores, never direct API calls from components
4. **Authentication**: Leverage existing auth middleware, don't modify route-auth.ts
5. **Testing Data**: Prefer seed data over frontend mocks

### Default Accounts
- Admin: admin@voting.com / admin123456  
- User1: user1@example.com / password123
- User2: user2@example.com / password123