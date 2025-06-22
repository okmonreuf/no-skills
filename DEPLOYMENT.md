# 🚀 Guide de Déploiement No-Skills

Ce guide vous permet de déployer l'application No-Skills sur un serveur VPS Ubuntu/Debian de manière **100% automatique**.

## 🚀 Déploiement Express (Recommandé)

### Prérequis

- VPS Ubuntu 20.04+ ou Debian 10+
- Nom de domaine (no-skills.fr)
- Accès root au serveur

### Déploiement en une commande

```bash
# Télécharger et exécuter le déploiement automatique
curl -sSL https://raw.githubusercontent.com/votre-repo/no-skills/main/deploy.sh | sudo bash -s -- -a
```

**OU** téléchargez les fichiers manuellement :

```bash
# 1. Télécharger les fichiers
git clone https://github.com/votre-repo/no-skills.git
cd no-skills

# 2. Rendre exécutable
chmod +x deploy.sh

# 3. Déploiement automatique
sudo ./deploy.sh -a
```

## 📋 Options de Déploiement

### Mode Interactif (Par défaut)

```bash
sudo ./deploy.sh
```

- Demande confirmation avant chaque étape
- Vérification DNS interactive
- Idéal pour le premier déploiement

### Mode Automatique

```bash
sudo ./deploy.sh -a
```

- Déploiement 100% automatique
- Skip la vérification DNS
- Parfait pour les scripts CI/CD

### Mode Skip DNS

```bash
sudo ./deploy.sh -s
```

- Ignore la vérification DNS
- Utile si le DNS n'est pas encore configuré
- L'application fonctionnera en HTTP

### Variables d'environnement

```bash
# Déploiement complètement automatique
sudo AUTO_DEPLOY=true ./deploy.sh

# Skip seulement la vérification DNS
sudo SKIP_DNS_CHECK=true ./deploy.sh
```

## 🔄 Mise à Jour Automatique

### Script de mise à jour inclus

```bash
# Mise à jour complète avec backup
sudo ./update.sh

# Mise à jour sans backup
sudo ./update.sh --no-backup

# Mise à jour sans nettoyage Docker
sudo ./update.sh --no-cleanup
```

Le script de mise à jour :

- ✅ Crée automatiquement un backup
- ✅ Met à jour le code depuis Git
- ✅ Reconstruit les conteneurs
- ✅ Vérifie la santé de l'application
- ✅ Nettoie les ressources Docker

## 🛡️ Configuration DNS

Si vous voulez configurer le DNS avant le déploiement :

1. **Obtenez l'IP de votre serveur** :

   ```bash
   curl ifconfig.me
   ```

2. **Configurez vos enregistrements DNS** :

   - `no-skills.fr` → `VOTRE_IP_SERVEUR`
   - `www.no-skills.fr` → `VOTRE_IP_SERVEUR`

3. **Vérifiez la propagation** :
   ```bash
   dig no-skills.fr @8.8.8.8
   ```

> **Note** : Le script peut déployer sans DNS configuré et générer le SSL plus tard !

## 📊 Ce que fait le script automatiquement

### 🔧 Installation Système

- ✅ Mise à jour du système (Ubuntu/Debian/CentOS)
- ✅ Installation Docker + Docker Compose
- ✅ Installation Nginx + Certbot
- ✅ Configuration firewall (UFW/FirewallD)
- ✅ Création de la structure de dossiers

### 🐳 Configuration Docker

- ✅ Génération docker-compose.yml optimisé
- ✅ Variables d'environnement sécurisées
- ✅ 4 services : Frontend, Backend, PostgreSQL, Redis
- ✅ Volumes persistants + réseaux isolés

### 🌐 Configuration Web

- ✅ Configuration Nginx avec proxy reverse
- ✅ Support WebSocket + uploads
- ✅ Headers de sécurité modernes
- ✅ Certificats SSL automatiques (3 méthodes)

### 📈 Monitoring & Logs

- ✅ Rotation des logs automatique
- ✅ Script de statut personnalisé
- ✅ Health checks des services
- ✅ Cron de renouvellement SSL

## 🏗️ Structure des Services

### 🗄️ PostgreSQL Database

- **Port** : 5432 (interne)
- **Volume** : `postgres_data`
- **Init** : Schema + utilisateur Yupi

### 🔗 Node.js Backend

- **Port** : 3001 (interne)
- **Features** : API + WebSocket + Auth
- **Volume** : `uploads` pour les fichiers

### 🌐 React Frontend

- **Port** : 3000 (interne)
- **Build** : Production + Nginx
- **Features** : SPA + React Router

### 🔄 Redis Cache

- **Port** : 6379 (interne)
- **Usage** : Sessions + Cache

## 💻 Commandes Post-Déploiement

### Vérification rapide

```bash
# Script de statut intégré
no-skills-status

# Vérifier les services
cd /var/www/no-skills && docker-compose ps

# Voir les logs en temps réel
docker-compose logs -f
```

### Gestion des services

```bash
cd /var/www/no-skills

# Redémarrer tout
docker-compose restart

# Redémarrer un service spécifique
docker-compose restart backend

# Voir les logs d'un service
docker-compose logs -f frontend

# Reconstruire après changement
docker-compose up -d --build
```

### SSL et certificats

```bash
# Forcer renouvellement SSL
sudo certbot renew --force-renewal

# Voir les certificats
sudo certbot certificates

# Réparer SSL si problème
sudo ./fix-ssl.sh
```

## 🔧 Dépannage Avancé

### Problèmes de démarrage

```bash
# Logs détaillés
docker-compose logs --tail=100

# Redémarrage complet
docker-compose down && docker-compose up -d

# Vérifier les ports
netstat -tlnp | grep -E ':80|:443|:3000|:3001'
```

### Problèmes SSL

```bash
# Vérifier la configuration Nginx
sudo nginx -t

# Tester SSL
curl -I https://no-skills.fr

# Forcer régénération
sudo certbot delete --cert-name no-skills.fr
sudo certbot --nginx -d no-skills.fr -d www.no-skills.fr
```

### Problèmes de base de données

```bash
# Accéder à PostgreSQL
docker-compose exec database psql -U no_skills_user -d no_skills

# Voir les logs de la DB
docker-compose logs database

# Backup manuel
docker-compose exec database pg_dump -U no_skills_user no_skills > backup.sql
```

## 📈 Monitoring & Maintenance

### Logs importants

```bash
# Logs applicatifs
docker-compose logs -f backend frontend

# Logs Nginx
tail -f /var/log/nginx/no-skills.access.log
tail -f /var/log/nginx/no-skills.error.log

# Logs système
journalctl -u docker -f
```

### Surveillance automatique

```bash
# Ajout d'un cron de surveillance (optionnel)
echo "*/5 * * * * cd /var/www/no-skills && docker-compose ps | grep -q 'Up' || docker-compose restart" | sudo crontab -
```

### Backups automatiques

```bash
# Script de backup quotidien
cat > /usr/local/bin/no-skills-backup << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/no-skills/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"
cd /var/www/no-skills
docker-compose exec -T database pg_dump -U no_skills_user no_skills > "$BACKUP_DIR/db.sql"
cp .env "$BACKUP_DIR/"
tar -czf "$BACKUP_DIR/uploads.tar.gz" uploads/ 2>/dev/null || true
find /var/backups/no-skills -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true
EOF

chmod +x /usr/local/bin/no-skills-backup

# Ajouter au cron (3h du matin tous les jours)
echo "0 3 * * * /usr/local/bin/no-skills-backup" | sudo crontab -
```

## 🚨 Support Urgence

### Restauration rapide

```bash
# Stopper tout
docker-compose down

# Supprimer et recréer
docker-compose down -v
docker-compose up -d --build

# Restaurer depuis backup
docker-compose exec -T database psql -U no_skills_user -d no_skills < backup.sql
```

### Contact Support

En cas de problème critique :

1. **Collectez les informations** :

   ```bash
   no-skills-status > debug.log
   docker-compose logs >> debug.log
   ```

2. **Informations système** :

   ```bash
   uname -a >> debug.log
   df -h >> debug.log
   free -h >> debug.log
   ```

3. **Envoyez le fichier `debug.log`** avec votre demande de support

## 📱 Configuration Termius (Recommandé)

### Connexion SSH optimisée

1. **Nouveau Host** dans Termius :

   - **Label** : No-Skills Production
   - **Address** : IP de votre VPS
   - **Username** : root
   - **Port** : 22

2. **Scripts rapides** (dans Termius Snippets) :

   ```bash
   # Statut rapide
   cd /var/www/no-skills && docker-compose ps

   # Logs en temps réel
   cd /var/www/no-skills && docker-compose logs -f

   # Redémarrage complet
   cd /var/www/no-skills && docker-compose restart

   # Mise à jour
   cd /var/www/no-skills && ./update.sh
   ```

3. **Port Forwarding** (optionnel) :
   - **Local** : 5432 → **Remote** : 5432 (PostgreSQL)
   - **Local** : 6379 → **Remote** : 6379 (Redis)

## 🔄 Workflow CI/CD (Avancé)

### GitHub Actions Example

```yaml
name: Deploy No-Skills
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to production
        uses: appleboy/ssh-action@v0.1.7
        with:
          host: ${{ secrets.HOST }}
          username: root
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/no-skills
            git pull origin main
            ./update.sh --no-backup
```

---

## 🏆 Architecture de Production

### Stack Technologique

- **Frontend** : React 18 + TypeScript + Tailwind CSS + Vite
- **Backend** : Node.js 18 + Express + Socket.io + JWT
- **Database** : PostgreSQL 15 + Redis 7
- **Proxy** : Nginx + Let's Encrypt SSL
- **Containers** : Docker + Docker Compose
- **Monitoring** : Custom scripts + Logrotate

### Sécurité Intégrée

- 🔒 Certificats SSL automatiques (3 méthodes de fallback)
- 🛡️ Headers de sécurité modernes (HSTS, CSP, etc.)
- 🔥 Firewall configuré automatiquement
- 🔑 Mots de passe générés automatiquement (32+ caractères)
- 👤 Conteneurs non-root
- 🚫 Rate limiting API intégré

### Performance Optimisée

- ⚡ Build de production Vite optimisé
- 🗜️ Compression gzip/brotli activée
- 💾 Cache Redis pour sessions
- 🎯 Connection pooling PostgreSQL
- 📦 Images Docker Alpine (légères)
- 🔄 Health checks automatiques

### Monitoring Intégré

- 📊 Script de statut personnalisé (`no-skills-status`)
- 📝 Rotation automatique des logs
- 🔄 Renouvellement SSL automatique
- 📈 Health checks des conteneurs
- 🚨 Alertes en cas de problème

Cette architecture garantit une application **moderne**, **sécurisée** et **performante** prête pour la production avec **zéro configuration manuelle** ! 🎉

## 🎯 FAQ & Troubleshooting

### Questions Fréquentes

**Q: Puis-je déployer sans nom de domaine ?**
R: Oui ! Utilisez `sudo ./deploy.sh -s` et accédez via l'IP du serveur.

**Q: Comment changer le nom de domaine ?**
R: Modifiez la variable `DOMAIN` dans `deploy.sh` et relancez le script.

**Q: Le déploiement échoue, que faire ?**
R: Utilisez `no-skills-status` et `docker-compose logs` pour diagnostiquer.

**Q: Comment migrer vers un nouveau serveur ?**
R: Sauvegardez avec `./update.sh`, copiez le dossier `/var/www/no-skills` et relancez.

**Q: Peut-on utiliser un CDN ?**
R: Oui ! Cloudflare fonctionne parfaitement avec cette configuration.

### Support

Pour toute assistance, collectez les logs avec `no-skills-status > debug.log` et contactez l'équipe technique.
