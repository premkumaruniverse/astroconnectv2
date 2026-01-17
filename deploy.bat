@echo off
echo 🚀 Starting AstroConnect Deployment...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please edit .env file with your actual configuration values before proceeding.
    echo Press any key to continue after editing .env file...
    pause
)

REM Build and start services
echo 🔨 Building Docker images...
docker-compose -f docker-compose.prod.yml build

echo 🚀 Starting services...
docker-compose -f docker-compose.prod.yml up -d

echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak

REM Check if services are running
docker-compose -f docker-compose.prod.yml ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo ✅ Deployment successful!
    echo 🌐 Frontend: http://localhost
    echo 🔧 Backend API: http://localhost/api
    echo 📊 View logs: docker-compose -f docker-compose.prod.yml logs -f
) else (
    echo ❌ Deployment failed. Check logs with: docker-compose -f docker-compose.prod.yml logs
    pause
    exit /b 1
)

pause