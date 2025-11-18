# Fleet Costing Management System

A comprehensive fleet management web application built with Next.js 15 (App Router), TypeScript, Tailwind CSS, and SQL Server.

## Overview

This application provides end-to-end fleet management capabilities including operational management, dispatch, tracking, analytics, and reporting. It connects directly to a SQL Server database (FleetNew) and implements a complete fleet costing and management workflow.

## Features

### Phase 1 - Core Operations ✅
- **Dashboard**: KPI cards showing trips, miles, revenue, costs, profit, and margin
- **Trips & Costing**: View and manage trip costs with automatic calculation and manual override
- **Orders**: Create and manage customer orders with origin, destination, miles, and revenue
- **Drivers & Fleet**: View drivers and units with current assignments

### Phase 2 - Dispatch & Tracking ✅
- **Dispatch Board**: Kanban-style board with Unassigned → Assigned → In Transit → Delivered columns
  - Assign drivers and units to trips via modal dialog
  - View trip margins and key metrics on each card
- **Trip Detail Pages**: Comprehensive trip information with event timeline
  - Record events: Arrived Pickup, Departed Pickup, Arrived Delivery, Completed
  - View trip costing, driver, unit, customer, and route information
- **Active Tracking**: Real-time table view of active trips with last event information
  - Auto-refreshes every 30 seconds

### Phase 3 - Analytics & Reports ✅
- **Cost Analytics**: Performance breakdowns by driver type and customer
  - Revenue, cost, profit, and margin analysis
  - Color-coded margins (green ≥15%, yellow 5-15%, red <5%)
- **Trip Reports**: Comprehensive trip report table (200 most recent)
  - All key fields including CPM, margin percentage, and status

## Tech Stack

- **Frontend**: Next.js 15 App Router, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Server Components)
- **Database**: SQL Server (FleetNew database)
- **Database Client**: `mssql` npm package

## Project Structure

```
src/
├── app/
│   ├── api/                     # API Routes
│   │   ├── dashboard/           # Dashboard metrics
│   │   ├── dispatch/            # Dispatch board & assign
│   │   ├── drivers/             # Drivers list
│   │   ├── orders/              # Orders CRUD
│   │   ├── reports/trips/       # Trip reports
│   │   ├── stats/costing/       # Cost analytics
│   │   ├── tracking/active/     # Active tracking
│   │   ├── trips/               # Trips list
│   │   │   └── [id]/            # Trip detail, events, status
│   │   └── units/               # Units list
│   ├── analytics/costs/         # Cost analytics page
│   ├── dashboard/               # Dashboard page
│   ├── dispatch/                # Dispatch board page
│   ├── drivers/                 # Drivers & fleet page
│   ├── orders/                  # Orders page
│   ├── reports/trips/           # Trip reports page
│   ├── tracking/                # Active tracking page
│   ├── trips/                   # Trips list page
│   │   └── [id]/                # Trip detail page
│   ├── layout.tsx               # Root layout with nav
│   └── page.tsx                 # Home page
├── components/
│   └── NavBar.tsx               # Navigation bar
└── lib/
    └── db.ts                    # DB connection helper
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- SQL Server with the FleetNew database
- Tables: Trips, TripCosts, Drivers, Units, Orders, TripEvents
- Stored procedure: `usp_RecalculateTripCost`

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   
   Create `.env.local` in the root directory:
   ```env
   SQL_HOST=localhost
   SQL_PORT=1435
   SQL_USER=sa
   SQL_PASSWORD=YourPassword
   SQL_DATABASE=FleetNew
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

### Required Tables

- **Trips**: TripID, RawTripId, WeekStart, Miles, Status, PrimaryOrderID, DriverID, UnitID, MinimumRevenue, RequiredRevenue, etc.
- **TripCosts**: CostID, TripID, TotalCPM, TotalCost, Revenue, Profit, IsManual, ManualTotalCost, ManualReason, CreatedAt, etc.
- **Drivers**: DriverID, Name, Type
- **Units**: UnitID, UnitNumber, DriverID
- **Orders**: OrderID, Customer, Origin, Destination, Miles, Revenue, Status
- **TripEvents**: TripEventID, TripID, EventType, EventTime, City, State, Note

### Required Stored Procedures

- **usp_RecalculateTripCost** - Parameters: @TripId, @IsManual, @ManualTotalCost, @ManualReason

## API Endpoints

### Core Operations
- `GET /api/dashboard` - Dashboard metrics
- `GET /api/trips` - List trips with costs
- `GET /api/trips/[id]` - Trip detail
- `PATCH /api/trips/[id]` - Update trip
- `GET /api/trips/[id]/events` - List events
- `POST /api/trips/[id]/events` - Create event
- `PATCH /api/trips/[id]/status` - Update status
- `POST /api/trip-cost` - Recalculate cost
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `GET /api/drivers` - List drivers
- `GET /api/units` - List units

### Dispatch & Tracking
- `GET /api/dispatch/board` - Dispatch board data
- `POST /api/dispatch/assign` - Assign driver/unit
- `GET /api/tracking/active` - Active trips

### Analytics & Reports
- `GET /api/stats/costing` - Cost analytics
- `GET /api/reports/trips` - Trip reports

## Usage Guide

### Dispatching a Trip
1. Go to `/dispatch`
2. Find an unassigned trip card
3. Click "Assign"
4. Select driver and unit
5. Click "Assign" to confirm

### Recording Trip Events
1. Navigate to `/trips/[id]`
2. Use action buttons:
   - **Arrived Pickup** - Records pickup arrival
   - **Departed Pickup** - Records pickup departure
   - **Arrived Delivery** - Records delivery arrival
   - **Complete Trip** - Marks trip complete

### Managing Costs
1. View trips at `/trips`
2. **Recalc** - Auto-recalculate using stored procedure
3. **Manual** - Override with custom cost and reason

### Viewing Analytics
1. **Cost Analytics** (`/analytics/costs`) - Performance by driver type and customer
2. **Trip Reports** (`/reports/trips`) - Detailed trip history

## Design Patterns

### UI/UX Consistency
- Dark slate theme (bg-slate-950, borders slate-800)
- Responsive tables with consistent styling
- Color-coded margins: green (≥15%), yellow (5-15%), red (<5%)
- Status badges with contextual colors

### API Response Format
```typescript
// Success
{ ok: true, ...data }

// Error  
{ ok: false, error: string }
```

### Error Handling
- Try-catch in all API routes
- User-friendly error messages
- Loading states for async operations
- Disabled buttons during operations

## Development

### Running Locally
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## Future Enhancements

- [ ] Real-time map integration
- [ ] Advanced filtering and search
- [ ] CSV/Excel export
- [ ] User authentication & RBAC
- [ ] WebSocket real-time updates
- [ ] Mobile app
- [ ] Charts and graphs
- [ ] Batch operations
- [ ] Email notifications
- [ ] Telematics integration

## License

Proprietary - Fleet Management System
