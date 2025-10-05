# SoftAutoEvolve Docker Container
# Provides isolated environment for autonomous development

FROM node:20-bullseye

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    libnotify-bin \
    pulseaudio-utils \
    alsa-utils \
    beep \
    chromium \
    chromium-driver \
    && rm -rf /var/lib/apt/lists/*

# Install UV package manager for Python
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.cargo/bin:${PATH}"

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install Node dependencies
RUN npm install

# Copy source code
COPY src ./src
COPY .env.example ./.env.example

# Build TypeScript
RUN npm run build

# Install globally to make commands available
RUN npm link

# Create workspace directory for projects
RUN mkdir -p /workspace
WORKDIR /workspace

# Set environment variables
ENV NODE_ENV=production
ENV ENHANCED_MODE=true
ENV AUTO_INSTALL_DEPS=false

# Create volume mount points
VOLUME ["/workspace", "/root/.config"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('healthy')" || exit 1

# Default command
CMD ["bash"]

# Labels
LABEL maintainer="SoftAutoEvolve"
LABEL description="Autonomous software development agent"
LABEL version="2.0"
