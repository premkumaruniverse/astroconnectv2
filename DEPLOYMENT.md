# AstroConnect Deployment Guide

## Prerequisites

### Required Software
- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** (usually included with Docker Desktop)
- **Git** (for cloning repository)

### Required Accounts/Services
- **PostgreSQL** (or use included Docker PostgreSQL)
- **OpenAI API** account and API key
- **Cloudinary** account for image storage

## Quick Start (Local Development)

1. **Clone and Setup**
   ```bash
   git clone <your-repo-url>
   cd astroconnectv2
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Deploy with Docker Compose**
   ```bash
   # Windows
   deploy.bat
   
   # Linux/Mac
   chmod +x deploy.sh
   ./deploy.sh
   ```

## Deployment Options

### 1. Local Docker Deployment

**Step 1: Install Docker**
- Windows: Download Docker Desktop from docker.com
- Mac: Download Docker Desktop from docker.com  
- Linux: Install Docker Engine and Docker Compose

**Step 2: Configure Environment Variables**
```bash
# Copy template
cp .env.example .env

# Edit .env file with your values:
POSTGRES_PASSWORD=your-secure-password
SECRET_KEY=your-jwt-secret-key-min-32-chars
OPENAI_API_KEY=sk-your-openai-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Step 3: Deploy**
```bash
# Development (with hot reload)
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

**Step 4: Access Application**
- Frontend: http://localhost
- Backend API: http://localhost/api
- Database: localhost:5432

### 2. Cloud Deployment (AWS/GCP/Azure)

**Option A: Docker Compose on VM**
1. Create a VM instance (Ubuntu 20.04+ recommended)
2. Install Docker and Docker Compose
3. Clone repository and configure .env
4. Run deployment script
5. Configure domain and SSL (optional)

**Option B: Kubernetes Deployment**
1. **Prepare Images**
   ```bash
   # Build and push to registry
   docker build -t your-registry/astroconnect-backend:latest ./BE
   docker build -t your-registry/astroconnect-frontend:latest ./UI
   docker push your-registry/astroconnect-backend:latest
   docker push your-registry/astroconnect-frontend:latest
   ```

2. **Update k8s-deployment.yml**
   - Replace `your-registry` with your actual registry
   - Update secrets with your actual values

3. **Deploy to Kubernetes**
   ```bash
   kubectl apply -f k8s-deployment.yml
   ```

### 3. Platform-as-a-Service (Heroku, Railway, etc.)

**For Backend (FastAPI):**
- Create new app
- Set environment variables
- Connect PostgreSQL addon
- Deploy from Git

**For Frontend (React):**
- Build static files: `npm run build`
- Deploy dist folder to static hosting (Netlify, Vercel)

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `POSTGRES_DB` | Database name | Yes |
| `POSTGRES_USER` | Database user | Yes |
| `POSTGRES_PASSWORD` | Database password | Yes |
| `SECRET_KEY` | JWT secret key (32+ chars) | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |

## Monitoring and Maintenance

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Database Backup
```bash
# Backup
docker-compose exec database pg_dump -U postgres astroconnect > backup.sql

# Restore
docker-compose exec -T database psql -U postgres astroconnect < backup.sql
```

### Update Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using port 80/8000
   netstat -tulpn | grep :80
   # Kill process or change port in docker-compose.yml
   ```

2. **Database Connection Failed**
   - Check if PostgreSQL container is running
   - Verify DATABASE_URL format
   - Ensure database exists

3. **Frontend Can't Connect to Backend**
   - Check nginx.conf proxy configuration
   - Verify backend service is running
   - Check network connectivity between containers

4. **Environment Variables Not Loading**
   - Ensure .env file exists in root directory
   - Check file permissions
   - Verify variable names match exactly

### Health Checks
```bash
# Check service status
docker-compose ps

# Test backend API
curl http://localhost/api/health

# Check database connection
docker-compose exec backend python -c "from app.database import engine; print('DB Connected')"
```

## Security Considerations

1. **Change Default Passwords**
   - Use strong, unique passwords for database
   - Generate secure JWT secret key

2. **Environment Variables**
   - Never commit .env files to version control
   - Use secrets management in production

3. **Network Security**
   - Configure firewall rules
   - Use HTTPS in production
   - Restrict database access

4. **Regular Updates**
   - Keep Docker images updated
   - Update dependencies regularly
   - Monitor security advisories

## Production Checklist

- [ ] Environment variables configured
- [ ] Database backups scheduled
- [ ] SSL certificate configured
- [ ] Domain name configured
- [ ] Monitoring setup
- [ ] Log aggregation setup
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Health checks configured
- [ ] Disaster recovery plan

## Support

For deployment issues:
1. Check logs: `docker-compose logs`
2. Verify environment variables
3. Check service connectivity
4. Review this guide for common solutions