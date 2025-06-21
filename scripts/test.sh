#!/bin/bash

# Test script for CI/CD

set -e

echo "🧪 Running test suite..."

# Lint code
echo "🔍 Running linter..."
npm run lint

# Run tests with coverage
echo "🧪 Running tests with coverage..."
npm run test:coverage

# Check coverage thresholds
echo "📊 Checking coverage thresholds..."
npx nyc check-coverage --lines 80 --functions 80 --branches 80 --statements 80

echo "✅ All tests passed!"
