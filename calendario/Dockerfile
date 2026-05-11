# ETAPA 1: Construir a aplicação React (Build)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ETAPA 2: Servir a aplicação com Nginx
FROM nginx:alpine
# Copia os ficheiros compilados para o diretório do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Copia a configuração personalizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]