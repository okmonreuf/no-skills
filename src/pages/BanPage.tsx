import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  Clock,
  Shield,
  ArrowLeft,
  Calendar,
  MessageSquare,
  User,
  FileText,
} from "lucide-react";

interface BanInfo {
  id: string;
  userId: string;
  userPseudo: string;
  reason: string;
  banType: "temporary" | "permanent";
  startDate: Date;
  endDate?: Date;
  bannedBy: string;
  bannedByRole: string;
  appealDeadline?: Date;
  canAppeal: boolean;
}

// Données de test pour une sanction
const mockBanInfo: BanInfo = {
  id: "ban-123",
  userId: "user-456",
  userPseudo: "UtilisateurTest",
  reason: "Harcèlement répété envers d'autres membres de la communauté",
  banType: "temporary",
  startDate: new Date("2024-01-15T10:30:00"),
  endDate: new Date("2024-01-22T10:30:00"),
  bannedBy: "ModérateurExample",
  bannedByRole: "Modérateur",
  appealDeadline: new Date("2024-01-19T10:30:00"),
  canAppeal: true,
};

export default function BanPage() {
  const [banInfo] = useState<BanInfo>(mockBanInfo);
  const [appealSubmitted, setAppealSubmitted] = useState(false);

  const isActive =
    banInfo.banType === "permanent" ||
    (banInfo.endDate && new Date() < banInfo.endDate);
  const timeRemaining = banInfo.endDate
    ? Math.max(0, banInfo.endDate.getTime() - Date.now())
    : 0;
  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.ceil(
    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleAppealSubmit = () => {
    setAppealSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-destructive/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* En-tête */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/connexion">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la connexion
            </Link>
          </Button>

          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-destructive rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-destructive-foreground" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-destructive">
              Compte suspendu
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Votre compte a été temporairement suspendu pour violation des
              règles de la communauté.
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Statut de la sanction */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-destructive" />
                Statut de la sanction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Type de sanction</p>
                  <Badge
                    variant={
                      banInfo.banType === "permanent"
                        ? "destructive"
                        : "secondary"
                    }
                    className="w-fit"
                  >
                    {banInfo.banType === "permanent"
                      ? "Bannissement définitif"
                      : "Suspension temporaire"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Utilisateur concerné</p>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{banInfo.userPseudo}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Date de début</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{formatDate(banInfo.startDate)}</span>
                  </div>
                </div>

                {banInfo.endDate && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Date de fin</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{formatDate(banInfo.endDate)}</span>
                    </div>
                  </div>
                )}
              </div>

              {isActive && banInfo.banType === "temporary" && (
                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <h4 className="font-semibold text-destructive mb-2">
                    Temps restant
                  </h4>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {daysRemaining > 0
                          ? `${daysRemaining} jour${daysRemaining > 1 ? "s" : ""}`
                          : `${hoursRemaining} heure${hoursRemaining > 1 ? "s" : ""}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Raison de la sanction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Motif de la sanction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Raison détaillée :
                  </p>
                  <p className="font-medium">{banInfo.reason}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      Sanctionné par :
                    </span>
                    <p className="font-medium">
                      {banInfo.bannedBy} ({banInfo.bannedByRole})
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      ID de sanction :
                    </span>
                    <p className="font-mono text-xs">{banInfo.id}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processus de recours */}
          {banInfo.canAppeal && !appealSubmitted && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Faire appel de la décision
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Si vous estimez que cette sanction est injustifiée, vous
                  pouvez faire appel de la décision. Notre équipe de modération
                  examinera votre demande dans les plus brefs délais.
                </p>

                {banInfo.appealDeadline && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm">
                      <strong>Délai limite pour faire appel :</strong>{" "}
                      {formatDate(banInfo.appealDeadline)}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      Conditions pour faire appel :
                    </h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                      <li>Fournir des preuves de votre innocence</li>
                      <li>Expliquer les circonstances atténuantes</li>
                      <li>
                        Démontrer que la sanction ne correspond pas à
                        l'infraction
                      </li>
                      <li>Respecter le délai de recours</li>
                    </ul>
                  </div>

                  <Button onClick={handleAppealSubmit} className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Faire appel de cette décision
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confirmation d'appel soumis */}
          {appealSubmitted && (
            <Card className="border-green-500/20 bg-green-50 dark:bg-green-900/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-700 dark:text-green-300">
                      Appel soumis avec succès
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Votre demande de recours a été transmise à l'équipe de
                      modération. Vous recevrez une réponse dans les
                      notifications dans un délai de 48 à 72 heures.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Règles de la communauté */}
          <Card>
            <CardHeader>
              <CardTitle>Rappel des règles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Pour éviter de futures sanctions, nous vous rappelons les
                principales règles de No-Skills :
              </p>

              <div className="grid gap-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">Respect mutuel</h4>
                  <p className="text-xs text-muted-foreground">
                    Traitez tous les membres avec respect et courtoisie
                  </p>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">
                    Contenu approprié
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Partagez uniquement du contenu adapté à tous les publics
                  </p>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">Pas de spam</h4>
                  <p className="text-xs text-muted-foreground">
                    Évitez les messages répétitifs ou non sollicités
                  </p>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">
                    Confidentialité
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Respectez la vie privée des autres utilisateurs
                  </p>
                </div>
              </div>

              <div className="text-center pt-4">
                <Button variant="outline" asChild>
                  <Link to="/cgu">Lire les règles complètes</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact support */}
        <div className="mt-8 text-center">
          <Separator className="mb-6" />
          <p className="text-sm text-muted-foreground mb-4">
            Une question sur votre sanction ? Contactez notre équipe de support.
          </p>
          <Button variant="outline" asChild>
            <Link to="/contact">
              <MessageSquare className="w-4 h-4 mr-2" />
              Contacter le support
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
