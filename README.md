# Helix - Developer Community Platform

Helix is an open-source contribution identity platform. It helps developers discover projects, track their impact, and earn recognition through a gamified leaderboard and badge system.

![Dashboard Preview](public/dashboard-preview.png)

## Features

- **Identity Hub**: Showcase your global rank, badges, and contribution stats.
- **Leaderboards**: Compete with other developers and see top-performing repositories.
- **Gamification**: Earn badges like "Star Magnet", "Open Source Hero", and "Early Adopter".
- **Social Graph**: Follow other top contributors and see their achievements in your Activity Feed.
- **Discovery Engine**: Find high-growth repositories to contribute to with historical growth charts.
- **Automated Analytics**: Background workers automatically track repository growth and user activity daily.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose)
- **Auth**: NextAuth.js (GitHub Provider)
- **Styling**: Tailwind CSS + Shadcn/ui
- **Animations**: Framer Motion
- **Deployment**: Vercel (recommended)

## Getting Started

### 1. Prerequisites
- Node.js 18+
- MongoDB Database (Local or MongoDB Atlas)
- GitHub OAuth App (for authentication)

### 2. Installation

```bash
git clone https://github.com/dharanisham/helix.git
cd helix
npm install
```

### 3. Configuration

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI="mongodb://localhost:27017/helix"

# Authentication (GitHub OAuth)
# Get these from GitHub Developer Settings -> OAuth Apps
GITHUB_ID="your_github_client_id"
GITHUB_SECRET="your_github_client_secret"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_random_secret_string"

# GitHub API (Optional, for higher rate limits)
GITHUB_TOKEN="your_personal_access_token"

# Automation Security
CRON_SECRET="your_secure_random_string_for_cron_jobs"
```

### 4. Run Development Server

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

## Automation (Cron Jobs)

To keep data "live" (updating stats, badges, and charts), you must trigger the cron endpoints periodically.

### Endpoints
- **User Ingestion**: `/api/cron/ingest-users` (Updates user profiles & snapshots)
- **Repository Ingestion**: `/api/cron/ingest-repos` (Updates repository metrics & snapshots)

### Setting up Cron
**Option A: Vercel (Recommended)**
This project includes a `vercel.json` configured to run these jobs automatically (Daily at 00:00 and 01:00 UTC). Just set the `CRON_SECRET` env var in Vercel.

**Option B: Manual / Curl**
```bash
curl "http://localhost:3000/api/cron/ingest-users?key=YOUR_CRON_SECRET"
```

## Project Structure

- `src/app`: Next.js App Router pages (Dashboard, Leaderboard, Discovery, Repository).
- `src/lib`: Core utilities (Auth, DB, GitHub Client).
- `src/models`: Mongoose schemas (User, Repository, Snapshot, Badge).
- `src/services`: Business logic (Data Ingestion, Ranking Engine).
- `src/middleware.ts`: Session protection and route guarding.

## License

MIT
