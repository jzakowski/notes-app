#!/bin/bash
# Clean Next.js cache to fix MODULE_NOT_FOUND error

echo "Cleaning Next.js cache..."

# Remove cache directories
find .next/cache -type f -delete 2>/dev/null
find .next/cache -type d -empty -delete 2>/dev/null

echo "Cache cleaned. Restarting server..."
