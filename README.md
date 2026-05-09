# TeamSync — Workflow Intelligence & Productivity Platform

> A real-time, event-driven project management platform built for engineering teams — combining sprint management, ticket tracking, intelligent leaderboards, and live collaboration in a single multi-tenant workspace.

---

## What is TeamSync?

TeamSync is a full-stack productivity platform designed around how engineering teams actually work. Instead of passive dashboards, it reacts to what your team does in real time — ticket completions, check-ins, sprint closures — and surfaces that activity as live rankings, instant notifications, and performance insights without a single page refresh.

The system is built on an event-driven backbone: every meaningful action produces an event, events flow through a message broker, and downstream consumers handle scoring, notifications, and real-time UI updates independently. No tight coupling. No polling.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          React Frontend                          │
│              SignalR (WebSocket) ←→ REST API (JWT)              │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                      .NET Core API Layer                         │
│        Controllers → Services → Repositories → Supabase         │
│                                                                  │
│   ┌─────────────────┐        ┌──────────────────────────────┐   │
│   │  MessagePublisher│──────▶│         RabbitMQ             │   │
│   │  NotifPublisher  │       │  ┌─────────────────────────┐ │   │
│   └─────────────────┘       │  │  events.exchange        │ │   │
│                              │  │  notifications.exchange │ │   │
│                              │  └────────────┬────────────┘ │   │
│                              └───────────────┼──────────────┘   │
│                                              │                   │
│   ┌───────────────────────────────────────── ▼ ───────────────┐ │
│   │              Background Consumers                          │ │
│   │  MessageConsumer → MessageProcessor → Redis (Sorted Sets)  │ │
│   │  NotificationConsumer → NotificationProcessor → SignalR    │ │
│   │  DatabaseSyncService → PostgreSQL (60-min flush)           │ │
│   │  DeadlineNotificationService → Daily 09:00 UTC sweep       │ │
│   └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Features

### Multi-Tenant Workspaces
Each workspace is fully isolated — members, projects, sprints, tickets, and scores are scoped per workspace. Users can belong to multiple workspaces and switch between them seamlessly. Role-based access (Owner → Admin → Manager → Member → Viewer) controls what each user can create, edit, or close.

### Project & Sprint Management
Projects contain sprints. Sprints contain tickets. Tickets contain tasks. The full hierarchy is navigable with filters, pagination, and dropdown selectors at every level. Sprint progress is tracked in real time with a breakdown of ticket statuses and team contribution metrics.

### Ticket Lifecycle
Tickets move through a defined status flow. Members assigned to a ticket can request closure with a reason; managers and above review and approve or reject. Every transition produces an event log entry and a notification to the relevant parties.

### Leaderboard — Real-Time Performance Ranking
The leaderboard is the core differentiator. Rankings are stored in **Redis sorted sets** for O(log N) updates and reads. Every ticket completion, sprint close, or check-in fires an event through RabbitMQ to the `MessageProcessor`, which updates the Redis score immediately. `DatabaseSyncService` flushes the state to PostgreSQL every 60 minutes for durability.

**Score composition:**
```
PerformanceScore = (ActivityPoints × 0.75) + (DeliveryRate × 0.20) + (TotalHours × 0.05)
```

Rank changes are pushed to connected clients via SignalR — no polling, sub-second propagation.

### Notifications Pipeline
```
Service layer (e.g. TicketService)
  └─▶ NotificationPublisher (RabbitMQ)
        └─▶ NotificationConsumer (BackgroundService)
              └─▶ NotificationProcessor
                    ├─▶ PostgreSQL (persisted, survives offline)
                    └─▶ SignalR Hub → user_{guid} group (live push)
```
If RabbitMQ is unavailable, `NotificationService` falls back to direct DB write — zero notification loss regardless of queue health.

## 🔐 Security

- **JWT authentication** — Issued on login, validated on every request via middleware
- **Role-based authorization** — `[RequireAuthorization]` validates workspace membership and role level before any controller action executes
- **Rate limiting** — Named policies separate read-tier (`Api`) from write-tier (`Write`) limits, protecting high-frequency endpoints from abuse
- **HttpOnly cookies** — JWT is never accessible to JavaScript, protecting against XSS token theft
- **Workspace scoping** — All repository queries are filtered by `workspaceGuid`; cross-workspace data access is prevented at the query level

---

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | .NET Core (C#) |
| Frontend | React.js |
| Realtime | SignalR (WebSockets) |
| Message Broker | RabbitMQ |
| Cache / Leaderboard | Redis (Sorted Sets) |
| Primary Database | PostgreSQL (via Supabase) |
| Auth | JWT (cookie-based, HttpOnly) |
| Rate Limiting | ASP.NET Core named policies (read / write tiers) |

---

## 📦 Project Structure

```
TeamSync/
├── Enterpise.Flowstate/                    # API entry point
│   ├── Controllers/                        # HTTP endpoints (REST)
│   │   ├── TicketController.cs
│   │   ├── SprintController.cs
│   │   ├── ProjectController.cs
│   │   ├── WorkspaceController.cs
│   │   ├── NotificationController.cs
│   │   └── LeaderboardController.cs
│   ├── Extensions/                         # DI registration (services, repos, messaging, infra)
│   └── Program.cs                          # Middleware pipeline, CORS, rate limiting, SignalR
│
├── Enterprise.Flowstate.Core/              # Business logic layer
│   ├── BusinessLogic/
│   │   ├── Services/                       # All domain services
│   │   │   ├── MessageProcessor.cs         # Score computation engine
│   │   │   ├── DatabaseSyncService.cs      # Redis → PostgreSQL flush + week rollover
│   │   │   ├── ScoreRecalculationService.cs# Cold-start Redis rebuild from DB
│   │   │   ├── LeaderboardComparisonService.cs
│   │   │   ├── NotificationProcessor.cs
│   │   │   ├── TicketService.cs
│   │   │   ├── SprintService.cs
│   │   │   ├── ProfileService.cs
│   │   │   ├── CacheService.cs             # Redis abstraction layer
│   │   │   └── AuthorizationService.cs
│   │   └── BGService/                      # Hosted background services
│   │       ├── DatabaseSyncService.cs      # 60-min sync loop
│   │       └── DeadlineNotificationService.cs # Daily 09:00 UTC sweep
│   ├── Hubs/
│   │   ├── LeaderboardHub.cs               # workspace_{guid} SignalR groups
│   │   └── NotificationHub.cs              # user_{guid} SignalR groups
│   ├── Filters/
│   │   ├── RequireAuthorizationAttribute.cs# Role-based endpoint guard
│   │   └── CheckResourceLimitAttribute.cs  # Subscription plan enforcement
│   └── Middlewares/
│       └── SubscriptionMiddleware.cs
│
├── Enterprise.Flowstate.DAL/               # Data access layer
│   ├── Models/                             # Supabase ORM models
│   ├── Repositories/                       # DB access via Supabase client
│   │   ├── ProfileRepository.cs
│   │   ├── TicketRepository.cs
│   │   ├── LeaderBoardRepository.cs
│   │   └── ...
│   ├── DTOs/                               # Request / response contracts
│   └── Enums/
│       ├── AuthEnums.cs                    # RoleEnum, PositionEnum
│       └── GeneralEnums.cs                 # EventType, TicketStatus, NotificationType, etc.
│
└── frontend/                               # React SPA
    └── src/
        ├── pages/                          # leaderboard, sprint, ticket-details, dashboard
        ├── components/                     # Kanban board, task cards, sprint cards, modals
        ├── context/                        # AuthContext, ThemeContext
        └── services/                       # Axios API clients, SignalR service wrappers
```

---




## Connent with me

[![LinkedIn](https://img.shields.io/badge/LinkedIn-niraj--vichare-0A66C2?style=flat&logo=linkedin)](https://linkedin.com/in/niraj-vichare)
[![GitHub](https://img.shields.io/badge/GitHub-Niraj--Vichare-181717?style=flat&logo=github)](https://github.com/Niraj-Vichare)
[![Email](https://img.shields.io/badge/Email-nirajvichare123@gmail.com-EA4335?style=flat&logo=gmail)](mailto:nirajvichare123@gmail.com)

**Niraj Vichare**
[LinkedIn](https://linkedin.com/in/niraj-vichare) · [GitHub](https://github.com/Niraj-Vichare) · nirajvichare123@gmail.com
