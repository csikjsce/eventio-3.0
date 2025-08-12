# Eventio 3.0

Event management system for college events.

## Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- SSL certificates for HTTPS (place them in the `ssl` folder)

### Environment Setup
1. Copy the environment example file and modify it:
   ```bash
   cp env.example .env
   ```

2. Update the `.env` file with your configuration:
   - Database credentials
   - JWT secret
   - Google OAuth credentials
   - SMTP settings for email

3. SSL Certificates
   - Place your SSL certificates in the `ssl` folder:
     - `fullchain.pem`: Your certificate chain
     - `privkey.pem`: Your private key
   - For development, you can generate self-signed certificates:
     ```bash
     # Navigate to the ssl directory
     cd ssl
     
     # Generate private key
     openssl genrsa -out privkey.pem 2048
     
     # Generate self-signed certificate
     openssl req -new -x509 -key privkey.pem -out fullchain.pem -days 365 -subj "/CN=localhost"
     ```

### Starting the Application
```bash
docker-compose up -d
```

This will start:
- Backend server at port 8000 (internal)
- Frontend on ports 80 (HTTP) and 443 (HTTPS)
- All API endpoints are accessible at `/api`
- Admin panel at `/dean`
- Council portal at `/council`
- Student portal at `/` (root)
