FROM node:22-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
# Comando padrão para produção (o compose.local.yaml vai sobrescrever com 'npm run dev')
CMD ["node", "server.js"]