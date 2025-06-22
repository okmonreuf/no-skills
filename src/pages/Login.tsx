import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, Mail, Lock, AlertCircle } from "lucide-react";

export default function Login() {
  const { login } = useApp();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      if (!success) {
        setError("Email ou mot de passe incorrect");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo et titre */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/60 rounded-2xl blur opacity-20"></div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              No-Skills
            </h1>
            <p className="text-muted-foreground">
              Connectez-vous à votre messagerie
            </p>
          </div>
        </div>

        {/* Formulaire de connexion */}
        <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-4">
            <div className="text-center">
              <CardTitle className="text-2xl">Connexion</CardTitle>
              <CardDescription>
                Accédez à votre compte No-Skills
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Adresse e-mail
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>

            <div className="text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Nouveau sur No-Skills ?
                  </span>
                </div>
              </div>

              <Button variant="outline" asChild className="w-full h-12">
                <Link to="/inscription">Créer un compte</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Liens légaux */}
        <div className="text-center text-xs text-muted-foreground space-x-4">
          <Link to="/cgu" className="hover:text-foreground transition-colors">
            CGU
          </Link>
          <Link
            to="/confidentialite"
            className="hover:text-foreground transition-colors"
          >
            Confidentialité
          </Link>
          <Link
            to="/contact"
            className="hover:text-foreground transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
