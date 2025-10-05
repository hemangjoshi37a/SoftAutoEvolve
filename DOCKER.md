# 🐳 Docker Guide for SoftAutoEvolve

Run SoftAutoEvolve in an isolated Docker container to protect your host system.

## 📋 Prerequisites

- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (usually comes with Docker Desktop)
- At least 4GB RAM available for the container
- 10GB disk space

## 🚀 Quick Start

### 1. Build the Container

```bash
./docker-run.sh build
```

This will:
- Pull Node.js 20 base image
- Install all system dependencies
- Build the TypeScript project
- Create the container image

### 2. Start the Container

```bash
./docker-run.sh start
```

The container will start in the background.

### 3. Run Autonomous Mode

```bash
# Run in default workspace
./docker-run.sh auto

# Run in specific directory
./docker-run.sh auto /workspace/my-project
```

### 4. Open Interactive Shell

```bash
./docker-run.sh shell
```

This opens a bash shell inside the container where you can run commands manually.

## 📖 Available Commands

### Container Management

```bash
# Build the container
./docker-run.sh build

# Start container in background
./docker-run.sh start

# Stop container
./docker-run.sh stop

# Rebuild and restart
./docker-run.sh restart

# Remove container and volumes
./docker-run.sh clean
```

### Running Commands

```bash
# Run any command in the container
./docker-run.sh run 'npm install'
./docker-run.sh run 'git status'
./docker-run.sh run 'softautoevolve --help'

# Run autonomous mode
./docker-run.sh auto /workspace/myproject
```

### Monitoring

```bash
# View container logs
./docker-run.sh logs

# Open shell for manual control
./docker-run.sh shell
```

## 📂 Volume Mounts

The container mounts several directories for data persistence:

- **`./workspace`** → `/workspace` - Your project files
- **`./config`** → `/root/.config` - Configuration files
- **`~/.gitconfig`** → `/root/.gitconfig` - Git configuration (read-only)
- **`~/.ssh`** → `/root/.ssh` - SSH keys for GitHub (read-only)

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# GitHub Configuration
GITHUB_TOKEN=ghp_your_token_here
GITHUB_USERNAME=your_username

# Paths to external tools (if using)
CLAUDE_CODE_PATH=/path/to/claude-code
SPEC_KIT_PATH=/path/to/spec-kit
SHINKA_EVOLVE_PATH=/path/to/shinka-evolve

# Feature flags
VERBOSE=false
AUTO_INSTALL_DEPS=false
```

### Resource Limits

Edit `docker-compose.yml` to adjust resource limits:

```yaml
deploy:
  resources:
    limits:
      cpus: '4'      # Maximum CPU cores
      memory: 8G     # Maximum RAM
    reservations:
      cpus: '2'      # Reserved CPU cores
      memory: 2G     # Reserved RAM
```

## 🎯 Usage Examples

### Example 1: Create New Project

```bash
# Start container
./docker-run.sh start

# Create project directory
./docker-run.sh run 'mkdir -p /workspace/my-new-app'

# Initialize project
./docker-run.sh run 'cd /workspace/my-new-app && npm init -y'

# Run autonomous mode
./docker-run.sh auto /workspace/my-new-app
```

### Example 2: Work on Existing Project

```bash
# Copy project to workspace
cp -r ~/my-project ./workspace/

# Start container
./docker-run.sh start

# Run autonomous mode
./docker-run.sh auto /workspace/my-project
```

### Example 3: Interactive Development

```bash
# Start container
./docker-run.sh start

# Open shell
./docker-run.sh shell

# Inside container:
cd /workspace/myproject
sae-auto
# Press Ctrl+C to stop when done
exit
```

### Example 4: Monitor Progress

```bash
# Terminal 1: Run autonomous mode
./docker-run.sh auto /workspace/myapp

# Terminal 2: View logs
./docker-run.sh logs
```

## 🐛 Troubleshooting

### Container won't start

```bash
# Check Docker is running
docker ps

# Check logs
./docker-run.sh logs

# Clean and rebuild
./docker-run.sh clean
./docker-run.sh build
./docker-run.sh start
```

### Out of memory

Edit `docker-compose.yml` and increase memory limits:

```yaml
deploy:
  resources:
    limits:
      memory: 16G  # Increase from 8G
```

### Permission issues

Ensure your `.gitconfig` and `.ssh` are readable:

```bash
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.gitconfig
```

### GitHub authentication

Make sure your GitHub token is set:

```bash
echo "GITHUB_TOKEN=ghp_your_token" >> .env
echo "GITHUB_USERNAME=your_username" >> .env
```

## 🔒 Security Notes

### ✅ Safe by Default

- Runs in isolated container
- Limited resource access
- Read-only mounts for sensitive data
- Network isolation available

### ⚠️ Important

- SSH keys are mounted read-only from host
- GitHub tokens stored in `.env` (gitignored)
- Don't commit `.env` to version control
- Container has full access to mounted workspace

### 🛡️ Best Practices

1. **Use separate workspace directory** - Don't mount your entire home directory
2. **Limit resources** - Set appropriate CPU/memory limits
3. **Regular updates** - Rebuild container periodically for security updates
4. **Monitor logs** - Check what the agent is doing
5. **Backup data** - Keep backups of your workspace

## 📊 Performance Tips

### Speed up builds

```bash
# Use Docker BuildKit
DOCKER_BUILDKIT=1 docker build -t softautoevolve .
```

### Reduce container size

The Dockerfile uses multi-stage builds and cleans up after installations.

### Persistent cache

The container uses volumes for persistent storage. Data in `/workspace` persists across container restarts.

## 🔄 Updates

### Update SoftAutoEvolve

```bash
# Pull latest code
git pull

# Rebuild container
./docker-run.sh restart
```

### Update dependencies

```bash
./docker-run.sh run 'npm update'
./docker-run.sh restart
```

## 🗑️ Cleanup

### Remove container

```bash
./docker-run.sh stop
```

### Remove container and volumes

```bash
./docker-run.sh clean
```

### Remove Docker image

```bash
docker rmi softautoevolve:latest
```

### Full cleanup

```bash
./docker-run.sh clean
docker system prune -a
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Main README](./README.md)
- [Improvements Documentation](./IMPROVEMENTS_v2.md)

## 💡 Tips

1. **Keep workspace organized** - Create separate directories for each project
2. **Use interactive mode** - Run `./docker-run.sh shell` for more control
3. **Monitor resource usage** - Use `docker stats` to see CPU/memory usage
4. **Save important data** - The `/workspace` directory is your persistent storage
5. **Customize container** - Edit `Dockerfile` to add additional tools

---

**Need help?** Open an issue on GitHub or check the main README.
