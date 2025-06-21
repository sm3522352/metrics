# Metrics Analytics Backend

A comprehensive TypeScript backend for metrics and events analytics with correlation analysis, built with clean architecture principles.

## 🚀 Features

- **Clean Architecture**: Modular design with clear separation of concerns
- **Metrics Management**: CRUD operations with time series data storage
- **Events Tracking**: Business events with metric correlations
- **Advanced Analytics**: Anomaly detection, trend analysis, and insights generation
- **Import/Export**: Bulk operations with CSV/Excel support
- **Authentication**: JWT-based auth with role-based access control
- **Multi-tenancy**: Data isolation for different organizations
- **Real-time Processing**: Async operations with Redis queues
- **Comprehensive Testing**: Unit and integration tests
- **API Documentation**: Swagger/OpenAPI documentation
- **Docker Support**: Containerized deployment

## 🏗️ Architecture

\`\`\`
src/
├── config/          # Configuration files
├── models/          # Sequelize models
├── services/        # Business logic
├── routes/          # API endpoints
├── middleware/      # Authentication, validation, etc.
├── utils/           # Utility functions
├── database/        # Migrations and seeders
└── tests/           # Test files
\`\`\`

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Cache**: Redis
- **Authentication**: JWT
- **Validation**: Joi
- **Testing**: Jest
- **Documentation**: Swagger
- **Containerization**: Docker

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- Docker (optional)

## 🚀 Quick Start

### 1. Clone the repository

\`\`\`bash
git clone <repository-url>
cd metrics-analytics-backend
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set up environment variables

\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

### 4. Set up the database

\`\`\`bash
# Create databases
createdb metrics_analytics
createdb metrics_analytics_test

# Run migrations
npm run migrate

# Seed with demo data
npm run seed
\`\`\`

### 5. Start the development server

\`\`\`bash
npm run dev
\`\`\`

The API will be available at `http://localhost:3000`

API Documentation: `http://localhost:3000/api-docs`

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

\`\`\`bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
\`\`\`

### Manual Docker Build

\`\`\`bash
# Build image
docker build -t metrics-analytics .

# Run container
docker run -p 3000:3000 \
  -e DB_HOST=your-db-host \
  -e DB_PASSWORD=your-password \
  metrics-analytics
\`\`\`

## 🧪 Testing

\`\`\`bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
\`\`\`

## 📊 Demo Data

The application includes demo data with:

- **Users**: Admin, Analyst, and Viewer roles
- **Metrics**: Revenue, customers, conversion rate, churn rate, AOV
- **Time Series**: 24 months of sample data with trends
- **Events**: Marketing campaigns, product launches, etc.
- **Correlations**: Pre-calculated event-metric relationships

### Demo Credentials

\`\`\`
Admin: admin@example.com / admin123
Analyst: analyst@example.com / analyst123
Viewer: viewer@example.com / viewer123
\`\`\`

## 🔧 API Usage Examples

### Authentication

\`\`\`bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"analyst"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
\`\`\`

### Metrics

\`\`\`bash
# Get all metrics
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/metrics

# Get time series data
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/metrics/timeseries?startDate=2024-01-01&endDate=2024-12-31"

# Import metrics data
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@metrics.csv" \
  http://localhost:3000/api/metrics/import
\`\`\`

### Analytics

\`\`\`bash
# Get insights
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/analytics/insights?startDate=2024-01-01&endDate=2024-12-31"

# Compare periods
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/analytics/compare?metricId=METRIC_ID&period1Start=2024-01-01&period1End=2024-06-30&period2Start=2024-07-01&period2End=2024-12-31"
\`\`\`

## 📁 Import/Export Templates

### Metrics Template (CSV)

\`\`\`csv
metricName,date,value,period
revenue,2024-01-01,100000,2024-01
customers,2024-01-01,1000,2024-01
\`\`\`

### Events Template (CSV)

\`\`\`csv
name,category,description,startDate,endDate,impact,metricNames
Product Launch,marketing,New product launch campaign,2024-01-01,2024-01-31,high,"revenue,customers"
\`\`\`

## 🔍 Monitoring and Health Checks

\`\`\`bash
# Health check
curl http://localhost:3000/health

# Response
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
\`\`\`

## 🚀 Production Deployment

### Environment Variables

\`\`\`bash
NODE_ENV=production
PORT=3000
DB_HOST=your-production-db
DB_PASSWORD=secure-password
JWT_SECRET=very-secure-secret
REDIS_URL=redis://your-redis-instance
\`\`\`

### Database Setup

\`\`\`bash
# Run migrations in production
NODE_ENV=production npm run migrate

# Optional: Seed with demo data
NODE_ENV=production npm run seed
\`\`\`

### Process Management

\`\`\`bash
# Using PM2
npm install -g pm2
pm2 start dist/app.js --name metrics-analytics

# Using Docker
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

## 🔧 Configuration

### Database Configuration

Edit `src/config/database.ts` for custom database settings.

### Redis Configuration

Edit `src/config/redis.ts` for Redis settings.

### JWT Configuration

Edit `src/config/app.ts` for JWT and security settings.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the API documentation at `/api-docs`
- Review the test files for usage examples

## 🔄 Changelog

### v1.0.0
- Initial release
- Complete CRUD operations for metrics and events
- Advanced analytics with correlation analysis
- Import/export functionality
- JWT authentication with RBAC
- Comprehensive test suite
- Docker support
- API documentation
