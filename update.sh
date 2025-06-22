#!/bin/bash

# ========================================
# SCRIPT DE MISE À JOUR NO-SKILLS
# Mise à jour automatique de l'application
# ========================================

set -e  # Arrêter le script en cas d'erreur

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/no-skills"
BACKUP_DIR="/var/backups/no-skills"

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
        error "Ce script doit être exécuté en tant que root (sudo ./update.sh)"
        exit 1
    fi
}

# Créer un backup avant la mise à jour
create_backup() {
    log "Création du backup..."
    
    # Créer le dossier de backup avec timestamp
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    CURRENT_BACKUP="$BACKUP_DIR/$TIMESTAMP"
    mkdir -p "$CURRENT_BACKUP"
    
    # Backup de la base de données
    if docker-compose -f $APP_DIR/docker-compose.yml exec -T database pg_dump -U no_skills_user no_skills > "$CURRENT_BACKUP/database.sql" 2>/dev/null; then
        log "✅ Backup de la base de données créé"
    else
        warning "⚠️  Impossible de créer le backup de la base de données"
    fi
    
    # Backup des fichiers uploadés
    if [ -d "$APP_DIR/uploads" ]; then
        cp -r "$APP_DIR/uploads" "$CURRENT_BACKUP/" 2>/dev/null || true
        log "✅ Backup des fichiers uploadés créé"
    fi
    
    # Backup de la configuration
    cp "$APP_DIR/.env" "$CURRENT_BACKUP/" 2>/dev/null || true
    cp "$APP_DIR/docker-compose.yml" "$CURRENT_BACKUP/" 2>/dev/null || true
    
    # Garder seulement les 5 derniers backups
    ls -dt $BACKUP_DIR/*/ | tail -n +6 | xargs rm -rf 2>/dev/null || true
    
    log "✅ Backup créé dans $CURRENT_BACKUP"
}

# Mise à jour du code depuis Git
update_code() {
    log "Mise à jour du code..."
    
    cd "$APP_DIR"
    
    # Vérifier si c'est un repo git
    if [ ! -d ".git" ]; then
        warning "Pas de repository Git trouvé, copie manuelle du code nécessaire"
        return 1
    fi
    
    # Sauvegarder les modifications locales
    git stash push -m "Auto-stash avant mise à jour $(date)"
    
    # Récupérer les dernières modifications
    git fetch origin
    git pull origin main
    
    log "✅ Code mis à jour"
}

# Reconstruire et redémarrer les services
rebuild_services() {
    log "Reconstruction et redémarrage des services..."
    
    cd "$APP_DIR"
    
    # Arrêter les services
    docker-compose down
    
    # Supprimer les anciennes images pour forcer la reconstruction
    docker-compose build --no-cache
    
    # Redémarrer les services
    docker-compose up -d
    
    # Attendre que les services démarrent
    log "Attente du redémarrage des services..."
    sleep 30
    
    # Vérifier que tout fonctionne
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        log "✅ Services redémarrés avec succès"
    else
        error "❌ Problème détecté lors du redémarrage"
        return 1
    fi
}

# Nettoyage des ressources Docker
cleanup_docker() {
    log "Nettoyage des ressources Docker..."
    
    # Supprimer les images non utilisées
    docker image prune -f
    
    # Supprimer les volumes non utilisés
    docker volume prune -f
    
    log "✅ Nettoyage terminé"
}

# Vérification de santé post-mise à jour
health_check() {
    log "Vérification de santé de l'application..."
    
    cd "$APP_DIR"
    
    # Vérifier le statut des conteneurs
    if ! docker-compose ps | grep -q "Up"; then
        error "❌ Certains conteneurs ne sont pas en cours d'exécution"
        docker-compose logs
        return 1
    fi
    
    # Test de l'API
    if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
        error "❌ L'API ne répond pas"
        return 1
    fi
    
    # Test du frontend
    if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
        error "❌ Le frontend ne répond pas"
        return 1
    fi
    
    log "✅ Tous les services fonctionnent correctement"
}

# Afficher le statut final
show_status() {
    log "Statut de l'application:"
    
    cd "$APP_DIR"
    
    echo ""
    echo "========================================="
    echo "📊 STATUT POST-MISE À JOUR"
    echo "========================================="
    
    # Statut des conteneurs
    echo "🐳 Conteneurs Docker:"
    docker-compose ps
    
    echo ""
    echo "💾 Utilisation disque:"
    df -h / | tail -1
    
    echo ""
    echo "🧠 Utilisation mémoire:"
    free -h | grep "Mem:"
    
    echo ""
    echo "🔗 URLs:"
    echo "   • Frontend: http://localhost:3000"
    echo "   • Backend:  http://localhost:3001"
    echo "   • Health:   http://localhost:3001/health"
    
    echo ""
    echo "📋 Commandes utiles:"
    echo "   • Logs: docker-compose logs -f [service]"
    echo "   • Restart: docker-compose restart [service]"
    echo "   • Status: docker-compose ps"
    
    echo "========================================="
}

# Fonction principale
main() {
    log "🔄 Début de la mise à jour de No-Skills"
    
    check_root
    
    # Vérifier que l'application est installée
    if [ ! -d "$APP_DIR" ]; then
        error "Application No-Skills non trouvée dans $APP_DIR"
        error "Exécutez d'abord le script de déploiement: ./deploy.sh"
        exit 1
    fi
    
    cd "$APP_DIR"
    
    # Créer un backup
    create_backup
    
    # Mise à jour du code
    if update_code; then
        log "Code mis à jour depuis Git"
    else
        warning "Mise à jour manuelle du code nécessaire"
    fi
    
    # Reconstruction des services
    rebuild_services
    
    # Nettoyage
    cleanup_docker
    
    # Vérification finale
    if health_check; then
        log "✅ Mise à jour terminée avec succès!"
        show_status
    else
        error "❌ Problème détecté après la mise à jour"
        warning "Vérifiez les logs: docker-compose logs"
        exit 1
    fi
}

# Gestion des arguments
case "${1:-}" in
    -h|--help)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Met à jour l'application No-Skills automatiquement"
        echo ""
        echo "Options:"
        echo "  -h, --help    Afficher cette aide"
        echo "  --no-backup   Skip la création de backup"
        echo "  --no-cleanup  Skip le nettoyage Docker"
        echo ""
        echo "Exemples:"
        echo "  sudo ./update.sh              # Mise à jour complète"
        echo "  sudo ./update.sh --no-backup  # Sans backup"
        exit 0
        ;;
    --no-backup)
        create_backup() { log "Backup ignoré"; }
        ;;
    --no-cleanup)
        cleanup_docker() { log "Nettoyage ignoré"; }
        ;;
esac

# Exécution
main "$@"
