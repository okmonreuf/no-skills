import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MessageSquare,
  User,
  Mail,
  Lock,
  Calendar,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function Register() {
  const { register } = useApp();
  const [formData, setFormData] = useState({
    pseudo: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    acceptedTOS: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.pseudo.length < 3) {
      newErrors.pseudo = "Le pseudo doit contenir au moins 3 caractères";
    }

    if (!formData.email.includes("@")) {
      newErrors.email = "Adresse e-mail invalide";
    }

    if (formData.password.length < 8) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    const age = parseInt(formData.age);
    if (isNaN(age) || age < 15) {
      newErrors.age = "Vous devez avoir au moins 15 ans";
    }

    if (!formData.acceptedTOS) {
      newErrors.acceptedTOS =
        "Vous devez accepter les conditions d'utilisation";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const success = await register({
        pseudo: formData.pseudo,
        email: formData.email,
        password: formData.password,
        age: parseInt(formData.age),
        acceptedTOS: formData.acceptedTOS,
      });

      if (!success) {
        setErrors({ general: "Une erreur est survenue lors de l'inscription" });
      }
    } catch (err) {
      setErrors({ general: "Une erreur est survenue lors de l'inscription" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
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
              Rejoignez No-Skills
            </h1>
            <p className="text-muted-foreground">
              Créez votre compte et commencez à discuter
            </p>
          </div>
        </div>

        {/* Formulaire d'inscription */}
        <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-4">
            <div className="text-center">
              <CardTitle className="text-2xl">Inscription</CardTitle>
              <CardDescription>Rejoignez notre communauté</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pseudo" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Pseudo
                </Label>
                <Input
                  id="pseudo"
                  name="pseudo"
                  type="text"
                  placeholder="Votre pseudo"
                  value={formData.pseudo}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
                {errors.pseudo && (
                  <p className="text-sm text-destructive">{errors.pseudo}</p>
                )}
              </div>

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
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Âge
                </Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="Votre âge"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="15"
                  className="h-12"
                />
                {errors.age && (
                  <p className="text-sm text-destructive">{errors.age}</p>
                )}
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
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Confirmer le mot de passe
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="acceptedTOS"
                    name="acceptedTOS"
                    checked={formData.acceptedTOS}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        acceptedTOS: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="acceptedTOS" className="text-sm leading-5">
                    J'accepte les{" "}
                    <Link to="/cgu" className="text-primary hover:underline">
                      conditions d'utilisation
                    </Link>{" "}
                    et la{" "}
                    <Link
                      to="/confidentialite"
                      className="text-primary hover:underline"
                    >
                      politique de confidentialité
                    </Link>
                  </Label>
                </div>
                {errors.acceptedTOS && (
                  <p className="text-sm text-destructive">
                    {errors.acceptedTOS}
                  </p>
                )}
              </div>

              {errors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Création du compte..." : "Créer mon compte"}
              </Button>
            </form>

            <div className="text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Déjà un compte ?
                  </span>
                </div>
              </div>

              <Button variant="outline" asChild className="w-full h-12">
                <Link to="/connexion">Se connecter</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Information importante */}
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Âge minimum :</strong> Vous devez avoir au moins 15 ans pour
            utiliser No-Skills.
          </AlertDescription>
        </Alert>

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
