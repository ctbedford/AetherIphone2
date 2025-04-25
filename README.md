# Aether App

A modern mobile application built with Expo, React Native, tRPC, and Tamagui.

## Project Structure

- `/app` - Expo Router app screens and navigation
- `/components` - Reusable UI components
- `/utils` - Utility functions and helpers
- `/server` - Express/tRPC backend server

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- iOS Simulator or Android Emulator for mobile testing

### Installing

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Install server dependencies:

```bash
cd server
npm install
cd ..
```

### Running the App

**Start the backend server:**

```bash
cd server
npm run dev
```

This will start the tRPC server on [http://localhost:3000](http://localhost:3000).

**Start the Expo app:**

In a separate terminal:

```bash
npm start
```

This will launch the Expo development server. Press:
- `i` to open in iOS simulator
- `a` to open in Android emulator
- `w` to open in web browser

## Authentication

The app uses Supabase for secure authentication:

1. Create a free Supabase account at [supabase.com](https://supabase.com)
2. Create a new project and note your project URL and anon key
3. Create a `.env` file in the root of the project (copy from `.env.example`) and add your Supabase credentials
4. Authentication is already set up with the following features:
   - Email/password sign up and login
   - Session persistence with SecureStore
   - Password reset (through Supabase)

Demo credentials:
  - Email: `demo@example.com`
  - Password: `password`

## Development

### Backend Server

The backend server uses:
- Express
- tRPC for type-safe API
- In-memory data store (replace with a real DB in production)

Key endpoints:
- `/health` - Health check endpoint
- `/api/trpc` - tRPC API endpoint

### Mobile App

The app is organized using Expo Router file-based routing:
- `/app/(tabs)` - Main tabs after login
- `/app/auth` - Authentication screens (login/register)
- `/app/compose` - Modal screen example

## Project Roadmap

Phase 1 (In Progress):
- Core authentication flow
- Basic UI components
- API integration

Phase 2 (Upcoming):
- Offline sync capabilities
- Push notifications
- Performance optimizations

## Technologies

- Expo SDK 52
- React Native 0.76.x
- React 18.3
- TypeScript
- tRPC
- Tamagui UI
- NativeWind/Tailwind CSS
- React Query for data fetching/caching
