# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
pnpm dev                 # Start development server
pnpm build              # Build for production
pnpm start              # Start production server
pnpm lint               # Run ESLint

# Database
pnpm db:generate        # Generate Drizzle migrations
pnpm db:migrate         # Run database migrations
pnpm db:push            # Push schema changes to database
pnpm db:studio          # Open Drizzle Studio
pnpm db:seed            # Seed database with initial data
pnpm db:init            # Initialize database setup
```

## Architecture Overview

This is a **voting system** (投票系统) built with Next.js that supports project submission, voting, and administrative management with real-name authentication.

### Key Architecture Patterns

**Dual Authentication System**: The application uses separate authentication flows for regular users and administrators:
- **User Auth**: NextAuth.js with email/password, using `userAuthOptions` in `src/lib/auth/user-auth.ts`
- **Admin Auth**: Separate NextAuth.js config with username/password, using `adminAuthOptions` in `src/lib/auth/admin-auth.ts`
- **Session Management**: Users and admins have completely separate session cookies (`admin-session-token` vs default session token)

**Database Architecture**: Uses Drizzle ORM with PostgreSQL, with main entities:
- `users` - Regular users with voting capabilities
- `admin_users` - Admin users with management permissions
- `projects` - User-submitted projects for voting
- `votes` - Voting records with unique constraints (one vote per user per project)
- `voting_system_status` - Global system settings managed by admins

**Admin Dashboard Architecture**: Recently refactored from a monolithic component to a modular page-based system:
- Each admin page (`users`, `projects`, `votes`, `online-users`, `settings`) is an independent component
- Common layout provided by `AdminPageLayout` component with breadcrumbs, titles, and action areas
- Pages handle their own data fetching and state management
- Main dashboard (`AdminDashboardContent`) simplified to just route between page components

**WebSocket Integration**: Real-time communication using Socket.IO:
- Automatic user authentication and online tracking when users log in
- Admin can view all online users with connection status and activity
- Real-time message push from admins to users (individual or broadcast)
- Toast notifications displayed to users regardless of current page
- Separate WebSocket providers for users (`WebSocketProvider`) and admins (`AdminWebSocketProvider`)

### Route Structure

```
/                       # Marketing/public homepage
/sign-in, /sign-up      # User authentication
/dashboard              # User dashboard (authenticated users)
/admin/sign-in          # Admin authentication  
/admin/dashboard/*      # Admin management interface
  /admin/dashboard/online-users  # Online users monitoring
/api/auth/*             # User authentication APIs
/api/admin/*            # Admin management APIs
  /api/admin/online-users        # Online users API
/api/projects           # Project management APIs
/api/votes              # Voting APIs
/api/socket             # WebSocket endpoint (Socket.IO)
```

### Component Organization

- `src/components/ui/` - shadcn/ui components (Radix UI + Tailwind CSS)
- `src/components/providers/` - Context providers (theme, session, admin session)
- `src/components/auth-guard.tsx` - User authentication protection
- `src/components/admin-auth-guard.tsx` - Admin authentication protection
- `src/app/admin/dashboard/components/` - Admin-specific components
- `src/hooks/` - Shared React hooks

### Authentication Guards

Always use appropriate auth guards:
- `<AuthGuard>` for user-protected routes
- `<AdminAuthGuard>` for admin-protected routes
- Check session context for current user/admin state

### Database Operations

- Use Drizzle ORM queries through `src/lib/db/index.ts`
- Schema definitions in `src/lib/db/schema.ts` with full TypeScript types
- Use transactions for operations affecting multiple tables
- All voting operations should respect the `maxVotesPerUser` system setting

## Development Notes

**Environment Setup**: Requires PostgreSQL database. Use provided scripts for setup:
1. `pnpm tsx scripts/create-db.ts` - Create database
2. `pnpm db:push` - Push schema
3. `pnpm db:seed` - Seed with test data (includes admin user: admin/admin123456)

**Voting Rules**: 
- Users have 3 votes by default (configurable via admin)
- Cannot vote for own projects
- Each vote requires a reason/justification
- Real-name voting system (实名制)

**Admin Features**:
- User management (block/unblock voting permissions)
- Project management (block/unblock projects)
- Vote management (view/delete vote records)
- Online users monitoring (view connected users, send real-time messages)
- System settings (enable/disable voting, set vote limits)

**Key Libraries**:
- Next.js 15 with App Router
- NextAuth.js for authentication
- Drizzle ORM for database
- shadcn/ui for components
- Tailwind CSS for styling
- Zustand for client state management
- Socket.IO for real-time features