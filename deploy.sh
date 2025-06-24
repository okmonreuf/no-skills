#!/bin/bash

# ========================================
# SCRIPT DE DÉPLOIEMENT NO-SKILLS
# Déploiement automatique sur VPS Ubuntu/Debian
# ========================================

set -e  # Arrêter le script en cas d'erreur

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="no-skills.fr"
EMAIL="admin@no-skills.fr"
APP_DIR="/var/www/no-skills"
NGINX_CONFIG="/etc/nginx/sites-available/no-skills"
DOCKER_COMPOSE_VERSION="v2.20.0"

# Configuration automatique
AUTO_DEPLOY=${AUTO_DEPLOY:-false}
SKIP_DNS_CHECK=${SKIP_DNS_CHECK:-false}

# Fonction de logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Vérifier si le script est exécuté en tant que root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "Ce script doit être exécuté en tant que root (sudo ./deploy.sh)"
        exit 1
    fi
}

# Vérifier la configuration DNS
check_dns() {
    if [[ "$SKIP_DNS_CHECK" == "true" ]]; then
        log "Vérification DNS ignorée (SKIP_DNS_CHECK=true)"
        return 0
    fi

    log "Vérification de la configuration DNS..."

    # Obtenir l'IP publique du serveur
    SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || curl -s icanhazip.com)

    if [[ -z "$SERVER_IP" ]]; then
        warning "Impossible de détecter l'IP publique du serveur"
        return 1
    fi

    log "IP publique du serveur: $SERVER_IP"

    # Vérifier la résolution DNS (IPv4 et IPv6)
    if [[ "$SERVER_IP" =~ : ]]; then
        # IPv6 - utiliser AAAA record
        DOMAIN_IP=$(dig +short AAAA $DOMAIN @8.8.8.8 | tail -n1)
    else
        # IPv4 - utiliser A record
        DOMAIN_IP=$(dig +short A $DOMAIN @8.8.8.8 | tail -n1)
    fi

    if [[ "$DOMAIN_IP" == "$SERVER_IP" ]]; then
        log "✅ DNS correctement configuré: $DOMAIN → $SERVER_IP"
        return 0
    else
        warning "⚠️  DNS non configuré: $DOMAIN → $DOMAIN_IP (attendu: $SERVER_IP)"

        if [[ "$AUTO_DEPLOY" == "true" ]]; then
            error "Déploiement automatique impossible: DNS non configuré"
            exit 1
        fi

        echo ""
        echo "📝 Pour configurer le DNS:"
        echo "   - Connectez-vous à votre registrar de domaine"

        # Déterminer le type d'enregistrement selon l'IP
        if [[ "$SERVER_IP" =~ : ]]; then
            # IPv6
            echo "   - Créez un enregistrement AAAA: $DOMAIN → $SERVER_IP"
            echo "   - Créez un enregistrement AAAA: www.$DOMAIN → $SERVER_IP"
        else
            # IPv4
            echo "   - Créez un enregistrement A: $DOMAIN → $SERVER_IP"
            echo "   - Créez un enregistrement A: www.$DOMAIN → $SERVER_IP"
        fi

        echo "   - Attendez la propagation DNS (jusqu'à 24h)"
        echo ""
        read -p "Appuyez sur Entrée quand le DNS est configuré, ou Ctrl+C pour annuler..."

        # Revérifier après action utilisateur
        check_dns
    fi
}

# Vérifier la distribution Linux
check_distribution() {
    log "Vérification de la distribution Linux..."

    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID

        case $ID in
            ubuntu)
                if [[ $VER < "20.04" ]]; then
                    error "Ubuntu 20.04 ou supérieur requis"
                    exit 1
                fi
                PACKAGE_MANAGER="apt"
                ;;
            debian)
                if [[ $VER -lt "10" ]]; then
                    error "Debian 10 ou supérieur requis"
                    exit 1
                fi
                PACKAGE_MANAGER="apt"
                ;;
            centos|rhel|fedora)
                PACKAGE_MANAGER="yum"
                ;;
            *)
                warning "Distribution non testée: $OS"
                PACKAGE_MANAGER="apt"
                ;;
        esac

        log "Distribution détectée: $OS $VER"
    else
        error "Impossible de détecter la distribution"
        exit 1
    fi
}

# Mise à jour du système
update_system() {
    log "Mise à jour du système..."

    case $PACKAGE_MANAGER in
        apt)
            apt update && apt upgrade -y
            apt install -y curl wget git ufw fail2ban htop nano
            ;;
        yum)
            yum update -y
            yum install -y curl wget git firewalld htop nano
            ;;
    esac
}

# Installation de Docker
install_docker() {
    log "Installation de Docker..."

    if command -v docker &> /dev/null; then
        log "Docker est déjà installé"
        # Vérifier que Docker fonctionne
        if ! docker info &> /dev/null; then
            log "Redémarrage du service Docker..."
            systemctl start docker
            systemctl enable docker
        fi
        return
    fi

    case $PACKAGE_MANAGER in
        apt)
            # Supprimer les anciennes versions
            apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

            # Installer les dépendances
            apt install -y ca-certificates curl gnupg lsb-release

            # Ajouter la clé GPG officielle de Docker
            mkdir -p /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

            # Ajouter le repository
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list

            # Installer Docker
            apt update
            apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            ;;
        yum)
            yum install -y yum-utils
            yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            systemctl enable docker
            ;;
    esac

    # Démarrer Docker
    systemctl start docker
    systemctl enable docker

    # Ajouter l'utilisateur actuel au groupe docker
    usermod -aG docker $SUDO_USER 2>/dev/null || true

    log "Docker installé avec succès"
}

# Installation de Docker Compose (version standalone)
install_docker_compose() {
    log "Installation de Docker Compose..."

    # Vérifier les deux versions possibles
    if command -v docker-compose &> /dev/null; then
        log "Docker Compose (standalone) est déjà installé"
        return
    fi

    if docker compose version &> /dev/null; then
        log "Docker Compose (plugin) est déjà installé"
        # Créer un alias pour compatibilité
        ln -sf /usr/bin/docker /usr/local/bin/docker-compose
        return
    fi

    # Télécharger Docker Compose
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

    # Rendre exécutable
    chmod +x /usr/local/bin/docker-compose

    # Créer un lien symbolique
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

    log "Docker Compose installé avec succès"
}

# Installation de Nginx
install_nginx() {
    log "Installation de Nginx..."

    case $PACKAGE_MANAGER in
        apt)
            apt install -y nginx
            ;;
        yum)
            yum install -y nginx
            ;;
    esac

    systemctl start nginx
    systemctl enable nginx

    log "Nginx installé avec succès"
}

# Installation de Certbot pour SSL
install_certbot() {
    log "Installation de Certbot pour SSL..."

    case $PACKAGE_MANAGER in
        apt)
            apt install -y certbot python3-certbot-nginx
            ;;
        yum)
            yum install -y certbot python3-certbot-nginx
            ;;
    esac

    log "Certbot installé avec succès"
}

# Configuration du firewall
configure_firewall() {
    log "Configuration du firewall..."

    case $PACKAGE_MANAGER in
        apt)
            # UFW pour Ubuntu/Debian
            ufw --force reset
            ufw default deny incoming
            ufw default allow outgoing

            # Ports nécessaires
            ufw allow ssh
            ufw allow 80/tcp
            ufw allow 443/tcp

            # Activer UFW
            ufw --force enable
            ;;
        yum)
            # FirewallD pour CentOS/RHEL
            systemctl start firewalld
            systemctl enable firewalld

            firewall-cmd --permanent --add-service=ssh
            firewall-cmd --permanent --add-service=http
            firewall-cmd --permanent --add-service=https
            firewall-cmd --reload
            ;;
    esac

    log "Firewall configuré avec succès"
}

# Création de la structure des dossiers
create_directories() {
    log "Création de la structure des dossiers..."

    mkdir -p $APP_DIR
    mkdir -p $APP_DIR/frontend
    mkdir -p $APP_DIR/backend
    mkdir -p $APP_DIR/database
    mkdir -p $APP_DIR/nginx
    mkdir -p $APP_DIR/ssl
    mkdir -p /var/log/no-skills

    log "Dossiers créés avec succès"
}

# Création du fichier Docker Compose
create_docker_compose() {
    log "Création du fichier docker-compose.yml..."

    cat > $APP_DIR/docker-compose.yml << 'EOF'
version: '3.8'

services:
  # Base de données PostgreSQL
  database:
    image: postgres:15-alpine
    container_name: no-skills-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: no_skills
      POSTGRES_USER: no_skills_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - no-skills-network
    ports:
      - "5432:5432"

  # Backend API (Node.js/Express)
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    container_name: no-skills-api
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3001
      DB_HOST: database
      DB_PORT: 5432
      DB_NAME: no_skills
      DB_USER: no_skills_user
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGIN: https://${DOMAIN}
    volumes:
      - ./backend:/app
      - node_modules
      - uploads:uploads
    networks:
      - no-skills-network
    ports:
      - "3001:3001"
    depends_on:
      - database

  # Frontend React
  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    container_name: no-skills-frontend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      REACT_APP_API_URL: https://${DOMAIN}/api
    volumes:
      - ./frontend:/app
      - node_modules
      - dist
    networks:
      - no-skills-network
    ports:
      - "3000:3000"

  # Redis pour les sessions et cache
  redis:
    image: redis:7-alpine
    container_name: no-skills-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - no-skills-network
    ports:
      - "6379:6379"

volumes:
  postgres_data:
  redis_data:
  uploads:

networks:
  no-skills-network:
    driver: bridge
EOF

    log "Fichier docker-compose.yml créé"
}

# Création du fichier d'environnement
create_env_file() {
    log "Création du fichier d'environnement..."

    # Générer des mots de passe sécurisés
    DB_PASSWORD=$(openssl rand -base64 32)
    JWT_SECRET=$(openssl rand -base64 64)
    REDIS_PASSWORD=$(openssl rand -base64 32)

    cat > $APP_DIR/.env << EOF
# Configuration No-Skills
DOMAIN=$DOMAIN
EMAIL=$EMAIL

# Base de données
DB_PASSWORD=$DB_PASSWORD

# JWT
JWT_SECRET=m9cAkixkXU/nKfedP+Ip+RUbSKknafr3RAacqEFW0UK8Qe2pSVKqWR9PyvCZxpkh
SECRET_KEY="eZRrjBrDsGIvR/K3j/KE7g=="



# Redis
REDIS_PASSWORD=$REDIS_PASSWORD

# Mode de production
NODE_ENV=production
EOF

    chmod 600 $APP_DIR/.env
    log "Fichier .env créé avec mots de passe sécurisés"
}

# Configuration de Nginx (sans SSL d'abord)
configure_nginx_http() {
    log "Configuration initiale de Nginx (HTTP seulement)..."

    cat > $NGINX_CONFIG << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Logs
    access_log /var/log/nginx/no-skills.access.log;
    error_log /var/log/nginx/no-skills.error.log;

    # Taille maximale des uploads
    client_max_body_size 50M;

    # Frontend (React)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Gestion des fichiers statiques
        try_files \$uri \$uri/ @fallback;
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Timeout pour les longs traitements
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # WebSocket pour le temps réel
    location /socket.io/ {
        proxy_pass http://localhost:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Gestion des fichiers uploadés
    location /uploads/ {
        proxy_pass http://localhost:3001/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Fallback pour React Router
    location @fallback {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    # Activer le site
    ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/

    # Supprimer le site par défaut
    rm -f /etc/nginx/sites-enabled/default

    # Tester la configuration
    nginx -t

    # Recharger Nginx
    systemctl reload nginx

    log "Configuration Nginx HTTP créée et activée"
}

# Configuration de Nginx avec SSL (après génération des certificats)
configure_nginx_ssl() {
    log "Configuration de Nginx avec SSL..."

    cat > $NGINX_CONFIG << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Redirection vers HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # Certificats SSL
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # Configuration SSL moderne
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # En-têtes de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Logs
    access_log /var/log/nginx/no-skills.access.log;
    error_log /var/log/nginx/no-skills.error.log;

    # Taille maximale des uploads
    client_max_body_size 50M;

    # Frontend (React)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Gestion des fichiers statiques
        try_files \$uri \$uri/ @fallback;
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Timeout pour les longs traitements
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # WebSocket pour le temps réel
    location /socket.io/ {
        proxy_pass http://localhost:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Gestion des fichiers uploadés
    location /uploads/ {
        proxy_pass http://localhost:3001/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Fallback pour React Router
    location @fallback {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    # Activer le site
    ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/

    # Supprimer le site par défaut
    rm -f /etc/nginx/sites-enabled/default

    # Tester la configuration
    nginx -t

    log "Configuration Nginx créée"
}

# Déploiement du code
deploy_code() {
    log "Déploiement du code de l'application..."

    # Copier le frontend (code React)
    if [ -d "./src" ]; then
        log "Copie du code frontend..."

        # Copier TOUS les fichiers source à la racine du contexte Docker
        cp -r ./src "$APP_DIR/" 2>/dev/null || true
        cp -r ./public "$APP_DIR/" 2>/dev/null || mkdir -p "$APP_DIR/public"
        cp ./index.html "$APP_DIR/" 2>/dev/null || true
        cp ./vite.config.ts "$APP_DIR/" 2>/dev/null || true
        cp ./tailwind.config.ts "$APP_DIR/" 2>/dev/null || true
        cp ./postcss.config.js "$APP_DIR/" 2>/dev/null || true
        cp ./tsconfig*.json "$APP_DIR/" 2>/dev/null || true
        cp ./components.json "$APP_DIR/" 2>/dev/null || true
        cp ./package.json "$APP_DIR/" 2>/dev/null || true
        cp ./package-lock.json "$APP_DIR/" 2>/dev/null || true

        # Copier aussi dans le dossier frontend
        cp -r frontend/* frontend/.[!.]* "$APP_DIR/frontend/" 2>/dev/null || true

        # Créer le Dockerfile pour le frontend
        cat > $APP_DIR/frontend/Dockerfile << 'EOF'
FROM node:18-alpine as builder

WORKDIR /app

# Copier package.json depuis le frontend
COPY frontend/package.json ./

# Installer les dépendances
RUN npm install

# Copier tous les fichiers source depuis la racine (copiés par deploy.sh)
COPY index.html ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY tsconfig*.json ./
COPY components.json ./
COPY src/ ./src/
COPY public/ ./public/

# Build de production
RUN npm run build

# Production avec Nginx
FROM nginx:alpine

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
EOF

        # Configuration nginx pour le conteneur frontend
        cat > $APP_DIR/frontend/nginx.conf << 'EOF'
server {
    listen 3000;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gestion de React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache pour les assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Sécurité
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
}
EOF
    fi

    # Créer un backend de base (Node.js/Express)
    mkdir -p $APP_DIR/backend

    cat > $APP_DIR/backend/package.json << 'EOF'
{
  "name": "no-skills-backend",
  "version": "1.0.0",
  "description": "Backend API pour No-Skills",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.3",
    "socket.io": "^4.7.2",
    "multer": "^1.4.4",
    "redis": "^4.6.7",
    "dotenv": "^16.3.1",
    "express-rate-limit": "^6.10.0",
    "express-validator": "^7.0.1"
  }
}
EOF

    cat > $APP_DIR/backend/server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes de base
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API No-Skills fonctionnelle!' });
});

// Gestion des WebSockets
io.on('connection', (socket) => {
  console.log('Utilisateur connecté:', socket.id);

  socket.on('disconnect', () => {
    console.log('Utilisateur déconnecté:', socket.id);
  });
});

// Démarrage du serveur
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur No-Skills démarré sur le port ${PORT}`);
});
EOF

    cat > $APP_DIR/backend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances depuis le backend
COPY backend/package*.json ./

# Installer les dépendances
RUN npm install --only=production

# Copier le code source du backend
COPY backend/ ./

# Créer le dossier uploads
RUN mkdir -p uploads

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Changer le propriétaire des fichiers
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3001

CMD ["npm", "start"]
EOF

    # Script SQL d'initialisation
    cat > $APP_DIR/database/init.sql << 'EOF'
-- Création de la base de données No-Skills
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des utilisateurs
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pseudo VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 15),
    bio TEXT,
    avatar_url VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin', 'owner')),
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des discussions
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100),
    type VARCHAR(20) NOT NULL CHECK (type IN ('private', 'group', 'staff')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_visible BOOLEAN DEFAULT true
);

-- Table des messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    author_id UUID REFERENCES users(id),
    chat_id UUID REFERENCES chats(id),
    reply_to UUID REFERENCES messages(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);

-- Créer l'utilisateur owner par défaut
INSERT INTO users (pseudo, email, password_hash, age, role) VALUES
('Yupi', 'yupi@no-skills.fr', '$2a$10$YourHashedPasswordHere', 25, 'owner');

-- Index pour les performances
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_pseudo ON users(pseudo);
EOF

    log "Code de l'application déployé"
}

# Génération du certificat SSL
generate_ssl() {
    log "Génération du certificat SSL..."

    # Vérifier d'abord si le certificat existe déjà
    if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
        log "Certificat SSL existant trouvé"
        configure_nginx_ssl
        systemctl reload nginx
        return 0
    fi

    # S'assurer que nginx fonctionne pour le défi HTTP
    systemctl reload nginx

    # Tentative 1: Utiliser le plugin nginx
    log "Tentative de génération SSL avec le plugin nginx..."
    if certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive --redirect; then
        log "✅ Certificat SSL généré avec succès (méthode nginx)"
    else
        warning "Échec avec le plugin nginx, essai avec webroot..."

        # Tentative 2: Méthode webroot
        mkdir -p /var/www/html/.well-known/acme-challenge
        chown -R www-data:www-data /var/www/html

        if certbot certonly --webroot -w /var/www/html -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive; then
            log "✅ Certificat SSL généré avec succès (méthode webroot)"
            configure_nginx_ssl
            systemctl reload nginx
        else
            warning "Échec avec webroot, essai avec standalone..."

            # Tentative 3: Méthode standalone
            systemctl stop nginx

            if certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive; then
                log "✅ Certificat SSL généré avec succès (méthode standalone)"
                configure_nginx_ssl
                systemctl start nginx
            else
                error "⚠️  Échec de la génération du certificat SSL avec toutes les méthodes"
                warning "Le site restera en HTTP. Vous pourrez générer le SSL plus tard avec:"
                warning "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
                systemctl start nginx
                return 1
            fi
        fi
    fi

    # Programmer le renouvellement automatique
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --nginx") | crontab -

    log "✅ Certificat SSL configuré et renouvellement programmé"
}

# Démarrage des services
start_services() {
    log "Démarrage des services..."

    cd $APP_DIR

    # Arrêter les anciens conteneurs s'ils existent
    docker-compose down 2>/dev/null || true

    # Construire et démarrer les conteneurs
    log "Construction et démarrage des conteneurs..."
    docker-compose up -d --build

    # Attendre que les services démarrent
    log "Attente du démarrage des services..."

    # Vérification progressive des services
    local max_attempts=60
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        attempt=$((attempt + 1))

        # Vérifier si tous les conteneurs sont en cours d'exécution
        if docker-compose ps | grep -q "Up"; then
            log "Services en cours de démarrage... ($attempt/$max_attempts)"

            # Test de connectivité
            if curl -s http://localhost:3001/health > /dev/null 2>&1; then
                log "✅ Backend accessible"
                break
            fi
        fi

        if [ $attempt -eq $max_attempts ]; then
            error "Timeout: Les services n'ont pas démarré dans les temps"
            docker-compose logs
            exit 1
        fi

        sleep 2
    done

    # Vérifier le statut final
    docker-compose ps

    # Afficher les logs en cas de problème
    if ! docker-compose ps | grep -q "Up"; then
        error "Certains services ne sont pas démarrés correctement"
        docker-compose logs
        exit 1
    fi

    log "✅ Services démarrés avec succès"
}

# Configuration des logs et monitoring
setup_monitoring() {
    log "Configuration du monitoring..."

    # Logrotate pour les logs nginx
    cat > /etc/logrotate.d/no-skills << 'EOF'
/var/log/nginx/no-skills*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
EOF

    # Script de monitoring simple
    cat > /usr/local/bin/no-skills-status << 'EOF'
#!/bin/bash
echo "=== No-Skills Status ==="
echo "Date: $(date)"
echo ""
echo "=== Services Docker ==="
cd /var/www/no-skills
docker-compose ps
echo ""
echo "=== Utilisation disque ==="
df -h
echo ""
echo "=== Utilisation mémoire ==="
free -h
echo ""
echo "=== Derniers logs nginx ==="
tail -n 10 /var/log/nginx/no-skills.error.log
EOF
    chmod +x /usr/local/bin/no-skills-status

    log "Monitoring configuré"
}

# Fonction principale
main() {
    log "🚀 Début du déploiement automatique de No-Skills"

    # Vérifications préliminaires
    check_root
    check_distribution

    # Installation des dépendances système
    log "📦 Installation des dépendances système..."
    update_system
    install_docker
    install_docker_compose
    install_nginx
    install_certbot
    configure_firewall

    # Préparation de l'environnement
    log "🏗️  Préparation de l'environnement..."
    create_directories
    create_docker_compose
    create_env_file
    configure_nginx_http
    deploy_code

    # Vérification DNS (avec possibilité de skip)
    check_dns

    # Démarrage des services
    log "🚀 Démarrage des services Docker..."
    start_services

    # Configuration SSL (tentative automatique)
    log "🔒 Configuration SSL..."
    if generate_ssl; then
        SSL_PROTOCOL="https"
    else
        SSL_PROTOCOL="http"
        warning "Site accessible en HTTP seulement pour le moment"
    fi

    # Configuration du monitoring
    setup_monitoring

    # Rapport final
    log "✅ Déploiement terminé avec succès!"

    echo ""
    echo "========================================="
    echo "🎉 NO-SKILLS DÉPLOYÉ AVEC SUCCÈS!"
    echo "========================================="
    echo "🌐 URL: $SSL_PROTOCOL://$DOMAIN"
    echo "📁 Dossier: $APP_DIR"
    echo "🔑 Fichier env: $APP_DIR/.env"
    echo "📊 Status: no-skills-status"
    echo "🔄 Restart: cd $APP_DIR && docker-compose restart"
    echo "📋 Logs: cd $APP_DIR && docker-compose logs -f"
    echo ""
    echo "🔧 Commandes utiles:"
    echo "   • Vérifier les services: docker-compose ps"
    echo "   • Voir les logs: docker-compose logs -f [service]"
    echo "   • Redémarrer: docker-compose restart"
    echo "   • Mettre à jour: git pull && docker-compose up -d --build"

    if [[ "$SSL_PROTOCOL" == "http" ]]; then
        echo ""
        echo "⚠️  Pour activer HTTPS plus tard:"
        echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
    fi

    echo "========================================="
}

# Gestion des arguments en ligne de commande
while getopts "has" opt; do
    case $opt in
        h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -h          Afficher cette aide"
            echo "  -a          Déploiement automatique (skip DNS check)"
            echo "  -s          Skip DNS check (permet de continuer sans DNS configuré)"
            echo ""
            echo "Variables d'environnement:"
            echo "  AUTO_DEPLOY=true     Déploiement automatique complet"
            echo "  SKIP_DNS_CHECK=true  Ignorer la vérification DNS"
            echo ""
            echo "Exemples:"
            echo "  sudo ./deploy.sh              # Déploiement interactif"
            echo "  sudo ./deploy.sh -a           # Déploiement automatique"
            echo "  sudo ./deploy.sh -s           # Skip DNS check"
            echo "  sudo AUTO_DEPLOY=true ./deploy.sh"
            exit 0
            ;;
        a)
            AUTO_DEPLOY=true
            SKIP_DNS_CHECK=true
            ;;
        s)
            SKIP_DNS_CHECK=true
            ;;
        \?)
            echo "Option invalide: -$OPTARG" >&2
            echo "Utilisez -h pour l'aide"
            exit 1
            ;;
    esac
done

# Afficher la configuration
if [[ "$AUTO_DEPLOY" == "true" ]]; then
    log "🤖 Mode de déploiement automatique activé"
fi

if [[ "$SKIP_DNS_CHECK" == "true" ]]; then
    log "⏭️  Vérification DNS désactivée"
fi

# Exécution du script principal
main "$@"
