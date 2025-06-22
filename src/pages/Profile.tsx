import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  Settings,
  Bell,
  Shield,
  Palette,
  Eye,
  Lock,
  Trash2,
  Camera,
  Save,
  Calendar,
  Crown,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface NotificationSettings {
  mentions: boolean;
  privateMessages: boolean;
  systemAlerts: boolean;
  moderationUpdates: boolean;
}

interface PrivacySettings {
  showOnlineStatus: boolean;
  allowDirectMessages: boolean;
  showProfileToEveryone: boolean;
  allowFriendRequests: boolean;
}

export default function Profile() {
  const { user, theme, setTheme, logout } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    pseudo: user?.pseudo || "",
    bio: user?.bio || "",
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    mentions: true,
    privateMessages: true,
    systemAlerts: true,
    moderationUpdates: user?.role !== "user",
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    showOnlineStatus: true,
    allowDirectMessages: true,
    showProfileToEveryone: true,
    allowFriendRequests: true,
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground">
              Vous devez être connecté pour accéder à votre profil.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSaveProfile = () => {
    console.log("Saving profile:", editedProfile);
    // Ici on ferait l'appel API pour sauvegarder
    setIsEditing(false);
  };

  const handleNotificationChange = (
    key: keyof NotificationSettings,
    value: boolean,
  ) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key: keyof PrivacySettings, value: boolean) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmation === "SUPPRIMER") {
      console.log("Deleting account");
      // Ici on ferait l'appel API pour supprimer le compte
      logout();
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const getRoleDisplay = () => {
    switch (user.role) {
      case "owner":
        return { label: "Propriétaire", icon: Crown, color: "text-yellow-500" };
      case "admin":
        return {
          label: "Administrateur",
          icon: Shield,
          color: "text-red-500",
        };
      case "moderator":
        return {
          label: "Modérateur",
          icon: Shield,
          color: "text-blue-500",
        };
      default:
        return { label: "Utilisateur", icon: User, color: "text-gray-500" };
    }
  };

  const roleInfo = getRoleDisplay();
  const RoleIcon = roleInfo.icon;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* En-tête du profil */}
        <Card className="mb-8">
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <UserAvatar user={user} size="xl" />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-center md:text-left flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{user.pseudo}</h1>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        user.role === "owner" || user.role === "admin"
                          ? "destructive"
                          : user.role === "moderator"
                            ? "secondary"
                            : "outline"
                      }
                      className="flex items-center gap-1"
                    >
                      <RoleIcon className={`w-3 h-3 ${roleInfo.color}`} />
                      {roleInfo.label}
                    </Badge>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4">{user.bio}</p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Inscrit le {formatDate(user.createdAt)}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </>
                  ) : (
                    "Modifier le profil"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Confidentialité
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Compte
            </TabsTrigger>
          </TabsList>

          {/* Paramètres du profil */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pseudo">Pseudo</Label>
                    <Input
                      id="pseudo"
                      value={isEditing ? editedProfile.pseudo : user.pseudo}
                      onChange={(e) =>
                        setEditedProfile((prev) => ({
                          ...prev,
                          pseudo: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biographie</Label>
                    <Textarea
                      id="bio"
                      value={isEditing ? editedProfile.bio : user.bio || ""}
                      onChange={(e) =>
                        setEditedProfile((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      placeholder="Parlez-nous de vous..."
                      rows={3}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Âge</Label>
                    <Input value={`${user.age} ans`} disabled />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSaveProfile}>
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder les modifications
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Thème */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Apparence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Thème de l'interface</Label>
                    <Select
                      value={theme}
                      onValueChange={(value: "light" | "dark" | "military") =>
                        setTheme(value)
                      }
                    >
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Clair</SelectItem>
                        <SelectItem value="dark">Sombre</SelectItem>
                        <SelectItem value="military">Militaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
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
                      checked={notifications.mentions}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("mentions", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Messages privés</h4>
                      <p className="text-sm text-muted-foreground">
                        Nouveaux messages privés
                      </p>
                    </div>
                    <Switch
                      checked={notifications.privateMessages}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("privateMessages", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Alertes système</h4>
                      <p className="text-sm text-muted-foreground">
                        Maintenance, mises à jour importantes
                      </p>
                    </div>
                    <Switch
                      checked={notifications.systemAlerts}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("systemAlerts", checked)
                      }
                    />
                  </div>

                  {user.role !== "user" && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">
                            Mises à jour modération
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Signalements et actions de modération
                          </p>
                        </div>
                        <Switch
                          checked={notifications.moderationUpdates}
                          onCheckedChange={(checked) =>
                            handleNotificationChange(
                              "moderationUpdates",
                              checked,
                            )
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Confidentialité */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de confidentialité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">
                        Afficher le statut en ligne
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Les autres peuvent voir si vous êtes en ligne
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showOnlineStatus}
                      onCheckedChange={(checked) =>
                        handlePrivacyChange("showOnlineStatus", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">
                        Autoriser les messages privés
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Permettre aux autres de vous envoyer des messages privés
                      </p>
                    </div>
                    <Switch
                      checked={privacy.allowDirectMessages}
                      onCheckedChange={(checked) =>
                        handlePrivacyChange("allowDirectMessages", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Profil public</h4>
                      <p className="text-sm text-muted-foreground">
                        Votre profil est visible par tous les utilisateurs
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showProfileToEveryone}
                      onCheckedChange={(checked) =>
                        handlePrivacyChange("showProfileToEveryone", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Demandes d'amitié</h4>
                      <p className="text-sm text-muted-foreground">
                        Autoriser les demandes d'amitié (fonctionnalité future)
                      </p>
                    </div>
                    <Switch
                      checked={privacy.allowFriendRequests}
                      onCheckedChange={(checked) =>
                        handlePrivacyChange("allowFriendRequests", checked)
                      }
                      disabled
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paramètres du compte */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sécurité du compte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Lock className="w-4 h-4 mr-2" />
                  Changer le mot de passe
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Authentification à deux facteurs (bientôt)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Données et confidentialité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  Télécharger mes données
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  Voir mes droits RGPD
                </Button>
              </CardContent>
            </Card>

            {/* Zone dangereuse */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">
                  Zone dangereuse
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <h4 className="font-medium text-destructive mb-2">
                    Supprimer mon compte
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Cette action est irréversible. Toutes vos données seront
                    définitivement supprimées.
                  </p>

                  <Dialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                  >
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer mon compte
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                        <DialogDescription>
                          Cette action supprimera définitivement votre compte et
                          toutes vos données. Cette action ne peut pas être
                          annulée.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <Label>
                            Pour confirmer, tapez{" "}
                            <strong className="text-destructive">
                              SUPPRIMER
                            </strong>
                          </Label>
                          <Input
                            value={deleteConfirmation}
                            onChange={(e) =>
                              setDeleteConfirmation(e.target.value)
                            }
                            placeholder="SUPPRIMER"
                            className="mt-2"
                          />
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowDeleteDialog(false);
                              setDeleteConfirmation("");
                            }}
                          >
                            Annuler
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirmation !== "SUPPRIMER"}
                          >
                            Supprimer définitivement
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
