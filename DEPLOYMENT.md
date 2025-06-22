# 🚀 Guide de Déploiement No-Skills

Ce guide vous explique comment déployer l'application No-Skills sur un VPS Linux en utilisant le script `deploy.sh`.

## 📋 Prérequis

### VPS Recommandé

- **RAM**: Minimum 2GB (4GB recommandé)
- **Stockage**: Minimum 20GB SSD
- **Bande passante**: Illimitée
- **IPv4**: Adresse IP fixe

### Distribution Linux Recommandée

**Ubuntu Server 22.04 LTS** (recommandé)

- Stable et bien supportée
- Docker officiellement supporté
- Mises à jour de sécurité longues

**Alternatives compatibles:**

- Ubuntu Server 20.04 LTS
- Debian 11 (Bullseye)
- Debian 12 (Bookworm)
- CentOS 8/9 (si nécessaire)

## 🛠️ Préparation du VPS

### 1. Configuration DNS

Avant le déploiement, configurez votre DNS :

```bash
# Enregistrements DNS requis
no-skills.fr        A    [IP_DE_VOTRE_VPS]
www.no-skills.fr    A    [IP_DE_VOTRE_VPS]
```

### 2. Connexion SSH avec Termius

Dans **Termius** :

1. Créez une nouvelle connexion
2. **Hostname**: IP de votre VPS
3. **Username**: `root` (ou votre utilisateur avec sudo)
4. **Port**: 22 (par défaut)
5. **Authentication**: Clé SSH ou mot de passe

```bash
# Test de connexion
ssh root@votre-ip-vps
```

## 🚀 Déploiement avec deploy.sh

### 1. Transfert du code

**Option A: Via Git (recommandé)**

```bash
# Sur votre VPS
cd /tmp
git clone https://github.com/votre-username/no-skills.git
cd no-skills
```

**Option B: Via Termius (transfert de fichiers)**

1. Dans Termius, utilisez le SFTP
2. Uploadez tous les fichiers du projet
3. Placez-les dans `/tmp/no-skills/`

### 2. Exécution du script de déploiement

```bash
# Rendre le script exécutable
chmod +x deploy.sh

# Lancer le déploiement (en tant que root)
sudo ./deploy.sh
```

### 3. Processus automatisé

Le script va automatiquement :

1. ✅ **Vérifier le système** (Ubuntu/Debian/CentOS)
2. ✅ **Mettre à jour** le système
3. ✅ **Installer Docker** et Docker Compose
4. ✅ **Installer Nginx** et Certbot
5. ✅ **Configurer le firewall** (UFW/FirewallD)
6. ✅ **Créer la structure** de dossiers
7. ✅ **Générer docker-compose.yml** complet
8. ✅ **Créer les variables** d'environnement sécurisées
9. ✅ **Configurer Nginx** avec proxy reverse
10. ✅ **Déployer le code** frontend/backend
11. ✅ **Générer les certificats SSL** (Let's Encrypt)
12. ✅ **Démarrer tous les services**

## 🏗️ Architecture Déployée

```
┌─────────────────────────────────────────┐
│                INTERNET                 │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│              NGINX                      │
│         (Proxy Reverse)                 │
│    Port 80/443 + Certificats SSL       │
└─────────────┬───────────┬───────────────┘
              │           │
    ┌─────────▼─────────┐ │
    │   FRONTEND        │ │
    │   (React App)     │ │
    │   Port 3000       │ │
    └───────────────────┘ │
                          │
              ┌───────────▼───────────┐
              │      BACKEND          │
              │   (Node.js/Express)   │
              │      Port 3001        │
              └─────────┬─────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼─────┐
│ POSTGRESQL   │ │    REDIS    │ │  UPLOADS  │
│ (Database)   │ │   (Cache)   │ │ (Files)   │
│ Port 5432    │ │ Port 6379   │ │  Volume   │
└──────────────┘ └─────────────┘ └───────────┘
```

## 🔧 Commandes Utiles Post-Déploiement

### Gestion des services

```bash
# Aller dans le dossier de l'app
cd /var/www/no-skills

# Voir le statut des conteneurs
docker-compose ps

# Voir les logs
docker-compose logs -f

# Redémarrer tous les services
docker-compose restart

# Arrêter tous les services
docker-compose down

# Redémarrer un service spécifique
docker-compose restart frontend
docker-compose restart backend
```

### Monitoring

```bash
# Script de statut personnalisé
no-skills-status

# Logs Nginx
tail -f /var/log/nginx/no-skills.access.log
tail -f /var/log/nginx/no-skills.error.log

# Utilisation des ressources
htop
df -h
free -h
```

### Maintenance

```bash
# Mise à jour du code
cd /var/www/no-skills
git pull origin main
docker-compose down
docker-compose up -d --build

# Sauvegarde de la base de données
docker-compose exec database pg_dump -U no_skills_user no_skills > backup_$(date +%Y%m%d_%H%M%S).sql

# Nettoyage Docker
docker system prune -f
docker volume prune -f
```

## 🔒 Sécurité

### Firewall

```bash
# Vérifier le statut UFW (Ubuntu/Debian)
ufw status

# Voir les règles actives
iptables -L
```

### SSL/TLS

```bash
# Vérifier les certificats
certbot certificates

# Renouvellement manuel
certbot renew

# Test du renouvellement
certbot renew --dry-run
```

### Mots de passe

Les mots de passe sont générés automatiquement et stockés dans :

```bash
cat /var/www/no-skills/.env
```

## 🐛 Dépannage

### Problèmes courants

**1. DNS non configuré**

```bash
# Vérifier la résolution DNS
nslookup no-skills.fr
dig no-skills.fr
```

**2. Certificat SSL échoué**

```bash
# Vérifier que le port 80 est libre
netstat -tulpn | grep :80
# Régénérer le certificat
certbot delete --cert-name no-skills.fr
sudo ./deploy.sh  # Relancer le script
```

**3. Docker ne démarre pas**

```bash
# Vérifier Docker
systemctl status docker
docker --version

# Redémarrer Docker
systemctl restart docker
```

**4. Base de données inaccessible**

```bash
# Vérifier les logs de la DB
docker-compose logs database

# Se connecter à la DB
docker-compose exec database psql -U no_skills_user -d no_skills
```

**5. Frontend ne se charge pas**

```bash
# Vérifier Nginx
nginx -t
systemctl status nginx

# Vérifier les logs
tail -f /var/log/nginx/no-skills.error.log
```

## 📞 Support

### Logs importants

```bash
# Logs système
journalctl -xe

# Logs Docker
docker-compose logs --tail=100

# Logs Nginx
tail -f /var/log/nginx/error.log
```

### Informations système

```bash
# Version du système
cat /etc/os-release

# Espace disque
df -h

# Mémoire
free -h

# Processus
ps aux | grep node
ps aux | grep nginx
```

## 🔄 Mise à jour

Pour mettre à jour l'application :

```bash
cd /var/www/no-skills

# Sauvegarder
docker-compose exec database pg_dump -U no_skills_user no_skills > backup_before_update.sql

# Mettre à jour
git pull origin main
docker-compose down
docker-compose up -d --build

# Vérifier
docker-compose ps
curl -k https://no-skills.fr/api/test
```

---

🎉 **Votre application No-Skills est maintenant déployée et accessible à l'adresse https://no-skills.fr !**
