# Notes App

A modern, full-featured notes application built with Next.js, TypeScript, and Prisma.

## Features

- 📝 Rich text editor with Tiptap
- 🏷️ Categories and tags for organization
- 📎 Image and video uploads (Uploadthing)
- 👥 User authentication (Email/Password + Google OAuth)
- 🎨 Dark mode support
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js 18+ installed
- SQLite3 (included with Node.js on most systems)

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd notes-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

5. Create the dev user (optional, for development):
```bash
npx ts-node scripts/seed-dev-user.ts
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development Login (Dev Mode)

For easier development and testing, a pre-configured dev user is available:

### Quick Setup

1. Create the dev user:
```bash
npx ts-node scripts/seed-dev-user.ts
```

2. Ensure `NEXT_PUBLIC_DEV_MODE="true"` is set in your `.env` file

3. Visit the login page at `/auth/login`

4. You'll see a "Dev Login Available" box with:
   - Email: `dev@notes-app.local`
   - Password: `dev123456`
   - A "Quick Dev Login" button

### Dev Credentials

```
Email: dev@notes-app.local
Password: dev123456
```

### Production Deployment

For production, simply:
1. Remove or set `NEXT_PUBLIC_DEV_MODE` to `"false"` in your production environment variables
2. Optionally, delete the dev user from the database
3. The dev login hint will not appear in production

## Environment Variables

### Required

```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

### Optional

```bash
# Development Mode
NEXT_PUBLIC_DEV_MODE="true"  # Shows dev login hint (unset in production)

# Google OAuth
GOOGLE_ID="your-google-client-id"
GOOGLE_SECRET="your-google-client-secret"

# Uploadthing (file uploads)
UPLOADTHING_APP_ID="your-app-id"
UPLOADTHING_SECRET="your-secret"

# AWS S3 (alternative to Uploadthing)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
```

## Database

This project uses SQLite with Prisma ORM.

### Useful Commands

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma studio` - Open database GUI
- `npx ts-node scripts/seed-dev-user.ts` - Create dev user

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript 5.5
- **Styling:** Tailwind CSS
- **Database:** SQLite with Prisma ORM
- **Authentication:** NextAuth.js
- **Editor:** Tiptap (rich text editor)
- **File Uploads:** Uploadthing

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   └── notes/          # Main notes application
├── components/         # React components
├── lib/               # Utility functions
└── styles/            # Global styles

prisma/
├── schema.prisma      # Database schema
└── dev.db            # SQLite database file

scripts/
└── seed-dev-user.ts  # Dev user creation script
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT
