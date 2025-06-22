import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";

// Types pour l'application
export type Theme = "light" | "dark" | "military";

export type UserRole = "user" | "moderator" | "admin" | "owner";

export type UserStatus = "online" | "away" | "busy" | "offline";

export interface User {
  id: string;
  pseudo: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  status: UserStatus;
  lastSeen: Date;
  createdAt: Date;
  age: number;
}

export interface Message {
  id: string;
  content: string;
  authorId: string;
  author: User;
  chatId: string;
  timestamp: Date;
  edited?: Date;
  reactions: Record<string, string[]>; // emoji -> user IDs
  attachments?: string[];
  replyTo?: string;
}

export interface Chat {
  id: string;
  name?: string;
  type: "private" | "group" | "staff";
  participants: User[];
  lastMessage?: Message;
  isVisible: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  timestamp: Date;
  status: "pending" | "read" | "resolved";
  assignedTo?: string;
  response?: string;
  respondedAt?: Date;
}

interface AppContextType {
  // Authentification
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: RegisterData) => Promise<boolean>;

  // Thème
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Chat
  currentChat: Chat | null;
  setCurrentChat: (chat: Chat | null) => void;
  chats: Chat[];
  messages: Record<string, Message[]>;

  // Messages de contact
  contactMessages: ContactMessage[];
  addContactMessage: (
    message: Omit<ContactMessage, "id" | "timestamp" | "status">,
  ) => void;
  updateContactMessage: (id: string, updates: Partial<ContactMessage>) => void;

  // Interface
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
}

interface RegisterData {
  pseudo: string;
  email: string;
  password: string;
  age: number;
  acceptedTOS: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Données de test pour le développement
const mockOwner: User = {
  id: "owner-yupi",
  pseudo: "Yupi",
  email: "yupi@no-skills.fr",
  role: "owner",
  status: "online",
  lastSeen: new Date(),
  createdAt: new Date("2024-01-01"),
  age: 25,
  bio: "Propriétaire de No-Skills",
};

const mockUsers: User[] = [
  mockOwner,
  {
    id: "admin-alex",
    pseudo: "Alexandre",
    email: "alex@no-skills.fr",
    role: "admin",
    status: "online",
    lastSeen: new Date(),
    createdAt: new Date("2024-01-15"),
    age: 28,
    bio: "Administrateur",
  },
  {
    id: "modo-marie",
    pseudo: "Marie",
    email: "marie@no-skills.fr",
    role: "moderator",
    status: "away",
    lastSeen: new Date(Date.now() - 300000),
    createdAt: new Date("2024-02-01"),
    age: 24,
    bio: "Modératrice",
  },
  {
    id: "user-paul",
    pseudo: "Paul",
    email: "paul@example.com",
    role: "user",
    status: "online",
    lastSeen: new Date(),
    createdAt: new Date("2024-03-01"),
    age: 22,
    bio: "Utilisateur actif",
  },
];

const mockChats: Chat[] = [
  {
    id: "general",
    name: "Général",
    type: "group",
    participants: mockUsers,
    isVisible: true,
    createdBy: "owner-yupi",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "staff",
    name: "Staff",
    type: "staff",
    participants: mockUsers.filter((u) =>
      ["admin", "moderator", "owner"].includes(u.role),
    ),
    isVisible: true,
    createdBy: "owner-yupi",
    createdAt: new Date("2024-01-01"),
  },
];

const mockMessages: Record<string, Message[]> = {
  general: [
    {
      id: "msg-1",
      content: "Bienvenue sur No-Skills ! 🎉",
      authorId: "owner-yupi",
      author: mockOwner,
      chatId: "general",
      timestamp: new Date(Date.now() - 3600000),
      reactions: { "👋": ["admin-alex", "user-paul"] },
    },
    {
      id: "msg-2",
      content: "Merci Yupi ! Hâte de découvrir cette plateforme.",
      authorId: "user-paul",
      author: mockUsers[3],
      chatId: "general",
      timestamp: new Date(Date.now() - 3000000),
      reactions: {},
    },
  ],
  staff: [
    {
      id: "staff-msg-1",
      content: "Réunion staff demain à 14h",
      authorId: "owner-yupi",
      author: mockOwner,
      chatId: "staff",
      timestamp: new Date(Date.now() - 1800000),
      reactions: {},
    },
  ],
};

const mockContactMessages: ContactMessage[] = [
  {
    id: "contact-1",
    name: "Sophie Martin",
    email: "sophie.martin@example.com",
    subject: "Problème de connexion",
    category: "support",
    message:
      "Bonjour, j'ai des difficultés à me connecter à mon compte depuis ce matin. Pourriez-vous m'aider ?",
    timestamp: new Date(Date.now() - 3600000),
    status: "pending",
  },
  {
    id: "contact-2",
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    subject: "Suggestion d'amélioration",
    category: "general",
    message:
      "Serait-il possible d'ajouter un mode sombre à l'interface ? Cela améliorerait grandement l'expérience utilisateur.",
    timestamp: new Date(Date.now() - 7200000),
    status: "read",
    assignedTo: "admin-alex",
  },
  {
    id: "contact-3",
    name: "Anonymous",
    email: "report@anonymous.com",
    subject: "Signalement de comportement inapproprié",
    category: "security",
    message:
      "Un utilisateur avec le pseudo 'TrollUser123' publie des messages offensants dans le chat général.",
    timestamp: new Date(Date.now() - 10800000),
    status: "resolved",
    assignedTo: "owner-yupi",
    response:
      "Merci pour votre signalement. L'utilisateur a été sanctionné et surveillé.",
    respondedAt: new Date(Date.now() - 9000000),
  },
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<Theme>("dark");
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [chats] = useState<Chat[]>(mockChats);
  const [messages] = useState<Record<string, Message[]>>(mockMessages);
  const [contactMessages, setContactMessages] =
    useState<ContactMessage[]>(mockContactMessages);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Gestion responsive
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Gestion du thème
  useEffect(() => {
    const savedTheme = localStorage.getItem("no-skills-theme") as Theme;
    if (savedTheme && ["light", "dark", "military"].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("no-skills-theme", theme);
  }, [theme]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulation de connexion
    if (email === "yupi@no-skills.fr" && password === "1515Dh!dofly") {
      setUser(mockOwner);
      return true;
    }

    // Autres utilisateurs de test
    const testUser = mockUsers.find((u) => u.email === email);
    if (testUser && password === "test123") {
      setUser(testUser);
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setCurrentChat(null);
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    // Simulation d'inscription
    if (data.acceptedTOS && data.age >= 15) {
      const newUser: User = {
        id: `user-${Date.now()}`,
        pseudo: data.pseudo,
        email: data.email,
        role: "user",
        status: "online",
        lastSeen: new Date(),
        createdAt: new Date(),
        age: data.age,
      };
      setUser(newUser);
      return true;
    }
    return false;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const addContactMessage = (
    messageData: Omit<ContactMessage, "id" | "timestamp" | "status">,
  ) => {
    const newMessage: ContactMessage = {
      ...messageData,
      id: `contact-${Date.now()}`,
      timestamp: new Date(),
      status: "pending",
    };
    setContactMessages((prev) => [newMessage, ...prev]);
  };

  const updateContactMessage = (
    id: string,
    updates: Partial<ContactMessage>,
  ) => {
    setContactMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)),
    );
  };

  const value: AppContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    theme,
    setTheme,
    currentChat,
    setCurrentChat,
    chats,
    messages,
    contactMessages,
    addContactMessage,
    updateContactMessage,
    isSidebarOpen,
    toggleSidebar,
    isMobile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
