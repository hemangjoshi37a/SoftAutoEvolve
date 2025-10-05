#!/bin/bash

# SoftAutoEvolve Docker Runner
# Simplifies running SoftAutoEvolve in Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    warning "docker-compose is not installed. Will use 'docker compose' instead."
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Function to build the container
build_container() {
    info "Building SoftAutoEvolve Docker container..."
    $DOCKER_COMPOSE build
    success "Container built successfully"
}

# Function to start the container
start_container() {
    info "Starting SoftAutoEvolve container..."
    $DOCKER_COMPOSE up -d
    success "Container started"
}

# Function to stop the container
stop_container() {
    info "Stopping SoftAutoEvolve container..."
    $DOCKER_COMPOSE down
    success "Container stopped"
}

# Function to run a command in the container
run_command() {
    local cmd="$@"
    info "Running command in container: $cmd"
    $DOCKER_COMPOSE exec softautoevolve bash -c "$cmd"
}

# Function to run autonomous mode
run_auto() {
    local project_dir="${1:-/workspace}"
    info "Starting autonomous mode in: $project_dir"
    $DOCKER_COMPOSE exec softautoevolve bash -c "cd $project_dir && sae-auto"
}

# Function to enter interactive shell
shell() {
    info "Opening interactive shell in container..."
    $DOCKER_COMPOSE exec softautoevolve bash
}

# Function to view logs
logs() {
    info "Showing container logs..."
    $DOCKER_COMPOSE logs -f softautoevolve
}

# Function to clean up everything
clean() {
    warning "This will remove the container and all data in volumes!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        info "Cleaning up..."
        $DOCKER_COMPOSE down -v
        success "Cleanup complete"
    else
        info "Cleanup cancelled"
    fi
}

# Main command dispatcher
case "${1:-help}" in
    build)
        build_container
        ;;
    start)
        start_container
        ;;
    stop)
        stop_container
        ;;
    restart)
        stop_container
        build_container
        start_container
        ;;
    run)
        shift
        run_command "$@"
        ;;
    auto)
        shift
        run_auto "$@"
        ;;
    shell)
        shell
        ;;
    logs)
        logs
        ;;
    clean)
        clean
        ;;
    help|*)
        echo "SoftAutoEvolve Docker Runner"
        echo ""
        echo "Usage: ./docker-run.sh [command]"
        echo ""
        echo "Commands:"
        echo "  build         Build the Docker container"
        echo "  start         Start the container in background"
        echo "  stop          Stop the container"
        echo "  restart       Rebuild and restart the container"
        echo "  run <cmd>     Run a command in the container"
        echo "  auto [dir]    Run autonomous mode (default: /workspace)"
        echo "  shell         Open interactive shell in container"
        echo "  logs          View container logs"
        echo "  clean         Remove container and volumes"
        echo "  help          Show this help message"
        echo ""
        echo "Examples:"
        echo "  ./docker-run.sh build                    # Build container"
        echo "  ./docker-run.sh start                    # Start container"
        echo "  ./docker-run.sh auto /workspace/myapp    # Run autonomous mode"
        echo "  ./docker-run.sh shell                    # Open shell"
        echo "  ./docker-run.sh run 'npm install'        # Run npm install"
        echo ""
        ;;
esac
