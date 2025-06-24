FROM node:18-alpine as builder

WORKDIR /app

# Copier les fichiers du package.json depuis le frontend
COPY frontend/package.json ./

# Installer les dépendances
RUN npm install

# Copier TOUS les fichiers depuis la racine (copiés par deploy.sh)
COPY index.html ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY src/ ./src/
COPY public/ ./public/

# Build
RUN npm run build

# Production avec Nginx
FROM nginx:alpine

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
