FROM node:18-alpine as builder

# Métadonnées
LABEL maintainer="No-Skills Team"
LABEL description="Frontend React pour No-Skills - Interface de messagerie moderne"
LABEL version="1.0.0"

# Installer les dépendances système nécessaires
RUN apk add --no-cache git

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY index.html ./

# Installer les dépendances
RUN npm ci --silent

# Copier le code source
COPY src/ src/
COPY public/ public/

# Variables d'environnement pour le build
ENV NODE_ENV=production
ENV VITE_API_URL=https://no-skills.fr/api

# Build de l'application
RUN npm run build

# Étape de production avec Nginx
FROM nginx:alpine

# Installer des outils de base
RUN apk add --no-cache curl

# Copier la configuration nginx personnalisée
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés depuis l'étape de build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier un script de santé
RUN echo '#!/bin/sh\ncurl -f http://localhost:3000/ || exit 1' > /health-check.sh && \
    chmod +x /health-check.sh

# Créer un utilisateur non-root
RUN addgroup -g 101 -S nginx && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx nginx

# Ajuster les permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Passer à l'utilisateur nginx
USER nginx

# Exposer le port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD /health-check.sh

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
