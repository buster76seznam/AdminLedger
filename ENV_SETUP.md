# Environment Variables Setup

This document describes all the environment variables needed to run OpsMate AI.

## Required Variables

### Database

```env
DATABASE_URL=postgresql://user:password@localhost:5432/opsmate
```

Your PostgreSQL connection string. Replace with your actual database credentials.

### NextAuth.js

```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

- `NEXTAUTH_SECRET`: Generate a secure random string. Use `openssl rand -base64 32` on Linux/Mac or similar on Windows.
- `NEXTAUTH_URL`: The URL of your application (http://localhost:3000 for development, your production URL for production).

### OpenRouter API (AI Features)

```env
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-api-key
```

Your OpenRouter API key for AI features (document extraction, categorization, chat assistant). Get one from https://openrouter.ai/keys. The app is configured to use free models from OpenRouter.

Note: You can also use `OPENAI_API_KEY` as a fallback if you prefer to use OpenAI directly.

## Optional Variables

### Email Service (Resend)

```env
RESEND_API_KEY=re-your-resend-api-key
RESEND_FROM=noreply@yourdomain.com
```

For sending emails (reminders, notifications). Get an API key from https://resend.com.

### AWS S3 (File Storage)

```env
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=opsmate-uploads
```

For storing uploaded files. Create an S3 bucket and get credentials from AWS IAM.

### Redis (BullMQ Job Queue)

```env
REDIS_URL=redis://localhost:6379
```

For background job processing (document processing, email sending). Install Redis locally or use a hosted service.

## Quick Setup

1. Create a `.env` file in the project root:

```bash
# On Linux/Mac
touch .env

# On Windows (PowerShell)
New-Item -Path . -Name ".env" -ItemType File
```

2. Add the required variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/opsmate
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=sk-your-openai-api-key
```

3. Add optional variables as needed for your setup.

## Development vs Production

### Development
- Use local PostgreSQL
- Use http://localhost:3000 for NEXTAUTH_URL
- Can skip optional services initially (file uploads, email, jobs)

### Production
- Use managed PostgreSQL (Supabase, Neon, AWS RDS)
- Use your production domain for NEXTAUTH_URL
- Configure all optional services for full functionality
- Use environment-specific secrets

## Security Notes

- Never commit `.env` files to version control
- Use strong, randomly generated secrets
- Rotate secrets periodically
- Use different secrets for development and production
- Limit API key permissions to minimum required

## Testing Your Setup

After setting up environment variables:

```bash
# Test database connection
npx prisma db push

# Test Prisma client generation
npx prisma generate

# Start development server
npm run dev
```

If everything is configured correctly, the application should start without errors.
