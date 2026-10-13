# OctoCookie — imagem ÚNICA: site + bot 24/7 (Chromium/Playwright) + CookieScript (Python).
# Comando de start: node start.mjs  (um proxy interno expõe tudo numa só porta)
FROM mcr.microsoft.com/playwright:v1.49.1-jammy

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates python3 \
 && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
 && apt-get install -y --no-install-recommends nodejs \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
# URLs relativas: tudo fica na mesma origem (VITE_* entram no build do site)
ENV VITE_COOKIESCRIPT_URL=/cookiescript-app VITE_BOT_24X7_URL=/bot

COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund --legacy-peer-deps
COPY bot-server/package.json bot-server/package-lock.json ./bot-server/
RUN cd bot-server && npm ci --omit=dev

COPY . .
RUN npm run build

ENV NODE_ENV=production DATA_DIR=/data DISABLE_LOCAL_AI=true
EXPOSE 10000
CMD ["node", "start.mjs"]
