import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Upload,
  Image,
  Video,
  File,
  Trash2,
  Download,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Share,
  Calendar,
  User,
  HardDrive,
  AlertCircle,
} from "lucide-react";

interface MediaFile {
  id: string;
  name: string;
  type: "image" | "video" | "document" | "audio";
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  url: string;
  chatId?: string;
  isPublic: boolean;
}

const mockFiles: MediaFile[] = [
  {
    id: "file-1",
    name: "screenshot_2024.png",
    type: "image",
    size: 2048576, // 2MB
    uploadedBy: "Yupi",
    uploadedAt: new Date(Date.now() - 3600000),
    url: "/api/files/screenshot_2024.png",
    chatId: "general",
    isPublic: true,
  },
  {
    id: "file-2",
    name: "presentation.pdf",
    type: "document",
    size: 5242880, // 5MB
    uploadedBy: "Alexandre",
    uploadedAt: new Date(Date.now() - 7200000),
    url: "/api/files/presentation.pdf",
    chatId: "staff",
    isPublic: false,
  },
  {
    id: "file-3",
    name: "demo_video.mp4",
    type: "video",
    size: 15728640, // 15MB
    uploadedBy: "Marie",
    uploadedAt: new Date(Date.now() - 10800000),
    url: "/api/files/demo_video.mp4",
    chatId: "general",
    isPublic: true,
  },
];

export default function MediaManager() {
  const { user } = useApp();
  const [files, setFiles] = useState<MediaFile[]>(mockFiles);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="w-8 h-8 text-green-500" />;
      case "video":
        return <Video className="w-8 h-8 text-blue-500" />;
      case "document":
        return <File className="w-8 h-8 text-red-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || file.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);
  const storageUsed = (totalSize / (100 * 1024 * 1024)) * 100; // Pourcentage sur 100MB

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulation d'upload
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);

          // Ajouter le fichier à la liste
          const newFile: MediaFile = {
            id: `file-${Date.now()}`,
            name: file.name,
            type: file.type.startsWith("image/")
              ? "image"
              : file.type.startsWith("video/")
                ? "video"
                : "document",
            size: file.size,
            uploadedBy: user?.pseudo || "Utilisateur",
            uploadedAt: new Date(),
            url: URL.createObjectURL(file),
            isPublic: true,
          };

          setFiles((prev) => [newFile, ...prev]);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground">
              Vous devez être connecté pour accéder au gestionnaire de fichiers.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <HardDrive className="w-6 h-6 text-primary-foreground" />
                </div>
                Gestionnaire de Fichiers
              </h1>
              <p className="text-muted-foreground mt-2">
                Gérez tous vos fichiers partagés sur No-Skills
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right text-sm">
                <p className="font-medium">{formatFileSize(totalSize)}</p>
                <p className="text-muted-foreground">utilisés</p>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Téléverser
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Téléverser un fichier</DialogTitle>
                    <DialogDescription>
                      Sélectionnez un fichier à partager (max 50MB)
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Glissez vos fichiers ici ou cliquez pour sélectionner
                      </p>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                      />
                      <Button
                        variant="outline"
                        onClick={() =>
                          document.getElementById("file-upload")?.click()
                        }
                        disabled={isUploading}
                      >
                        Sélectionner un fichier
                      </Button>
                    </div>

                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Téléversement en cours...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} />
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Stockage utilisé */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Stockage utilisé</span>
                <span>{storageUsed.toFixed(1)}% de 100 MB</span>
              </div>
              <Progress value={storageUsed} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {formatFileSize(100 * 1024 * 1024 - totalSize)} restants
              </p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setSelectedType("all")}>
                Tous les fichiers
              </TabsTrigger>
              <TabsTrigger
                value="image"
                onClick={() => setSelectedType("image")}
              >
                Images
              </TabsTrigger>
              <TabsTrigger
                value="video"
                onClick={() => setSelectedType("video")}
              >
                Vidéos
              </TabsTrigger>
              <TabsTrigger
                value="document"
                onClick={() => setSelectedType("document")}
              >
                Documents
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher des fichiers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              {filteredFiles.map((file) => (
                <Card
                  key={file.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{file.name}</h3>
                          {!file.isPublic && (
                            <Badge variant="secondary" className="text-xs">
                              Privé
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {file.uploadedBy}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(file.uploadedAt)}
                          </span>
                          <span>{formatFileSize(file.size)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>

                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Share className="w-4 h-4 mr-2" />
                              Partager
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Télécharger
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteFile(file.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredFiles.length === 0 && (
                <Card>
                  <CardContent className="pt-8 pb-8 text-center">
                    <File className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? "Aucun fichier trouvé pour cette recherche"
                        : "Aucun fichier dans cette catégorie"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
