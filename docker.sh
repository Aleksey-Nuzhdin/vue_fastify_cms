#!/bin/bash

COMPOSE_FILE="docker-compose.prod.yml"

case "$1" in
  "start")
    docker-compose -f $COMPOSE_FILE up -d --force-recreate
    echo "✓ Production started"
    ;;
  "stop")
    docker-compose -f $COMPOSE_FILE down
    echo "✓ Production stopped"
    ;;
  "build")
    docker-compose -f $COMPOSE_FILE build
    echo "✓ Build complete"
    ;;
  "update")
    echo "→ Pulling latest changes..."
    git pull || { echo "✗ git pull failed"; exit 1; }
    echo "→ Stopping services..."
    docker-compose -f $COMPOSE_FILE down
    echo "→ Building new image..."
    docker-compose -f $COMPOSE_FILE build || { echo "✗ Build failed"; exit 1; }
    echo "→ Starting services..."
    docker-compose -f $COMPOSE_FILE up -d --force-recreate
    echo "✓ Update complete"
    ;;
  "logs")
    docker-compose -f $COMPOSE_FILE logs -f
    ;;
  *)
    echo "Usage: ./docker.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start   - Start production services"
    echo "  stop    - Stop production services"
    echo "  build   - Build image only"
    echo "  update  - git pull → stop → build → start"
    echo "  logs    - Follow production logs"
    ;;
esac
