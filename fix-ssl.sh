#!/bin/bash

# ========================================
# SCRIPT DE DÉPANNAGE SSL POUR NO-SKILLS
# Répare les problèmes de certificats SSL
# ========================================

set -e

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOMAIN="no-skills.fr"
EMAIL="contact@no-skills.fr"
NGINX_CONFIG="/etc/nginx/sites-available/no-skills"

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
if [[ $EUID -ne 0 ]]; then
    error "Ce script doit être exécuté en tant que root (sudo ./fix-ssl.sh)"
    exit 1
fi

log "🔧 Début du dépannage SSL pour No-Skills"

# Étape 1: Vérifier l'état actuel
log "Vérification de l'état actuel..."

# Vérifier DNS
log "Test de résolution DNS..."
if nslookup $DOMAIN > /dev/null 2>&1; then
    log "✅ DNS résolu correctement"
else
    error "❌ Problème de résolution DNS pour $DOMAIN"
    exit 1
fi

# Étape 2: Arrêter nginx
log "Arrêt de nginx..."
systemctl stop nginx

# Étape 3: Nettoyer les anciens certificats si ils existent
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    warning "Suppression des anciens certificats..."
    certbot delete --cert-name $DOMAIN --non-interactive
fi

# Étape 4: Configurer nginx en HTTP seulement
log "Configuration de nginx en HTTP..."

cat > $NGINX_CONFIG << 'EOF'
server {
    listen 80;
    server_name no-skills.fr www.no-skills.fr;
    
    # Logs
    access_log /var/log/nginx/no-skills.access.log;
    error_log /var/log/nginx/no-skills.error.log;
    
    # Taille maximale des uploads
    client_max_body_size 50M;
    
    # Frontend (React)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Gestion des fichiers statiques
        try_files $uri $uri/ @fallback;
    }
    
    # API Backend
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout pour les longs traitements
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
    
    # WebSocket pour le temps réel
    location /socket.io/ {
        proxy_pass http://localhost:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_Set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Activer le site
ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Tester la configuration
if nginx -t; then
    log "✅ Configuration nginx valide"
else
    error "❌ Configuration nginx invalide"
    exit 1
fi

# Étape 5: Démarrer nginx
log "Démarrage de nginx..."
systemctl start nginx

# Vérifier que nginx fonctionne
if systemctl is-active --quiet nginx; then
    log "✅ Nginx démarré avec succès"
else
    error "❌ Échec du démarrage de nginx"
    exit 1
fi

# Étape 6: Générer les certificats SSL
log "Génération des certificats SSL..."

# Méthode 1: Avec le plugin nginx (recommandée)
if certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive --redirect; then
    log "✅ Certificats générés avec succès via le plugin nginx"
else
    warning "Échec avec le plugin nginx, essai avec standalone..."
    
    # Arrêter nginx temporairement
    systemctl stop nginx
    
    # Méthode 2: Standalone
    if certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive; then
        log "✅ Certificats générés avec succès via standalone"
        
        # Reconfigurer nginx avec SSL
        log "Reconfiguration de nginx avec SSL..."
        
        cat > $NGINX_CONFIG << 'EOF'
server {
    listen 80;
    server_name no-skills.fr www.no-skills.fr;
    
    # Redirection vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name no-skills.fr www.no-skills.fr;
    
    # Certificats SSL
    ssl_certificate /etc/letsencrypt/live/no-skills.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/no-skills.fr/privkey.pem;
    
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
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Gestion des fichiers statiques
        try_files $uri $uri/ @fallback;
    }
    
    # API Backend
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout pour les longs traitements
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
    
    # WebSocket pour le temps réel
    location /socket.io/ {
        proxy_pass http://localhost:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_Set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_Set_header X-Forwarded-Proto $scheme;
    }
}
EOF
        
        # Tester la nouvelle configuration
        if nginx -t; then
            systemctl start nginx
            log "✅ Nginx reconfiguré avec SSL"
        else
            error "❌ Erreur dans la configuration SSL"
            exit 1
        fi
    else
        error "❌ Échec de la génération des certificats SSL"
        systemctl start nginx
        exit 1
    fi
fi

# Étape 7: Programmer le renouvellement automatique
log "Configuration du renouvellement automatique..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Étape 8: Vérifications finales
log "Vérifications finales..."

# Vérifier nginx
if systemctl is-active --quiet nginx; then
    log "✅ Nginx opérationnel"
else
    error "❌ Nginx ne fonctionne pas"
fi

# Vérifier les certificats
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    log "✅ Certificats SSL présents"
    
    # Afficher les informations du certificat
    CERT_EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem | cut -d= -f2)
    log "📅 Expiration du certificat: $CERT_EXPIRY"
else
    warning "⚠️  Certificats SSL non trouvés"
fi

# Test de connectivité
log "Test de connectivité..."
if curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN | grep -q "301\|200"; then
    log "✅ Site accessible en HTTP"
else
    warning "⚠️  Problème d'accès HTTP"
fi

if command -v openssl >/dev/null 2>&1; then
    if echo | timeout 5 openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | grep -q "BEGIN CERTIFICATE"; then
        log "✅ SSL fonctionne correctement"
    else
        warning "⚠️  Problème avec SSL"
    fi
fi

log "🎉 Dépannage SSL terminé!"

echo ""
echo "========================================="
echo "🎉 SSL RÉPARÉ AVEC SUCCÈS!"
echo "========================================="
echo "🌐 Test HTTP: curl -I http://$DOMAIN"
echo "🔒 Test HTTPS: curl -I https://$DOMAIN"
echo "📋 Statut nginx: systemctl status nginx"
echo "📃 Logs nginx: tail -f /var/log/nginx/no-skills.error.log"
echo "🔐 Certificats: certbot certificates"
echo "========================================="
