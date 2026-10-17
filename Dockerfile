# All-in-one runner: Playwright browsers + k6 + Lighthouse CI.
FROM mcr.microsoft.com/playwright:v1.64.1-noble
ARG K6_VERSION=2.3.0
ARG TARGETARCH=amd64
RUN apt-get update && apt-get install -y --no-install-recommends make && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL "https://github.com/grafana/k6/releases/download/v${K6_VERSION}/k6-v${K6_VERSION}-linux-${TARGETARCH}.tar.gz" \
    | tar -xz --strip-components=1 -C /usr/local/bin "k6-v${K6_VERSION}-linux-${TARGETARCH}/k6" \
 && k6 version
WORKDIR /suite
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ENV CI=1 CHROME_PATH=/usr/bin/chromium
# Lighthouse needs a Chrome binary; reuse Playwright's Chromium.
RUN ln -sf "$(ls -d /ms-playwright/chromium-*/chrome-linux*/chrome | head -1)" /usr/bin/chromium
ENTRYPOINT ["make"]
CMD ["all"]
