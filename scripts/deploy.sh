#!/bin/bash

# Deployment script

set -e

echo "🚀 Deploying Metrics Analytics Backend..."

# Build application
echo "🔨 Building application..."
npm run build

# Run database migrations
echo "🗄️  Running database migrations..."
npm run migrate

# Start application with PM2
echo "🚀 Starting application..."
pm2 start dist/app.js --name metrics-analytics --max-memory-restart 500M

# Save PM2 configuration
pm2 save

echo "✅ Deployment complete!"
echo "Application is running on port 3000"
