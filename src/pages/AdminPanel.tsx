import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Settings,
  Activity,
  MessageSquare,
  Shield,
  AlertTriangle,
  Search,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  Ban,
  Clock,
  Crown,
  ShieldCheck,
  Eye,
  Trash2,
  Mail,
  Calendar,
  BarChart3,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalMessages: number;
  reportedMessages: number;
  activeBans: number;
  newUsersToday: number;
}

interface ReportedContent {
  id: string;
  type: "message" | "user";
  content: string;
  reportedBy: string;
  reportedUser: string;
  reason: string;
  timestamp: Date;
  status: "pending" | "resolved" | "dismissed";
}

interface BanRecord {
  id: string;
  userId: string;
  userPseudo: string;
  reason: string;
  bannedBy: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  type: "temporary" | "permanent";
}

const mockStats: AdminStats = {
  totalUsers: 1247,
  activeUsers: 342,
  totalMessages: 15678,
  reportedMessages: 23,
  activeBans: 5,
  newUsersToday: 12,
};

const mockReports: ReportedContent[] = [
  {
    id: "report-1",
    type: "message",
    content: "Message inapproprié contenant des insultes",
    reportedBy: "Marie",
    reportedUser: "UtilisateurProblème",
    reason: "Langage inapproprié",
    timestamp: new Date(Date.now() - 3600000),
    status: "pending",
  },
  {
    id: "report-2",
    type: "user",
    content: "Harcèlement répété en privé",
    reportedBy: "Paul",
    reportedUser: "SpammerTest",
    reason: "Harcèlement",
    timestamp: new Date(Date.now() - 7200000),
    status: "pending",
  },
];

const mockBans: BanRecord[] = [
  {
    id: "ban-1",
    userId: "user-123",
    userPseudo: "UtilisateurBanni",
    reason: "Violation répétée des règles",
    bannedBy: "Alexandre",
    startDate: new Date(Date.now() - 86400000),
    endDate: new Date(Date.now() + 86400000 * 6),
    isActive: true,
    type: "temporary",
  },
  {
    id: "ban-2",
    userId: "user-456",
    userPseudo: "TrollPermanent",
    reason: "Comportement toxique récurrent",
    bannedBy: "Yupi",
    startDate: new Date(Date.now() - 172800000),
    isActive: true,
    type: "permanent",
  },
];

export default function AdminPanel() {
  const { user, chats, contactMessages, updateContactMessage } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("");
  const [banType, setBanType] = useState<"temporary" | "permanent">(
    "temporary",
  );

  // Vérifier les permissions admin
  if (!user || !["admin", "owner"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground">
              Vous n'avez pas les permissions nécessaires pour accéder à ce
              panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handlePromoteUser = (userId: string, newRole: string) => {
    console.log(`Promoting user ${userId} to ${newRole}`);
    // Ici on ferait l'appel API
  };

  const handleBanUser = () => {
    if (!selectedUser || !banReason) return;

    console.log("Banning user:", {
      userId: selectedUser,
      reason: banReason,
      type: banType,
      duration: banDuration,
    });

    setBanReason("");
    setBanDuration("");
    setSelectedUser(null);
  };

  const handleUnbanUser = (banId: string) => {
    console.log(`Unbanning user with ban ID: ${banId}`);
    // Ici on ferait l'appel API
  };

  const handleResolveReport = (
    reportId: string,
    action: "resolve" | "dismiss",
  ) => {
    console.log(`${action} report ${reportId}`);
    // Ici on ferait l'appel API
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 bg-destructive rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-destructive-foreground" />
                </div>
                Panel d'Administration
              </h1>
              <p className="text-muted-foreground mt-2">
                Gestion complète de la plateforme No-Skills
              </p>
            </div>
            <Badge variant="destructive" className="text-sm">
              {user.role === "owner" ? "PROPRIÉTAIRE" : "ADMINISTRATEUR"}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Tableau de bord
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Modération
            </TabsTrigger>
            <TabsTrigger value="bans" className="flex items-center gap-2">
              <Ban className="w-4 h-4" />
              Bannissements
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Signalements
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          {/* Tableau de bord */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Utilisateurs totaux
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockStats.totalUsers}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{mockStats.newUsersToday} aujourd'hui
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Utilisateurs actifs
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockStats.activeUsers}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    En ligne maintenant
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Messages envoyés
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockStats.totalMessages}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total sur la plateforme
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Signalements
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {mockStats.reportedMessages}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    En attente de traitement
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Bannissements actifs
                  </CardTitle>
                  <Ban className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                    {mockStats.activeBans}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Utilisateurs bannis
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Messages Contact
                  </CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {
                      contactMessages.filter((m) => m.status === "pending")
                        .length
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    En attente de traitement
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Activité récente */}
            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <UserPlus className="w-4 h-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Nouvel utilisateur inscrit
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Pierre123 - il y a 2 min
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Nouveau signalement
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Message signalé dans #général - il y a 15 min
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <Ban className="w-4 h-4 text-red-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Utilisateur banni</p>
                        <p className="text-xs text-muted-foreground">
                          TrollUser banni par Marie - il y a 1h
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages de Contact */}
          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Messages de Contact Reçus</CardTitle>
                <div className="flex gap-4">
                  <Badge variant="outline">
                    Total: {contactMessages.length}
                  </Badge>
                  <Badge variant="destructive">
                    En attente:{" "}
                    {
                      contactMessages.filter((m) => m.status === "pending")
                        .length
                    }
                  </Badge>
                  <Badge variant="secondary">
                    Traités:{" "}
                    {
                      contactMessages.filter((m) => m.status === "resolved")
                        .length
                    }
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {contactMessages.map((contactMsg) => (
                      <div
                        key={contactMsg.id}
                        className={cn(
                          "p-4 rounded-lg border space-y-3",
                          contactMsg.status === "pending" &&
                            "border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/20",
                          contactMsg.status === "read" &&
                            "border-blue-500/50 bg-blue-50 dark:bg-blue-900/20",
                          contactMsg.status === "resolved" &&
                            "border-green-500/50 bg-green-50 dark:bg-green-900/20",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                contactMsg.status === "pending"
                                  ? "destructive"
                                  : contactMsg.status === "read"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {contactMsg.status === "pending"
                                ? "NOUVEAU"
                                : contactMsg.status === "read"
                                  ? "LU"
                                  : "RÉSOLU"}
                            </Badge>
                            <Badge variant="outline">
                              {contactMsg.category}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(contactMsg.timestamp)}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">
                                De: {contactMsg.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {contactMsg.email}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                Sujet: {contactMsg.subject}
                              </p>
                              {contactMsg.assignedTo && (
                                <p className="text-sm text-muted-foreground">
                                  Assigné à: {contactMsg.assignedTo}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="bg-muted/50 p-3 rounded">
                            <p className="text-sm">{contactMsg.message}</p>
                          </div>

                          {contactMsg.response && (
                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800">
                              <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                                Réponse (le{" "}
                                {formatDate(contactMsg.respondedAt!)})
                              </p>
                              <p className="text-sm">{contactMsg.response}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 justify-end">
                          {contactMsg.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateContactMessage(contactMsg.id, {
                                    status: "read",
                                    assignedTo: user?.pseudo,
                                  })
                                }
                              >
                                Marquer comme lu
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  const response = prompt("Réponse à envoyer:");
                                  if (response) {
                                    updateContactMessage(contactMsg.id, {
                                      status: "resolved",
                                      assignedTo: user?.pseudo,
                                      response,
                                      respondedAt: new Date(),
                                    });
                                  }
                                }}
                              >
                                Répondre
                              </Button>
                            </>
                          )}

                          {contactMsg.status === "read" && (
                            <Button
                              size="sm"
                              onClick={() => {
                                const response = prompt("Réponse à envoyer:");
                                if (response) {
                                  updateContactMessage(contactMsg.id, {
                                    status: "resolved",
                                    response,
                                    respondedAt: new Date(),
                                  });
                                }
                              }}
                            >
                              Répondre
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              // Ici on pourrait ouvrir une modale pour voir les détails
                              console.log(
                                "Voir détails du message",
                                contactMsg.id,
                              );
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {contactMessages.length === 0 && (
                      <div className="text-center py-8">
                        <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Aucun message de contact reçu
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestion des utilisateurs */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des utilisateurs</CardTitle>
                <div className="flex gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un utilisateur..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {chats[0]?.participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <UserAvatar user={participant} size="md" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {participant.pseudo}
                              </span>
                              {participant.role !== "user" && (
                                <Badge
                                  variant={
                                    participant.role === "owner"
                                      ? "destructive"
                                      : participant.role === "admin"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                >
                                  {participant.role === "owner"
                                    ? "Propriétaire"
                                    : participant.role === "admin"
                                      ? "Admin"
                                      : "Modérateur"}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {participant.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {user.role === "owner" &&
                            participant.role !== "owner" && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handlePromoteUser(participant.id, "admin")
                                    }
                                  >
                                    <Shield className="w-4 h-4 mr-2" />
                                    Promouvoir Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handlePromoteUser(
                                        participant.id,
                                        "moderator",
                                      )
                                    }
                                  >
                                    <ShieldCheck className="w-4 h-4 mr-2" />
                                    Promouvoir Modérateur
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setSelectedUser(participant.id)
                                    }
                                    className="text-destructive"
                                  >
                                    <Ban className="w-4 h-4 mr-2" />
                                    Bannir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Modération */}
          <TabsContent value="moderation" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Actions de modération</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex-col">
                      <Eye className="w-6 h-6 mb-2" />
                      Surveiller les discussions
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Trash2 className="w-6 h-6 mb-2" />
                      Supprimer messages
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Ban className="w-6 h-6 mb-2" />
                      Gérer les bans
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Mail className="w-6 h-6 mb-2" />
                      Envoyer avertissements
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bannissements */}
          <TabsContent value="bans" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bannissements actifs</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {mockBans.map((ban) => (
                      <div
                        key={ban.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {ban.userPseudo}
                            </span>
                            <Badge
                              variant={
                                ban.type === "permanent"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {ban.type === "permanent"
                                ? "Permanent"
                                : "Temporaire"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Raison: {ban.reason}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Par: {ban.bannedBy}</span>
                            <span>Le: {formatDate(ban.startDate)}</span>
                            {ban.endDate && (
                              <span>Jusqu'au: {formatDate(ban.endDate)}</span>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnbanUser(ban.id)}
                        >
                          Lever le ban
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Dialog pour bannir un utilisateur */}
            <Dialog
              open={!!selectedUser}
              onOpenChange={() => setSelectedUser(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bannir un utilisateur</DialogTitle>
                  <DialogDescription>
                    Cette action suspendra l'accès de l'utilisateur à la
                    plateforme.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">
                      Type de bannissement
                    </label>
                    <Select
                      value={banType}
                      onValueChange={(value: "temporary" | "permanent") =>
                        setBanType(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="temporary">Temporaire</SelectItem>
                        <SelectItem value="permanent">Permanent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {banType === "temporary" && (
                    <div>
                      <label className="text-sm font-medium">Durée</label>
                      <Select
                        value={banDuration}
                        onValueChange={setBanDuration}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir la durée" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1d">1 jour</SelectItem>
                          <SelectItem value="3d">3 jours</SelectItem>
                          <SelectItem value="7d">7 jours</SelectItem>
                          <SelectItem value="30d">30 jours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium">
                      Raison du bannissement
                    </label>
                    <Textarea
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      placeholder="Expliquez la raison du bannissement..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedUser(null)}
                    >
                      Annuler
                    </Button>
                    <Button variant="destructive" onClick={handleBanUser}>
                      Confirmer le bannissement
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Signalements */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Signalements en attente</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {mockReports.map((report) => (
                      <div
                        key={report.id}
                        className="p-4 rounded-lg border space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {report.type === "message"
                                ? "Message"
                                : "Utilisateur"}
                            </Badge>
                            <Badge variant="secondary">{report.reason}</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(report.timestamp)}
                          </span>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-1">
                            Signalé par: {report.reportedBy}
                          </p>
                          <p className="text-sm font-medium mb-1">
                            Utilisateur concerné: {report.reportedUser}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {report.content}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleResolveReport(report.id, "resolve")
                            }
                          >
                            Résoudre
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleResolveReport(report.id, "dismiss")
                            }
                          >
                            Rejeter
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paramètres */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de la plateforme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Restrictions générales
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium">Âge minimum</label>
                        <p className="text-sm text-muted-foreground">
                          Âge minimum requis pour s'inscrire
                        </p>
                      </div>
                      <Input className="w-20" value="15" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium">
                          Taille max des fichiers
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Taille maximale pour les fichiers partagés (MB)
                        </p>
                      </div>
                      <Input className="w-20" value="10" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Modération automatique
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium">
                          Filtre de mots interdits
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Bloquer automatiquement les mots inappropriés
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configurer
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium">Détection de spam</label>
                        <p className="text-sm text-muted-foreground">
                          Détecter et bloquer automatiquement le spam
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configurer
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
