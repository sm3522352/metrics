-- Create database if it doesn't exist
SELECT 'CREATE DATABASE metrics_analytics'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'metrics_analytics')\gexec

-- Create test database
SELECT 'CREATE DATABASE metrics_analytics_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'metrics_analytics_test')\gexec

-- Connect to the main database
\c metrics_analytics;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_metrics_name ON metrics(name);
CREATE INDEX IF NOT EXISTS idx_metrics_category ON metrics(category);
CREATE INDEX IF NOT EXISTS idx_metric_values_date ON metric_values(date);
CREATE INDEX IF NOT EXISTS idx_metric_values_metric_date ON metric_values(metric_id, date);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
