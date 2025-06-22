import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  MessageSquare,
  Users,
  Shield,
  Settings,
  Check,
  X,
  Trash2,
  Eye,
  EyeOff,
  Crown,
  AlertTriangle,
  Info,
  CheckCircle,
} from "lucide-react";

interface Notification {
  id: string;
  type: "message" | "mention" | "system" | "moderation" | "admin";
  title: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  isImportant: boolean;
  actionable?: boolean;
  fromUser?: any;
  relatedChat?: string;
  actions?: NotificationAction[];
}

interface NotificationAction {
  id: string;
  label: string;
  type: "primary" | "secondary" | "destructive";
  action: () => void;
}

const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "mention",
    title: "Vous avez été mentionné",
    content:
      "Paul vous a mentionné dans #Général : '@Yupi peux-tu regarder ce problème ?'",
    timestamp: new Date(Date.now() - 300000),
    isRead: false,
    isImportant: true,
    actionable: true,
    fromUser: {
      id: "user-paul",
      pseudo: "Paul",
      role: "user",
    },
    relatedChat: "general",
    actions: [
      {
        id: "reply",
        label: "Répondre",
        type: "primary",
        action: () => console.log("Reply to mention"),
      },
      {
        id: "mark-read",
        label: "Marquer comme lu",
        type: "secondary",
        action: () => console.log("Mark as read"),
      },
    ],
  },
  {
    id: "notif-2",
    type: "message",
    title: "Nouveau message privé",
    content: "Alexandre vous a envoyé un message privé",
    timestamp: new Date(Date.now() - 1800000),
    isRead: false,
    isImportant: false,
    fromUser: {
      id: "admin-alex",
      pseudo: "Alexandre",
      role: "admin",
    },
    actions: [
      {
        id: "open-chat",
        label: "Ouvrir",
        type: "primary",
        action: () => console.log("Open private chat"),
      },
    ],
  },
  {
    id: "notif-3",
    type: "moderation",
    title: "Nouveau signalement",
    content:
      "Un utilisateur a signalé un message dans #Général pour langage inapproprié",
    timestamp: new Date(Date.now() - 3600000),
    isRead: true,
    isImportant: true,
    actionable: true,
    actions: [
      {
        id: "review",
        label: "Examiner",
        type: "primary",
        action: () => console.log("Review report"),
      },
      {
        id: "dismiss",
        label: "Ignorer",
        type: "secondary",
        action: () => console.log("Dismiss report"),
      },
    ],
  },
  {
    id: "notif-4",
    type: "system",
    title: "Mise à jour de sécurité",
    content:
      "Une nouvelle mise à jour de sécurité a été installée sur No-Skills",
    timestamp: new Date(Date.now() - 7200000),
    isRead: true,
    isImportant: false,
  },
  {
    id: "notif-5",
    type: "admin",
    title: "Nouveau rôle assigné",
    content: "Marie a été promue au rôle de Modérateur",
    timestamp: new Date(Date.now() - 10800000),
    isRead: true,
    isImportant: true,
    fromUser: {
      id: "modo-marie",
      pseudo: "Marie",
      role: "moderator",
    },
  },
];

export default function Notifications() {
  const { user } = useApp();
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    mentions: true,
    messages: true,
    system: true,
    moderation: user?.role !== "user",
    admin: ["admin", "owner"].includes(user?.role || ""),
    sound: true,
    desktop: true,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const importantCount = notifications.filter(
    (n) => n.isImportant && !n.isRead,
  ).length;

  const filteredNotifications = showOnlyUnread
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "mention":
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-green-500" />;
      case "system":
        return <Info className="w-4 h-4 text-blue-500" />;
      case "moderation":
        return <Shield className="w-4 h-4 text-yellow-500" />;
      case "admin":
        return <Crown className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "mention":
        return "Mention";
      case "message":
        return "Message";
      case "system":
        return "Système";
      case "moderation":
        return "Modération";
      case "admin":
        return "Administration";
      default:
        return "Notification";
    }
  };

  const formatTime = (date: Date) => {
    const now = Date.now();
    const diff = now - date.getTime();

    if (diff < 60000) return "À l'instant";
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground">
              Vous devez être connecté pour voir vos notifications.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Bell className="w-6 h-6 text-primary-foreground" />
                </div>
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </h1>
              <p className="text-muted-foreground mt-2">
                Gérez toutes vos notifications No-Skills
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOnlyUnread(!showOnlyUnread)}
              >
                {showOnlyUnread ? (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Tout afficher
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Non lues seulement
                  </>
                )}
              </Button>

              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Tout marquer comme lu
                </Button>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          {/* Liste des notifications */}
          <TabsContent value="notifications" className="space-y-4">
            {/* Statistiques rapides */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {unreadCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Non lues</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {importantCount}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Importantes
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <div className="text-2xl font-bold">
                    {notifications.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </CardContent>
              </Card>
            </div>

            {filteredNotifications.length > 0 ? (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={cn(
                      "transition-all hover:shadow-md",
                      !notification.isRead &&
                        "border-l-4 border-l-primary bg-primary/5",
                      notification.isImportant && "ring-1 ring-yellow-500/20",
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getTypeIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-sm">
                              {notification.title}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(notification.type)}
                            </Badge>
                            {notification.isImportant && (
                              <Badge variant="destructive" className="text-xs">
                                Important
                              </Badge>
                            )}
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.content}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {notification.fromUser && (
                                <div className="flex items-center gap-1">
                                  <UserAvatar
                                    user={notification.fromUser}
                                    size="sm"
                                  />
                                  <span>{notification.fromUser.pseudo}</span>
                                </div>
                              )}
                              <span>{formatTime(notification.timestamp)}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              {notification.actions?.map((action) => (
                                <Button
                                  key={action.id}
                                  variant={
                                    action.type === "primary"
                                      ? "default"
                                      : action.type === "destructive"
                                        ? "destructive"
                                        : "outline"
                                  }
                                  size="sm"
                                  onClick={action.action}
                                  className="text-xs h-7"
                                >
                                  {action.label}
                                </Button>
                              ))}

                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-7 w-7 p-0"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  deleteNotification(notification.id)
                                }
                                className="h-7 w-7 p-0 text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {notifications.length > 0 && (
                  <div className="text-center pt-4">
                    <Button
                      variant="outline"
                      onClick={clearAllNotifications}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer toutes les notifications
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-8 pb-8 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Aucune notification
                  </h3>
                  <p className="text-muted-foreground">
                    {showOnlyUnread
                      ? "Vous n'avez aucune notification non lue"
                      : "Vous êtes à jour ! Aucune notification à afficher."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Paramètres des notifications */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Mentions</h4>
                      <p className="text-sm text-muted-foreground">
                        Quand quelqu'un vous mentionne dans un message
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.mentions}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          mentions: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Messages privés</h4>
                      <p className="text-sm text-muted-foreground">
                        Nouveaux messages privés reçus
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.messages}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          messages: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Alertes système</h4>
                      <p className="text-sm text-muted-foreground">
                        Mises à jour et maintenance de la plateforme
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.system}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          system: checked,
                        }))
                      }
                    />
                  </div>

                  {user.role !== "user" && (
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Modération</h4>
                        <p className="text-sm text-muted-foreground">
                          Signalements et actions de modération
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.moderation}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            moderation: checked,
                          }))
                        }
                      />
                    </div>
                  )}

                  {["admin", "owner"].includes(user.role) && (
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Administration</h4>
                        <p className="text-sm text-muted-foreground">
                          Notifications d'administration de la plateforme
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.admin}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            admin: checked,
                          }))
                        }
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Paramètres d'affichage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Sons de notification</h4>
                    <p className="text-sm text-muted-foreground">
                      Jouer un son pour les nouvelles notifications
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.sound}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        sound: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notifications du navigateur</h4>
                    <p className="text-sm text-muted-foreground">
                      Afficher les notifications même quand l'onglet n'est pas
                      actif
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.desktop}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        desktop: checked,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
