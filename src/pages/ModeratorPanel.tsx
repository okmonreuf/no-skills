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
  AlertTriangle,
  MessageSquare,
  Shield,
  Search,
  Clock,
  Eye,
  Trash2,
  UserMinus,
  Bell,
  BarChart3,
  CheckCircle,
  XCircle,
  Flag,
  Users,
} from "lucide-react";

interface ModeratorStats {
  pendingReports: number;
  resolvedToday: number;
  temporaryBans: number;
  warningsIssued: number;
  messagesDeleted: number;
}

interface ModerationAction {
  id: string;
  type: "warning" | "temporary_ban" | "message_delete" | "report_resolve";
  targetUser: string;
  reason: string;
  timestamp: Date;
  moderator: string;
}

interface PendingReport {
  id: string;
  type: "message" | "user" | "spam";
  reportedBy: string;
  targetUser: string;
  content: string;
  reason: string;
  timestamp: Date;
  priority: "low" | "medium" | "high";
  category: string;
}

interface AppealRequest {
  id: string;
  userId: string;
  userPseudo: string;
  banId: string;
  appealReason: string;
  submittedAt: Date;
  status: "pending" | "approved" | "rejected";
  evidence?: string;
}

const mockModeratorStats: ModeratorStats = {
  pendingReports: 15,
  resolvedToday: 8,
  temporaryBans: 3,
  warningsIssued: 12,
  messagesDeleted: 25,
};

const mockPendingReports: PendingReport[] = [
  {
    id: "report-1",
    type: "message",
    reportedBy: "Marie",
    targetUser: "ProblematicUser",
    content: "Message contenant des insultes et du langage inapproprié",
    reason: "Langage offensant",
    timestamp: new Date(Date.now() - 1800000),
    priority: "high",
    category: "Comportement",
  },
  {
    id: "report-2",
    type: "spam",
    reportedBy: "Paul",
    targetUser: "SpamBot123",
    content: "Envoi répétitif de liens publicitaires",
    reason: "Spam publicitaire",
    timestamp: new Date(Date.now() - 3600000),
    priority: "medium",
    category: "Spam",
  },
  {
    id: "report-3",
    type: "user",
    reportedBy: "Claire",
    targetUser: "Harasser456",
    content: "Harcèlement en messages privés",
    reason: "Harcèlement",
    timestamp: new Date(Date.now() - 7200000),
    priority: "high",
    category: "Harcèlement",
  },
];

const mockRecentActions: ModerationAction[] = [
  {
    id: "action-1",
    type: "warning",
    targetUser: "UserX",
    reason: "Première infraction - langage inapproprié",
    timestamp: new Date(Date.now() - 1800000),
    moderator: "Marie",
  },
  {
    id: "action-2",
    type: "temporary_ban",
    targetUser: "TrollUser",
    reason: "Comportement perturbateur répété",
    timestamp: new Date(Date.now() - 3600000),
    moderator: "Marie",
  },
  {
    id: "action-3",
    type: "message_delete",
    targetUser: "SpammerTest",
    reason: "Messages publicitaires non sollicités",
    timestamp: new Date(Date.now() - 5400000),
    moderator: "Marie",
  },
];

const mockAppeals: AppealRequest[] = [
  {
    id: "appeal-1",
    userId: "user-123",
    userPseudo: "BannedUser",
    banId: "ban-456",
    appealReason:
      "Je pense que le bannissement était disproportionné par rapport à mon comportement. J'ai déjà présenté mes excuses et je m'engage à respecter les règles.",
    submittedAt: new Date(Date.now() - 7200000),
    status: "pending",
    evidence: "Captures d'écran des excuses publiques",
  },
  {
    id: "appeal-2",
    userId: "user-789",
    userPseudo: "MisunderstoodUser",
    banId: "ban-101",
    appealReason:
      "Il y a eu un malentendu, mon message était sarcastique et non agressif.",
    submittedAt: new Date(Date.now() - 10800000),
    status: "pending",
  },
];

export default function ModeratorPanel() {
  const { user } = useApp();
  const [selectedReport, setSelectedReport] = useState<PendingReport | null>(
    null,
  );
  const [actionReason, setActionReason] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [banDuration, setBanDuration] = useState("");

  // Vérifier les permissions de modération
  if (!user || !["moderator", "admin", "owner"].includes(user.role)) {
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
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const handleReportAction = () => {
    if (!selectedReport || !selectedAction || !actionReason) return;

    console.log("Moderator action:", {
      reportId: selectedReport.id,
      action: selectedAction,
      reason: actionReason,
      duration: banDuration,
    });

    setSelectedReport(null);
    setActionReason("");
    setSelectedAction("");
    setBanDuration("");
  };

  const handleAppealDecision = (
    appealId: string,
    decision: "approved" | "rejected",
  ) => {
    console.log(`Appeal ${appealId} ${decision}`);
    // Ici on ferait l'appel API
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <Bell className="w-4 h-4 text-yellow-500" />;
      case "temporary_ban":
        return <UserMinus className="w-4 h-4 text-red-500" />;
      case "message_delete":
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case "report_resolve":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case "warning":
        return "Avertissement";
      case "temporary_ban":
        return "Ban temporaire";
      case "message_delete":
        return "Suppression message";
      case "report_resolve":
        return "Signalement résolu";
      default:
        return "Action";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                Panel de Modération
              </h1>
              <p className="text-muted-foreground mt-2">
                Surveillance et modération de la communauté No-Skills
              </p>
            </div>
            <Badge variant="secondary" className="text-sm">
              MODÉRATEUR
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Tableau de bord
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Signalements
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Actions récentes
            </TabsTrigger>
            <TabsTrigger value="appeals" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Recours
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Surveillance
            </TabsTrigger>
          </TabsList>

          {/* Tableau de bord */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Signalements en attente
                  </CardTitle>
                  <Flag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {mockModeratorStats.pendingReports}
                  </div>
                  <p className="text-xs text-muted-foreground">À traiter</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Résolus aujourd'hui
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {mockModeratorStats.resolvedToday}
                  </div>
                  <p className="text-xs text-muted-foreground">Cas traités</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Bans temporaires
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockModeratorStats.temporaryBans}
                  </div>
                  <p className="text-xs text-muted-foreground">Actifs</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avertissements
                  </CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockModeratorStats.warningsIssued}
                  </div>
                  <p className="text-xs text-muted-foreground">Cette semaine</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Messages supprimés
                  </CardTitle>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockModeratorStats.messagesDeleted}
                  </div>
                  <p className="text-xs text-muted-foreground">Cette semaine</p>
                </CardContent>
              </Card>
            </div>

            {/* Actions urgentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Actions urgentes requises
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockPendingReports
                    .filter((report) => report.priority === "high")
                    .map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="destructive">URGENT</Badge>
                            <span className="font-medium">
                              {report.targetUser}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {report.reason} - {formatDate(report.timestamp)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                        >
                          Traiter
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signalements */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Signalements en attente</CardTitle>
                <div className="flex gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher dans les signalements..."
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {mockPendingReports.map((report) => (
                      <div
                        key={report.id}
                        className="p-4 rounded-lg border space-y-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={getPriorityColor(report.priority)}>
                              {report.priority.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{report.category}</Badge>
                            <Badge variant="secondary">
                              {report.type === "message"
                                ? "Message"
                                : report.type === "user"
                                  ? "Utilisateur"
                                  : "Spam"}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(report.timestamp)}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-1">
                              Signalé par: {report.reportedBy}
                            </p>
                            <p className="text-sm font-medium mb-1">
                              Utilisateur visé: {report.targetUser}
                            </p>
                            <p className="text-sm font-medium mb-1">
                              Raison: {report.reason}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Contenu signalé:
                            </p>
                            <p className="text-sm bg-muted/50 p-2 rounded mt-1">
                              {report.content}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            onClick={() => setSelectedReport(report)}
                          >
                            Traiter le signalement
                          </Button>
                          <Button size="sm" variant="outline">
                            Voir le contexte
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actions récentes */}
          <TabsContent value="actions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historique des actions de modération</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {mockRecentActions.map((action) => (
                      <div
                        key={action.id}
                        className="flex items-center gap-3 p-3 rounded-lg border"
                      >
                        {getActionIcon(action.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {getActionLabel(action.type)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              sur {action.targetUser}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {action.reason}
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>Par {action.moderator}</p>
                          <p>{formatDate(action.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recours */}
          <TabsContent value="appeals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Demandes de recours</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {mockAppeals.map((appeal) => (
                      <div
                        key={appeal.id}
                        className="p-4 rounded-lg border space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {appeal.userPseudo}
                            </span>
                            <Badge variant="outline">
                              {appeal.status === "pending"
                                ? "En attente"
                                : appeal.status}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(appeal.submittedAt)}
                          </span>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-2">
                            Raison du recours:
                          </p>
                          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                            {appeal.appealReason}
                          </p>
                        </div>

                        {appeal.evidence && (
                          <div>
                            <p className="text-sm font-medium mb-1">
                              Preuves fournies:
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {appeal.evidence}
                            </p>
                          </div>
                        )}

                        {appeal.status === "pending" && (
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleAppealDecision(appeal.id, "approved")
                              }
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approuver
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleAppealDecision(appeal.id, "rejected")
                              }
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Rejeter
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Surveillance */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Surveillance des utilisateurs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Fonctionnalité de surveillance en cours de développement
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog pour traiter un signalement */}
        <Dialog
          open={!!selectedReport}
          onOpenChange={() => setSelectedReport(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Traiter le signalement</DialogTitle>
              <DialogDescription>
                Choisissez l'action appropriée pour ce signalement.
              </DialogDescription>
            </DialogHeader>

            {selectedReport && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Détails du signalement</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Utilisateur visé:</strong>{" "}
                      {selectedReport.targetUser}
                    </p>
                    <p>
                      <strong>Signalé par:</strong> {selectedReport.reportedBy}
                    </p>
                    <p>
                      <strong>Raison:</strong> {selectedReport.reason}
                    </p>
                    <p>
                      <strong>Contenu:</strong> {selectedReport.content}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Action à prendre
                  </label>
                  <Select
                    value={selectedAction}
                    onValueChange={setSelectedAction}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dismiss">
                        Rejeter le signalement
                      </SelectItem>
                      <SelectItem value="warning">
                        Envoyer un avertissement
                      </SelectItem>
                      <SelectItem value="delete_message">
                        Supprimer le message
                      </SelectItem>
                      <SelectItem value="temporary_ban">
                        Bannissement temporaire
                      </SelectItem>
                      <SelectItem value="escalate">
                        Escalader aux admins
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedAction === "temporary_ban" && (
                  <div>
                    <label className="text-sm font-medium">
                      Durée du bannissement
                    </label>
                    <Select value={banDuration} onValueChange={setBanDuration}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir la durée" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1 heure</SelectItem>
                        <SelectItem value="6h">6 heures</SelectItem>
                        <SelectItem value="1d">1 jour</SelectItem>
                        <SelectItem value="3d">3 jours</SelectItem>
                        <SelectItem value="7d">7 jours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">
                    Raison de l'action
                  </label>
                  <Textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="Expliquez la raison de cette action..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedReport(null)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleReportAction}>
                    Confirmer l'action
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
