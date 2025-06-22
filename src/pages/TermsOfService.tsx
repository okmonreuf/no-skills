import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Scale, Shield } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
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
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                <Scale className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">
              Conditions Générales d'Utilisation
            </h1>
            <p className="text-muted-foreground">
              Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Bienvenue sur No-Skills, une plateforme de messagerie
                instantanée. En accédant et en utilisant notre service, vous
                acceptez d'être lié par les présentes Conditions Générales
                d'Utilisation.
              </p>
            </CardContent>
          </Card>

          {/* Conditions d'accès */}
          <Card>
            <CardHeader>
              <CardTitle>1. Conditions d'accès</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Âge minimum</h4>
                <p>
                  Vous devez avoir au moins 15 ans pour utiliser No-Skills. En
                  créant un compte, vous confirmez avoir l'âge requis.
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Compte utilisateur</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Vous êtes responsable de la sécurité de votre compte</li>
                  <li>Vous devez fournir des informations exactes et à jour</li>
                  <li>Un seul compte par personne est autorisé</li>
                  <li>Vous ne pouvez pas partager vos identifiants</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Règles de conduite */}
          <Card>
            <CardHeader>
              <CardTitle>2. Règles de conduite</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-green-600">
                  Comportements autorisés
                </h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Communication respectueuse et bienveillante</li>
                  <li>Partage de contenu approprié</li>
                  <li>Respect de la vie privée des autres utilisateurs</li>
                  <li>Signalement des comportements inappropriés</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2 text-red-600">
                  Comportements interdits
                </h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Harcèlement, intimidation ou menaces</li>
                  <li>Contenu pornographique, violent ou illégal</li>
                  <li>Spam ou publicité non autorisée</li>
                  <li>Usurpation d'identité</li>
                  <li>Diffusion de virus ou de logiciels malveillants</li>
                  <li>Contournement des mesures de sécurité</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Système de modération */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                3. Système de modération
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Rôles et permissions</h4>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">👑</span>
                    </div>
                    <div>
                      <p className="font-medium">Propriétaire (Owner)</p>
                      <p className="text-sm text-muted-foreground">
                        Contrôle total de la plateforme
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">🛡️</span>
                    </div>
                    <div>
                      <p className="font-medium">Administrateur</p>
                      <p className="text-sm text-muted-foreground">
                        Gestion des utilisateurs et modération avancée
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">🛡️</span>
                    </div>
                    <div>
                      <p className="font-medium">Modérateur</p>
                      <p className="text-sm text-muted-foreground">
                        Modération des discussions et support utilisateur
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Sanctions</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Avertissement</li>
                  <li>Suppression de messages</li>
                  <li>Bannissement temporaire (1 jour à 30 jours)</li>
                  <li>Bannissement définitif</li>
                  <li>Suppression de compte</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Protection des données */}
          <Card>
            <CardHeader>
              <CardTitle>4. Protection des données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Nous nous engageons à protéger vos données personnelles
                conformément au RGPD. Pour plus de détails, consultez notre{" "}
                <Link
                  to="/confidentialite"
                  className="text-primary hover:underline"
                >
                  Politique de confidentialité
                </Link>
                .
              </p>

              <div>
                <h4 className="font-semibold mb-2">Vos droits</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Droit d'accès à vos données</li>
                  <li>Droit de rectification</li>
                  <li>Droit à l'effacement</li>
                  <li>Droit à la portabilité</li>
                  <li>Droit d'opposition</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Responsabilités */}
          <Card>
            <CardHeader>
              <CardTitle>5. Responsabilités</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">
                  Responsabilité de No-Skills
                </h4>
                <p>
                  Nous nous efforçons de maintenir un service de qualité, mais
                  ne garantissons pas une disponibilité continue. Nous ne sommes
                  pas responsables du contenu publié par les utilisateurs.
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">
                  Responsabilité de l'utilisateur
                </h4>
                <p>
                  Vous êtes entièrement responsable de votre utilisation du
                  service et du contenu que vous publiez. Vous vous engagez à ne
                  pas violer les droits d'autrui ou les lois applicables.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Modifications */}
          <Card>
            <CardHeader>
              <CardTitle>6. Modifications des CGU</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Nous nous réservons le droit de modifier ces conditions à tout
                moment. Les utilisateurs seront informés des changements
                significatifs par notification sur la plateforme. L'utilisation
                continue du service après modification constitue une acceptation
                des nouvelles conditions.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>7. Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Pour toute question concernant ces conditions, contactez-nous :
              </p>
              <ul className="mt-2 space-y-1">
                <li>Formulaire de contact disponible</li>
                <li>Adresse : [Adresse physique]</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-8 text-center space-y-4">
          <Separator />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link to="/confidentialite">Politique de confidentialité</Link>
            </Button>
            <Button asChild>
              <Link to="/connexion">Retour à la connexion</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
