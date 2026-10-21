# Contexto de build = raiz do repositório (precisa de public/octocookie-app, que é o bot que o servidor abre).
# A versão da imagem deve ser a mesma do pacote "playwright" no package.json (1.49.1).
FROM mcr.microsoft.com/playwright:v1.49.1-jammy
WORKDIR /app
COPY bot-server/package.json bot-server/package-lock.json ./bot-server/
RUN cd bot-server && npm ci --omit=dev
COPY bot-server ./bot-server
COPY public/octocookie-app ./public/octocookie-app
ENV NODE_ENV=production DATA_DIR=/data APP_DIR=/app/public/octocookie-app
CMD ["node", "bot-server/server.js"]
