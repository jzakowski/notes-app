#!/bin/bash

###############################################################################
# Notes App - Development Environment Setup Script
# This script sets up the development environment for the Notes App
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main setup function
main() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  Notes App - Development Environment Setup                 ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""

    # Check prerequisites
    print_info "Checking prerequisites..."

    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi

    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi

    print_success "Prerequisites check passed"

    # Install dependencies
    print_info "Installing dependencies..."
    npm install
    print_success "Dependencies installed"

    # Set up environment variables
    if [ ! -f .env.local ]; then
        print_info "Creating .env.local file..."
        cat > .env.local << 'EOF'
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Uploadthing (optional - for cloud file storage)
# UPLOADTHING_KEY=""
# UPLOADTHING_SECRET=""

# AWS S3 (optional - for S3 fallback)
# AWS_ACCESS_KEY_ID=""
# AWS_SECRET_ACCESS_KEY=""
# AWS_REGION="us-east-1"
# AWS_S3_BUCKET=""

# Google OAuth (optional)
# GOOGLE_ID=""
# GOOGLE_SECRET=""
EOF
        print_success "Created .env.local file"
        print_warning "Please update .env.local with your API keys"
    else
        print_info ".env.local already exists, skipping..."
    fi

    # Set up database
    print_info "Setting up database..."
    if [ -f "prisma/schema.prisma" ]; then
        npx prisma generate
        npx prisma db push
        print_success "Database setup complete"
    else
        print_warning "Prisma schema not found yet. Run this after 'Feature: Database Schema' is complete."
    fi

    # Create directories
    print_info "Creating project directories..."
    mkdir -p src/app src/components src/lib src/styles
    mkdir -p tests/e2e/puppeteer tests/e2e/test-suites tests/unit tests/verification
    mkdir -p docs public logs
    print_success "Project directories created"

    # Create .gitignore if not exists
    if [ ! -f .gitignore ]; then
        print_info "Creating .gitignore..."
        cat > .gitignore << 'EOF'
# Dependencies
node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Logs
logs/
*.log

# IDEs
.vscode/
.idea/
*.swp
*.swo

# Testing
/tests/verification/

# Database
*.db
*.db-journal
EOF
        print_success "Created .gitignore"
    fi

    # Initialize git if not already initialized
    if [ ! -d .git ]; then
        print_info "Initializing git repository..."
        git init
        git add .
        git commit -m "Initial project setup"
        print_success "Git repository initialized"
    else
        print_info "Git repository already exists, skipping..."
    fi

    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  Setup Complete!                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    print_success "Development environment is ready!"
    echo ""
    print_info "Next steps:"
    echo "  1. Update .env.local with your API keys (if needed)"
    echo "  2. Run: npm run dev"
    echo "  3. Open: http://localhost:3000"
    echo ""
    print_info "Useful commands:"
    echo "  npm run dev          - Start development server"
    echo "  npm run build        - Build for production"
    echo "  npm run start        - Start production server"
    echo "  npm run lint         - Run ESLint"
    echo "  npx prisma studio    - Open Prisma Studio"
    echo "  npx prisma db push   - Push schema changes to database"
    echo ""
}

# Run main function
main
