-- =====================================
-- SCRIPT D'INITIALISATION NO-SKILLS
-- Base de données PostgreSQL
-- =====================================

-- Activer l'extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================
-- TABLES PRINCIPALES
-- =====================================

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
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des discussions/chats
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100),
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('private', 'group', 'staff')),
    is_visible BOOLEAN DEFAULT true,
    max_members INTEGER DEFAULT 100,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de participation aux chats
CREATE TABLE chat_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'admin', 'moderator')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_muted BOOLEAN DEFAULT false,
    UNIQUE(chat_id, user_id)
);

-- Table des messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    file_url VARCHAR(255),
    file_name VARCHAR(255),
    file_size INTEGER,
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Table des réactions aux messages
CREATE TABLE message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id, emoji)
);

-- Table des bannissements
CREATE TABLE bans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    banned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    ban_type VARCHAR(20) NOT NULL CHECK (ban_type IN ('temporary', 'permanent')),
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    appeal_deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des recours de bannissement
CREATE TABLE ban_appeals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ban_id UUID REFERENCES bans(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    appeal_reason TEXT NOT NULL,
    evidence TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP,
    response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des signalements
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reported_user UUID REFERENCES users(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    chat_id UUID REFERENCES chats(id) ON DELETE SET NULL,
    reason VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Table des messages de contact
CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL DEFAULT 'non-renseigné',
    subject VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'resolved')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    response TEXT,
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_important BOOLEAN DEFAULT false,
    related_id UUID, -- ID de l'objet lié (message, chat, etc.)
    action_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des sessions utilisateur
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- =====================================
-- INDEX POUR LES PERFORMANCES
-- =====================================

-- Index sur les utilisateurs
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_pseudo ON users(pseudo);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Index sur les messages
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_author_id ON messages(author_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_type ON messages(message_type);

-- Index sur les chats
CREATE INDEX idx_chats_type ON chats(type);
CREATE INDEX idx_chats_created_by ON chats(created_by);

-- Index sur les participants
CREATE INDEX idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX idx_chat_participants_user_id ON chat_participants(user_id);

-- Index sur les bannissements
CREATE INDEX idx_bans_user_id ON bans(user_id);
CREATE INDEX idx_bans_is_active ON bans(is_active);
CREATE INDEX idx_bans_end_date ON bans(end_date);

-- Index sur les signalements
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_priority ON reports(priority);
CREATE INDEX idx_reports_created_at ON reports(created_at);

-- Index sur les notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- =====================================
-- FONCTIONS UTILITAIRES
-- =====================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- DONNÉES INITIALES
-- =====================================

-- Créer l'utilisateur owner par défaut (Yupi)
INSERT INTO users (id, pseudo, email, password_hash, age, role, bio, is_active, email_verified) VALUES 
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479', 
    'Yupi', 
    'yupi@no-skills.fr', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LefeWY/7zlDGP6ZVS', -- Hash de "1515Dh!dofly"
    25, 
    'owner',
    'Propriétaire et fondateur de No-Skills',
    true,
    true
);

-- Créer quelques utilisateurs de test
INSERT INTO users (pseudo, email, password_hash, age, role, bio, is_active, email_verified) VALUES 
('Alexandre', 'alex@no-skills.fr', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LefeWY/7zlDGP6ZVS', 28, 'admin', 'Administrateur de la plateforme', true, true),
('Marie', 'marie@no-skills.fr', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LefeWY/7zlDGP6ZVS', 24, 'moderator', 'Modératrice de la communauté', true, true),
('Paul', 'paul@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LefeWY/7zlDGP6ZVS', 22, 'user', 'Utilisateur actif de la communauté', true, true);

-- Créer les chats par défaut
INSERT INTO chats (id, name, type, description, created_by) VALUES 
(
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Général',
    'group',
    'Discussion générale de la communauté No-Skills',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'
),
(
    'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    'Staff',
    'staff',
    'Discussion réservée à l''équipe de modération',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'
);

-- Ajouter les utilisateurs aux chats
INSERT INTO chat_participants (chat_id, user_id, role) 
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', id, 'member' FROM users;

INSERT INTO chat_participants (chat_id, user_id, role) 
SELECT 'b2c3d4e5-f6g7-8901-bcde-f23456789012', id, 
CASE 
    WHEN role IN ('owner', 'admin') THEN 'admin'
    WHEN role = 'moderator' THEN 'moderator'
    ELSE 'member'
END
FROM users WHERE role IN ('owner', 'admin', 'moderator');

-- Messages de bienvenue
INSERT INTO messages (content, author_id, chat_id, message_type) VALUES 
(
    'Bienvenue sur No-Skills ! 🎉 Cette plateforme de messagerie moderne vous permet de communiquer en toute sécurité.',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'text'
),
(
    'Espace staff opérationnel. Toutes les discussions importantes se déroulent ici.',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    'text'
);

-- =====================================
-- VUES UTILES
-- =====================================

-- Vue pour les statistiques des utilisateurs
CREATE VIEW user_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE role = 'owner') as owners,
    COUNT(*) FILTER (WHERE role = 'admin') as admins,
    COUNT(*) FILTER (WHERE role = 'moderator') as moderators,
    COUNT(*) FILTER (WHERE role = 'user') as regular_users,
    COUNT(*) FILTER (WHERE status = 'online') as online_users,
    COUNT(*) FILTER (WHERE is_active = true) as active_users,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as new_users_today
FROM users;

-- Vue pour les statistiques des messages
CREATE VIEW message_stats AS
SELECT 
    COUNT(*) as total_messages,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as messages_today,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as messages_this_week,
    COUNT(DISTINCT author_id) as active_users,
    COUNT(DISTINCT chat_id) as active_chats
FROM messages 
WHERE is_deleted = false;

-- =====================================
-- PERMISSIONS ET SÉCURITÉ
-- =====================================

-- Fonction pour vérifier les permissions de modération
CREATE OR REPLACE FUNCTION can_moderate(user_role VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN user_role IN ('moderator', 'admin', 'owner');
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier les permissions d'administration
CREATE OR REPLACE FUNCTION can_admin(user_role VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN user_role IN ('admin', 'owner');
END;
$$ LANGUAGE plpgsql;

-- =====================================
-- FINALISATION
-- =====================================

-- Mettre à jour les statistiques
ANALYZE;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Base de données No-Skills initialisée avec succès !';
    RAISE NOTICE 'Utilisateurs créés: %', (SELECT COUNT(*) FROM users);
    RAISE NOTICE 'Chats créés: %', (SELECT COUNT(*) FROM chats);
    RAISE NOTICE 'Messages initiaux: %', (SELECT COUNT(*) FROM messages);
END
$$;
