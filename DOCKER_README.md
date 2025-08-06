# Eventio 3.0 Docker Setup

This Docker setup builds and serves all three frontend portals (Student, Council, Dean) with nginx, and proxies the backend API.

## Architecture

-   **Student Portal**: Served at root path `/`
-   **Council Portal**: Served at `/council`
-   **Dean Portal**: Served at `/dean`
-   **Backend API**: Proxied from `/api` to port 8000

## Prerequisites

-   Docker and Docker Compose installed
-   Environment variables configured (see `.env.example`)

## Quick Start

1. **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd eventio-3.0
    ```

2. **Set up environment variables**:

    ```bash
    cp env.example .env
    # Edit .env with your configuration
    ```

3. **Set up SSL certificates**:

    ```bash
    # Navigate to the ssl directory
    cd ssl

    # Generate private key
    openssl genrsa -out privkey.pem 2048

    # Generate self-signed certificate
    openssl req -new -x509 -key privkey.pem -out fullchain.pem -days 365 -subj "/CN=localhost"
    ```

    For production, replace with certificates from a trusted Certificate Authority.

    ```

    ```

4. **Build and run with Docker Compose**:

    ```bash
    docker-compose up --build
    ```

5. **Access the applications**:
    - Student Portal: http://localhost/
    - Council Portal: http://localhost/council
    - Dean Portal: http://localhost/dean
    - API Health Check: http://localhost/health

## Manual Docker Build

If you prefer to build manually:

```bash
# Build the frontend image
docker build -t eventio-frontend .

# Run the container
docker run -p 80:80 eventio-frontend
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=your_database_url

# JWT Secret
JWT_SECRET=your_jwt_secret

# Email Configuration
MAIL_HOST=your_mail_host
MAIL_PORT=587
MAIL_USER=your_mail_user
MAIL_PASS=your_mail_password
```

## Docker Compose Services

### Frontend Service

-   **Image**: Built from `Dockerfile`
-   **Port**: 80
-   **Health Check**: `/health` endpoint
-   **Dependencies**: Backend service

### Backend Service

-   **Image**: Built from `backend/Dockerfile`
-   **Port**: 8000 (internal)
-   **Health Check**: Backend health endpoint
-   **Environment**: Database and email configuration

## Nginx Configuration Features

-   **Static Asset Caching**: 1-year cache for JS, CSS, images
-   **Gzip Compression**: Optimized for performance
-   **Rate Limiting**: API (10 req/s), General (30 req/s)
-   **Security Headers**: XSS protection, frame options, etc.
-   **SPA Routing**: Proper handling of React Router
-   **API Proxy**: `/api/*` requests forwarded to backend

## Development

For development, you can run individual services:

```bash
# Frontend only
docker-compose up frontend

# Backend only
docker-compose up backend
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 80 and 8000 are available
2. **Build failures**: Check that all frontend apps have valid `package.json`
3. **API connection**: Verify backend is running and accessible
4. **Environment variables**: Ensure all required env vars are set

### Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs frontend
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f
```

### Health Checks

```bash
# Check frontend health
curl http://localhost/health

# Check backend health (if exposed)
curl http://localhost:8000/health
```

## Production Deployment

For production deployment:

1. **Use proper SSL certificates**
2. **Set up environment variables securely**
3. **Configure proper database connection**
4. **Set up monitoring and logging**
5. **Use a reverse proxy (like Traefik) if needed**

## File Structure

```
eventio-3.0/
├── Dockerfile              # Multi-stage frontend build
├── docker-compose.yml      # Service orchestration
├── nginx.conf             # Nginx configuration
├── .dockerignore          # Docker build exclusions
├── frontend/
│   ├── student/           # Student portal
│   ├── council/           # Council portal
│   └── dean/              # Dean portal
└── backend/               # Backend API
```

## Performance Optimizations

-   **Multi-stage builds**: Reduces final image size
-   **Static asset caching**: Improves load times
-   **Gzip compression**: Reduces bandwidth usage
-   **Rate limiting**: Prevents abuse
-   **Health checks**: Ensures service availability
