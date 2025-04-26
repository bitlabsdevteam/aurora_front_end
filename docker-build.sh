#!/bin/bash

# Enable Docker BuildKit
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Set environment variables for Next.js build
export NEXT_TELEMETRY_DISABLED=1
export ESLINT_SKIP=true
export NEXT_ESLINT_SKIP_VALIDATION=1
export TS_SKIP_TYPECHECK=true

# Clean up any existing containers and build cache if needed
echo "Cleaning up previous builds..."
docker-compose down

# Prune unused Docker images and containers to free space
echo "Pruning Docker system to free up space..."
docker system prune -f

# Build with no cache option
echo "Building Docker image..."
docker-compose build web

# If the build fails, try with more aggressive options
if [ $? -ne 0 ]; then
  echo "First build attempt failed. Trying with more aggressive options..."
  
  # Force rebuild with no cache
  echo "Building with no cache..."
  docker-compose build --no-cache web
  
  # If it still fails, exit
  if [ $? -ne 0 ]; then
    echo "Build failed. Check the error messages above."
    exit 1
  fi
fi

# Start the container
echo "Starting container..."
docker-compose up -d

echo "Container is now running. Access the application at http://localhost:3000"
echo "To view logs, run: docker-compose logs -f" 