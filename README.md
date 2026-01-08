# Helix - Developer Community Platform

Helix is an open-source contribution identity platform. It helps developers discover projects, track their impact, and earn recognition through a gamified leaderboard and badge system.

## Features

- **Identity Hub**: Showcase your global rank, badges, and contribution stats.
- **Leaderboards**: Compete with other developers for top spots based on contribution velocity.
- **Gamification**: Earn badges like "Star Magnet", "Open Source Hero", and "Early Adopter".
- **Social Graph**: Follow other top contributors and see their achievements in your Activity Feed.
- **Discovery Engine**: Find high-growth repositories to contribute to.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose)
- **Auth**: NextAuth.js (GitHub)
- **Styling**: Tailwind CSS + Shadcn/ui
- **Animations**: Framer Motion

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your/helix.git
   cd helix
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env.local` file with:
   ```env
   # Database
   MONGODB_URI=mongodb+srv://...

   # Authentication (GitHub OAuth)
   GITHUB_ID=...
   GITHUB_SECRET=...
   NEXTAUTH_SECRET=...
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Project Structure

- `src/app`: Next.js App Router pages (Dashboard, Leaderboard, Discovery).
- `src/lib`: Core logic (Ranking Engine, Gamification, Social Graph).
- `src/models`: Mongoose schemas (User, Badge, Activity, Snapshot).
- `src/services`: External integrations (GitHub API).
- `src/components`: UI components (using shadcn/ui).

## License

MIT
