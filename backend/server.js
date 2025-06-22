const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const http = require("http");
const socketIo = require("socket.io");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// Middleware de sécurité
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "wss:", "ws:"],
      },
    },
  }),
);

// Compression des réponses
app.use(compression());

// CORS configuré
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite de 100 requêtes par fenêtre de temps
  message: {
    error: "Trop de requêtes depuis cette IP, réessayez dans 15 minutes.",
  },
});
app.use("/api/", limiter);

// Logging des requêtes
app.use(morgan("combined"));

// Parsing du body
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Middleware pour servir les fichiers statiques
app.use("/uploads", express.static("uploads"));

// Routes de santé et test
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "No-Skills Backend API",
    version: "1.0.0",
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "API No-Skills fonctionnelle!",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Route d'information sur l'API
app.get("/api/info", (req, res) => {
  res.json({
    name: "No-Skills API",
    version: "1.0.0",
    description: "Backend pour l'application de messagerie No-Skills",
    endpoints: {
      health: "/health",
      test: "/api/test",
      auth: "/api/auth/*",
      users: "/api/users/*",
      messages: "/api/messages/*",
      chats: "/api/chats/*",
    },
  });
});

// Routes d'authentification (simulées pour le moment)
app.post(
  "/api/auth/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Simulation de vérification (à remplacer par vraie authentification)
    if (email === "yupi@no-skills.fr" && password === "1515Dh!dofly") {
      res.json({
        success: true,
        user: {
          id: "owner-yupi",
          pseudo: "Yupi",
          email: "yupi@no-skills.fr",
          role: "owner",
        },
        token: "simulated-jwt-token",
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Identifiants incorrects",
      });
    }
  },
);

app.post(
  "/api/auth/register",
  [
    body("pseudo").isLength({ min: 3 }).trim().escape(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }),
    body("age").isInt({ min: 15 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { pseudo, email, password, age } = req.body;

    // Simulation d'inscription (à remplacer par vraie logique)
    res.json({
      success: true,
      message: "Compte créé avec succès",
      user: {
        id: `user-${Date.now()}`,
        pseudo,
        email,
        age,
        role: "user",
      },
    });
  },
);

// Routes pour les messages (simulées)
app.get("/api/messages/:chatId", (req, res) => {
  const { chatId } = req.params;

  // Simulation de messages
  const messages = [
    {
      id: "msg-1",
      content: "Bienvenue sur No-Skills ! 🎉",
      author: {
        id: "owner-yupi",
        pseudo: "Yupi",
        role: "owner",
      },
      timestamp: new Date(Date.now() - 3600000),
      chatId,
    },
  ];

  res.json({ messages });
});

app.post(
  "/api/messages",
  [
    body("content").isLength({ min: 1 }).trim().escape(),
    body("chatId").notEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, chatId } = req.body;

    const newMessage = {
      id: `msg-${Date.now()}`,
      content,
      chatId,
      timestamp: new Date(),
      author: {
        id: "current-user",
        pseudo: "Utilisateur",
      },
    };

    // Émettre le message via WebSocket
    io.to(chatId).emit("new-message", newMessage);

    res.json({ success: true, message: newMessage });
  },
);

// Routes pour les utilisateurs
app.get("/api/users/me", (req, res) => {
  // Simulation d'utilisateur connecté
  res.json({
    id: "current-user",
    pseudo: "Utilisateur",
    email: "user@example.com",
    role: "user",
    status: "online",
  });
});

// Gestion des WebSockets pour le temps réel
io.on("connection", (socket) => {
  console.log(
    `[${new Date().toISOString()}] Utilisateur connecté: ${socket.id}`,
  );

  // Rejoindre des salles de chat
  socket.on("join-chat", (chatId) => {
    socket.join(chatId);
    console.log(`Utilisateur ${socket.id} a rejoint le chat ${chatId}`);
  });

  // Quitter des salles de chat
  socket.on("leave-chat", (chatId) => {
    socket.leave(chatId);
    console.log(`Utilisateur ${socket.id} a quitté le chat ${chatId}`);
  });

  // Gestion des messages en temps réel
  socket.on("send-message", (messageData) => {
    const message = {
      ...messageData,
      id: `msg-${Date.now()}`,
      timestamp: new Date(),
    };

    // Diffuser le message à tous les utilisateurs du chat
    io.to(messageData.chatId).emit("new-message", message);
  });

  // Statut de frappe
  socket.on("typing", (data) => {
    socket.to(data.chatId).emit("user-typing", {
      userId: data.userId,
      pseudo: data.pseudo,
    });
  });

  socket.on("stop-typing", (data) => {
    socket.to(data.chatId).emit("user-stop-typing", {
      userId: data.userId,
    });
  });

  // Déconnexion
  socket.on("disconnect", () => {
    console.log(
      `[${new Date().toISOString()}] Utilisateur déconnecté: ${socket.id}`,
    );
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Erreur:`, err);
  res.status(500).json({
    error: "Erreur interne du serveur",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Une erreur est survenue",
  });
});

// Route 404 pour les API
app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: "Endpoint non trouvé",
    message: `La route ${req.originalUrl} n'existe pas`,
  });
});

// Démarrage du serveur
server.listen(PORT, "0.0.0.0", () => {
  console.log(`
╔════════════════════════════════════════════════════════════════════════════════════════╗
║                                    NO-SKILLS BACKEND                                   ║
║                                  Démarré avec succès !                                ║
╠════════════════════════════════════════════════════════════════════════════════════════╣
║  🚀 Serveur     : http://0.0.0.0:${PORT}                                                    ║
║  🌍 Environment : ${process.env.NODE_ENV || "development"}                                                    ║
║  📅 Démarré le  : ${new Date().toLocaleString("fr-FR")}                              ║
║  🔗 API Health  : http://localhost:${PORT}/health                                           ║
║  🔗 API Test    : http://localhost:${PORT}/api/test                                         ║
║  🔗 API Info    : http://localhost:${PORT}/api/info                                         ║
║  🔌 WebSocket   : Activé et prêt pour les connexions temps réel                       ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
  `);
});

// Gestion propre de l'arrêt du serveur
process.on("SIGTERM", () => {
  console.log("SIGTERM reçu, arrêt propre du serveur...");
  server.close(() => {
    console.log("Serveur fermé");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT reçu, arrêt propre du serveur...");
  server.close(() => {
    console.log("Serveur fermé");
    process.exit(0);
  });
});
