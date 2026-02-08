# @tikit/mobile - TiKiT OS Mobile App

React Native mobile app built with Expo and expo-router.

## Features

- 📱 Cross-platform (iOS & Android)
- 🔐 Authentication with secure token storage
- 📊 Campaign management
- ✅ Approval workflows
- 🔄 Pull-to-refresh
- 🎯 Type-safe API with tRPC
- 📦 90%+ code sharing with web app

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Expo CLI
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

Create `.env` file:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api/trpc
```

## Architecture

### Code Sharing

- `@tikit/api` - tRPC client and routers (shared)
- `@tikit/types` - TypeScript types (shared)
- `@tikit/ui` - UI utilities (shared)
- Platform-specific UI components

### Navigation

Uses `expo-router` for file-based routing:

- `app/(auth)/login.tsx` - Login screen
- `app/(tabs)/` - Main app tabs
  - `index.tsx` - Home/Dashboard
  - `campaigns.tsx` - Campaigns list
  - `approvals.tsx` - Approvals
  - `profile.tsx` - Profile

### Authentication

Secure token storage with `expo-secure-store`:
- Token persisted securely
- Auto-navigation based on auth state
- Logout clears all auth data

## Development

```bash
# Start development server
pnpm start

# Type check
pnpm type-check

# Lint
pnpm lint
```

## Build for Production

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

## Tech Stack

- **Expo ~54.0** - React Native framework
- **expo-router** - File-based routing
- **React Native 0.81.5** - Mobile framework
- **React 19** - UI library
- **tRPC** - Type-safe API
- **React Query** - Data fetching
- **expo-secure-store** - Secure storage
