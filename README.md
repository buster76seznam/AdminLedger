# FuiLedger

Your affordable admin and bookkeeping copilot for US small businesses.

## Overview

FuiLedger is a SaaS application that helps small businesses (1-25 employees) manage admin work, bookkeeping prep, document intake, task follow-up, and simple accounting assistance. The app is designed for non-technical users and focuses on reducing admin time while maintaining trust and accuracy.

## Features

- **Authentication**: Email/password login with role-based access (owner, staff, accountant)
- **Dashboard**: Today's tasks, unread documents, upcoming deadlines, outstanding invoices, bookkeeping readiness score
- **Document Intake**: Upload PDF, image, CSV with AI-powered OCR and data extraction
- **AI Admin Assistant**: Chat interface for asking questions about finances, drafting emails, getting insights
- **Bookkeeping Copilot**: Transaction categorization, duplicate detection, export-ready summaries
- **Task & Deadline System**: Create tasks from docs, due dates, reminders, recurring tasks
- **Client/Contact Management**: Store vendors, clients, accountants, staff
- **Messaging**: Email templates for common business communications
- **Reports**: Financial summaries, expense breakdowns, cash flow snapshots
- **Trust & Compliance**: Audit logs, human approval required, clear disclaimers

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **AI**: OpenRouter API (free models - Llama 3 8B)
- **File Storage**: S3-compatible (placeholder for production)
- **Email**: Resend/SendGrid (placeholder for production)
- **Job Queue**: BullMQ (placeholder for production)

## Pricing

- **Starter**: $29/month - 100 documents, 1 user, basic AI
- **Pro**: $59/month - 500 documents, 5 users, advanced AI
- **Team**: $199/month - Unlimited documents, 25 users, full AI + API

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenRouter API key (free)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd opsmate-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example environment variables
cp .env.example .env

# Edit .env with your values
# Required:
# DATABASE_URL=postgresql://user:password@localhost:5432/opsmate
# NEXTAUTH_SECRET=your-secret-key
# NEXTAUTH_URL=http://localhost:3000
# OPENROUTER_API_KEY=sk-or-v1-your-openrouter-api-key
```

4. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed with sample data
npx prisma db seed
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/opsmate

# NextAuth
NEXTAUTH_SECRET=your-secret-key-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# OpenRouter (AI)
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-api-key

# Email (Resend)
RESEND_API_KEY=re-your-resend-api-key

# S3 (for file storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=opsmate-uploads

# Redis (for BullMQ)
REDIS_URL=redis://localhost:6379
```

## Project Structure

```
opsmate-ai/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/     # Dashboard pages
│   ├── api/             # API routes
│   └── layout.tsx       # Root layout
├── components/
│   ├── ui/              # shadcn/ui components
│   └── layout/          # Layout components
├── lib/
│   ├── ai/              # AI service layer
│   ├── services/        # Business logic services
│   ├── auth.ts          # NextAuth configuration
│   └── prisma.ts        # Prisma client
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data
└── types/               # TypeScript definitions
```

## Database Schema

The application uses Prisma with PostgreSQL. Key models include:

- **User**: User accounts with authentication
- **Organization**: Business/organization entities
- **Membership**: User-organization relationships with roles
- **Document**: Uploaded financial documents
- **DocumentField**: Extracted data from documents
- **Transaction**: Financial transactions
- **Invoice**: Client invoices
- **Task**: Admin tasks and reminders
- **Message**: Email communications
- **Contact**: Vendors, clients, accountants
- **AIInsight**: AI-generated suggestions
- **AuditLog**: Change tracking for compliance

## Development

### Running Prisma Commands

```bash
# Generate Prisma client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name migration-name

# Reset database (development only)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

### Adding New Components

Use shadcn/ui CLI to add components:

```bash
npx shadcn@latest add [component-name]
```

## Deployment

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## Important Notes

- **Not a CPA**: This app provides administrative assistance, not professional tax or legal advice
- **Human Approval Required**: All AI suggestions require user approval
- **Audit Trail**: All changes are logged for transparency
- **US Market First**: Optimized for US tax and payment language
- **Data Privacy**: Users can delete their business data

## License

Proprietary - All rights reserved

## Support

For support, contact support@opsmate.ai
