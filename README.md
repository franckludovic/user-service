# User Service

A microservice for managing users, authentication, and roles in the Home Services Marketplace.

## Features

- **User Management**: Register, authenticate, and manage user profiles
- **Role-based Access**: Separate permissions for clients, workers, and admins
- **Authentication**: JWT-based authentication with refresh tokens
- **Password Management**: Secure password reset and email verification
- **Profile Updates**: Update user profiles and privacy settings

## API Documentation

See [docs/user-service.yaml](docs/user-service.yaml) for the OpenAPI specification.

## Tech Stack

- **Node.js** with Express.js
- **Prisma** ORM with PostgreSQL
- **Redis** for caching
- **JWT** for authentication
- **Joi** for validation

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (create `.env` file):
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/user_service_db"
   JWT_SECRET="your-secret-key"
   REDIS_URL="redis://localhost:6379"
   PORT=3000
   ```

3. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

4. Start the service:
   ```bash
   npm run dev
   ```

## Docker

To run with Docker Compose:

```bash
docker-compose up -d
```

## Project Structure

```
user-service/
├── docs/
│   └── user-service.yaml
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── validators/
├── docker-compose.yml
├── package.json
├── server.js
└── README.md
```

## License

ISC
