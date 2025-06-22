import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { UserAvatar } from "@/components/UserAvatar";
import { StatusIndicator } from "@/components/StatusIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Send,
  Plus,
  Smile,
  Paperclip,
  MoreHorizontal,
  Settings,
  LogOut,
  Users,
  Hash,
  Lock,
  Crown,
  Shield,
  ShieldCheck,
  Search,
  Bell,
  Moon,
  Sun,
  Palette,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Chat() {
  const {
    user,
    currentChat,
    setCurrentChat,
    chats,
    messages,
    theme,
    setTheme,
    logout,
    isSidebarOpen,
    toggleSidebar,
    isMobile,
  } = useApp();

  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentMessages = currentChat ? messages[currentChat.id] || [] : [];

  const filteredChats = chats.filter((chat) =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  // Définir le chat par défaut
  useEffect(() => {
    if (!currentChat && chats.length > 0) {
      setCurrentChat(chats[0]);
    }
  }, [chats, currentChat, setCurrentChat]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Ici on enverrait le message au serveur
      console.log("Envoi du message:", message);
      setMessage("");
    }
  };

  const getChatIcon = (chat: any) => {
    if (chat.type === "private") return <Lock className="w-4 h-4" />;
    if (chat.type === "staff") return <Shield className="w-4 h-4" />;
    return <Hash className="w-4 h-4" />;
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const themeIcons = {
    light: Sun,
    dark: Moon,
    military: Shield,
  };

  const ThemeIcon = themeIcons[theme];

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-sidebar border-r">
      {/* En-tête utilisateur */}
      <div className="p-4 border-b bg-sidebar-accent/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserAvatar user={user!} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sidebar-foreground truncate">
                  {user!.pseudo}
                </h3>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <StatusIndicator status={user!.status} />
                <span className="text-xs text-sidebar-foreground/70 capitalize">
                  {user!.status === "online"
                    ? "En ligne"
                    : user!.status === "away"
                      ? "Absent"
                      : user!.status === "busy"
                        ? "Occupé"
                        : "Hors ligne"}
                </span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/profil">
                  <User className="w-4 h-4 mr-2" />
                  Mon profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/parametres">
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/notifications">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/recherche">
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/fichiers">
                  <Paperclip className="w-4 h-4 mr-2" />
                  Fichiers
                </Link>
              </DropdownMenuItem>

              {/* Liens selon le rôle */}
              {user && ["moderator", "admin", "owner"].includes(user.role) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/moderation">
                      <Shield className="w-4 h-4 mr-2" />
                      Panel modération
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              {user && ["admin", "owner"].includes(user.role) && (
                <DropdownMenuItem asChild>
                  <Link to="/admin">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Panel administration
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  setTheme(
                    theme === "light"
                      ? "dark"
                      : theme === "dark"
                        ? "military"
                        : "light",
                  )
                }
              >
                <ThemeIcon className="w-4 h-4 mr-2" />
                Thème :{" "}
                {theme === "light"
                  ? "Clair"
                  : theme === "dark"
                    ? "Sombre"
                    : "Militaire"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Recherche */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-sidebar-accent/50"
          />
        </div>
      </div>

      {/* Liste des discussions */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setCurrentChat(chat)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                "hover:bg-sidebar-accent",
                currentChat?.id === chat.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground",
              )}
            >
              <div className="flex-shrink-0">{getChatIcon(chat)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{chat.name}</span>
                  {chat.type === "staff" && (
                    <Badge variant="secondary" className="text-xs">
                      Staff
                    </Badge>
                  )}
                </div>
                {chat.lastMessage && (
                  <p className="text-xs opacity-70 truncate">
                    {chat.lastMessage.content}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 text-xs opacity-50">
                {chat.lastMessage && formatTime(chat.lastMessage.timestamp)}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Actions rapides */}
      <div className="p-4 border-t space-y-3">
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle discussion
        </Button>

        {/* Boutons d'accès rapide selon le rôle */}
        {user && ["moderator", "admin", "owner"].includes(user.role) && (
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Link to="/moderation">
              <Shield className="w-4 h-4 mr-2" />
              Panel Modération
            </Link>
          </Button>
        )}

        {user && ["admin", "owner"].includes(user.role) && (
          <Button asChild variant="destructive" size="sm" className="w-full">
            <Link to="/admin">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Panel Administration
            </Link>
          </Button>
        )}

        {user && user.role === "owner" && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                Propriétaire
              </span>
            </div>
            <div className="grid gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-8 border-yellow-500/50 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
              >
                <Settings className="w-3 h-3 mr-2" />
                Config Serveur
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-8 border-yellow-500/50 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
              >
                <Users className="w-3 h-3 mr-2" />
                Gestion Globale
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar Desktop */}
      {!isMobile && isSidebarOpen && (
        <div className="w-80 flex-shrink-0">
          <Sidebar />
        </div>
      )}

      {/* Sidebar Mobile */}
      {isMobile && (
        <Sheet open={isSidebarOpen} onOpenChange={toggleSidebar}>
          <SheetContent side="left" className="w-80 p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
      )}

      {/* Zone de chat principale */}
      <div className="flex-1 flex flex-col">
        {/* En-tête du chat */}
        <div className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-8 w-8 p-0"
            >
              <Menu className="w-4 h-4" />
            </Button>

            {currentChat && (
              <>
                <div className="flex items-center gap-2">
                  {getChatIcon(currentChat)}
                  <h2 className="font-semibold">{currentChat.name}</h2>
                  {currentChat.type === "staff" && (
                    <Badge variant="secondary">Staff</Badge>
                  )}
                </div>

                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {currentChat.participants.length} membres
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Bell className="w-4 h-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Users className="w-4 h-4 mr-2" />
                  Membres
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres du chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Zone des messages */}
        <ScrollArea className="flex-1 chat-scrollbar">
          <div className="p-4 space-y-4">
            {currentMessages.map((msg, index) => {
              const isOwn = msg.authorId === user.id;
              const showAvatar =
                index === 0 ||
                currentMessages[index - 1]?.authorId !== msg.authorId;

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3 animate-fade-in",
                    isOwn ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  {showAvatar && !isOwn && (
                    <UserAvatar user={msg.author} size="sm" />
                  )}
                  {!showAvatar && !isOwn && <div className="w-8" />}

                  <div
                    className={cn(
                      "flex flex-col gap-1 max-w-xs lg:max-w-md",
                      isOwn ? "items-end" : "items-start",
                    )}
                  >
                    {showAvatar && (
                      <div
                        className={cn(
                          "flex items-center gap-2 text-xs text-muted-foreground",
                          isOwn ? "flex-row-reverse" : "flex-row",
                        )}
                      >
                        <span className="font-medium">{msg.author.pseudo}</span>
                        <span>{formatTime(msg.timestamp)}</span>
                      </div>
                    )}

                    <div
                      className={cn(
                        "px-4 py-2 rounded-2xl break-words",
                        isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted",
                      )}
                    >
                      {msg.content}
                    </div>

                    {/* Réactions */}
                    {Object.keys(msg.reactions).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(msg.reactions).map(
                          ([emoji, userIds]) => (
                            <button
                              key={emoji}
                              className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-full text-xs hover:bg-muted transition-colors"
                            >
                              <span>{emoji}</span>
                              <span>{userIds.length}</span>
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Zone de saisie */}
        <div className="border-t bg-card/50 backdrop-blur-sm p-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tapez votre message..."
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <Smile className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button type="submit" disabled={!message.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
