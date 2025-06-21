#!/bin/bash

# Setup script for Metrics Analytics Backend

set -e

echo "🚀 Setting up Metrics Analytics Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. Please install PostgreSQL 12+ or use Docker."
fi

# Check if Redis is installed
if ! command -v redis-cli &> /dev/null; then
    echo "⚠️  Redis is not installed. Please install Redis 6+ or use Docker."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your configuration."
else
    echo "✅ Environment file already exists"
fi

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your database and Redis configuration"
echo "2. Create databases: createdb metrics_analytics && createdb metrics_analytics_test"
echo "3. Run migrations: npm run migrate"
echo "4. Seed demo data: npm run seed"
echo "5. Start development server: npm run dev"
echo ""
echo "Or use Docker: docker-compose up -d"
