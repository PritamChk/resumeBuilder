# Stage 1: Build Tectonic or download binary
FROM python:3.11-slim AS backend-builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    libssl3 \
    libfontconfig1 \
    libgraphite2-3 \
    libharfbuzz0b \
    libicu-dev \
    libpng16-16 \
    libfreetype6 \
    zlib1g \
    && rm -rf /var/lib/apt/lists/*

# Install Tectonic
RUN curl -LO https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.15.0/tectonic-0.15.0-x86_64-unknown-linux-gnu.tar.gz \
    && tar -xzf tectonic-0.15.0-x86_64-unknown-linux-gnu.tar.gz \
    && mv tectonic /usr/local/bin/ \
    && rm tectonic-0.15.0-x86_64-unknown-linux-gnu.tar.gz

# Stage 2: Final Runtime Image
FROM python:3.11-slim

WORKDIR /app

# Copy system libraries needed by Tectonic
RUN apt-get update && apt-get install -y --no-install-recommends \
    libssl3 \
    libfontconfig1 \
    libgraphite2-3 \
    libharfbuzz0b \
    libicu-dev \
    libpng16-16 \
    libfreetype6 \
    zlib1g \
    && rm -rf /var/lib/apt/lists/*

# Copy Tectonic binary from builder
COPY --from=backend-builder /usr/local/bin/tectonic /usr/local/bin/tectonic

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Environment variables
ENV TECTONIC_CACHE_DIR=/tmp/tectonic_cache
RUN mkdir -p /tmp/tectonic_cache && chmod 777 /tmp/tectonic_cache

# Expose port
EXPOSE 8000

# Start command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
