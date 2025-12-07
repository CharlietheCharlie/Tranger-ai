# 👨‍💻 Developer Guide

This document provides a technical overview of the Tranger architecture, intended for developers contributing to the project or deploying it to production.

## 🏗️ Architecture Overview

Tranger uses a **Hybrid Architecture** designed to balance cost (free tier friendly) and scalability.

### 1. Frontend & Edge (Vercel)
- **Next.js 15 App Router**: Handles routing, server-side rendering (SSR), and static site generation (SSG).
- **Route Handlers (`/app/api/...`)**: Acts as a secure proxy for the Gemini AI API, protecting the API Key from being exposed to the client.
- **State**: Client-side state is managed by **Zustand**. It syncs optimistically with the backend (mocked in this repo, but architected for WebSocket sync).

### 2. Backend (AWS Serverless)
For a production deployment, the heavy lifting moves to AWS:
- **API Gateway**: Manages WebSocket connections for real-time collaboration (cursor tracking, chat, updates).
- **Lambda Functions**:
  - `itineraryHandler.ts`: CRUD operations for trips.
  - `collabHandler.ts` (Conceptual): Handles WebSocket connect/disconnect and broadcasting.
- **Database**: **Aurora Serverless v2** (PostgreSQL) managed via **Prisma ORM**.

## 📂 Directory Structure

```
Tranger-ai/
├── app/                  # Next.js 15 App Router
│   ├── api/              # API Route Handlers (AI Proxy)
│   ├── layout.tsx        # Root layout (Fonts, Metadata)
│   └── page.tsx          # Main entry point
├── aws/                  # AWS Infrastructure Code
│   └── lambda/           # Serverless function handlers
├── components/           # React UI Components
│   ├── Dashboard.tsx     # Main Trip Grid
│   ├── ItineraryBoard.tsx# Drag & Drop Canvas
│   └── ...               # Modals, Cards, Sidebars
├── contexts/             # React Context Providers (i18n)
├── lib/                  # Utilities (Translations, Helpers)
├── prisma/               # Database Schema
│   └── schema.prisma     # PostgreSQL Data Model
├── public/               # Static Assets & PWA Manifest
├── services/             # Business Logic
│   ├── store.ts          # Zustand Store (The Brain 🧠)
│   └── geminiService.ts  # AI Integration
├── tests/                # Testing Suite
│   ├── e2e/              # Playwright Specs
│   └── *.test.ts         # Vitest Unit Tests
└── types.ts              # TypeScript Interfaces
```

## 💾 Database Schema (Prisma)

The application uses a relational model. Key relationships:

- **User** 1--n **Itinerary** (Owner)
- **Itinerary** 1--n **Day**
- **Day** 1--n **Activity**
- **Itinerary** m--n **User** (Collaborators)

*To deploy the DB:*
1. Set `DATABASE_URL` in `.env`.
2. Run `npx prisma db push`.

## 🧪 Testing Strategy

### Unit Testing (Vitest)
Used for testing pure business logic, specifically the **Zustand Store** reducers (`reorderDays`, `updateActivity`).
```bash
npm run test
```

### End-to-End Testing (Playwright)
Simulates real user flows (Creating a trip, Dragging an activity) in a headless browser.
```bash
npm run test:e2e
```

## 🚀 Deployment Guide

### Option A: Vercel (Recommended for Frontend)
1. Fork repo to GitHub.
2. Connect to Vercel.
3. Add Environment Variable `API_KEY` (Gemini).
4. Deploy. Vercel automatically handles the Next.js build.

### Option B: AWS (Backend Features)
To enable the persistent backend:
1. **Build Lambdas**: Use `esbuild` to bundle `aws/lambda/itineraryHandler.ts`.
2. **Deploy CDK/Terraform** (Not included):
   - Provision an **Aurora Serverless v2** cluster.
   - Provision an **API Gateway** (HTTP + WebSocket).
   - Link Gateway routes to Lambdas.
3. **Update Client**:
   - In `services/store.ts`, replace the mock logic with `fetch()` calls to your AWS API Gateway URL.

## 🎨 Design System

We use a "Swiss Style" / Modern Minimalist aesthetic:
- **Fonts**: Inter (Sans-serif).
- **Colors**: Slate (900/500/200) + White + Crisp Borders.
- **Icons**: Lucide React.
- **Components**: Custom built, inspired by shadcn/ui but implementation-independent.
