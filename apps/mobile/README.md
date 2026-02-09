# PrecisionFlow Mobile App

React Native mobile app built with Expo and expo-router for the PrecisionFlow campaign management platform.

## Features

- 📱 Cross-platform (iOS & Android)
- 🔐 Supabase authentication with secure token storage
- 📊 Campaign management with detail views
- 👥 Client directory with contact integration
- 🎬 Creator roster with social stats
- ✅ Approval workflows with approve/reject actions
- 🔄 Pull-to-refresh on all list screens
- 🎯 Type-safe API with tRPC
- 📦 Shared codebase with web app

## Screens (11 total)

| Screen | Route | Description |
|--------|-------|-------------|
| Splash | `/` | Auth check, auto-redirect |
| Login | `/(auth)/login` | Supabase email/password auth |
| Dashboard | `/(tabs)/` | Stats grid, recent campaigns |
| Campaigns | `/(tabs)/campaigns` | List with status badges |
| Clients | `/(tabs)/clients` | List with tier badges |
| Creators | `/(tabs)/creators` | List with follower stats |
| Approvals | `/(tabs)/approvals` | Pending with approve/reject |
| Profile | `/(tabs)/profile` | Account info, logout |
| Campaign Detail | `/campaign/[id]` | Budget, timeline, tags |
| Client Detail | `/client/[id]` | Contact, address, tags |
| Creator Detail | `/creator/[id]` | Metrics, socials, rate card |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Expo CLI (`npx expo`)
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
# Install dependencies (from monorepo root)
pnpm install

# Start Expo development server
cd apps/mobile
pnpm start
```

### Running on Devices

```bash
# iOS Simulator (macOS only)
pnpm ios

# Android Emulator
pnpm android

# Web (for testing)
pnpm web
```

## Configuration

Create `.env` file from `.env.example`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api/trpc
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Architecture

### Code Sharing

- `@precisionflow/api` — tRPC client and routers (shared with web)
- `@precisionflow/types` — TypeScript types (shared)
- `@precisionflow/ui` — UI utilities (shared)
- Platform-specific UI in `app/` directory

### Navigation

Uses `expo-router` for file-based routing:

- `app/(auth)/` — Authentication screens
- `app/(tabs)/` — 6-tab bottom navigation (Home, Campaigns, Clients, Creators, Approvals, Profile)
- `app/campaign/[id]` — Campaign detail stack screen
- `app/client/[id]` — Client detail stack screen
- `app/creator/[id]` — Creator detail stack screen

### Authentication

- **Supabase Auth** — email/password via `@supabase/supabase-js`
- **Secure storage** — tokens in `expo-secure-store`
- **Auto-navigation** — redirect based on auth state
- **JWT headers** — sent with every tRPC request

## Tech Stack

- **Expo ~54.0** — React Native framework
- **expo-router** — File-based routing
- **React Native 0.81.5** — Mobile framework
- **React 19** — UI library
- **tRPC** — Type-safe API
- **React Query** — Data fetching
- **Supabase** — Authentication
- **expo-secure-store** — Secure token storage
