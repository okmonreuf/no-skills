import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, MessageSquare, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-xl border-0 bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-12 pb-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/60 rounded-2xl blur opacity-20"></div>
            </div>
          </div>

          {/* Erreur 404 */}
          <div className="mb-6">
            <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
            <h2 className="text-2xl font-semibold mb-3">Page introuvable</h2>
            <p className="text-muted-foreground">
              Désolé, la page que vous recherchez n'existe pas ou a été
              déplacée.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Link>
            </Button>

            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Page précédente
            </Button>
          </div>

          {/* Liens utiles */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-3">Liens utiles :</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/connexion" className="text-primary hover:underline">
                Se connecter
              </Link>
              <Link to="/inscription" className="text-primary hover:underline">
                Créer un compte
              </Link>
              <Link to="/contact" className="text-primary hover:underline">
                Nous contacter
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
