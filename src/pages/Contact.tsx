import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  MessageSquare,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Shield,
  HelpCircle,
  Bug,
} from "lucide-react";

export default function Contact() {
  const { addContactMessage } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    category: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Envoyer le message vers l'administration
      addContactMessage({
        name: formData.name,
        email: "non-renseigné", // Email non demandé pour la sécurité
        subject: formData.subject,
        category: formData.category,
        message: formData.message,
      });

      // Simulation d'envoi (remplacé par l'appel API en production)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSubmitted(true);
      setFormData({
        name: "",
        subject: "",
        category: "",
        message: "",
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactCategories = [
    { value: "general", label: "Question générale", icon: HelpCircle },
    { value: "support", label: "Support technique", icon: MessageSquare },
    { value: "security", label: "Signalement de sécurité", icon: Shield },
    { value: "bug", label: "Signaler un bug", icon: Bug },
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Message envoyé !</h2>
            <p className="text-muted-foreground mb-6">
              Votre message a été transmis directement à notre équipe
              d'administration. Nous vous répondrons dans les plus brefs délais
              (24-48h maximum).
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/connexion">Retour à la connexion</Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsSubmitted(false)}
                className="w-full"
              >
                Envoyer un autre message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
                <MessageSquare className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">Contactez-nous</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Une question, un problème ou une suggestion ? Notre équipe est là
              pour vous aider.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Informations de contact */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Informations de contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Support & sécurité</p>
                    <p className="text-sm text-muted-foreground">
                      Utilisez le formulaire ci-dessous
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Temps de réponse</p>
                    <p className="text-sm text-muted-foreground">
                      24-48h en moyenne
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Types de demandes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contactCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div
                      key={category.value}
                      className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg"
                    >
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-sm">{category.label}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Urgence sécuritaire ?</strong>
                <br />
                Pour les vulnérabilités de sécurité, contactez directement
                security@no-skills.fr avec les détails.
              </AlertDescription>
            </Alert>
          </div>

          {/* Formulaire de contact */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Envoyer un message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Votre nom"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie *</Label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {contactCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Sujet *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Résumé de votre demande"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Décrivez votre demande en détail..."
                      rows={6}
                      required
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? (
                        "Envoi en cours..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Envoyer le message
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                      <Link to="/connexion">Annuler</Link>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ rapide */}
        <div className="mt-12">
          <Separator className="mb-8" />
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Questions fréquentes</h2>
            <p className="text-muted-foreground">
              Peut-être que votre question a déjà une réponse
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Comment créer un compte ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Cliquez sur "Créer un compte" sur la page de connexion. Vous
                  devez avoir au moins 15 ans et accepter nos CGU.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  J'ai oublié mon mot de passe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Contactez-nous via le formulaire pour obtenir de l'aide sur
                  votre mot de passe.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Comment signaler un utilisateur ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Utilisez la fonction de signalement dans l'interface ou
                  contactez directement un modérateur.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Liens légaux */}
        <div className="mt-8 text-center space-y-4">
          <Separator />
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm text-muted-foreground">
            <Link to="/cgu" className="hover:text-foreground transition-colors">
              Conditions d'utilisation
            </Link>
            <Link
              to="/confidentialite"
              className="hover:text-foreground transition-colors"
            >
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
