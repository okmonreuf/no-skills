import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Settings as SettingsIcon,
  Palette,
  Volume2,
  Monitor,
  Keyboard,
  Bell,
  Shield,
  Database,
  Info,
  Zap,
  Moon,
  Sun,
  Eye,
  MessageSquare,
} from "lucide-react";

interface AppSettings {
  fontSize: number;
  compactMode: boolean;
  showAvatars: boolean;
  showTimestamps: boolean;
  animationsEnabled: boolean;
  soundEnabled: boolean;
  notificationSound: boolean;
  autoScrollToNewMessages: boolean;
  markReadOnScroll: boolean;
  sendOnEnter: boolean;
  ctrlEnterToSend: boolean;
  spellCheck: boolean;
}

interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
}

export default function Settings() {
  const { user, theme, setTheme } = useApp();

  const [appSettings, setAppSettings] = useState<AppSettings>({
    fontSize: 14,
    compactMode: false,
    showAvatars: true,
    showTimestamps: true,
    animationsEnabled: true,
    soundEnabled: true,
    notificationSound: true,
    autoScrollToNewMessages: true,
    markReadOnScroll: true,
    sendOnEnter: true,
    ctrlEnterToSend: false,
    spellCheck: true,
  });

  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    highContrast: false,
    reducedMotion: false,
    screenReaderMode: false,
    keyboardNavigation: true,
    focusIndicators: true,
  });

  const handleAppSettingChange = (key: keyof AppSettings, value: any) => {
    setAppSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleAccessibilityChange = (
    key: keyof AccessibilitySettings,
    value: boolean,
  ) => {
    setAccessibility((prev) => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setAppSettings({
      fontSize: 14,
      compactMode: false,
      showAvatars: true,
      showTimestamps: true,
      animationsEnabled: true,
      soundEnabled: true,
      notificationSound: true,
      autoScrollToNewMessages: true,
      markReadOnScroll: true,
      sendOnEnter: true,
      ctrlEnterToSend: false,
      spellCheck: true,
    });
    setTheme("dark");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Vous devez être connecté pour accéder aux paramètres.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const themeOptions = [
    { value: "light", label: "Clair", icon: Sun },
    { value: "dark", label: "Sombre", icon: Moon },
    { value: "military", label: "Militaire", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <SettingsIcon className="w-6 h-6 text-primary-foreground" />
                </div>
                Paramètres
              </h1>
              <p className="text-muted-foreground mt-2">
                Personnalisez votre expérience No-Skills
              </p>
            </div>

            <Button variant="outline" onClick={resetToDefaults}>
              Réinitialiser
            </Button>
          </div>
        </div>

        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Apparence
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="accessibility"
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Accessibilité
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Avancé
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Info className="w-4 h-4" />À propos
            </TabsTrigger>
          </TabsList>

          {/* Apparence */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thème de l'interface</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value as any)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          theme === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Icon className="w-8 h-8" />
                          <span className="font-medium">{option.label}</span>
                          {theme === option.value && (
                            <Badge variant="default" className="text-xs">
                              Actuel
                            </Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personnalisation de l'affichage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">
                        Taille de la police
                      </label>
                      <span className="text-sm text-muted-foreground">
                        {appSettings.fontSize}px
                      </span>
                    </div>
                    <Slider
                      value={[appSettings.fontSize]}
                      onValueChange={(value) =>
                        handleAppSettingChange("fontSize", value[0])
                      }
                      min={12}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Mode compact</h4>
                      <p className="text-sm text-muted-foreground">
                        Réduire l'espacement pour afficher plus de contenu
                      </p>
                    </div>
                    <Switch
                      checked={appSettings.compactMode}
                      onCheckedChange={(checked) =>
                        handleAppSettingChange("compactMode", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Afficher les avatars</h4>
                      <p className="text-sm text-muted-foreground">
                        Montrer les photos de profil dans les messages
                      </p>
                    </div>
                    <Switch
                      checked={appSettings.showAvatars}
                      onCheckedChange={(checked) =>
                        handleAppSettingChange("showAvatars", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Horodatage des messages</h4>
                      <p className="text-sm text-muted-foreground">
                        Afficher l'heure d'envoi des messages
                      </p>
                    </div>
                    <Switch
                      checked={appSettings.showTimestamps}
                      onCheckedChange={(checked) =>
                        handleAppSettingChange("showTimestamps", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Animations</h4>
                      <p className="text-sm text-muted-foreground">
                        Activer les animations de l'interface
                      </p>
                    </div>
                    <Switch
                      checked={appSettings.animationsEnabled}
                      onCheckedChange={(checked) =>
                        handleAppSettingChange("animationsEnabled", checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat */}
          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Comportement du chat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Défilement automatique</h4>
                      <p className="text-sm text-muted-foreground">
                        Faire défiler automatiquement vers les nouveaux messages
                      </p>
                    </div>
                    <Switch
                      checked={appSettings.autoScrollToNewMessages}
                      onCheckedChange={(checked) =>
                        handleAppSettingChange(
                          "autoScrollToNewMessages",
                          checked,
                        )
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">
                        Marquer comme lu au défilement
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Marquer les messages comme lus quand ils deviennent
                        visibles
                      </p>
                    </div>
                    <Switch
                      checked={appSettings.markReadOnScroll}
                      onCheckedChange={(checked) =>
                        handleAppSettingChange("markReadOnScroll", checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Saisie de messages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Envoyer avec Entrée</h4>
                      <p className="text-sm text-muted-foreground">
                        Appuyer sur Entrée pour envoyer un message
                      </p>
                    </div>
                    <Switch
                      checked={appSettings.sendOnEnter}
                      onCheckedChange={(checked) =>
                        handleAppSettingChange("sendOnEnter", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Ctrl+Entrée pour envoyer</h4>
                      <p className="text-sm text-muted-foreground">
                        Alternative : Ctrl+Entrée pour envoyer
                      </p>
                    </div>
                    <Switch
                      checked={appSettings.ctrlEnterToSend}
                      onCheckedChange={(checked) =>
                        handleAppSettingChange("ctrlEnterToSend", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Correcteur orthographique</h4>
                      <p className="text-sm text-muted-foreground">
                        Vérifier l'orthographe lors de la saisie
                      </p>
                    </div>
                    <Switch
                      checked={appSettings.spellCheck}
                      onCheckedChange={(checked) =>
                        handleAppSettingChange("spellCheck", checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sons et notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Sons activés</h4>
                      <p className="text-sm text-muted-foreground">
                        Activer tous les sons de l'application
                      </p>
                    </div>
                    <Switch
                      checked={appSettings.soundEnabled}
                      onCheckedChange={(checked) =>
                        handleAppSettingChange("soundEnabled", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Son de notification</h4>
                      <p className="text-sm text-muted-foreground">
                        Jouer un son pour les nouvelles notifications
                      </p>
                    </div>
                    <Switch
                      checked={appSettings.notificationSound}
                      onCheckedChange={(checked) =>
                        handleAppSettingChange("notificationSound", checked)
                      }
                      disabled={!appSettings.soundEnabled}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accessibilité */}
          <TabsContent value="accessibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Options d'accessibilité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Contraste élevé</h4>
                      <p className="text-sm text-muted-foreground">
                        Augmenter le contraste pour une meilleure lisibilité
                      </p>
                    </div>
                    <Switch
                      checked={accessibility.highContrast}
                      onCheckedChange={(checked) =>
                        handleAccessibilityChange("highContrast", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Réduire les animations</h4>
                      <p className="text-sm text-muted-foreground">
                        Minimiser les mouvements pour réduire les distractions
                      </p>
                    </div>
                    <Switch
                      checked={accessibility.reducedMotion}
                      onCheckedChange={(checked) =>
                        handleAccessibilityChange("reducedMotion", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Mode lecteur d'écran</h4>
                      <p className="text-sm text-muted-foreground">
                        Optimiser l'interface pour les lecteurs d'écran
                      </p>
                    </div>
                    <Switch
                      checked={accessibility.screenReaderMode}
                      onCheckedChange={(checked) =>
                        handleAccessibilityChange("screenReaderMode", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Navigation au clavier</h4>
                      <p className="text-sm text-muted-foreground">
                        Permettre la navigation complète au clavier
                      </p>
                    </div>
                    <Switch
                      checked={accessibility.keyboardNavigation}
                      onCheckedChange={(checked) =>
                        handleAccessibilityChange("keyboardNavigation", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Indicateurs de focus</h4>
                      <p className="text-sm text-muted-foreground">
                        Afficher clairement l'élément ayant le focus
                      </p>
                    </div>
                    <Switch
                      checked={accessibility.focusIndicators}
                      onCheckedChange={(checked) =>
                        handleAccessibilityChange("focusIndicators", checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Avancé */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres avancés</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="w-4 h-4 mr-2" />
                    Vider le cache local
                  </Button>

                  <Button variant="outline" className="w-full justify-start">
                    <Monitor className="w-4 h-4 mr-2" />
                    Informations système
                  </Button>

                  <Button variant="outline" className="w-full justify-start">
                    <Keyboard className="w-4 h-4 mr-2" />
                    Raccourcis clavier
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Données et stockage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      Cache utilisé:
                    </span>
                    <p className="font-medium">2.4 MB</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Messages stockés:
                    </span>
                    <p className="font-medium">1,247</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Fichiers téléchargés:
                    </span>
                    <p className="font-medium">156 MB</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Dernière sync:
                    </span>
                    <p className="font-medium">Il y a 2 min</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* À propos */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>No-Skills Messagerie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
                    <MessageSquare className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">No-Skills v1.0.0</h3>
                    <p className="text-muted-foreground">
                      Plateforme de messagerie moderne et sécurisée
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version:</span>
                    <span className="font-medium">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Build:</span>
                    <span className="font-medium">2025.06.22</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plateforme:</span>
                    <span className="font-medium">Web</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Licence:</span>
                    <span className="font-medium">Propriétaire</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Crédits</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Développé avec React, TypeScript et Tailwind CSS</p>
                    <p>Icônes par Lucide React</p>
                    <p>Composants UI par Radix UI</p>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Changelog
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Licence
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
