import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Shield, Eye, Lock, Database } from "lucide-react";

export default function PrivacyPolicy() {
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
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">Politique de Confidentialité</h1>
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
                <Eye className="w-5 h-5" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Chez No-Skills, nous respectons votre vie privée et nous nous
                engageons à protéger vos données personnelles. Cette politique
                explique comment nous collectons, utilisons, stockons et
                protégeons vos informations conformément au Règlement Général
                sur la Protection des Données (RGPD).
              </p>
            </CardContent>
          </Card>

          {/* Données collectées */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                1. Données que nous collectons
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">
                  Informations d'inscription
                </h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Pseudo (nom d'utilisateur)</li>
                  <li>Mot de passe (hashé et chiffré)</li>
                  <li>Âge (pour vérifier l'éligibilité)</li>
                  <li>Date de création du compte</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Informations de profil</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Photo de profil (optionnelle)</li>
                  <li>Biographie (optionnelle)</li>
                  <li>Statut en ligne</li>
                  <li>Préférences de thème</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Données d'utilisation</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Messages envoyés et reçus</li>
                  <li>Fichiers partagés</li>
                  <li>Horodatage des activités</li>
                  <li>Adresse IP (pour la sécurité)</li>
                  <li>Informations sur l'appareil et le navigateur</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Utilisation des données */}
          <Card>
            <CardHeader>
              <CardTitle>2. Comment nous utilisons vos données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">
                    Fonctionnement du service
                  </h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Permettre la communication entre utilisateurs</li>
                    <li>Maintenir votre profil et vos préférences</li>
                    <li>Afficher l'historique de vos conversations</li>
                    <li>Synchroniser vos données entre appareils</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">
                    Sécurité et protection
                  </h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Authentification et autorisation</li>
                    <li>Détection des activités suspectes</li>
                    <li>Prévention du spam et des abus</li>
                    <li>Sauvegarde et récupération des données</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">
                    Amélioration du service
                  </h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>
                      Analyser l'utilisation pour améliorer les fonctionnalités
                    </li>
                    <li>Résoudre les problèmes techniques</li>
                    <li>Développer de nouvelles fonctionnalités</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Partage des données */}
          <Card>
            <CardHeader>
              <CardTitle>3. Partage de vos données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-semibold mb-2 text-red-700 dark:text-red-300">
                  Principe général : Aucun partage commercial
                </h4>
                <p className="text-sm">
                  Nous ne vendons, ne louons ni ne partageons vos données
                  personnelles avec des tiers à des fins commerciales.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Exceptions limitées</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    <strong>Obligations légales :</strong> Lorsque requis par la
                    loi ou une autorité judiciaire
                  </li>
                  <li>
                    <strong>Protection des droits :</strong> Pour protéger nos
                    droits, notre propriété ou la sécurité des utilisateurs
                  </li>
                  <li>
                    <strong>Prestataires techniques :</strong> Uniquement pour
                    le fonctionnement du service (hébergement, sauvegardes)
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Sécurité */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                4. Sécurité de vos données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2">Chiffrement</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Chiffrement des mots de passe avec bcrypt</li>
                    <li>Communication sécurisée via HTTPS/TLS</li>
                    <li>Chiffrement des données sensibles en base</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2">Accès contrôlé</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Authentification à deux facteurs disponible</li>
                    <li>Accès administrateur limité et audité</li>
                    <li>Surveillance des accès non autorisés</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2">Infrastructure</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Serveurs sécurisés et régulièrement mis à jour</li>
                    <li>Sauvegardes automatiques chiffrées</li>
                    <li>Protection contre les attaques DDoS</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vos droits */}
          <Card>
            <CardHeader>
              <CardTitle>5. Vos droits RGPD</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>

              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Eye className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Droit d'accès</h4>
                    <p className="text-sm text-muted-foreground">
                      Obtenir une copie de toutes vos données personnelles
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-xs font-bold">✏️</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Droit de rectification</h4>
                    <p className="text-sm text-muted-foreground">
                      Corriger ou mettre à jour vos informations personnelles
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-xs font-bold">🗑️</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Droit à l'effacement</h4>
                    <p className="text-sm text-muted-foreground">
                      Demander la suppression de vos données personnelles
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-xs font-bold">📦</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Droit à la portabilité</h4>
                    <p className="text-sm text-muted-foreground">
                      Récupérer vos données dans un format structuré
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-xs font-bold">🚫</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Droit d'opposition</h4>
                    <p className="text-sm text-muted-foreground">
                      Vous opposer au traitement de certaines données
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm">
                  <strong>Pour exercer vos droits :</strong> Contactez-nous à
                  privacy@no-skills.fr avec une pièce d'identité. Nous
                  répondrons dans un délai de 30 jours maximum.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Conservation des données */}
          <Card>
            <CardHeader>
              <CardTitle>6. Conservation des données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Type de données</th>
                      <th className="text-left p-2">Durée de conservation</th>
                      <th className="text-left p-2">Justification</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    <tr className="border-b">
                      <td className="p-2 font-medium">Données de compte</td>
                      <td className="p-2">Jusqu'à suppression du compte</td>
                      <td className="p-2">Fonctionnement du service</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Messages</td>
                      <td className="p-2">Jusqu'à suppression manuelle</td>
                      <td className="p-2">Historique des conversations</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Logs de connexion</td>
                      <td className="p-2">12 mois</td>
                      <td className="p-2">Sécurité et débogage</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Données de modération</td>
                      <td className="p-2">24 mois</td>
                      <td className="p-2">Prévention des récidives</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>7. Cookies et technologies similaires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Cookies essentiels</h4>
                <p className="text-sm text-muted-foreground">
                  Nécessaires au fonctionnement du site (session,
                  authentification, préférences de thème). Ces cookies ne
                  peuvent pas être désactivés.
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">
                  Cookies analytiques (optionnels)
                </h4>
                <p className="text-sm text-muted-foreground">
                  Nous utilisons des cookies pour analyser l'utilisation du site
                  et améliorer nos services. Vous pouvez les refuser dans vos
                  paramètres de compte.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>8. Contact et réclamations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">
                  Délégué à la protection des données
                </h4>
                <ul className="space-y-1 text-sm">
                  <li>Formulaire de contact disponible</li>
                  <li>Réponse garantie sous 30 jours</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Autorité de contrôle</h4>
                <p className="text-sm text-muted-foreground">
                  En cas de litige non résolu, vous pouvez saisir la CNIL
                  (Commission Nationale de l'Informatique et des Libertés) :
                  <a
                    href="https://www.cnil.fr"
                    className="text-primary hover:underline ml-1"
                  >
                    www.cnil.fr
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-8 text-center space-y-4">
          <Separator />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link to="/cgu">Conditions d'utilisation</Link>
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
